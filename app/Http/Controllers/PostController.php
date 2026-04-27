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
// นำเข้า Intervention Image สำหรับจัดการรูปภาพ
use Intervention\Image\Laravel\Facades\Image;

/**
 * @class PostController
 * @package App\Http\Controllers
 * @description คอนโทรลเลอร์สำหรับจัดการระบบกระดานสนทนา (Forum Posts)
 * รองรับการสร้าง, แก้ไข, ลบ และแสดงผลโพสต์ พร้อมระบบจัดการรูปภาพ (Image Processing) 
 * และการจัดการแคช (Cache Management) เพื่อเพิ่มประสิทธิภาพการทำงาน
 */
class PostController extends Controller
{
    /**
     * @function store
     * @description บันทึกโพสต์ใหม่พร้อมประมวลผลรูปภาพเป็นไฟล์ WebP
     * @param StorePostRequest $request ข้อมูลฟอร์มที่ผ่านการตรวจสอบ (Validated)
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้า Dashboard
     */
    public function store(StorePostRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        // 1. สร้าง Record โพสต์หลักเชื่อมโยงกับผู้ใช้ที่ล็อกอิน
        $post = $request->user()->posts()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        // 2. ตรวจสอบและประมวลผลรูปภาพ (ถ้ามี)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                // อ่านข้อมูลรูปภาพและเริ่มการประมวลผล
                $image = Image::read($file);
                
                // ย่อขนาดความกว้างให้ไม่เกิน 1200px (Aspect Ratio จะถูกรักษาไว้อัตโนมัติ)
                $image->scaleDown(width: 1200);
                
                // บีบอัดและแปลงเป็นฟอร์แมต WebP (คุณภาพ 80%) เพื่อประหยัดพื้นที่และโหลดไว
                $encodedImage = $image->toWebp(80);
                
                // กำหนดชื่อไฟล์แบบสุ่มและบันทึกลงใน Directory 'posts'
                $filename = 'posts/' . uniqid('post_') . '_' . time() . '.webp';
                Storage::put($filename, $encodedImage);

                // บันทึกความสัมพันธ์ของรูปภาพลงในฐานข้อมูล
                $post->images()->create(['image_path' => $filename]);
            }
        }

        // ล้าง Cache ข้อมูลโพสต์เพื่อให้หน้า Feed อัปเดตทันที
        Cache::forget('dashboard_posts_all');

        return redirect(route('dashboard'));
    }

    /**
     * @function update
     * @description อัปเดตข้อมูลโพสต์และจัดการเปลี่ยนชุดรูปภาพใหม่
     * @param UpdatePostRequest $request ข้อมูลแก้ไขที่ผ่านการตรวจสอบ
     * @param Post $post โมเดลโพสต์เป้าหมาย
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้า Dashboard
     * @security ตรวจสอบสิทธิ์ความเป็นเจ้าของ (Owner Authorization)
     */
    public function update(UpdatePostRequest $request, Post $post): RedirectResponse
    {
        // ตรวจสอบสิทธิ์: ป้องกันผู้อื่นแอบแก้ไขโพสต์ผ่านการส่ง Request โดยตรง
        if ($post->user_id !== auth()->id()) { 
            abort(403, 'Unauthorized action.'); 
        }

        $validated = $request->validated();

        // อัปเดตข้อมูล Title และ Content
        $post->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        // จัดการรูปภาพใหม่ (จะทำงานเฉพาะเมื่อมีการอัปโหลดไฟล์ใหม่เข้ามา)
        if ($request->hasFile('images')) {
            
            // ลบรูปภาพชุดเก่าทั้งใน Storage และ Database
            foreach ($post->images as $img) {
                Storage::delete($img->image_path);
                $img->delete();
            }
            
            // ประมวลผลและบันทึกรูปภาพชุดใหม่ (Logic เดียวกับฟังก์ชัน Store)
            foreach ($request->file('images') as $file) {
                $image = Image::read($file);
                $image->scaleDown(width: 1200);
                $encodedImage = $image->toWebp(80);
                
                $filename = 'posts/' . uniqid('post_') . '_' . time() . '.webp';
                Storage::put($filename, $encodedImage);
                
                $post->images()->create(['image_path' => $filename]);
            }
        }

        // ล้าง Cache หลังการอัปเดต
        Cache::forget('dashboard_posts_all');

        return redirect(route('dashboard'));
    }

    /**
     * @function destroy
     * @description ลบโพสต์และล้างไฟล์รูปภาพที่เกี่ยวข้องทั้งหมดออกจากระบบ
     * @param Post $post โมเดลโพสต์เป้าหมาย
     * @return RedirectResponse รีไดเรกต์กลับไปยังหน้า Dashboard
     */
    public function destroy(Post $post): RedirectResponse
    {
        // ตรวจสอบสิทธิ์ความเป็นเจ้าของ
        if ($post->user_id !== auth()->id()) { 
            abort(403, 'Unauthorized action.'); 
        }

        // ลบไฟล์รูปภาพออกจาก Storage เพื่อป้องกันไฟล์ขยะ
        foreach ($post->images as $img) {
            Storage::delete($img->image_path);
        }

        // ลบข้อมูลจากฐานข้อมูล (ความสัมพันธ์แบบ Cascade จะจัดการ Record ที่เกี่ยวข้อง)
        $post->delete();

        // ล้าง Cache หลังการลบ
        Cache::forget('dashboard_posts_all');

        return redirect(route('dashboard'));
    }

    /**
     * @function show
     * @description แสดงรายละเอียดโพสต์ฉบับเต็ม พร้อมจัดการการเน้นความคิดเห็น (Highlight)
     * @param Request $request ข้อมูล Request สำหรับดึง Query Params
     * @param Post $post โมเดลโพสต์เป้าหมาย
     * @return \Inertia\Response หน้าแสดงผลผ่าน Inertia.js
     */
    public function show(Request $request, Post $post)
    {
        // ดึงค่า comment_id สำหรับการเน้นข้อความ (ถ้ามี)
        $highlightId = $request->query('comment_id');

        return Inertia::render('Posts/Show', [
            // ใช้ Eager Loading ดึงข้อมูลความสัมพันธ์ที่จำเป็นทั้งหมดในคราวเดียว
            'post' => $post->load([
                'user',         // เจ้าของโพสต์
                'likes',        // ยอดถูกใจ
                'images',       // รูปภาพในโพสต์
                'comments' => function($query) {
                    $query->whereNull('parent_id') // ดึงเฉพาะคอมเมนต์หลัก (ไม่ใช่การตอบกลับ)
                          ->with(['user', 'likes', 'replies.user', 'replies.likes'])
                          ->latest()
                          ->get()
                          ->values()
                }
            ]),
            'highlightId' => $highlightId ? (int)$highlightId : null,
        ]);
    }
}
