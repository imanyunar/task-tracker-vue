<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use App\Models\Post;
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
   // app/Models/Project.php

public function department(): BelongsTo
{
    return $this->belongsTo(Department::class);
}

public function tasks(): HasMany
{
    return $this->hasMany(Task::class);
}

/**
 * Relasi untuk Anggota Tim (Many-to-Many)
 */
public function members(): BelongsToMany
{
    return $this->belongsToMany(User::class, 'project_user')
                ->withPivot('role_in_project')
                ->withTimestamps();
}

/**
 * FIX: Tambahkan ini agar Controller tidak error saat memanggil with('user')
 * Kita asumsikan 'user' di sini adalah Owner pertama dari proyek ini.
 */
public function user()
{
    // Mengambil member yang role_in_project nya adalah OWNER (1)
    return $this->belongsToMany(User::class, 'project_user')
                ->wherePivot('role_in_project', self::OWNER)
                ->withPivot('role_in_project')
                ->limit(1);
}

public function posts(): HasMany
{
    return $this->hasMany(Post::class);
}

}