<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✨ ใส่เกราะเช็กก่อนว่ามีคอลัมน์ deleted_at แอบอยู่แล้วหรือยัง
        if (!Schema::hasColumn('post_images', 'deleted_at')) {
            Schema::table('post_images', function (Blueprint $table) {
                $table->softDeletes(); 
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('post_images', 'deleted_at')) {
            Schema::table('post_images', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};