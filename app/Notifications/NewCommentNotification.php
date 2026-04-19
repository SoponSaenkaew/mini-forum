<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

class NewCommentNotification extends Notification implements ShouldBroadcastNow
{
    public function __construct(public $comment) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast']; // ✨ ระบุว่าเก็บลง Database
    }

    public function toArray(object $notifiable): array
    {
        // ✨ สร้างเงื่อนไขเช็คว่ามี parent_id หรือไม่
        $message = $this->comment->parent_id 
            ? 'ได้ตอบกลับความคิดเห็นของคุณ 💬' 
            : 'ได้มาแสดงความคิดเห็นในโพสต์ของคุณ ✨';

        return [
            'comment_id' => $this->comment->id,
            'post_id' => $this->comment->post_id,
            'user_name' => $this->comment->user->name, // ชื่อคนคอมเมนต์
            'message' => $message, // ✨ ส่งข้อความที่แยกประเภทแล้วไปเก็บ
        ];
    }

    public function toBroadcast(object $notifiable)
    {
        return new \Illuminate\Notifications\Messages\BroadcastMessage([
            'unread_notifications_count' => $notifiable->unreadNotifications()->count(),
            'user_name' => $this->comment->user->name,
            'message' => $this->comment->parent_id ? 'ตอบกลับคอมเมนต์ของคุณ' : 'คอมเมนต์โพสต์ของคุณ',
        ]);
    }
}