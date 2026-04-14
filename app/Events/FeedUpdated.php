<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // ✨ สำคัญมาก!
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FeedUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct()
    {
        //
    }

    public function broadcastOn(): array
    {
        // ✨ สร้างช่องกระจายเสียงชื่อ 'public-feed'
        return [
            new Channel('public-feed'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'FeedUpdated';
    }
}