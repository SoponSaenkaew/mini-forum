<?php

namespace App\Http\Controllers;

use App\Models\Post; //
use App\Models\Comment; //

use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Notifications\NewCommentNotification;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
            'parent_id' => 'nullable|exists:comments,id', // ✨ ตรวจสอบว่าคอมเมนต์แม่มีจริงไหม
        ]);

        $comment = $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
            'parent_id' => $request->parent_id, // ✨ บันทึกค่าคอมเมนต์แม่
        ]);

        // ✨ กรณีที่ 1: ตอบกลับคอมเมนต์ (ส่งหาเจ้าของคอมเมนต์แม่)
        if ($comment->parent_id) {
            $parentComment = Comment::find($comment->parent_id);
            if ($parentComment->user_id !== auth()->id()) {
                $parentComment->user->notify(new NewCommentNotification($comment));
            }
        } 
        // ✨ กรณีที่ 2: คอมเมนต์โพสต์ปกติ (ส่งหาเจ้าของโพสต์)
        elseif ($post->user_id !== auth()->id()) {
            $post->user->notify(new NewCommentNotification($comment));
        }

        return back();
    }
    
    public function destroy(Comment $comment)
    {
        // ✨ เช็คว่าคนที่จะลบ เป็นเจ้าของคอมเมนต์จริงๆ หรือเปล่า
        if ($comment->user_id !== auth()->id()) {
            abort(403, 'เซนเซไม่มีสิทธิ์ลบคอมเมนต์ของคนอื่นนะคะ!');
        }

        $comment->delete();

        // กลับไปหน้าเดิมและรักษาตำแหน่งการ Scroll ไว้ด้วยนะคะ
        return back();
    }
    public function update(Request $request, Comment $comment)
    {
        // ตรวจสอบสิทธิ์ว่าเซนเซเป็นเจ้าของคอมเมนต์นี้จริงไหม
        if ($comment->user_id !== auth()->id()) {
            abort(403, 'เซนเซไม่มีสิทธิ์แก้ไขคอมเมนต์ของคนอื่นนะคะ!');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update($validated); // บันทึกข้อมูลใหม่

        return back(); // กลับหน้าเดิมโดยรักษาตำแหน่ง scroll
    }

    /**
     * หน้าสำหรับตอบกลับคอมเมนต์ที่ระบุโดยเฉพาะ (วาร์ปจาก Notification)
     */
    public function replyPage(Comment $comment)
    {
        return Inertia::render('Comments/ReplyPage', [
            'targetComment' => $comment->load(['user', 'post', 'replies.user', 'replies.replies.user']),
        ]);
    }
}