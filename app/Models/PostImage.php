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
        return $this->image_url ? Storage::disk('supabase')->url($this->image_url) : null;
    }

    protected $guarded = [];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}