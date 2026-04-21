<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PostImage extends Model
{
    use SoftDeletes;
    use HasFactory;

    protected $guarded = [];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
    protected function imagePath(): Attribute
    {
        return Attribute::get(function ($value) {
            // ถ้ามันขึ้นต้นด้วย http อยู่แล้วก็ส่งคืนเลย แต่ถ้าไม่ ก็ให้ดึง URL จาก S3
            return str_starts_with($value, 'http') ? $value : Storage::disk('s3')->url($value);
        });
    }
}
