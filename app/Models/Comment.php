<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;


class Comment extends Model
{
    use SoftDeletes;
    protected $fillable = ['user_id','post_id', 'parent_id', 'content'];

    public function user(): BelongsTo 
    { 
        return $this->belongsTo(User::class); 
    }

    public function post(): BelongsTo 
    { 
        return $this->belongsTo(Post::class); 
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id')->with('user');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')->with(['user', 'likes', 'replies']);
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    // ✨ สั่งล้าง Cache และตะโกนบอกหน้าบ้าน (Broadcast)
    protected static function booted()
    {
        static::saved(function () {
            \Illuminate\Support\Facades\Cache::flush();
            event(new \App\Events\FeedUpdated()); // 📢 ตะโกนบอกว่ามีอัปเดต!
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::flush();
            event(new \App\Events\FeedUpdated()); // 📢 ตะโกนบอกว่ามีอัปเดต!
        });
    }
}