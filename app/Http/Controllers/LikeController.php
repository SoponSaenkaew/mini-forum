<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache; // ✨ อย่าลืม import Cache
use App\Events\FeedUpdated;           // ✨ อย่าลืม import Event

class LikeController extends Controller
{
    public function togglePost(Post $post)
    {
        $this->toggleLike($post);
        return back();
    }

    public function toggleComment(Comment $comment)
    {
        $this->toggleLike($comment);
        return back();
    }

    private function toggleLike($model)
    {
        $existingLike = $model->likes()->where('user_id', auth()->id())->first();

        if ($existingLike) {
            $existingLike->delete();
        } else {
            $model->likes()->create(['user_id' => auth()->id()]);
        }

        
        Cache::flush();
        broadcast(new FeedUpdated())->toOthers();
    }
}