<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class PostImage extends Model
{
    use SoftDeletes;
    use HasFactory;
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        return Storage::disk('supabase')->url($this->image_path) : null;
    }

    protected $guarded = [];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}