<?php

namespace App\Filament\Widgets;

use App\Models\Comment; //
use App\Models\Post;    //
use Filament\Widgets\StatsOverviewWidget as BaseWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class StatsOverview extends BaseWidget
{
    protected function getStats(): array
    {
        return [
            // แสดงยอดรวมโพสต์ทั้งหมด
            Stat::make('Total Posts', Post::count())
                ->description('จำนวนโพสต์ทั้งหมดในระบบ')
                ->descriptionIcon('heroicon-m-pencil-square')
                ->color('success'),

            // แสดงยอดรวมคอมเมนต์ทั้งหมด
            Stat::make('Total Comments', Comment::count())
                ->description('การตอบกลับจากสมาชิก')
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color('info'),
        ];
    }
}