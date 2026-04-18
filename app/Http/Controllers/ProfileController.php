<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

use Illuminate\Support\Facades\Storage;


class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * แสดงหน้าโปรไฟล์ของผู้ใช้พร้อมรายการโพสต์ของเขา
     */
    public function show(User $user)
    {
        return Inertia::render('Profile/Show', [
            'user' => $user,
            // ✨ ดึงโพสต์พร้อมความสัมพันธ์ต่างๆ เหมือนหน้า Dashboard เพื่อให้ PostItem ทำงานได้
            'posts' => $user->posts()->with([
                'user', 
                'likes',
                'images',
                'comments' => function($query) {
                    $query->whereNull('parent_id')
                        ->with(['user', 'likes', 'replies'])
                        ->latest();
                }
            ])->latest()->get(),
        ]);
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // ลบรูปเก่าทิ้งก่อน (ถ้ามี)
            // 💡 ตอนนี้จะใช้งานได้แล้วเพราะเรา import Storage มาแล้วค่ะ
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            // เก็บรูปใหม่ในโฟลเดอร์ avatars
            $path = $request->file('avatar')->store('avatars', 'public');
            
            // บันทึกพาธรูปลง Database
            $user->update(['avatar' => $path]);
        }

        // รีโหลดข้อมูลกลับไปที่หน้าเดิมเพื่อให้รูปเปลี่ยนทันที
        return back()->with('status', 'profile-avatar-updated');
    }

    public function updateCoverPhoto(Request $request)
    {
        $request->validate([
            // หน้าปกอาจจะใหญ่หน่อย หนูให้ลิมิตที่ 4MB นะคะ (4096 KB)
            'cover_photo' => ['required', 'image', 'max:4096'], 
        ]);

        $user = $request->user();

        if ($request->hasFile('cover_photo')) {
            // ลบหน้าปกเก่าทิ้งก่อนเพื่อประหยัดพื้นที่
            if ($user->cover_photo) {
                Storage::disk('public')->delete($user->cover_photo);
            }

            // เก็บรูปใหม่ในโฟลเดอร์ covers
            $path = $request->file('cover_photo')->store('covers', 'public');
            $user->update(['cover_photo' => $path]);
        }

        return back()->with('status', 'profile-cover-updated');
    }
}
