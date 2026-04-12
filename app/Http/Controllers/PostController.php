<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

class PostController extends Controller
{
    /**
     * บันทึกโพสต์ใหม่ลงฐานข้อมูล
     */
    public function store(Request $request): RedirectResponse
    {
        // 1. ตรวจสอบข้อมูลที่ส่งมา
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // 2. สร้างโพสต์ผ่านความสัมพันธ์ของ User ที่ล็อกอินอยู่
        $request->user()->posts()->create($validated);

        // 3. ย้ายหน้ากลับไปที่เดิม (Dashboard)
        return redirect(route('dashboard'));
    }
}