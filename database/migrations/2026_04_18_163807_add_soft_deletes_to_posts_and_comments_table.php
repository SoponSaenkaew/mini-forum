<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✨ เพิ่ม deleted_at ให้ตาราง posts
        Schema::table('posts', function (Blueprint $table) {
            $table->softDeletes(); 
        });

        // ✨ เพิ่ม deleted_at ให้ตาราง comments
        Schema::table('comments', function (Blueprint $table) {
            $table->softDeletes(); 
        });
    }

    public function down(): void
    {
        // ✨ วิธียกเลิก (Rollback) ถ้าเปลี่ยนใจ
        Schema::table('posts', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('comments', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};