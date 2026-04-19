<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Cache;
use App\Events\FeedUpdated;

/**
 * @class Like
 * @description โมเดลสำหรับจัดการข้อมูลการกดถูกใจ (Likes)
 * ออกแบบให้ทำงานแบบ Polymorphic Relation เพื่อให้สามารถใช้งานร่วมกับโมเดลเป้าหมายอื่นๆ ได้หลากหลาย (เช่น Post, Comment)
 */
class Like extends Model
{
    use HasFactory;

    /**
     * @var array $guarded
     * @description อนุญาตให้เพิ่มข้อมูลผ่าน Mass Assignment ได้ทุกฟิลด์
     */
    protected $guarded = [];

    /**
     * @function user
     * @description ความสัมพันธ์: การกดถูกใจนี้ดำเนินการโดย "ผู้ใช้งาน" คนใด
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @function likeable
     * @description ความสัมพันธ์แบบ Polymorphic: ดึงข้อมูลโมเดลเป้าหมายที่ถูกกระทำ (เช่น Post หรือ Comment)
     * @return MorphTo
     */
    public function likeable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * @function booted
     * @description ฟังก์ชันตั้งค่าเริ่มต้น (Boot) ทำหน้าที่ดักจับเหตุการณ์ (Model Events) 
     * เพื่ออัปเดตแคชและส่งสัญญาณแจ้งเตือนการเปลี่ยนแปลงไปยังฝั่งไคลเอนต์แบบ Real-time
     */
    protected static function booted()
    {
        // ทำงานเมื่อมีการ "บันทึกข้อมูล" (กดถูกใจ)
        static::saved(function () {
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated()); // 📢 ตะโกนบอกให้หน้าบ้านอัปเดตยอดไลก์!
        });

        // ทำงานเมื่อมีการ "ลบข้อมูล" (เลิกกดถูกใจ)
        static::deleted(function () {
            Cache::forget('dashboard_posts_all');
            event(new FeedUpdated()); // 📢 ตะโกนบอกให้หน้าบ้านอัปเดตยอดไลก์!
        });
    }
}