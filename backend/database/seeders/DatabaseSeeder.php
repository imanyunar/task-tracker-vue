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
       // Create roles if not exist
       Role::firstOrCreate(['name' => 'admin']);
       Role::firstOrCreate(['name' => 'manager']);
       Role::firstOrCreate(['name' => 'employee']);

       // Create departments if not exist
       Department::firstOrCreate(['name' => 'IT Support']);
       Department::firstOrCreate(['name' => 'Human Resource']);
       Department::firstOrCreate(['name' => 'Marketing']);

       // Create 3 users with roles and departments
       $users = [
           User::firstOrCreate(
               ['email' => 'admin@tas.com'],
               [
                   'name'          => 'Super Admin TAS',
                   'password'      => Hash::make('password123'), 
                   'department_id' => 1,
                   'role_id'       => 1,
               ]
           ),
           User::firstOrCreate(
               ['email' => 'manager@tas.com'],
               [
                   'name'          => 'Project Manager',
                   'password'      => Hash::make('password123'), 
                   'department_id' => 1,
                   'role_id'       => 2,
               ]
           ),
           User::firstOrCreate(
               ['email' => 'member@tas.com'],
               [
                   'name'          => 'Team Member',
                   'password'      => Hash::make('password123'), 
                   'department_id' => 2,
                   'role_id'       => 3,
               ]
           ),
       ];

       // Create 3 projects
       $projects = [
           Project::firstOrCreate(
               ['name' => 'Website Redesign'],
               [
                   'description' => 'Complete redesign of company website with modern UI',
                   'start_date' => '2026-02-01',
                   'end_date' => '2026-04-30',
                   'status' => 'on_progress',
               ]
           ),
           Project::firstOrCreate(
               ['name' => 'Mobile App Development'],
               [
                   'description' => 'Build iOS and Android app for task management',
                   'start_date' => '2026-02-15',
                   'end_date' => '2026-06-30',
                   'status' => 'on_progress',
               ]
           ),
           Project::firstOrCreate(
               ['name' => 'Database Migration'],
               [
                   'description' => 'Migrate from MySQL to PostgreSQL',
                   'start_date' => '2026-01-20',
                   'end_date' => '2026-03-20',
                   'status' => 'completed',
               ]
           ),
       ];

       // Create tasks for project 1
       $tasksData = [
           // Project 1 tasks
           ['title' => 'Design Homepage Mockup', 'description' => 'Create mockup for new homepage', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-02-20', 'project_id' => $projects[0]->id, 'user_id' => 1],
           ['title' => 'Setup Development Environment', 'description' => 'Setup dev server and tools', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-02-15', 'project_id' => $projects[0]->id, 'user_id' => 2],
           ['title' => 'Build Header Component', 'description' => 'Create responsive header', 'status' => 'doing', 'priority' => 'high', 'due_date' => '2026-02-28', 'project_id' => $projects[0]->id, 'user_id' => 1],
           ['title' => 'Implement Footer Section', 'description' => 'Add footer with links', 'status' => 'todo', 'priority' => 'medium', 'due_date' => '2026-03-05', 'project_id' => $projects[0]->id, 'user_id' => 3],
           
           // Project 2 tasks
           ['title' => 'Create Project Structure', 'description' => 'Setup Flutter/React Native project', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-02-20', 'project_id' => $projects[1]->id, 'user_id' => 2],
           ['title' => 'Design App UI Screens', 'description' => 'Design all app screens in Figma', 'status' => 'review', 'priority' => 'high', 'due_date' => '2026-03-10', 'project_id' => $projects[1]->id, 'user_id' => 1],
           ['title' => 'Implement Authentication', 'description' => 'Add login/register screens', 'status' => 'todo', 'priority' => 'high', 'due_date' => '2026-03-20', 'project_id' => $projects[1]->id, 'user_id' => 3],
           ['title' => 'Connect to Backend API', 'description' => 'Integrate with REST API', 'status' => 'todo', 'priority' => 'urgent', 'due_date' => '2026-04-01', 'project_id' => $projects[1]->id, 'user_id' => 2],
           
           // Project 3 tasks
           ['title' => 'Backup MySQL Database', 'description' => 'Create full backup before migration', 'status' => 'done', 'priority' => 'urgent', 'due_date' => '2026-01-25', 'project_id' => $projects[2]->id, 'user_id' => 1],
           ['title' => 'Create PostgreSQL Schema', 'description' => 'Design schema for PostgreSQL', 'status' => 'done', 'priority' => 'high', 'due_date' => '2026-01-30', 'project_id' => $projects[2]->id, 'user_id' => 2],
           ['title' => 'Run Data Migration', 'description' => 'Migrate all data to PostgreSQL', 'status' => 'done', 'priority' => 'urgent', 'due_date' => '2026-02-10', 'project_id' => $projects[2]->id, 'user_id' => 1],
           ['title' => 'Test Database Performance', 'description' => 'Verify queries and performance', 'status' => 'done', 'priority' => 'medium', 'due_date' => '2026-03-20', 'project_id' => $projects[2]->id, 'user_id' => 3],
       ];

       foreach ($tasksData as $taskData) {
           Task::firstOrCreate(
               ['title' => $taskData['title'], 'project_id' => $taskData['project_id']],
               $taskData
           );
       }

       // Assign users to projects (sync to avoid duplicates)
       $projects[0]->users()->sync([1, 2, 3], false);
       $projects[1]->users()->sync([1, 2], false);
       $projects[2]->users()->sync([1, 2, 3], false);
    }
}
