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
 * @class Comment
 * @description โมเดลสำหรับจัดการข้อมูลความคิดเห็น (Comments) และการตอบกลับ (Replies)
 * รองรับระบบ Soft Deletes และความสัมพันธ์แบบ Polymorphic สำหรับระบบถูกใจ
 */
class Comment extends Model
{
    use SoftDeletes;

    /**
     * @var array $fillable
     * @description กำหนดฟิลด์ที่อนุญาตให้เพิ่มข้อมูลผ่านระบบ Mass Assignment
     */
    protected $fillable = ['user_id', 'post_id', 'parent_id', 'content'];

    /**
     * @function user
     * @description ความสัมพันธ์: ความคิดเห็นนี้ถูกเขียนโดย "ผู้ใช้งาน" คนใด
     * @return BelongsTo
     */
    public function user(): BelongsTo 
    { 
        return $this->belongsTo(User::class); 
    }

    /**
     * @function post
     * @description ความสัมพันธ์: ความคิดเห็นนี้แสดงอยู่ภายใต้ "โพสต์" ใด
     * @return BelongsTo
     */
    public function post(): BelongsTo 
    { 
        return $this->belongsTo(Post::class); 
    }

    /**
     * @function parent
     * @description ความสัมพันธ์: ความคิดเห็นนี้เป็นการตอบกลับของ "ความคิดเห็นหลัก" (Parent) รายการใด
     * @return BelongsTo
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id')->with('user');
    }

    /**
     * @function replies
     * @description ความสัมพันธ์: ดึงรายการ "ความคิดเห็นย่อย" (Replies) ที่มาตอบกลับคอมเมนต์นี้
     * @return HasMany
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->with(['user', 'likes', 'replies']);
    }

    /**
     * @function likes
     * @description ความสัมพันธ์: ดึงข้อมูลการ "กดถูกใจ" (Likes) ของความคิดเห็นนี้ (Polymorphic Relation)
     * @return MorphMany
     */
    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    /**
     * @function booted
     * @description ฟังก์ชันตั้งค่าเริ่มต้น (Boot) ของโมเดล ทำหน้าที่ดักจับเหตุการณ์ (Model Events)
     * เพื่ออัปเดตแคชและส่งสัญญาณแจ้งเตือนไปยังฝั่งไคลเอนต์แบบ Real-time
     */
    protected static function booted()
    {
        // ทำงานเมื่อมีการ "บันทึกข้อมูล" (สร้างใหม่หรือแก้ไขเนื้อหา)
        static::saved(function () {
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated()); // 📢 ตะโกนบอกหน้าบ้านว่ามีอัปเดต!
        });

        // ทำงานเมื่อมีการ "ลบข้อมูล" (Soft Delete)
        static::deleted(function () {
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated()); // 📢 ตะโกนบอกหน้าบ้านว่ามีอัปเดต!
        });
    }
}