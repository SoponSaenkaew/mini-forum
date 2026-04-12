<?php

namespace App\Http\Controllers;

use App\Models\Post; //
use App\Models\Comment; //

use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // สร้างคอมเมนต์ผ่านความสัมพันธ์ที่ตั้งไว้ใน Post Model
        $post->comments()->create([
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);

        return back(); // ส่งกลับหน้าเดิม
    }
    
    public function destroy(Comment $comment)
    {
        // ✨ เช็คว่าคนที่จะลบ เป็นเจ้าของคอมเมนต์จริงๆ หรือเปล่า
        if ($comment->user_id !== auth()->id()) {
            abort(403, 'เซนเซไม่มีสิทธิ์ลบคอมเมนต์ของคนอื่นนะคะ!');
        }

        $comment->delete();

        // กลับไปหน้าเดิมและรักษาตำแหน่งการ Scroll ไว้ด้วยนะคะ
        return back();
    }
}