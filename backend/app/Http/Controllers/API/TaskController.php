<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Task::with(['project', 'user']);
        if ($user->role_id == 3) {
            $tasks = $query->whereHas('project.members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->get();
        } else {
            $tasks = $query->get();
        }
        return response()->json($tasks, 200);
    }

    public function store(Request $request)
    {
        $user = $request->user();
        if ($user->role_id == 3) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        } else {
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:projects,id',
                'user_id' => 'required|exists:users,id',
                'title' => 'required|string',
                'description' => 'nullable|string',
                'priority' => 'required|in:low,medium,high,urgent',
                'status' => 'required|in:todo,review,doing,done',
                'due_date' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                return response()->json($validator->errors(), 422);
            }

            $task = Task::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Tugas Berhasil Dibuat',
                'task' => $task
            ], 201);
        }
    }

    public function update(Request $request, $id)
{
    $user = $request->user();
    $task = Task::with('project.members')->findOrFail($id);
    
    $member = $task->project->members()->where('user_id', $user->id)->first();
    $roleInProject = $member ? $member->pivot->role_in_project : null;

    // Cek apakah dia Stakeholder (4)
    if ($roleInProject == 4 && $user->role_id > 2) {
        return response()->json([
            'success' => false,
            'message' => 'Stakeholder hanya memiliki akses baca (read-only).'
        ], 403);
    }

    // Logika untuk Owner (1) dan Manager (2) yang boleh edit semua
    if ($user->role_id <= 2 || in_array($roleInProject, [1, 2])) {
        $task->update($request->all());
    } 
    // Logika untuk Contributor (3) yang hanya boleh update status tugasnya sendiri
    else if ($task->user_id === $user->id) {
        $task->update($request->only('status'));
    } else {
        return response()->json(['message' => 'Akses ditolak'], 403);
    }

    return response()->json(['success' => true, 'task' => $task]);
}
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::findOrFail($id);
        if ($user->role_id == 3) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak'
            ], 403);
        } else {
            $task->delete();
        }
        return response()->json([
            'success' => true,
            'message' => 'Tugas Berhasil Dihapus'
        ], 200);
    }

    public function tasksByProject(Request $request, $projectId)
    {
        $user = $request->user();
        $task = Task::with('user.department')->where('project_id', $projectId);
        if ($user->role_id == 3) {
            $isMember = Project::where('id', $projectId)
                ->whereHas('members', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
            if (!$isMember->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak'
                ], 403);
            }
        }
        $taskslist = $task->orderBy('due_date')->paginate(10);

        return response()->json([
            'success' => true,
            'tasks' => $taskslist
        ], 200);
    }

    public function getDashboardStats(Request $request)
{
    $user = $request->user();

    /** * 1. DEFINISI QUERY DASAR (SINKRON DENGAN INDEX)
     * Kita hanya menghitung tugas yang ada di dalam proyek di mana user adalah anggotanya.
     */
    $baseTaskQuery = Task::whereHas('project.members', function ($q) use ($user) {
        $q->where('user_id', $user->id);
    });

    // --- LOGIKA BOX STATISTIK (KANAN BAWAH) ---
    if ($user->role_id == 3) {
        // Employee: Statistik hanya berdasarkan proyek yang diikuti
        $totalTasks = (clone $baseTaskQuery)->count();
        $completedTasks = (clone $baseTaskQuery)->whereRaw('LOWER(status) = ?', ['done'])->count();
        $pendingTasks = (clone $baseTaskQuery)->whereRaw('LOWER(status) != ?', ['done'])->count();
        $totalProjects = $user->projects()->count();
    } else {
        // Admin/Manager: Statistik global satu perusahaan
        $totalTasks = Task::count();
        $completedTasks = Task::whereRaw('LOWER(status) = ?', ['done'])->count();
        $pendingTasks = Task::whereRaw('LOWER(status) != ?', ['done'])->count();
        $totalProjects = Project::count();
    }

    /**
     * 2. LOGIKA KPI (MURNI PERSONAL & SINKRON)
     * Hanya menghitung tugas yang user_id-nya adalah kamu 
     * DAN berada di dalam proyek yang kamu ikuti.
     */
    $myPersonalTasks = (clone $baseTaskQuery)->where('user_id', $user->id);
    
    $myTotal = (clone $myPersonalTasks)->count();
    $myDone = (clone $myPersonalTasks)->whereRaw('LOWER(status) = ?', ['done'])->count();
    
    // Hitung Ketepatan Waktu (On-Time)
    $myOnTime = (clone $myPersonalTasks)
        ->whereRaw('LOWER(status) = ?', ['done'])
        ->whereColumn('updated_at', '<=', 'due_date')
        ->count();

    // Kalkulasi Rate
    $compRate = $myTotal > 0 ? ($myDone / $myTotal) * 100 : 0;
    $timeRate = $myDone > 0 ? ($myOnTime / $myDone) * 100 : 0;
    $kpiScore = round(($compRate * 0.6) + ($timeRate * 0.4), 2);

    return response()->json([
        'success' => true,
        'total_tasks' => $totalTasks,
        'completed_tasks' => $completedTasks,
        'pending_tasks' => $pendingTasks,
        'total_projects' => $totalProjects,
        'completion_rate' => round($compRate, 1),
        'timeliness_rate' => round($timeRate, 1),
        'kpi_score' => $kpiScore
    ], 200);
}

    public function show($id)
    {
        $task = Task::with(['project.members', 'user.department'])->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $task,
        ], 200);
    }

    public function getKPIStats(Request $request)
    {
        $user = $request->user();
        $totalTasks = Task::where('user_id', $user->id)->count();
        $doneTasks = Task::where('user_id', $user->id)->where('status', 'done')->count();
        $completionRate = $totalTasks > 0 ? ($doneTasks / $totalTasks) * 100 : 0;

        $onTimeTasks = Task::where('user_id', $user->id)
            ->where('status', 'done')
            ->whereColumn('updated_at', '<=', 'due_date')->count();
        $timelinessRate = $doneTasks > 0 ? ($onTimeTasks / $doneTasks) * 100 : 0;

        $projectCount = Project::whereHas('members', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->count();
        $projectScore = min($projectCount * 20, 100);

        $finalKPI = ($completionRate * 0.6) + ($timelinessRate * 0.3) + ($projectScore * 0.1);

        return response()->json([
            'success' => true,
            'score' => round($finalKPI, 2),
            'metrics' => [
                'completion' => round($completionRate),
                'attendance' => 0,
                'timeliness' => round($timelinessRate),
                'projects'   => $projectCount
            ]
        ]);
    }
}