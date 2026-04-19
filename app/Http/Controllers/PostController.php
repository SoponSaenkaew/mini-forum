<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use App\Http\Requests\StorePostRequest;
use App\Http\Requests\UpdatePostRequest;

/**
 * @class PostController
 * @description คอนโทรลเลอร์สำหรับจัดการกระดานสนทนา (Posts)
 * ครอบคลุมการสร้าง, แก้ไข, ลบ และการแสดงผลโพสต์ฉบับเต็ม พร้อมจัดการระบบอัปโหลดรูปภาพ (Gallery)
 */
class PostController extends Controller
{
    /**
     * @function store
     * @description สร้างโพสต์ใหม่ลงในระบบพร้อมอัปโหลดรูปภาพที่แนบมาด้วย
     * @param StorePostRequest $request ข้อมูลฟอร์มที่ผ่านการตรวจสอบความถูกต้องแล้ว (Validation)
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้ากระดานหลัก (Dashboard)
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // 1. สร้างโพสต์หลักและเชื่อมโยงกับผู้ใช้งานปัจจุบัน
        $post = $request->user()->posts()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        // 2. ตรวจสอบและบันทึกรูปภาพ (รองรับการอัปโหลดหลายไฟล์พร้อมกัน)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('posts', 'public');
                $post->images()->create(['image_path' => $path]);
            }
        }

        // ล้าง Cache หน้ากระดานหลักเพื่อให้โพสต์ใหม่แสดงผลบนฟีดทันที
        Cache::forget('dashboard_posts_all');

        return redirect(route('dashboard'));
    }
    
    /**
     * @function destroy
     * @description ลบโพสต์และไฟล์รูปภาพที่เกี่ยวข้องทั้งหมดออกจากระบบ
     * @param Post $post โมเดลโพสต์เป้าหมายที่ต้องการลบ
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้ากระดานหลัก
     */
    public function destroy(Post $post): RedirectResponse
    {
        // ตรวจสอบสิทธิ์การเข้าถึง: อนุญาตให้ลบได้เฉพาะเจ้าของโพสต์เท่านั้น
        if ($post->user_id !== auth()->id()) { 
            abort(403, 'Unauthorized action.'); 
        }

        // ทำการลบไฟล์รูปภาพออกจากเซิร์ฟเวอร์ (Storage) ก่อน เพื่อไม่ให้เกิดไฟล์ขยะตกค้าง
        foreach ($post->images as $img) {
            Storage::disk('public')->delete($img->image_path);
        }

        $post->delete();

        // ล้าง Cache หน้ากระดานหลัก
        Cache::forget('dashboard_posts_all');

        return redirect(route('dashboard'));
    }

    /**
     * @function update
     * @description อัปเดตข้อมูลเนื้อหาโพสต์ และจัดการสลับเปลี่ยนรูปภาพ (หากมีการอัปโหลดใหม่)
     * @param UpdatePostRequest $request ข้อมูลฟอร์มที่ผ่านการตรวจสอบแล้ว
     * @param Post $post โมเดลโพสต์ที่ต้องการแก้ไข
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้ากระดานหลัก
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        // ตรวจสอบสิทธิ์การเข้าถึง
        if ($post->user_id !== auth()->id()) { 
            abort(403, 'Unauthorized action.'); 
        }

        $validated = $request->validated();

        $post->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        // จัดการเปลี่ยนรูปภาพ (ทำงานเฉพาะเมื่อผู้ใช้งานเลือกอัปโหลดรูปชุดใหม่เข้ามา)
        if ($request->hasFile('images')) {
            
            // ลบรูปภาพชุดเก่าออกจากเซิร์ฟเวอร์และฐานข้อมูลให้หมดก่อน
            foreach ($post->images as $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            }
            
            // อัปโหลดและบันทึกรูปภาพชุดใหม่เข้าไปแทนที่
            foreach ($request->file('images') as $file) {
                $path = $file->store('posts', 'public');
                $post->images()->create(['image_path' => $path]);
            }
        }

        // ล้าง Cache หน้ากระดานหลัก
        Cache::forget('dashboard_posts_all');

        return redirect(route('dashboard'));
    }

    /**
     * @function show
     * @description แสดงผลหน้าโพสต์แบบเจาะจง (Full Post View) 
     * พร้อมดึงข้อมูลความสัมพันธ์ทั้งหมด (Eager Loading) เพื่อแสดงความคิดเห็นและรูปภาพ
     * @param Request $request ข้อมูล HTTP Request (ใช้เพื่อตรวจสอบเป้าหมายการทำ Highlight)
     * @param Post $post โมเดลโพสต์ที่ถูกเลือก
     * @return \Inertia\Response หน้า Component ของ Inertia.js
     */
    public function show(Request $request, Post $post)
    {
        // รับค่า comment_id จาก URL Parameters เพื่อใช้เน้นข้อความ (Highlight) ความคิดเห็นนั้นๆ
        $highlightId = $request->query('comment_id');

        return Inertia::render('Posts/Show', [
            // โหลดข้อมูลความสัมพันธ์ (Relations) ทั้งหมดที่จำเป็นต้องใช้ในหน้าแสดงผล
            'post' => $post->load([
                'user',
                'likes', 
                'images', 
                'comments' => function($query) {
                    $query->whereNull('parent_id')
                          ->with(['user', 'likes', 'replies'])
                          ->latest();
                }
            ]),
            'highlightId' => $highlightId ? (int)$highlightId : null,
        ]);
    }
}