<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * @class NotificationController
 * @description คอนโทรลเลอร์สำหรับจัดการระบบแจ้งเตือน (Notifications) ของผู้ใช้งาน
 * ทำหน้าที่ดึงรายการแจ้งเตือน อัปเดตสถานะการอ่าน และลบประวัติการแจ้งเตือน
 */
class NotificationController extends Controller
{
    /**
     * @function index
     * @description แสดงหน้าต่างรายการแจ้งเตือนทั้งหมดของผู้ใช้งานปัจจุบัน
     * @return Response หน้า Component ของ Inertia.js
     */
    public function index(): Response
    {
        return Inertia::render('Notifications/Index', [
            // ดึงข้อมูลการแจ้งเตือนทั้งหมดของผู้ใช้งาน โดยเรียงจากล่าสุดไปเก่าสุดอัตโนมัติ
            'notifications' => auth()->user()->notifications,
        ]);
    }

    /**
     * @function markAsRead
     * @description อัปเดตสถานะการแจ้งเตือนที่ระบุเป็น "อ่านแล้ว" พร้อมเปลี่ยนเส้นทาง (Redirect) 
     * ไปยังหน้าโพสต์เป้าหมายและไฮไลต์ความคิดเห็นที่เกี่ยวข้อง
     * @param string|int $id รหัส (ID) ของการแจ้งเตือน
     * @return RedirectResponse รีไดเรกต์ไปยังหน้ารายละเอียดโพสต์ (Post Show)
     */
    public function markAsRead($id): RedirectResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        
        // 1. อัปเดตสถานะการแจ้งเตือนเป็น "อ่านแล้ว"
        $notification->markAsRead();

        // 2. แยกข้อมูล ID ของโพสต์และคอมเมนต์ออกจาก Payload ของการแจ้งเตือน
        $postId = $notification->data['post_id'];
        $commentId = $notification->data['comment_id'] ?? null;

        // 3. เปลี่ยนเส้นทางไปยังหน้าโพสต์เป้าหมาย พร้อมแนบพารามิเตอร์สำหรับไฮไลต์ความคิดเห็น
        return redirect()->route('posts.show', [
            'post' => $postId, 
            'comment_id' => $commentId
        ]);
    }

    /**
     * @function destroy
     * @description ลบข้อมูลการแจ้งเตือนที่ระบุออกจากฐานข้อมูล
     * @param string|int $id รหัส (ID) ของการแจ้งเตือนเป้าหมาย
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิม
     */
    public function destroy($id): RedirectResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->delete();

        return back();
    }

    /**
     * @function markAllAsRead
     * @description อัปเดตสถานะการแจ้งเตือนทั้งหมดที่ยังไม่ได้อ่านของผู้ใช้งานให้เป็น "อ่านแล้ว" (Mark all as read)
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิม
     */
    public function markAllAsRead(): RedirectResponse
    {
        auth()->user()->unreadNotifications->markAsRead();
        
        return back();
    }
}