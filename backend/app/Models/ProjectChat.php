<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectChat extends Model
{
    protected $fillable = ['project_id', 'user_id', 'message'];

    // Relasi ke User (Pengirim)
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Relasi ke Project
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}