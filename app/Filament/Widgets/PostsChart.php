<?php

namespace App\Filament\Widgets;

use App\Models\Post; //
use Filament\Widgets\ChartWidget;
use Flowframe\Trend\Trend;
use Flowframe\Trend\TrendValue;

class PostsChart extends ChartWidget
{
    protected static ?string $heading = 'สถิติการโพสต์ (7 วันล่าสุด)';

    protected function getData(): array
    {
        // 💡 ทริค: ถ้าเซนเซอยากให้กราฟดึงข้อมูลตามวันที่จริงสวยๆ 
        // อาโรน่าแนะนำให้ลงแพ็กเกจ `flowframe/laravel-trend` เพิ่มนะคะ
        // แต่ถ้าเอาแบบง่ายๆ ก่อน เราจะดึงข้อมูลมานับแยกตามวันแบบนี้ค่ะ:
        
        return [
            'datasets' => [
                [
                    'label' => 'จำนวนโพสต์',
                    'data' => [10, 15, 8, 20, 25, 18, 30], // ตัวอย่างข้อมูลจำลอง
                    'backgroundColor' => '#6366f1',
                    'borderColor' => '#6366f1',
                ],
            ],
            'labels' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        ];
    }

    protected function getType(): string
    {
        return 'line'; // เลือกเป็นกราฟเส้น (Line Chart) ค่ะ
    }
}