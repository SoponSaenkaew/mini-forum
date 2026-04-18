<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;

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
            
        });

        static::deleted(function () {
            \Illuminate\Support\Facades\Cache::flush();
            
        });

        // 🗑️ เมื่อโพสต์หลักถูกลบ (Soft Delete) ให้ซ่อนรูปภาพลูกๆ ด้วย
        static::deleting(function ($post) {
            // แจ้งเตือน: เซนเซต้องเช็กชื่อความสัมพันธ์ให้ตรงกับที่มีในโค้ดนะคะ (เช่น images())
            $post->images()->delete(); 
        });

        // ♻️ เมื่อโพสต์หลักถูกกู้คืน (Restore) ให้เรียกรูปภาพกลับมาด้วย
        static::restoring(function ($post) {
            $post->images()->withTrashed()->restore();
        });
    }
}