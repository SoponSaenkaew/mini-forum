<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ✨ เช็กก่อนว่าตาราง posts มีคอลัมน์ deleted_at แอบอยู่แล้วหรือยัง?
        if (!Schema::hasColumn('posts', 'deleted_at')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->softDeletes(); 
            });
        }

        // ✨ เช็กก่อนว่าตาราง comments มีหรือยัง?
        if (!Schema::hasColumn('comments', 'deleted_at')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->softDeletes(); 
            });
        }
    }

    public function down(): void
    {
        // ✨ ตอนถอยหลัง ก็เช็กก่อนลบเช่นกันค่ะ
        if (Schema::hasColumn('posts', 'deleted_at')) {
            Schema::table('posts', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }

        if (Schema::hasColumn('comments', 'deleted_at')) {
            Schema::table('comments', function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};