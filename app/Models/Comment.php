<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    //
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete(); // ใครเมนต์
            $table->foreignId('post_id')->constrained()->cascadeOnDelete(); // เมนต์ที่โพสต์ไหน
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete(); // ตอบกลับเมนต์ไหน (ถ้ามี)
            $table->text('content');
            $table->timestamps();
        });
    }
}
