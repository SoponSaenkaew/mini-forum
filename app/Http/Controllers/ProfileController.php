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

use Intervention\Image\Laravel\Facades\Image;

/**
 * @class ProfileController
 * @description คอนโทรลเลอร์สำหรับจัดการข้อมูลส่วนตัวของผู้ใช้งาน (User Profile)
 * ครอบคลุมการแก้ไขข้อมูลพื้นฐาน, การลบบัญชี, การแสดงหน้าโปรไฟล์สาธารณะ รวมถึงการอัปโหลดรูปโปรไฟล์และรูปหน้าปก
 */
class ProfileController extends Controller
{
    /**
     * @function edit
     * @description แสดงหน้าฟอร์มสำหรับแก้ไขข้อมูลส่วนตัวของผู้ใช้งาน (Settings/Edit Profile)
     * @param Request $request ข้อมูล HTTP Request
     * @return Response หน้า Component ของ Inertia.js
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * @function update
     * @description ตรวจสอบและบันทึกการเปลี่ยนแปลงข้อมูลส่วนตัวของผู้ใช้งาน (เช่น ชื่อ, อีเมล)
     * @param ProfileUpdateRequest $request ข้อมูลฟอร์มที่ผ่านการตรวจสอบความถูกต้องแล้ว
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าแก้ไขโปรไฟล์
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        // หากมีการเปลี่ยนอีเมล ให้รีเซ็ตสถานะการยืนยันอีเมล
        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * @function destroy
     * @description ลบบัญชีผู้ใช้งานออกจากระบบอย่างถาวร พร้อมทั้งยกเลิก Session
     * @param Request $request ข้อมูล HTTP Request ที่แนบรหัสผ่านปัจจุบันมาเพื่อยืนยันความปลอดภัย
     * @return RedirectResponse รีไดเรกต์ผู้ใช้กลับไปยังหน้าแรกสุด (Welcome Page)
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
     * @function show
     * @description แสดงหน้าโปรไฟล์สาธารณะของผู้ใช้งาน (Public Profile) พร้อมดึงประวัติการโพสต์ทั้งหมด
     * @param User $user ข้อมูลโมเดลของผู้ใช้งานที่ถูกเรียกดู
     * @return Response หน้า Component ของ Inertia.js
     */
    public function show(User $user)
    {
        return Inertia::render('Profile/Show', [
            'user' => $user,
            // ดึงข้อมูลโพสต์พร้อมความสัมพันธ์ต่างๆ แบบ Eager Loading เพื่อให้คอมโพเนนต์ PostItem นำไปแสดงผลได้อย่างสมบูรณ์
            'posts' => $user->posts()->with([
                'user', 
                'likes',
                'images',
                'comments' => function($query) {
                    $query->whereNull('parent_id')
                        ->with(['user', 'likes', 'replies.user', 'replies.likes'])
                        ->latest();
                }
            ])->latest()->get()->values(),
        ]);
    }

    /**
     * @function updateAvatar
     * @description จัดการการอัปโหลดและอัปเดตรูปโปรไฟล์ (Avatar) ของผู้ใช้งาน
     * @param Request $request ข้อมูล HTTP Request ที่แนบไฟล์รูปภาพมาด้วย
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิมพร้อมแนบสถานะความสำเร็จ
     */
    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image','mimes:jpeg, jpg, png, webp, avif, gif', 'max:2048'], // จำกัดขนาดไฟล์รูปโปรไฟล์สูงสุดที่ 2MB
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // ทำการลบรูปโปรไฟล์เก่าออกจากระบบ (Storage) ก่อน เพื่อไม่ให้เปลืองพื้นที่เซิร์ฟเวอร์
            if ($user->avatar) {
                Storage::delete($user->avatar);
            }

            $image = Image::read($request->file('avatar'));
            
            // รูปโปรไฟล์ใช้แสดงผลแค่กรอบเล็กๆ ย่อความกว้างให้เหลือแค่ 400px ก็คมชัดแล้วค่ะ
            $image->scaleDown(width: 400); 
            $encodedImage = $image->toWebp(80);
            
            // สร้างชื่อไฟล์ใหม่
            $filename = 'avatars/' . uniqid('avatar_') . '_' . time() . '.webp';
            
            // บันทึกไฟล์ที่ถูกบีบอัดแล้วลง Storage
            Storage::put($filename, $encodedImage);
            
            // อัปเดตที่อยู่ไฟล์ (Path) ลงในฐานข้อมูลของผู้ใช้งาน
            $user->update(['avatar' => $filename]);
        }

        return back()->with('status', 'profile-avatar-updated');
    }

    /**
     * @function updateCoverPhoto
     * @description จัดการการอัปโหลดและอัปเดตรูปหน้าปก (Cover Photo) ของผู้ใช้งาน
     * @param Request $request ข้อมูล HTTP Request ที่แนบไฟล์รูปภาพมาด้วย
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้าเดิมพร้อมแนบสถานะความสำเร็จ
     */
    public function updateCoverPhoto(Request $request)
    {
        $request->validate([
            // หน้าปกมีขนาดพื้นที่กว้างกว่า อาโรน่าจึงเผื่อขีดจำกัดไฟล์ไว้ที่ 4MB (4096 KB) นะคะ
            'cover_photo' => ['required', 'image','mimes:jpeg, jpg, png, webp, avif, gif', 'max:4096'], 
        ]);

        $user = $request->user();

        if ($request->hasFile('cover_photo')) {
            // ทำการลบรูปหน้าปกเก่าออกจากระบบเพื่อคืนพื้นที่ว่าง
            if ($user->cover_photo) {
                Storage::delete($user->cover_photo);
            }

            $image = Image::read($request->file('cover_photo'));
            
            // หน้าปกกว้างมาก ให้ย่อขนาดความกว้างสูงสุดไว้ที่ 1920px (ระดับ Full HD)
            $image->scaleDown(width: 1920);
            $encodedImage = $image->toWebp(80);
            
            // สร้างชื่อไฟล์ใหม่
            $filename = 'covers/' . uniqid('cover_') . '_' . time() . '.webp';
            
            // บันทึกไฟล์รูปที่ถูกบีบอัดลงใน Storage
            Storage::put($filename, $encodedImage);
            
            // อัปเดตข้อมูลที่อยู่ไฟล์ในฐานข้อมูล
            $user->update(['cover_photo' => $filename]);
        }

        return back()->with('status', 'profile-cover-updated');
    }
}
