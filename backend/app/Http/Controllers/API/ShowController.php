<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectChat;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class ShowController extends Controller
{
    // ─── Department ───────────────────────────────────────────────────────────

    public function departmentIndex()
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar semua departemen',
            'data'    => Department::all(),
        ]);
    }

    public function departmentShow($id)
    {
        return response()->json([
            'success' => true,
            'data'    => Department::with('users')->findOrFail($id),
        ]);
    }

    // ─── Profile ──────────────────────────────────────────────────────────────

    public function profileShow(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Data profil berhasil diambil',
            'data'    => $request->user()->load('department', 'role'),
        ]);
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    public function userIndex(Request $request)
    {
        $user = $request->user();

        $users = $user->role->name === 'employee'
            ? User::where('id', $user->id)->get()
            : User::all();

        return response()->json($users);
    }

    public function userShow($id)
    {
        return response()->json([
            'success' => true,
            'data'    => User::with(['department', 'tasks', 'projects', 'attendances'])->findOrFail($id),
        ]);
    }

    public function userProfile(Request $request)
    {
        return response()->json([
            'success' => true,
            'user'    => $request->user()->load('department', 'role'),
        ]);
    }

    // ─── Project ──────────────────────────────────────────────────────────────

    public function projectIndex(Request $request)
    {
        $user = $request->user();

        $projects = Project::with(['department', 'members'])
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn($q) => $q->where('status', 'done'),
            ])
            ->when($user->role_id != 1, fn($q) => $q->where(fn($q) =>
                $q->where('department_id', $user->department_id)
                  ->orWhereHas('members', fn($q) => $q->where('user_id', $user->id))
            ))
            ->get()
            ->each(function ($project) use ($user) {
                $member = $project->members->firstWhere('id', $user->id);
                $project->my_role_id = $member?->pivot->role_in_project;
                $project->progress   = $project->tasks_count > 0
                    ? round(($project->completed_tasks_count / $project->tasks_count) * 100, 2)
                    : 0;
            });

        return response()->json($projects);
    }

    public function projectShow($id)
    {
        $project = Project::with(['members', 'tasks.user', 'department', 'posts.user'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $project->id,
                'name'        => $project->name,
                'description' => $project->description,
                'department'  => $project->department->name ?? 'General',
                'tasks'       => $project->tasks,
                'posts'       => $project->posts,
                'members'     => $project->members->map(fn($m) => [
                    'id'              => $m->id,
                    'name'            => $m->name,
                    'role_in_project' => $m->pivot->role_in_project,
                    'avatar'          => 'https://ui-avatars.com/api/?name=' . urlencode($m->name) . '&background=4f46e5&color=fff',
                ]),
            ],
        ]);
    }

    public function projectSearch(Request $request)
    {
        $user    = $request->user();
        $keyword = $request->input('search', '');

        $projects = Project::where(fn($q) =>
                $q->where('name', 'ILIKE', "%$keyword%")
                  ->orWhere('description', 'ILIKE', "%$keyword%")
            )
            ->when($user->role_id != 1, fn($q) => $q->where(fn($q) =>
                $q->where('department_id', $user->department_id)
                  ->orWhereHas('members', fn($q) => $q->where('user_id', $user->id))
            ))
            ->get();

        return response()->json(['success' => true, 'data' => $projects, 'count' => $projects->count()]);
    }

    // ─── Task ─────────────────────────────────────────────────────────────────

    public function taskIndex(Request $request)
    {
        $user = $request->user();

        $tasks = Task::with(['project', 'user'])
            ->when(!in_array($user->role_id, [1, 2]), fn($q) => $q->where(fn($q) =>
                $q->where('user_id', $user->id)
                  ->orWhereHas('project.members', fn($q) =>
                    $q->where('user_id', $user->id)->whereIn('role_in_project', [1, 2])
                  )
            ))
            ->latest()
            ->get();

        return response()->json($tasks);
    }

    public function taskShow($id)
    {
        return response()->json([
            'success' => true,
            'data'    => Task::with(['project.members', 'user.department'])->findOrFail($id),
        ]);
    }

    public function tasksByProject(Request $request, $projectId)
    {
        $user = $request->user();

        if ($user->role_id == 3) {
            $isMember = Project::where('id', $projectId)
                ->whereHas('members', fn($q) => $q->where('user_id', $user->id))
                ->exists();

            if (!$isMember) {
                return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
            }
        }

        $tasks = Task::with('user.department')
            ->where('project_id', $projectId)
            ->orderBy('due_date')
            ->paginate(10);

        return response()->json(['success' => true, 'tasks' => $tasks]);
    }

    public function taskDashboardStats(Request $request)
    {
        $user = $request->user();
        $base = Task::whereHas('project.members', fn($q) => $q->where('user_id', $user->id));

        if ($user->role_id == 3) {
            $totalTasks     = (clone $base)->count();
            $completedTasks = (clone $base)->whereRaw('LOWER(status) = ?', ['done'])->count();
            $pendingTasks   = (clone $base)->whereRaw('LOWER(status) != ?', ['done'])->count();
            $totalProjects  = $user->projects()->count();
        } else {
            $totalTasks     = Task::count();
            $completedTasks = Task::whereRaw('LOWER(status) = ?', ['done'])->count();
            $pendingTasks   = Task::whereRaw('LOWER(status) != ?', ['done'])->count();
            $totalProjects  = Project::count();
        }

        $mine     = (clone $base)->where('user_id', $user->id);
        $myTotal  = (clone $mine)->count();
        $myDone   = (clone $mine)->whereRaw('LOWER(status) = ?', ['done'])->count();
        $myOnTime = (clone $mine)->whereRaw('LOWER(status) = ?', ['done'])->whereColumn('updated_at', '<=', 'due_date')->count();

        $compRate = $myTotal > 0 ? ($myDone / $myTotal) * 100 : 0;
        $timeRate = $myDone  > 0 ? ($myOnTime / $myDone) * 100 : 0;

        return response()->json([
            'success'         => true,
            'total_tasks'     => $totalTasks,
            'completed_tasks' => $completedTasks,
            'pending_tasks'   => $pendingTasks,
            'total_projects'  => $totalProjects,
            'completion_rate' => round($compRate, 1),
            'timeliness_rate' => round($timeRate, 1),
            'kpi_score'       => round(($compRate * 0.6) + ($timeRate * 0.4), 2),
        ]);
    }

    public function taskKPIStats(Request $request)
    {
        $user   = $request->user();
        $total  = Task::where('user_id', $user->id)->count();
        $done   = Task::where('user_id', $user->id)->where('status', 'done')->count();
        $onTime = Task::where('user_id', $user->id)->where('status', 'done')->whereColumn('updated_at', '<=', 'due_date')->count();

        $compRate     = $total > 0 ? ($done / $total) * 100 : 0;
        $timeRate     = $done  > 0 ? ($onTime / $done) * 100 : 0;
        $projectCount = Project::whereHas('members', fn($q) => $q->where('user_id', $user->id))->count();
        $projectScore = min($projectCount * 20, 100);

        return response()->json([
            'success' => true,
            'score'   => round(($compRate * 0.6) + ($timeRate * 0.3) + ($projectScore * 0.1), 2),
            'metrics' => [
                'completion' => round($compRate),
                'attendance' => 0,
                'timeliness' => round($timeRate),
                'projects'   => $projectCount,
            ],
        ]);
    }

    // ─── Chat ─────────────────────────────────────────────────────────────────

    public function chatIndex(Request $request, $projectId)
    {
        $messages = ProjectChat::where('project_id', $projectId)
            ->where('id', '>', $request->query('last_id', 0))
            ->with('user:id,name')
            ->oldest()
            ->get();

        return response()->json($messages);
    }
}