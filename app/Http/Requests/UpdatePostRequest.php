<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // ดึง Model Post จาก Route มาเช็คว่าเป็นของคนล็อคอินไหม
        $post = $this->route('post');
        return $post && $this->user()->id === $post->user_id;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['nullable', 'image', 'mimes:jpeg, jpg, png, webp, avif, gif', 'max:5120'],
        ];
    }
}
