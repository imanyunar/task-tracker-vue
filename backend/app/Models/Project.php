<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;
    const OWNER = 1;
    const MANAGER = 2;
    const CONTRIBUTOR = 3;
    const STAKEHOLDER = 4;

    protected $fillable = ['name', 'description', 'start_date', 'end_date', 'status'];

    /**
     * Relasi One-to-Many ke Task.
     * Satu proyek memiliki banyak tugas detail.
     */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Relasi Many-to-Many ke User (Tim Proyek).
     * Menghubungkan ke tabel pivot 'project_user'.
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user')
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }

    public function users(){
        return $this->belongsToMany(User::class, 'project_user');
    }
}