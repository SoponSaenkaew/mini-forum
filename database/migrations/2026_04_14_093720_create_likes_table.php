<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // ใครเป็นคนกดไลก์
            $table->morphs('likeable'); // ✨ เวทมนตร์ของ Polymorphic! มันจะสร้างคอลัมน์ likeable_type และ likeable_id ให้เองค่ะ
            $table->timestamps();

            // ป้องกันไม่ให้ยูสเซอร์คนเดิมกดไลก์ซ้ำสิ่งเดิม 2 รอบค่ะ
            $table->unique(['user_id', 'likeable_id', 'likeable_type']); 
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('likes');
    }
};