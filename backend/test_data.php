<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Task;
use App\Models\Project;
use App\Models\User;

echo "=== DATABASE DATA DEBUG ===\n\n";

echo "Total Users: " . User::count() . "\n";
foreach (User::all() as $user) {
    echo "  - {$user->name} (Role: {$user->role_id}, Dept: {$user->department_id})\n";
}

echo "\nTotal Projects: " . Project::count() . "\n";
foreach (Project::all() as $project) {
    echo "  - {$project->name} (Members: " . $project->members()->count() . ")\n";
}

echo "\nTotal Tasks: " . Task::count() . "\n";
foreach (Task::all() as $task) {
    echo "  - {$task->title} (Status: {$task->status}, Project: {$task->project_id})\n";
}

echo "\n=== ADMIN USER STATS ===\n";
$admin = User::where('role_id', 1)->first();
if ($admin) {
    echo "User: {$admin->name} (Role ID: {$admin->role_id})\n";
    echo "Total Tasks: " . Task::count() . "\n";
    echo "Completed Tasks: " . Task::where('status', 'done')->count() . "\n";
    echo "Total Projects: " . Project::count() . "\n";
}

echo "\n=== EMPLOYEE USER STATS ===\n";
$employee = User::where('role_id', 3)->first();
if ($employee) {
    echo "User: {$employee->name} (Role ID: {$employee->role_id})\n";
    $tasksCount = Task::whereHas('project.members', function ($q) use ($employee) {
        $q->where('user_id', $employee->id);
    })->count();
    echo "Tasks from assigned projects: {$tasksCount}\n";
    echo "Assigned projects: " . $employee->projects()->count() . "\n";
}

echo "\n";
?>
