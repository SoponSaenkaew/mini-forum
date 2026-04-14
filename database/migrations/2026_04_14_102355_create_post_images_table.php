<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_images', function (Blueprint $table) {
            $table->id();
            // ✨ ผูกกับโพสต์ และถ้าโพสต์โดนลบ รูปในตารางนี้ก็หายไปด้วยอัตโนมัติค่ะ
            $table->foreignId('post_id')->constrained()->cascadeOnDelete(); 
            $table->string('image_path'); // เก็บที่อยู่ของไฟล์รูป
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_images');
    }
};