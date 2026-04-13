<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    /**
     * บันทึกโพสต์ใหม่ลงฐานข้อมูล
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048', // ✨ เช็คว่าเป็นรูปภาพไม่เกิน 2MB
        ]);

        if ($request->hasFile('image')) {
            // ✨ บันทึกลงโฟลเดอร์ storage/app/public/posts
            $path = $request->file('image')->store('posts', 'public');
            $validated['image'] = $path;
        }

        $request->user()->posts()->create($validated);

        return redirect(route('dashboard'));
    }
    
    public function destroy(Post $post)
    {
        // เช็คว่าคนที่ลบคือเจ้าของโพสต์หรือไม่
        if ($post->user_id !== auth()->id()) {
            abort(403);
        }

        $post->delete();

        return redirect(route('dashboard'));
    }

    public function update(Request $request, Post $post)
    {
        if ($post->user_id !== auth()->id()) { abort(403); }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // ลบรูปเก่าทิ้งถ้ามีการอัปโหลดรูปใหม่
            if ($post->image) { Storage::disk('public')->delete($post->image); }
            $validated['image'] = $request->file('image')->store('posts', 'public');
        }

        $post->update($validated);
        return redirect(route('dashboard'));
    }
    /**
     * แสดงหน้าโพสต์เดี่ยวพร้อมคอมเมนต์
     */
    public function show(Request $request, Post $post)
    {
        $highlightId = $request->query('comment_id');

        return Inertia::render('Posts/Show', [
            'post' => $post->load(['user', 'comments' => function($query) {
                // ✨ โหลดลูกๆ ของคอมเมนต์ออกมาด้วย (ใช้ .replies ไปเรื่อยๆ เพื่อรองรับหลายชั้น)
                $query->whereNull('parent_id')
                    ->with(['user', 'replies.user']) 
                    ->latest();
            }]),
            'highlightId' => $highlightId ? (int)$highlightId : null,
        ]);
    }
}