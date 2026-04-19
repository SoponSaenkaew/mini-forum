<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache; 
use App\Events\FeedUpdated;           

/**
 * @class LikeController
 * @description คอนโทรลเลอร์สำหรับจัดการระบบถูกใจ (Like/Unlike) 
 * รองรับการทำงานทั้งบนกระดานโพสต์ (Post) และ ความคิดเห็น (Comment)
 */
class LikeController extends Controller
{
    /**
     * @function togglePost
     * @description สลับสถานะการกดถูกใจสำหรับ "โพสต์" 
     * @param Post $post โมเดลโพสต์เป้าหมาย
     * @return \Illuminate\Http\RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิม
     */
    public function togglePost(Post $post)
    {
        $this->toggleLike($post);
        return back();
    }

    /**
     * @function toggleComment
     * @description สลับสถานะการกดถูกใจสำหรับ "ความคิดเห็น"
     * @param Comment $comment โมเดลความคิดเห็นเป้าหมาย
     * @return \Illuminate\Http\RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิม
     */
    public function toggleComment(Comment $comment)
    {
        $this->toggleLike($comment);
        return back();
    }

    /**
     * @function toggleLike
     * @description ฟังก์ชันช่วยเหลือ (Helper) ทำหน้าที่ตรวจสอบและดำเนินการ เพิ่ม/ลบ ข้อมูลในฐานข้อมูล
     * @param \Illuminate\Database\Eloquent\Model $model โมเดลเป้าหมายที่ถูกกระทำ (Post หรือ Comment)
     * @return void
     */
    private function toggleLike($model)
    {
        // ตรวจสอบว่าผู้ใช้งานปัจจุบันเคยกดถูกใจโมเดลนี้ไปแล้วหรือไม่
        $existingLike = $model->likes()->where('user_id', auth()->id())->first();

        if ($existingLike) {
            // หากมีประวัติอยู่แล้ว ให้ลบข้อมูลออก (เลิกถูกใจ / Unlike)
            $existingLike->delete();
        } else {
            // หากยังไม่มีประวัติ ให้สร้างข้อมูลใหม่ (กดถูกใจ / Like)
            $model->likes()->create(['user_id' => auth()->id()]);
        }

        // หลังจากทำการเพิ่มหรือลบข้อมูลแล้ว ให้ล้างแคชที่เกี่ยวข้องกับโพสต์ทั้งหมด
        Cache::forget('dashboard_posts_all');
        
        // หมายเหตุ: หากมีการใช้งานคำค้นหา (Search) ในหน้า Dashboard บ่อยๆ 
        // อาจจะต้องพิจารณาใช้ Cache Tags (ถ้า Cache Driver รองรับ) ในอนาคต
    }
}