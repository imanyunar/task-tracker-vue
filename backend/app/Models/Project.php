<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Project extends Model
{
    use HasFactory;

    const OWNER = 1;
    const MANAGER = 2;
    const CONTRIBUTOR = 3;
    const STAKEHOLDER = 4;

    // TAMBAHKAN 'department_id' di sini agar bisa diisi (Mass Assignment)
    protected $fillable = [
        'name', 
        'description', 
        'start_date', 
        'end_date', 
        'status', 
        'department_id'
    ];

    /**
     * Relasi ke Department.
     * Proyek dikaitkan ke departemen tertentu.
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')
                    ->withPivot('role_in_project')
                    ->withTimestamps();
    }

    // Tips: Hapus method users() jika fungsinya sama dengan members() 
    // agar tidak membingungkan saat coding.
}