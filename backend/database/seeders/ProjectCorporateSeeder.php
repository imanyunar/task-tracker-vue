<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Department;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class ProjectCorporateSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        DB::table('project_user')->truncate();
        DB::table('projects')->truncate();
        DB::table('users')->truncate();
        DB::table('departments')->truncate();
        DB::table('roles')->truncate();
        Schema::enableForeignKeyConstraints();

        $roleAdmin = Role::updateOrCreate(['id' => 1], ['name' => 'Admin']);
        $roleManager = Role::updateOrCreate(['id' => 2], ['name' => 'Manager']);
        $roleEmployee = Role::updateOrCreate(['id' => 3], ['name' => 'Employee']);

        $deptIT = Department::updateOrCreate(['name' => 'IT Department']);

        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@company.com',
            'password' => Hash::make('password'),
            'role_id' => $roleAdmin->id,
            'department_id' => $deptIT->id,
        ]);

        $manager = User::create([
            'name' => 'Project Manager Global',
            'email' => 'pm@company.com',
            'password' => Hash::make('password'),
            'role_id' => $roleManager->id,
            'department_id' => $deptIT->id,
        ]);

        // PROJECT 1 - Tanpa field 'status' agar mengikuti default database
        $project1 = Project::create([
            'name' => 'Sistem ERP Perusahaan',
            'description' => 'Proyek skala besar untuk internal.',
            'start_date' => now(),
            'end_date' => now()->addMonths(6),
            // 'status' dihapus agar tidak melanggar check constraint
        ]);

        $project1->members()->attach($admin->id, ['role_in_project' => Project::OWNER]);
        $project1->members()->attach($manager->id, ['role_in_project' => Project::MANAGER]);

        // PROJECT 2
        $project2 = Project::create([
            'name' => 'Mobile App Client A',
            'description' => 'Pembuatan aplikasi Android & iOS.',
            'start_date' => now(),
            'end_date' => now()->addMonths(3),
        ]);

        $project2->members()->attach($manager->id, ['role_in_project' => Project::OWNER]);

        $this->command->info('Seeding berhasil dengan menggunakan status default database!');
    }
}