<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * แสดงหน้า Dashboard หลักและจัดการการค้นหา
     */
    public function index(Request $request): Response
    {
        $search = $request->query('search');

        // ดึงข้อมูลโพสต์พร้อม Relation ที่จำเป็น (รวม replies.user แก้บัคหน้าขาวแล้ว!)
        $postQuery = Post::with([
            'user', 
            'likes', 
            'images',
            'comments' => function($query) {
                $query->whereNull('parent_id')
                      ->with(['user', 'likes', 'replies.user', 'replies.likes']) 
                      ->latest();
            }
        ]);

        // จัดการระบบค้นหา
        $posts = $postQuery->when($search, function ($query, $search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        })->latest()->get();

        // ส่งข้อมูลไปที่หน้าจอ Inertia (React)
        return Inertia::render('Dashboard', [
            'posts' => $posts,
            'searchedUsers' => $search ? User::where('name', 'like', "%{$search}%")->limit(5)->get() : [],
            'filters' => ['search' => $search],
        ]);
    }
}