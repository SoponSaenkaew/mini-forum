<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    /**
     * ตรวจสอบสิทธิ์ว่าผู้ใช้มีสิทธิ์ทำการส่ง Request นี้หรือไม่
     */
    public function authorize(): bool
    {
        // ในกรณีนี้ ผู้ใช้งานที่ Login ทุกคนสามารถโพสต์ได้
        return auth()->check(); 
    }

    /**
     * กำหนดกฎ (Rules) สำหรับการตรวจสอบข้อมูล
     */
    public function rules(): array
    {
        return [
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'images'  => ['nullable', 'array', 'max:5'], // จำกัดไม่เกิน 5 รูป
            'images.*' => ['nullable', 'image', 'mimes:jpeg, jpg, png, webp, avif, gif', 'max:5120'], // ไฟล์ละไม่เกิน 5MB
        ];
    }
}
