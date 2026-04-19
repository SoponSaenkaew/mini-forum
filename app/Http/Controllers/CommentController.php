<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Notifications\NewCommentNotification;
use App\Http\Requests\StoreCommentRequest;
use App\Events\FeedUpdated;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    /**
     * Store a newly created comment in storage.
     * * @param  StoreCommentRequest  $request
     * @param  Post  $post
     * @return RedirectResponse
     */
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $validated = $request->validated();

        $comment = $post->comments()->create([
            'user_id'   => Auth::id(),
            'content'   => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $this->sendNotification($comment, $post);

        $this->clearCacheAndBroadcast();

        return back();
    }

    /**
     * Update the specified comment.
     */
    public function update(StoreCommentRequest $request, Comment $comment): RedirectResponse
    {
        // แนะนำให้ใช้ Policy: $this->authorize('update', $comment);
        if ($comment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $comment->update($request->validated());

        $this->clearCacheAndBroadcast();

        return back();
    }

    /**
     * Remove the specified comment.
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        
        if ($comment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        $this->clearCacheAndBroadcast();

        return back();
    }

    /**
     * Show the reply page for a specific comment.
     */
    public function replyPage(Comment $comment): Response
    {
        return Inertia::render('Comments/ReplyPage', [
            'targetComment' => $comment->load([
                'user', 
                'post', 
                'replies.user', 
                'replies.replies.user'
            ]),
        ]);
    }

    /**
     * Internal helper to handle notifications.
     */
    private function sendNotification(Comment $comment, Post $post): void
    {
        // กรณีตอบกลับคอมเมนต์
        if ($comment->parent_id) {
            $parent = $comment->parent;
            if ($parent && $parent->user_id !== Auth::id()) {
                $parent->user->notify(new NewCommentNotification($comment));
            }
            return;
        }

        // กรณีคอมเมนต์โพสต์ปกติ
        if ($post->user_id !== Auth::id()) {
            $post->user->notify(new NewCommentNotification($comment));
        }
    }

    /**
     * Handle cache clearing and broadcasting.
     */
    private function clearCacheAndBroadcast(): void
    {
        // ระวัง: Cache::flush() จะลบข้อมูลแคชทั้งหมดของแอป
        // แนะนำให้ใช้ Cache::forget('key') หรือ Tags แทน
        Cache::flush(); 
        broadcast(new FeedUpdated())->toOthers();
    }
}