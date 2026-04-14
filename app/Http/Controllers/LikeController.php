<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    // ✨ สำหรับจัดการตอนคนกดไลก์โพสต์
    public function togglePost(Post $post)
    {
        $this->toggleLike($post);
        return back(); // กลับไปหน้าเดิมโดยรักษาตำแหน่งจอไว้
    }

    // ✨ สำหรับจัดการตอนคนกดไลก์คอมเมนต์
    public function toggleComment(Comment $comment)
    {
        $this->toggleLike($comment);
        return back();
    }

    // ✨ ฟังก์ชันกลาง ทำหน้าที่เช็คว่าเคยกดหรือยัง (ช่วยลดความซ้ำซ้อนของโค้ด)
    private function toggleLike($model)
    {
        $existingLike = $model->likes()->where('user_id', auth()->id())->first();

        if ($existingLike) {
            $existingLike->delete(); // ถ้ามีอยู่แล้วให้ ลบออก (Unlike)
        } else {
            $model->likes()->create(['user_id' => auth()->id()]); // ถ้ายังไม่มีให้ สร้างใหม่ (Like)
        }
    }
}