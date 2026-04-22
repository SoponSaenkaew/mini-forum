<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Models\User; 

// --- สำหรับระบบ Admin Dashboard (Filament) ---
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel; 

/**
 * @class User
 * @description โมเดลสำหรับจัดการข้อมูลผู้ใช้งานและสิทธิ์การเข้าถึงระบบ
 */
class User extends Authenticatable implements FilamentUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * แนบตัวแปรนี้ไปกับ JSON เสมอ
     */
    protected $appends = ['avatar_url', 'cover_photo_url'];

    public function getAvatarUrlAttribute()
    {
        return $this->avatar ? Storage::url($this->avatar) : null;
    }

    public function getCoverPhotoUrlAttribute()
    {
        return $this->cover_photo ? Storage::url($this->cover_photo) : null;
    }

    /**
     * รายการฟิลด์ที่อนุญาตให้บันทึกข้อมูลแบบเป็นชุด (Mass Assignment)
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_admin', 
        'avatar',      
        'cover_photo',
    ];

    /**
     * รายการฟิลด์ที่ต้องซ่อนเมื่อแปลงข้อมูลเป็น Array หรือ JSON (เช่น API)
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * การตั้งค่าการแปลงประเภทข้อมูลอัตโนมัติ (Casting)
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean', // ✨ แปลงเป็น Boolean ให้อัตโนมัติค่ะ
        ];
    }

    /**
     * ความสัมพันธ์: ผู้ใช้งานหนึ่งคนสามารถมีได้หลายโพสต์
     * @return HasMany
     */
    public function posts(): HasMany 
    { 
        return $this->hasMany(Post::class); 
    }

    /**
     * ฟังก์ชันตรวจสอบสิทธิ์การเข้าถึงระบบหลังบ้าน (Filament Admin Panel)
     * @param Panel $panel
     * @return bool
     */
    public function canAccessPanel(Panel $panel): bool
    {
        // อนุญาตเฉพาะผู้ใช้งานที่มีสถานะเป็น Admin เท่านั้น
        return $this->is_admin === true;
    }

}