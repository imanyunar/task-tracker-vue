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
    // =========================================================================
    // DYNAMIC ROUTES
    // =========================================================================

    /** GET /{model} */
    public function index(Request $request, string $model)
    {
        return match ($model) {
            'departments' => $this->departmentIndex(),
            'users'       => $this->userIndex($request),
            'projects'    => $this->projectIndex($request),
            'tasks'       => $this->taskIndex($request),
            'profile'     => $this->profileShow($request),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    /** GET /{model}/{id} */
    public function show(Request $request, string $model, $id)
    {
        return match ($model) {
            'departments' => $this->departmentShow($id),
            'users'       => $this->userShow($id),
            'projects'    => $this->projectShow($id),
            'tasks'       => $this->taskShow($id),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    /** GET /{model}/{id}/{action} */
    public function action(Request $request, string $model, $id, string $action)
    {
        return match (true) {
            $model === 'projects' && $action === 'tasks' => $this->tasksByProject($request, $id),
            $model === 'projects' && $action === 'chats' => $this->chatIndex($request, $id),
            default => response()->json(['message' => "Action [$action] tidak ditemukan untuk [$model]"], 404),
        };
    }

    // =========================================================================
    // DEPARTMENT
    // =========================================================================

    private function departmentIndex()
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar semua departemen',
            'data'    => Department::all(),
        ]);
    }

    private function departmentShow($id)
    {
        $dept = Department::with('users')->find($id);

        if (!$dept) {
            return response()->json(['message' => 'Departemen tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $dept]);
    }

    // =========================================================================
    // USER
    // =========================================================================

    private function userIndex(Request $request)
    {
        $user  = $request->user();
        $users = $user->role->name === 'employee'
            ? User::where('id', $user->id)->get()
            : User::all();

        return response()->json($users);
    }

    private function userShow($id)
    {
        $user = User::with(['department', 'tasks', 'projects', 'attendances'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        return response()->json(['success' => true, 'data' => $user]);
    }

    // =========================================================================
    // PROJECT
    // =========================================================================

    private function projectIndex(Request $request)
    {
        $user    = $request->user();
        $keyword = $request->input('search', '');

        $query = Project::with(['department', 'members'])
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => function ($q) {
                    $q->where('status', 'done');
                },
            ]);

        // Filter search kalau ada keyword
        if ($keyword !== '') {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'ILIKE', "%$keyword%")
                  ->orWhere('description', 'ILIKE', "%$keyword%");
            });
        }

        // Admin lihat semua, selainnya hanya lihat project departemen atau yang diikuti
        if ((int) $user->role_id !== 1) {
            $query->where(function ($q) use ($user) {
                $q->where('department_id', $user->department_id)
                  ->orWhereHas('members', function ($q) use ($user) {
                      $q->where('user_id', $user->id);
                  });
            });
        }

        $projects = $query->get();

        // Tambah my_role_id — kalkulasi progress dilakukan di frontend
        $projects->transform(function ($project) use ($user) {
            $member = $project->members->where('id', $user->id)->first();
            $project->my_role_id = $member ? $member->pivot->role_in_project : null;
            return $project;
        });

        return response()->json(['success' => true, 'data' => $projects]);
    }

    private function projectShow($id)
    {
        $project = Project::with(['members', 'tasks.user', 'department', 'posts.user'])->find($id);

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'id'          => $project->id,
                'name'        => $project->name,
                'description' => $project->description,
                'start_date'  => $project->start_date,
                'end_date'    => $project->end_date,
                'status'      => $project->status,
                'department'  => $project->department->name ?? 'General',
                'tasks'       => $project->tasks,
                'posts'       => $project->posts,
                'members'     => $project->members->map(function ($member) {
                    return [
                        'id'              => $member->id,
                        'name'            => $member->name,
                        'email'           => $member->email,
                        'role_in_project' => $member->pivot->role_in_project,
                        'avatar'          => 'https://ui-avatars.com/api/?name=' . urlencode($member->name) . '&background=4f46e5&color=fff',
                    ];
                }),
            ],
        ]);
    }

    // =========================================================================
    // TASK
    // =========================================================================

    private function taskIndex(Request $request)
    {
        $user  = $request->user();
        $query = Task::with(['project', 'user']);

        // Admin & Manager lihat semua
        // Employee hanya lihat tugasnya atau project yang dia jadi Owner/Manager
        if (!in_array($user->role_id, [1, 2])) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereHas('project.members', function ($q) use ($user) {
                      $q->where('user_id', $user->id)
                        ->whereIn('role_in_project', [1, 2]);
                  });
            });
        }

        return response()->json($query->latest()->get());
    }

    private function taskShow($id)
    {
        $task = Task::with(['project.members', 'user.department'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $task]);
    }

    private function tasksByProject(Request $request, $projectId)
    {
        $user = $request->user();

        // Employee harus jadi anggota project untuk bisa lihat task-nya
        if ($user->role_id == 3) {
            $isMember = Project::where('id', $projectId)
                ->whereHas('members', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->exists();

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

    // =========================================================================
    // PROFILE
    // =========================================================================

    private function profileShow(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Sesi tidak valid'], 401);
        }

        return response()->json([
            'success' => true,
            'message' => 'Data profil berhasil diambil',
            'data'    => $user->load('department', 'role'),
        ]);
    }

    // =========================================================================
    // CHAT
    // =========================================================================

    private function chatIndex(Request $request, $projectId)
    {
        $lastId   = $request->query('last_id', 0);
        $messages = ProjectChat::where('project_id', $projectId)
            ->where('id', '>', $lastId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }
}