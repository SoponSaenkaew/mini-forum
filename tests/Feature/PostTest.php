<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostTest extends TestCase
{
    // ✨ สำคัญมาก: เวทมนตร์นี้จะช่วยจำลองฐานข้อมูลเปล่าๆ ขึ้นมาเทส 
    // และลบทิ้งอัตโนมัติเมื่อเทสเสร็จ ข้อมูลจริงของเซนเซจะได้ไม่พังค่ะ!
    use RefreshDatabase; 

    /**
     * 🧪 เทสที่ 1: เช็กระบบป้องกันคนแปลกหน้า
     */
    public function test_guest_cannot_create_post(): void
    {
        // ยิงคำสั่งสร้างโพสต์แบบดื้อๆ โดยไม่ล็อกอิน
        $response = $this->post('/posts', [
            'title' => 'โพสต์ป่วนเมือง',
            'content' => 'แอบสร้างโพสต์ตอนที่ไม่มีใครเห็น!',
        ]);

        // ระบบต้องเตะกลับไปหน้า login
        $response->assertRedirect('/login');
    }

    /**
     * 🧪 เทสที่ 2: เช็กระบบสร้างโพสต์ของสมาชิก
     */
    public function test_authenticated_user_can_create_post(): void
    {
        // 1. สร้าง User จำลองขึ้นมา 1 คน
        $user = User::factory()->create();

        // 2. จำลองการล็อกอินด้วย User นั้น แล้วส่งข้อมูลไปสร้างโพสต์
        $response = $this->actingAs($user)->post('/posts', [
            'title' => 'โพสต์แรกของฉัน',
            'content' => 'สวัสดี นี่คือโพสต์จากการเขียนเทสโดยเซนเซ!',
        ]);

        // 3. ตรวจสอบว่าระบบส่งสถานะกลับมาถูกต้อง (302 Redirect กลับไปหน้าเดิม)
        $response->assertStatus(302);

        // 4. เข้าไปส่องในฐานข้อมูลว่ามีโพสต์นี้โผล่มาจริงๆ ใช่ไหม
        $this->assertDatabaseHas('posts', [
            'title' => 'โพสต์แรกของฉัน',
            'content' => 'สวัสดี นี่คือโพสต์จากการเขียนเทสโดยเซนเซ!',
            'user_id' => $user->id,
        ]);
    }
}