<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use App\Notifications\NewCommentNotification;
use App\Http\Requests\StoreCommentRequest;
use App\Events\FeedUpdated;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;

/**
 * @class CommentController
 * @description คอนโทรลเลอร์สำหรับจัดการระบบความคิดเห็น (Comments) และการตอบกลับ (Replies)
 * รวมถึงหน้าที่ในการประเมินและส่งการแจ้งเตือน (Notifications) ไปยังเจ้าของโพสต์หรือเจ้าของคอมเมนต์
 */
class CommentController extends Controller
{
    /**
     * @function store
     * @description สร้างความคิดเห็นใหม่ลงในระบบ (ใช้ได้ทั้งคอมเมนต์โพสต์และตอบกลับคอมเมนต์เดิม)
     * @param StoreCommentRequest $request ข้อมูลฟอร์มที่ผ่านการตรวจสอบความถูกต้องแล้ว (Validation)
     * @param Post $post โพสต์เป้าหมายที่ถูกแสดงความคิดเห็น
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิมที่ผู้ใช้งานอยู่
     */
    public function store(StoreCommentRequest $request, Post $post): RedirectResponse
    {
        $validated = $request->validated();

        $comment = $post->comments()->create([
            'user_id'   => Auth::id(),
            'content'   => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        $this->sendNotification($comment, $post);

        $this->clearCacheAndBroadcast();

        return back();
    }

    /**
     * @function update
     * @description อัปเดตและแก้ไขเนื้อหาของความคิดเห็นเดิม
     * @param StoreCommentRequest $request ข้อมูลฟอร์มที่ผ่านการตรวจสอบความถูกต้องแล้ว
     * @param Comment $comment โมเดลความคิดเห็นที่ต้องการแก้ไข
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิม
     */
    public function update(StoreCommentRequest $request, Comment $comment): RedirectResponse
    {
        // ตรวจสอบสิทธิ์การเข้าถึง: อนุญาตให้แก้ไขเฉพาะเจ้าของความคิดเห็นเท่านั้น
        // (ข้อเสนอแนะ: ในอนาคตหากระบบขยายใหญ่ขึ้น แนะนำให้เปลี่ยนไปใช้ Policy ผ่าน $this->authorize() แทนค่ะ)
        if ($comment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $comment->update($request->validated());

        $this->clearCacheAndBroadcast();

        return back();
    }

    /**
     * @function destroy
     * @description ลบความคิดเห็นที่ระบุออกจากฐานข้อมูล
     * @param Comment $comment โมเดลความคิดเห็นเป้าหมาย
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิม
     */
    public function destroy(Comment $comment): RedirectResponse
    {
        // ตรวจสอบสิทธิ์การเข้าถึง: อนุญาตให้ลบได้เฉพาะเจ้าของความคิดเห็นเท่านั้น
        if ($comment->user_id !== Auth::id()) {
            abort(403, 'Unauthorized action.');
        }

        $comment->delete();

        $this->clearCacheAndBroadcast();

        return back();
    }

    /**
     * @function replyPage
     * @description แสดงหน้าต่างสำหรับดูและตอบกลับความคิดเห็นแบบเจาะจง (Thread View)
     * @param Comment $comment ความคิดเห็นเป้าหมายหลัก
     * @return Response หน้า Component ของ Inertia.js
     */
    public function replyPage(Comment $comment): Response
    {
        return Inertia::render('Comments/ReplyPage', [
            'targetComment' => $comment->load([
                'user', 
                'post', 
                'replies.user', 
                'replies.replies.user'
            ]),
        ]);
    }

    /**
     * @function sendNotification
     * @description ฟังก์ชันช่วยเหลือ (Helper) ภายในคลาส ทำหน้าที่วิเคราะห์ว่าควรส่งแจ้งเตือนให้ใคร
     * @param Comment $comment ความคิดเห็นที่เพิ่งถูกสร้างใหม่
     * @param Post $post โพสต์ที่เป็นเจ้าของความคิดเห็น
     * @return void
     */
    private function sendNotification(Comment $comment, Post $post): void
    {
        // กรณีเป็นการตอบกลับความคิดเห็น (Reply) ให้แจ้งเตือนไปยังเจ้าของคอมเมนต์หลัก
        if ($comment->parent_id) {
            $parent = $comment->parent;
            // แจ้งเตือนเฉพาะกรณีที่ไม่ได้ตอบกลับตัวเอง
            if ($parent && $parent->user_id !== Auth::id()) {
                $parent->user->notify(new NewCommentNotification($comment));
            }
            return;
        }

        // กรณีเป็นการแสดงความคิดเห็นบนโพสต์ปกติ ให้แจ้งเตือนไปยังเจ้าของโพสต์
        // แจ้งเตือนเฉพาะกรณีที่ไม่ได้คอมเมนต์โพสต์ตัวเอง
        if ($post->user_id !== Auth::id()) {
            $post->user->notify(new NewCommentNotification($comment));
        }
    }

    /**
     * @function clearCacheAndBroadcast
     * @description ฟังก์ชันช่วยเหลือ (Helper) สำหรับล้างข้อมูล Cache เพื่อบังคับให้ดึงข้อมูลใหม่ 
     * และกระจายสัญญาณ (Broadcast) ผ่าน WebSocket แจ้งให้ผู้ใช้อื่นทราบ
     * @return void
     */
    private function clearCacheAndBroadcast(): void
    {
        // หลังจากทำการเพิ่ม แก้ไข หรือ ลบ คอมเมนต์แล้ว ให้ล้างแคชที่เกี่ยวข้องกับโพสต์ทั้งหมด
        Cache::forget('dashboard_posts_all'); 
        
        // ส่งสัญญาณบอก Client อื่นๆ ว่ามีการอัปเดตฟีด เพื่อทำ Real-time UI
        broadcast(new FeedUpdated())->toOthers();
    }
}