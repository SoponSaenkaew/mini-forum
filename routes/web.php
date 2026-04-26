<?php

use Inertia\Inertia;

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\LikeController;

use App\Models\Post;
use App\Models\User;

use Illuminate\Support\Facades\Cache;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes (เส้นทางสำหรับเว็บแอปพลิเคชัน)
|--------------------------------------------------------------------------
*/

/**
 * @route GET /
 * @description หน้าแรกของเว็บไซต์ (Welcome Page)
 * นำเสนอภาพรวมของระบบและดึงข้อมูลโพสต์ล่าสุดจำนวน 3 รายการเพื่อแสดงผลดึงดูดผู้ใช้งาน
 */
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'latestPosts' => Post::with(['user', 'likes', 'images'])->latest()->take(3)->get(),
    ]);
});

/**
 * @route GET /dashboard
 * @description หน้ากระดานหลัก (Dashboard) แสดงฟีดโพสต์ทั้งหมด
 * มีการประยุกต์ใช้ระบบ Cache เพื่อเก็บข้อมูลโพสต์เป็นเวลา 60 วินาที ช่วยลดภาระการคิวรีฐานข้อมูล (Database Load)
 */
Route::get('/dashboard', function (Request $request) {
    $search = $request->query('search');

    // 1. กำหนดโครงสร้าง Query หลักที่ต้องใช้ซ้ำ
    $postQuery = Post::with([
        'user', 
        'likes', 
        'images',
        'comments' => function($query) {
            $query->whereNull('parent_id')
                  ->with(['user', 'likes', 'replies']) 
                  ->latest();
        }
    ]);

    // 2. แยกลอจิก: แคชเฉพาะตอน "ไม่ค้นหา" เท่านั้น
    if (empty($search)) {
        // ไม่มีคำค้นหา -> ดึงฟีดหลักจาก Cache
        $posts = Cache::remember('dashboard_posts_all', 60, function () use ($postQuery) {
            return $postQuery->latest()->get();
        });
    } else {
        // มีคำค้นหา -> คิวรีจากฐานข้อมูลสดๆ (Real-time) เพื่อความแม่นยำ
        $posts = $postQuery->where('title', 'like', "%{$search}%")
                           ->orWhere('content', 'like', "%{$search}%")
                           // แอบเพิ่มการค้นหาชื่อคนเขียนโพสต์ให้ด้วยค่ะ (ถ้าคุณครูต้องการ)
                           ->orWhereHas('user', function ($q) use ($search) {
                               $q->where('name', 'like', "%{$search}%");
                           })
                           ->latest()
                           ->get();
    }

    return Inertia::render('Dashboard', [
        'posts' => $posts,
        'searchedUsers' => $search ? User::where('name', 'like', "%{$search}%")->limit(5)->get() : [],
        'filters' => ['search' => $search],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// ==========================================
// Authenticated Routes (กลุ่มเส้นทางที่ต้องเข้าสู่ระบบก่อนเข้าถึง)
// ==========================================
Route::middleware(['auth', 'verified'])->group(function () {
    
    /**
     * @group Profile Management (การจัดการโปรไฟล์ผู้ใช้งาน)
     */
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/profile/{user}', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::post('/profile/cover', [ProfileController::class, 'updateCoverPhoto'])->name('profile.cover.update');

    /**
     * @group Post Management (การจัดการกระดานสนทนาและโพสต์)
     */
    Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show')->whereNumber('post'); // ดูรายละเอียดโพสต์ (มักถูกเรียกจากลิงก์ระบบแจ้งเตือน)
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::match(['put', 'patch'], '/posts/{post}', [PostController::class, 'update'])->name('posts.update')->whereNumber('post');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy')->whereNumber('post');

    /**
     * @group Comment Management (การจัดการความคิดเห็น)
     */
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    /**
     * @group Notification Management (การจัดการระบบแจ้งเตือน)
     */
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::get('/comments/{comment}/reply', [CommentController::class, 'replyPage'])->name('comments.reply');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read_all');
    
    /**
     * @group Like Management (การจัดการระบบถูกใจ)
     */
    Route::post('/posts/{post}/like', [LikeController::class, 'togglePost'])->name('posts.like');
    Route::post('/comments/{comment}/like', [LikeController::class, 'toggleComment'])->name('comments.like');
});

require __DIR__.'/auth.php';