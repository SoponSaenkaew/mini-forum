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

// --- หน้าแรกของเว็บไซต์ ---
// routes/web.php
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        // ✨ ดึงโพสต์ล่าสุด 3 อันมาโชว์ที่หน้าแรก
        'latestPosts' => Post::with(['user', 'likes', 'images'])->latest()->take(3)->get(),
    ]);
});

// --- หน้า Dashboard: แสดงฟีดโพสต์ทั้งหมด ---
Route::get('/dashboard', function (Request $request) {
    $search = $request->query('search');

    // ✨ สร้างกุญแจสำหรับจำข้อมูล (ถ้ามีการค้นหา ก็ให้จำแยกกัน)
    $cacheKey = 'dashboard_posts_' . ($search ?: 'all');

    // ✨ สั่งให้ Redis จำข้อมูลโพสต์ทั้งหมดไว้ 60 วินาที!
    $posts = Cache::remember($cacheKey, 60, function () use ($search) {
        return Post::with([
            'user', 
            'likes', 
            'images',
            'comments' => function($query) {
                $query->whereNull('parent_id')
                      ->with(['user', 'likes', 'replies']) 
                      ->latest();
            }
        ])
        ->when($search, function($query, $search) {
            $query->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
        })
        ->latest()->get();
    });

    return Inertia::render('Dashboard', [
        'posts' => $posts, // ส่งข้อมูลที่จำไว้ออกไป!
        'searchedUsers' => $search ? User::where('name', 'like', "%{$search}%")->limit(5)->get() : [],
        'filters' => ['search' => $search],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// --- กลุ่มเส้นทางที่ต้องล็อกอินก่อนเข้าถึง ---
Route::middleware(['auth', 'verified'])->group(function () {
    // 👤 จัดการโปรไฟล์และหน้าโปรไฟล์รวมโพสต์
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/user/{user}', [ProfileController::class, 'show'])->name('profile.show'); // ✨ หน้าโปรไฟล์ User
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar.update');
    Route::post('/profile/cover', [ProfileController::class, 'updateCoverPhoto'])->name('profile.cover.update');

    // 📝 จัดการโพสต์
    Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show'); // ✨ ดูโพสต์เดี่ยว (วาร์ปจากแจ้งเตือน)
    Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
    Route::patch('/posts/{post}', [PostController::class, 'update'])->name('posts.update');
    Route::delete('/posts/{post}', [PostController::class, 'destroy'])->name('posts.destroy');

    // 💬 จัดการคอมเมนต์
    Route::post('/posts/{post}/comments', [CommentController::class, 'store'])->name('comments.store');
    Route::patch('/comments/{comment}', [CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])->name('comments.destroy');

    // 🔔 ระบบแจ้งเตือน
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::get('/comments/{comment}/reply', [CommentController::class, 'replyPage'])->name('comments.reply');
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.read_all');
    
    // ❤️ ระบบกดถูกใจ (Likes)
    Route::post('/posts/{post}/like', [LikeController::class, 'togglePost'])->name('posts.like');
    Route::post('/comments/{comment}/like', [LikeController::class, 'toggleComment'])->name('comments.like');
});

require __DIR__.'/auth.php';