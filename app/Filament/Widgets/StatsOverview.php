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
            Stat::make('Total Posts', Post::count())
                ->description('การเติบโตของเนื้อหา')
                ->descriptionIcon('heroicon-m-arrow-trending-up')
                ->chart([7, 2, 10, 3, 15, 4, 17]) // เพิ่มกราฟเส้นจำลองสวยๆ
                ->color('success'),

            Stat::make('Total Comments', Comment::count())
                ->description('การมีส่วนร่วมล่าสุด')
                ->descriptionIcon('heroicon-m-chat-bubble-left-right')
                ->color('info'),
                
            Stat::make('Total Users', \App\Models\User::count())
                ->description('สมาชิกทั้งหมดในระบบ')
                ->descriptionIcon('heroicon-m-users')
                ->color('warning'),
        ];
    }
}