<?php

namespace App\Http\Controllers;

use App\Models\Post; //
use App\Models\Comment; //

use Illuminate\Http\Request;
use App\Notifications\NewCommentNotification;

class CommentController extends Controller
{
    public function store(Request $request, Post $post)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        // สร้างคอมเมนต์ผ่านความสัมพันธ์ที่ตั้งไว้ใน Post Model

        $comment = $post->comments()->create([
        'user_id' => auth()->id(),
        'content' => $request->content,
        ]);

        // ✨ แจ้งเตือนเจ้าของโพสต์ (ถ้าคนคอมเมนต์ไม่ใช่เจ้าของโพสต์เอง)
        if ($post->user_id !== auth()->id()) {
            $post->user->notify(new NewCommentNotification($comment));
        }

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
    public function update(Request $request, Comment $comment)
    {
        // ตรวจสอบสิทธิ์ว่าเซนเซเป็นเจ้าของคอมเมนต์นี้จริงไหม
        if ($comment->user_id !== auth()->id()) {
            abort(403, 'เซนเซไม่มีสิทธิ์แก้ไขคอมเมนต์ของคนอื่นนะคะ!');
        }

        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $comment->update($validated); // บันทึกข้อมูลใหม่

        return back(); // กลับหน้าเดิมโดยรักษาตำแหน่ง scroll
    }
}