<?php

use App\Models\User;
use App\Models\Project;
use App\Models\Task;

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Update test user dengan role_id 1 (Admin)
$user = User::where('email', 'test@example.com')->first();
if ($user) {
  $user->update(['role_id' => 1]);
  echo "✓ User updated with role_id = 1\n";
} else {
  echo "✗ Test user not found\n";
  exit(1);
}

// Create projects
$projects = [];
$projectNames = ['Website Redesign', 'Mobile App Dev', 'API Integration'];
foreach ($projectNames as $name) {
  $p = Project::create([
    'name' => $name,
    'description' => "Project: $name",
    'status' => 'on_progress',
    'start_date' => now()->subDays(30),
    'end_date' => now()->addDays(60)
  ]);
  $projects[] = $p;
  echo "✓ Created project: $name (ID: {$p->id})\n";
}

// Create tasks
$statuses = ['todo', 'doing', 'review', 'done'];
$taskIdx = 1;
foreach ($projects as $proj) {
  foreach ($statuses as $status) {
    Task::create([
      'project_id' => $proj->id,
      'assigned_to' => $user->id,
      'user_id' => $user->id,
      'title' => "Task $taskIdx - " . ucfirst($status),
      'description' => "Sample task $taskIdx",
      'status' => $status,
      'priority' => 'high',
      'due_date' => now()->addDays(rand(1, 30))
    ]);
    $taskIdx++;
  }
}
echo "✓ Created 12 tasks\n";
echo "✓ Database populated successfully!\n";
