<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    // ✨ อนุญาตให้บันทึกข้อมูลได้ (แก้ MassAssignmentException)
    protected $fillable = ['title', 'content','image'];

    public function user(): BelongsTo 
    { 
        return $this->belongsTo(User::class); 
    }

    public function comments(): HasMany 
    { 
        return $this->hasMany(Comment::class); 
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function images()
    {
        return $this->hasMany(PostImage::class);
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