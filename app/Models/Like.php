<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Like extends Model
{
    use HasFactory;

    protected $guarded = [];

    // บอกว่าไลก์นี้เป็นของใคร
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ✨ เวทมนตร์ Polymorphic: บอกว่าไลก์นี้สามารถไปเกาะกับอะไรก็ได้ (Post หรือ Comment)
    public function likeable()
    {
        return $this->morphTo();
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