<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Cache;
use App\Events\FeedUpdated;

/**
 * @class Post
 * @description โมเดลหลักสำหรับจัดการข้อมูลกระทู้ (Posts) 
 * รองรับระบบ Soft Deletes, การจัดการรูปภาพหลายรายการ (Gallery) และระบบถูกใจแบบ Polymorphic
 */
class Post extends Model
{
    use SoftDeletes;

    /**
     * @var array $fillable
     * @description รายชื่อฟิลด์ที่อนุญาตให้บันทึกข้อมูลแบบ Mass Assignment
     */
    protected $fillable = ['title', 'content', 'image'];

    /**
     * @function user
     * @description ความสัมพันธ์: กระทู้นี้ถูกสร้างโดย "ผู้ใช้งาน" คนใด
     * @return BelongsTo
     */
    public function user(): BelongsTo 
    { 
        return $this->belongsTo(User::class); 
    }

    /**
     * @function comments
     * @description ความสัมพันธ์: ดึงรายการ "ความคิดเห็น" ทั้งหมดที่อยู่ภายใต้กระทู้นี้
     * @return HasMany
     */
    public function comments(): HasMany 
    { 
        return $this->hasMany(Comment::class); 
    }

    /**
     * @function likes
     * @description ความสัมพันธ์แบบ Polymorphic: ดึงรายการการ "กดถูกใจ" ของกระทู้นี้
     * @return MorphMany
     */
    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    /**
     * @function images
     * @description ความสัมพันธ์: ดึงรายการ "รูปภาพ" ทั้งหมดที่แนบมากับกระทู้นี้ (Gallery)
     * @return HasMany
     */
    public function images(): HasMany
    {
        return $this->hasMany(PostImage::class);
    }

    /**
     * @function booted
     * @description ฟังก์ชันตั้งค่าเริ่มต้น (Boot) สำหรับดักจับเหตุการณ์ของโมเดล (Model Events)
     * เพื่อจัดการข้อมูลใน Cache และจัดการข้อมูลความสัมพันธ์แบบ Cascade
     */
    protected static function booted()
    {
        // ทำงานเมื่อมีการ "บันทึกข้อมูล" (สร้างใหม่หรือแก้ไขเนื้อหา)
        static::saved(function () {
            // ✨ ล้างแคชเฉพาะส่วนที่เกี่ยวข้อง เพื่อประสิทธิภาพสูงสุดของระบบ
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated()); // 📢 แจ้งเตือนหน้าบ้านว่ามีการอัปเดตข้อมูล!
        });

        // ทำงานเมื่อมีการ "ลบข้อมูล" (ทั้งแบบ Soft Delete และ Permanent)
        static::deleted(function () {
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated());
        });

        /**
         * @event deleting
         * @description เมื่อกระทู้หลักถูกลบ ให้ดำเนินการลบรูปภาพที่เกี่ยวข้องตามไปด้วย (Cascade Delete)
         */
        static::deleting(function ($post) {
            $post->images()->delete(); 
        });

        /**
         * @event restoring
         * @description เมื่อกระทู้หลักถูกกู้คืน ให้ดำเนินการกู้คืนรูปภาพที่เกี่ยวข้องกลับมาด้วย
         */
        static::restoring(function ($post) {
            $post->images()->withTrashed()->restore();
            // แจ้งให้หน้าบ้านทราบว่ามีข้อมูลที่ถูกกู้คืนกลับมาแล้ว
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated());
        });
    }

    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return $this->image_path ? \Illuminate\Support\Facades\Storage::url($this->image_path) : null;
    }
}