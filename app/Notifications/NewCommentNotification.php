<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewCommentNotification extends Notification
{
    public function __construct(public $comment) {}

    public function via(object $notifiable): array
    {
        return ['database']; // ✨ ระบุว่าเก็บลง Database
    }

    public function toArray(object $notifiable): array
    {
        return [
            'comment_id' => $this->comment->id,
            'post_id' => $this->comment->post_id,
            'user_name' => $this->comment->user->name, // ชื่อคนคอมเมนต์
            'message' => 'มาแสดงความคิดเห็นในโพสต์ของคุณ',
        ];
    }
}