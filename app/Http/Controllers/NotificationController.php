<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    /**
     * แสดงรายการแจ้งเตือนทั้งหมดของผู้ใช้
     */
    public function index()
    {
        return Inertia::render('Notifications/Index', [
            // ดึงการแจ้งเตือนทั้งหมดของ User เรียงตามใหม่ไปเก่า
            'notifications' => auth()->user()->notifications,
        ]);
    }

    /**
     * เปลี่ยนสถานะการแจ้งเตือนเป็น "อ่านแล้ว"
     */
    public function markAsRead($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        
        // 1. เปลี่ยนสถานะเป็นอ่านแล้ว
        $notification->markAsRead();

        // 2. ดึงข้อมูล post_id และ comment_id จาก data ของแจ้งเตือน
        $postId = $notification->data['post_id'];
        $commentId = $notification->data['comment_id'] ?? null;

        // 3. วาร์ปเซนเซไปยังหน้าโพสต์นั้น พร้อมส่ง comment_id ไปไฮไลท์
        return redirect()->route('posts.show', [
            'post' => $postId, 
            'comment_id' => $commentId
        ]);
    }

    /**
     * ลบการแจ้งเตือนที่ระบุ
     */
    public function destroy($id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->delete();

        return back();
    }

    /**
     * ทำเป็นอ่านแล้วทั้งหมด
     */
    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        
        return back();
    }
}