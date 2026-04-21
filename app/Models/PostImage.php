<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute; 
use Illuminate\Support\Facades\Storage;   

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
            if (empty($value)) return null;

            return str_starts_with($value, 'http') 
                ? $value 
                : Storage::disk('s3')->url($value);
        });
    }
}
