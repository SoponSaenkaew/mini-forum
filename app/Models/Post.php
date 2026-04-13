<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    // ✨ อนุญาตให้บันทึกข้อมูลได้ (แก้ MassAssignmentException)
    protected $fillable = ['title', 'content','image'];

    public function user(): BelongsTo 
    { 
        return $this->belongsTo(User::class); 
    }

    public function comments(): HasMany 
    { 
        return $this->hasMany(Comment::class); 
    }
}