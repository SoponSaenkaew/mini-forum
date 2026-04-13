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
        // ค้นหาการแจ้งเตือนที่ระบุ และเปลี่ยนสถานะ
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return back(); // ส่งกลับหน้าเดิม
    }
}