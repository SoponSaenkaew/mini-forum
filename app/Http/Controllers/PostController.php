<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images' => 'nullable|array|max:5', // ✨ อนุญาตให้แนบรูปได้สูงสุด 5 รูป
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        // สร้างโพสต์ก่อน
        $post = $request->user()->posts()->create([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        // ✨ ถ้ามีรูปแนบมา ให้วนลูปเซฟทีละรูปเข้าตาราง post_images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('posts', 'public');
                $post->images()->create(['image_path' => $path]);
            }
        }

        return redirect(route('dashboard'));
    }
    
    public function destroy(Post $post)
    {
        if ($post->user_id !== auth()->id()) { abort(403); }
        $post->delete();
        return redirect(route('dashboard'));
    }

    public function update(Request $request, Post $post)
    {
        if ($post->user_id !== auth()->id()) { abort(403); }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'images' => 'nullable|array|max:5', // ✨ อนุญาตให้แนบรูปได้สูงสุด 5 รูป
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $post->update([
            'title' => $validated['title'],
            'content' => $validated['content'],
        ]);

        if ($request->hasFile('images')) {
            // ✨ ลบรูปเก่าทิ้งให้เกลี้ยงก่อน
            foreach ($post->images as $img) {
                Storage::disk('public')->delete($img->image_path);
                $img->delete();
            }
            // ✨ อัปโหลดรูปล็อตใหม่เข้าไปแทนที่
            foreach ($request->file('images') as $file) {
                $path = $file->store('posts', 'public');
                $post->images()->create(['image_path' => $path]);
            }
        }

        return redirect(route('dashboard'));
    }

    public function show(Request $request, Post $post)
    {
        $highlightId = $request->query('comment_id');

        return Inertia::render('Posts/Show', [
            // ✨ อย่าลืมดึง 'images' มาด้วยนะคะ
            'post' => $post->load([
                'user',
                'likes', 
                'images', 
                'comments' => function($query) {
                $query->whereNull('parent_id')->with(['user', 'likes', 'replies'])->latest();
            }]),
            'highlightId' => $highlightId ? (int)$highlightId : null,
        ]);
    }
}