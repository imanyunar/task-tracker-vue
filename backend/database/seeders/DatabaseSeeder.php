<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Project;
use App\Models\Task;
use App\Models\Role;
use App\Models\Department;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $managerRole = Role::firstOrCreate(['name' => 'manager']);
        $employeeRole = Role::firstOrCreate(['name' => 'employee']);

        // 2. Create departments
        $itDept = Department::firstOrCreate(['name' => 'IT Support']);
        $hrDept = Department::firstOrCreate(['name' => 'Human Resource']);
        $marketingDept = Department::firstOrCreate(['name' => 'Marketing']);

        // 3. Create users
        $admin = User::firstOrCreate(
            ['email' => 'admin@tas.com'],
            [
                'name'          => 'Super Admin TAS',
                'password'      => Hash::make('password123'), 
                'department_id' => $itDept->id,
                'role_id'       => $adminRole->id,
            ]
        );

        $manager = User::firstOrCreate(
            ['email' => 'manager@tas.com'],
            [
                'name'          => 'Project Manager',
                'password'      => Hash::make('password123'), 
                'department_id' => $itDept->id,
                'role_id'       => $managerRole->id,
            ]
        );

        $member = User::firstOrCreate(
            ['email' => 'member@tas.com'],
            [
                'name'          => 'Team Member',
                'password'      => Hash::make('password123'), 
                'department_id' => $hrDept->id,
                'role_id'       => $employeeRole->id,
            ]
        );

        // 4. Create projects (DITAMBAHKAN department_id agar tidak error)
        $projects = [
            Project::firstOrCreate(
                ['name' => 'Website Redesign'],
                [
                    'description'   => 'Complete redesign of company website with modern UI',
                    'start_date'    => '2026-02-01',
                    'end_date'      => '2026-04-30',
                    'status'        => 'on_progress',
                    'department_id' => $itDept->id, // Wajib ada
                ]
            ),
            Project::firstOrCreate(
                ['name' => 'Mobile App Development'],
                [
                    'description'   => 'Build iOS and Android app for task management',
                    'start_date'    => '2026-02-15',
                    'end_date'      => '2026-06-30',
                    'status'        => 'on_progress',
                    'department_id' => $itDept->id, // Wajib ada
                ]
            ),
            Project::firstOrCreate(
                ['name' => 'Database Migration'],
                [
                    'description'   => 'Migrate from MySQL to PostgreSQL',
                    'start_date'    => '2026-01-20',
                    'end_date'      => '2026-03-20',
                    'status'        => 'completed',
                    'department_id' => $itDept->id, // Wajib ada
                ]
            ),
        ];

        // 5. Create tasks
        $tasksData = [
            // Project 1 tasks
            ['title' => 'Design Homepage Mockup', 'description' => 'Create mockup for new homepage', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-02-20', 'project_id' => $projects[0]->id, 'user_id' => $admin->id],
            ['title' => 'Setup Development Environment', 'description' => 'Setup dev server and tools', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-02-15', 'project_id' => $projects[0]->id, 'user_id' => $manager->id],
            ['title' => 'Build Header Component', 'description' => 'Create responsive header', 'status' => 'doing', 'priority' => 'high', 'due_date' => '2026-02-28', 'project_id' => $projects[0]->id, 'user_id' => $admin->id],
            ['title' => 'Implement Footer Section', 'description' => 'Add footer with links', 'status' => 'todo', 'priority' => 'medium', 'due_date' => '2026-03-05', 'project_id' => $projects[0]->id, 'user_id' => $member->id],
            
            // Project 2 tasks
            ['title' => 'Create Project Structure', 'description' => 'Setup Flutter/React Native project', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-02-20', 'project_id' => $projects[1]->id, 'user_id' => $manager->id],
            ['title' => 'Design App UI Screens', 'description' => 'Design all app screens in Figma', 'status' => 'review', 'priority' => 'high', 'due_date' => '2026-03-10', 'project_id' => $projects[1]->id, 'user_id' => $admin->id],
            ['title' => 'Implement Authentication', 'description' => 'Add login/register screens', 'status' => 'todo', 'priority' => 'high', 'due_date' => '2026-03-20', 'project_id' => $projects[1]->id, 'user_id' => $member->id],
            ['title' => 'Connect to Backend API', 'description' => 'Integrate with REST API', 'status' => 'todo', 'priority' => 'urgent', 'due_date' => '2026-04-01', 'project_id' => $projects[1]->id, 'user_id' => $manager->id],
            
            // Project 3 tasks
            ['title' => 'Backup MySQL Database', 'description' => 'Create full backup before migration', 'status' => 'done', 'priority' => 'urgent', 'due_date' => '2026-01-25', 'project_id' => $projects[2]->id, 'user_id' => $admin->id],
            ['title' => 'Create PostgreSQL Schema', 'description' => 'Design schema for PostgreSQL', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-01-30', 'project_id' => $projects[2]->id, 'user_id' => $manager->id],
            ['title' => 'Run Data Migration', 'description' => 'Migrate all data to PostgreSQL', 'status' => 'done', 'priority' => 'urgent', 'due_date' => '2026-02-10', 'project_id' => $projects[2]->id, 'user_id' => $admin->id],
            ['title' => 'Test Database Performance', 'description' => 'Verify queries and performance', 'status' => 'done', 'priority' => 'medium', 'due_date' => '2026-03-20', 'project_id' => $projects[2]->id, 'user_id' => $member->id],
        ];

        foreach ($tasksData as $taskData) {
            Task::firstOrCreate(
                ['title' => $taskData['title'], 'project_id' => $taskData['project_id']],
                $taskData
            );
        }

        // 6. Assign users to projects (Menggunakan pivot project_user)
        // Gunakan role_in_project: 1:OWNER, 2:MANAGER, 3:CONTRIBUTOR, 4:STAKEHOLDER
        $projects[0]->members()->sync([
            $admin->id   => ['role_in_project' => 1],
            $manager->id => ['role_in_project' => 2],
            $member->id  => ['role_in_project' => 3],
        ]);

        $projects[1]->members()->sync([
            $admin->id   => ['role_in_project' => 2],
            $manager->id => ['role_in_project' => 1],
        ]);

        $projects[2]->members()->sync([
            $admin->id   => ['role_in_project' => 1],
            $manager->id => ['role_in_project' => 2],
            $member->id  => ['role_in_project' => 4],
        ]);
    }
}