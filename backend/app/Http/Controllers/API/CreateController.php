<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Post;
use App\Models\Project;
use App\Models\ProjectChat;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CreateController extends Controller
{
    // =========================================================================
    // DYNAMIC ROUTES
    // =========================================================================

    /** POST /{model} */
    public function store(Request $request, string $model)
    {
        return match ($model) {
            'departments' => $this->departmentStore($request),
            'users'       => $this->userStore($request),
            'projects'    => $this->projectStore($request),
            'tasks'       => $this->taskStore($request),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    /** POST /{model}/{id}/{action} */
    public function action(Request $request, string $model, $id, string $action)
    {
        return match (true) {
            $model === 'projects' && $action === 'members' => $this->projectAddMember($request, $id),
            $model === 'projects' && $action === 'posts'   => $this->projectStorePost($request, $id),
            $model === 'projects' && $action === 'chats'   => $this->chatStore($request, $id),
            $model === 'projects' && $action === 'tasks'   => $this->taskStore($request),
            default => response()->json(['message' => "Action [$action] tidak ditemukan untuk [$model]"], 404),
        };
    }

    // =========================================================================
    // DEPARTMENT
    // =========================================================================

    private function departmentStore(Request $request)
    {
        if ($request->user()->role_id > 1) {
            return response()->json(['message' => 'Hanya Admin'], 403);
        }

        $request->validate([
            'name'        => 'required|string|max:255|unique:departments',
            'description' => 'nullable|string',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil dibuat',
            'data'    => Department::create($request->all()),
        ], 201);
    }

    // =========================================================================
    // USER
    // =========================================================================

    private function userStore(Request $request)
    {
        if ($request->user()->role_id > 1) {
            return response()->json(['message' => 'Hanya Admin'], 403);
        }

        $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|string|email|max:255|unique:users',
            'password'      => 'required|string|min:8',
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'department_id' => $request->department_id,
            'role_id'       => 3,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil didaftarkan',
            'data'    => $user,
        ], 201);
    }

    // =========================================================================
    // PROJECT
    // =========================================================================

    private function projectStore(Request $request)
    {
        $user = $request->user();

        if (!in_array($user->role_id, [1, 2])) {
            return response()->json(['message' => 'Hanya Admin atau Manager'], 403);
        }

        $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'status'        => 'required|in:planned,on_progress,completed',
            'department_id' => $user->role_id == 1 ? 'required|exists:departments,id' : 'nullable',
        ]);

        // Admin bebas pilih department, Manager otomatis pakai department sendiri
        $deptId = $user->role_id == 1 ? $request->department_id : $user->department_id;

        $project = Project::create([
            'name'          => $request->name,
            'description'   => $request->description,
            'start_date'    => $request->start_date,
            'end_date'      => $request->end_date,
            'status'        => $request->status,
            'department_id' => $deptId,
        ]);

        // Pembuat otomatis jadi Owner project
        $project->members()->attach($user->id, ['role_in_project' => Project::OWNER]);

        return response()->json([
            'message' => 'Project berhasil dibuat',
            'data'    => $project->load('department'),
        ], 201);
    }

    // =========================================================================
    // TASK
    // =========================================================================

    private function taskStore(Request $request)
    {
        if ($request->user()->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $request->validate([
            'project_id'  => 'required|exists:projects,id',
            'user_id'     => 'required|exists:users,id',
            'title'       => 'required|string',
            'description' => 'nullable|string',
            'priority'    => 'required|in:low,medium,high,urgent',
            'status'      => 'required|in:todo,review,doing,done',
            'due_date'    => 'nullable|date',
        ]);

        $task = Task::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Tugas Berhasil Dibuat',
            'task'    => $task,
        ], 201);
    }

    // =========================================================================
    // PROJECT EXTRAS
    // =========================================================================

    private function projectAddMember(Request $request, $id)
    {
        $user    = $request->user();
        $project = Project::findOrFail($id);
        
        $myMember        = $project->members()->where('user_id', $user->id)->first();
        $myRoleInProject = $myMember ? $myMember->pivot->role_in_project : null;

        if ((int) $user->role_id !== 1 && $myRoleInProject !== Project::OWNER) {
            return response()->json(['success' => false, 'message' => 'Hanya Owner proyek yang bisa mengelola anggota'], 403);
        }

        $request->validate([
            'user_id'         => 'required|exists:users,id',
            'role_in_project' => 'required|integer|in:1,2,3,4',
        ]);

        // syncWithoutDetaching: update kalau sudah ada, tambah kalau belum
        $project->members()->syncWithoutDetaching([
            $request->user_id => ['role_in_project' => $request->role_in_project],
        ]);

        return response()->json(['success' => true, 'message' => 'Role anggota berhasil diatur']);
    }

    private function projectStorePost(Request $request, $id)
    {
        $request->validate(['content' => 'required|string']);

        $post = Post::create([
            'project_id' => $id,
            'user_id'    => $request->user()->id,
            'content'    => $request->content,
        ]);

        return response()->json(['success' => true, 'data' => $post], 201);
    }

    // =========================================================================
    // CHAT
    // =========================================================================

    private function chatStore(Request $request, $projectId)
    {
        $request->validate(['message' => 'required|string']);

        $userId = $request->user()?->id;

        if (!$userId) {
            return response()->json(['message' => 'User tidak terautentikasi'], 401);
        }

        $chat = ProjectChat::create([
            'project_id' => $projectId,
            'user_id'    => $userId,
            'message'    => $request->message,
        ]);

        return response()->json($chat->load('user:id,name'), 201);
    }

    // =========================================================================
    // AUTH (fixed routes)
    // =========================================================================

    public function register(Request $request)
    {
        $request->validate([
            'name'       => 'required|string',
            'email'      => 'required|email|unique:users',
            'password'   => 'required|string|min:6',
            'department' => 'required|exists:departments,id',
        ]);

        $plainToken = Str::random(60);

        $user = User::create([
            'name'          => $request->name,
            'email'         => $request->email,
            'password'      => Hash::make($request->password),
            'department_id' => $request->department,
            'api_token'     => hash('sha256', $plainToken),
        ]);

        $user->load('role', 'department');

        return response()->json([
            'success'   => true,
            'message'   => 'Berhasil registrasi',
            'user'      => $user,
            'api_token' => $plainToken,
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Email atau password salah'], 401);
        }

        $plainToken = Str::random(60);
        $user->update(['api_token' => hash('sha256', $plainToken)]);
        $user->load('role', 'department');

        return response()->json([
            'success'   => true,
            'message'   => 'Berhasil login',
            'user'      => $user,
            'api_token' => $plainToken,
        ]);
    }
}