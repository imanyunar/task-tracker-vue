<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Department;
use App\Models\Project;
use App\Models\ProjectChat;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class ListController extends Controller
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
            'attachments' => $this->attachmentIndex($request),
            'profile'     => $this->profileIndex($request),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    /** GET /{model}/{id}/{action} */
    public function action(Request $request, string $model, $id, string $action)
    {
        return match (true) {
            $model === 'projects' && $action === 'tasks' => $this->tasksByProject($request, $id),
            $model === 'projects' && $action === 'chats' => $this->chatIndex($request, $id),
            $model === 'tasks' && $action === 'attachments' => $this->attachmentsByTask($request, $id),
            default => response()->json(['message' => "Action [$action] tidak ditemukan untuk [$model]"], 404),
        };
    }

    // =========================================================================
    // ATTACHMENT
    // =========================================================================

    private function attachmentIndex(Request $request)
    {
        $taskId = $request->query('task_id');
        
        $query = Attachment::with('user:id,name');
        
        if ($taskId) {
            $query->where('task_id', $taskId);
        }
        
        $attachments = $query->latest()->get();
        
        return response()->json([
            'success' => true,
            'data' => $attachments,
        ]);
    }

    private function attachmentsByTask(Request $request, $taskId)
    {
        $attachments = Attachment::with('user:id,name')
            ->where('task_id', $taskId)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $attachments,
        ]);
    }

    // =========================================================================
    // DEPARTMENT
    // =========================================================================

    private function departmentIndex()
    {
        return response()->json([
            'success' => true,
            'message' => 'Daftar departemen berhasil diambil',
            'data' => Department::withCount(['users' => fn ($q) => $q->where('is_active', true)])->get()

        ]);
    }

    // =========================================================================
    // USER
    // =========================================================================

    private function userIndex(Request $request)
    {
        $user         = $request->user();
        $withInactive = $request->boolean('with_inactive', false);

        // Non-admin hanya bisa lihat diri sendiri
        if ($user->role->name === 'employee') {
            return response()->json(
                User::with(['department', 'role'])->where('id', $user->id)->get()
            );
        }

        // Admin: default hanya tampilkan aktif, kecuali minta with_inactive
        $query = User::with(['department', 'role']);
        if (!$withInactive) {
            $query->where('is_active', true);
        }
        // with_inactive=1 → tampilkan semua (aktif + nonaktif)

        return response()->json($query->get());
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
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
            ]);

        if ($keyword !== '') {
            $query->where(function ($q) use ($keyword) {
                $q->where('name', 'ILIKE', "%$keyword%")
                  ->orWhere('description', 'ILIKE', "%$keyword%");
            });
        }

        if ((int) $user->role_id === 1) {
            // Admin: Lihat semua, tidak perlu filter tambahan
        } elseif ((int) $user->role_id === 2) {
            // Manager: Lihat proyek di departemennya ATAU proyek di mana dia jadi anggota
            $query->where(function ($q) use ($user) {
                $q->where('department_id', $user->department_id)
                  ->orWhereHas('members', fn ($q) => $q->where('user_id', $user->id));
            });
        } else {
            // Employee / Lainnya: HANYA lihat proyek di mana dia jadi anggota (diundang)
            $query->whereHas('members', fn ($q) => $q->where('user_id', $user->id));
        }

        $projects = $query->get()->transform(function ($project) use ($user) {
            $member = $project->members->where('id', $user->id)->first();
            $project->my_role_id = $member?->pivot->role_in_project;
            return $project;
        });

        return response()->json(['success' => true, 'data' => $projects]);
    }

    // =========================================================================
    // TASK
    // =========================================================================

    private function taskIndex(Request $request)
    {
        $user  = $request->user();
        $query = Task::with(['project', 'user']);

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

    private function tasksByProject(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role_id > 2) {
            $isMember = Project::where('id', $id)
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->exists();

            if (!$isMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akses ditolak: Anda bukan anggota proyek ini',
                ], 403);
            }
        }

        $tasks = Task::with('user.department')
            ->where('project_id', $id)
            ->orderBy('due_date')
            ->paginate(10);

        return response()->json(['success' => true, 'tasks' => $tasks]);
    }

    // =========================================================================
    // PROFILE
    // =========================================================================

    private function profileIndex(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 401);
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

    private function chatIndex(Request $request, $id)
    {
        $lastId   = $request->query('last_id', 0);
        $messages = ProjectChat::where('project_id', $id)
            ->where('id', '>', $lastId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages);
    }
}