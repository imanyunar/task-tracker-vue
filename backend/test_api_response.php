<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Task;
use App\Models\Project;
use App\Models\User;

// Simulate admin user request
$admin = User::where('role_id', 1)->first();

echo "=== SIMULATING ADMIN DASHBOARD STATS REQUEST ===\n";
echo "Admin User: {$admin->name}\n\n";

$user = $admin;

if ($user->role_id == 3) {
    // Employee
    $totalTasks = Task::whereHas('project.members', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->count();
    
    $completedTasks = Task::whereHas('project.members', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->where('status', 'done')->count();
    
    $pendingTasks = Task::whereHas('project.members', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->where('status', '!=', 'done')->count();
    
    $totalProjects = $user->projects()->count();
} else {
    // Admin/Manager
    $totalTasks = Task::count();
    $completedTasks = Task::where('status', 'done')->count();
    $pendingTasks = Task::where('status', '!=', 'done')->count();
    $totalProjects = Project::count();
}

// KPI Calculation
$completionRate = $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0;
$onTimeTasks = Task::where('status', 'done')
    ->whereColumn('updated_at', '<=', 'due_date')->count();
$timelinessRate = $completedTasks > 0 ? ($onTimeTasks / $completedTasks) * 100 : 0;
$kpiScore = round(($completionRate * 0.6) + ($timelinessRate * 0.4), 2);

$responseArray = [
    'success' => true,
    'total_tasks' => $totalTasks,
    'completed_tasks' => $completedTasks,
    'pending_tasks' => $pendingTasks,
    'total_projects' => $totalProjects,
    'completion_rate' => round($completionRate, 1),
    'timeliness_rate' => round($timelinessRate, 1),
    'kpi_score' => $kpiScore
];

echo "Response:\n";
echo json_encode($responseArray, JSON_PRETTY_PRINT) . "\n\n";

// Test employee
$employee = User::where('role_id', 3)->first();
echo "=== SIMULATING EMPLOYEE DASHBOARD STATS REQUEST ===\n";
echo "Employee User: {$employee->name}\n\n";

$user = $employee;

if ($user->role_id == 3) {
    $totalTasks = Task::whereHas('project.members', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->count();
    
    $completedTasks = Task::whereHas('project.members', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->where('status', 'done')->count();
    
    $pendingTasks = Task::whereHas('project.members', function ($query) use ($user) {
        $query->where('user_id', $user->id);
    })->where('status', '!=', 'done')->count();
    
    $totalProjects = $user->projects()->count();
} else {
    $totalTasks = Task::count();
    $completedTasks = Task::where('status', 'done')->count();
    $pendingTasks = Task::where('status', '!=', 'done')->count();
    $totalProjects = Project::count();
}

$completionRate = $totalTasks > 0 ? ($completedTasks / $totalTasks) * 100 : 0;
$onTimeTasks = Task::where('status', 'done')
    ->whereColumn('updated_at', '<=', 'due_date')->count();
$timelinessRate = $completedTasks > 0 ? ($onTimeTasks / $completedTasks) * 100 : 0;
$kpiScore = round(($completionRate * 0.6) + ($timelinessRate * 0.4), 2);

$responseArray = [
    'success' => true,
    'total_tasks' => $totalTasks,
    'completed_tasks' => $completedTasks,
    'pending_tasks' => $pendingTasks,
    'total_projects' => $totalProjects,
    'completion_rate' => round($completionRate, 1),
    'timeliness_rate' => round($timelinessRate, 1),
    'kpi_score' => $kpiScore
];

echo "Response:\n";
echo json_encode($responseArray, JSON_PRETTY_PRINT) . "\n";
?>
