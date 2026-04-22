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
        if (!$this->image_path) return null;

        $disk = config('filesystems.default'); 
        
        if ($disk === 'supabase' && config('filesystems.disks.supabase.bucket')) {
            return Storage::disk('supabase')->url($this->image_path);
        }

        return Storage::url($this->image_path);
    }

    protected $guarded = [];

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}