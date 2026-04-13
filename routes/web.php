<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\NotificationController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Models\Post;

// --- หน้าแรกของเว็บไซต์ ---
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// --- หน้า Dashboard: แสดงฟีดโพสต์ทั้งหมด ---
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard', [
        'posts' => Post::with([
            'user', 
            'comments' => function($query) {
                // ✨ เปลี่ยนมาเรียกแค่ 'user' และ 'replies' พอค่ะ Model จะจัดการส่วนที่ลึกกว่าให้เอง
                $query->whereNull('parent_id')
                      ->with(['user', 'replies'])
                      ->latest();
            }
        ])->latest()->get(),
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// --- กลุ่มเส้นทางที่ต้องล็อกอินก่อนเข้าถึง ---
Route::middleware(['auth', 'verified'])->group(function () {
    // 👤 จัดการโปรไฟล์และหน้าโปรไฟล์รวมโพสต์
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/user/{user}', [ProfileController::class, 'show'])->name('profile.show'); // ✨ หน้าโปรไฟล์ User

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
    
    
});

require __DIR__.'/auth.php';