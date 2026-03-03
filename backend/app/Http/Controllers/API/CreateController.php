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
    // ─── Auth ─────────────────────────────────────────────────────────────────

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
        ])->load('role', 'department');

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

        return response()->json([
            'success'   => true,
            'message'   => 'Berhasil login',
            'user'      => $user->load('role', 'department'),
            'api_token' => $plainToken,
        ]);
    }

    // ─── Department ───────────────────────────────────────────────────────────

    public function departmentStore(Request $request)
    {
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

    // ─── User ─────────────────────────────────────────────────────────────────

    public function userStore(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:255',
            'email'         => 'required|email|max:255|unique:users',
            'password'      => 'required|string|min:8',
            'department_id' => 'required|exists:departments,id',
        ]);

        $user = User::create([
            ...$data,
            'password' => Hash::make($data['password']),
            'role_id'  => 3,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User berhasil didaftarkan',
            'data'    => $user,
        ], 201);
    }

    // ─── Project ──────────────────────────────────────────────────────────────

    public function projectStore(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'          => 'required|string|max:255',
            'description'   => 'nullable|string',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after_or_equal:start_date',
            'status'        => 'required|in:planned,on_progress,completed',
            'department_id' => $user->role_id == 1 ? 'required|exists:departments,id' : 'nullable',
        ]);

        $project = Project::create([
            ...$request->only('name', 'description', 'start_date', 'end_date', 'status'),
            'department_id' => $user->role_id == 1 ? $request->department_id : $user->department_id,
        ]);

        $project->members()->attach($user->id, ['role_in_project' => Project::OWNER]);

        return response()->json([
            'message' => 'Project created successfully',
            'data'    => $project->load('department'),
        ], 201);
    }

    public function projectAddMember(Request $request, $id)
    {
        $user    = $request->user();
        $project = Project::findOrFail($id);
        $role    = $project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;

        if ($user->role_id != 1 && $role !== Project::OWNER) {
            return response()->json(['success' => false, 'message' => 'Hanya Owner proyek yang bisa mengelola anggota'], 403);
        }

        $request->validate([
            'user_id'         => 'required|exists:users,id',
            'role_in_project' => 'required|integer|in:1,2,3,4',
        ]);

        $project->members()->syncWithoutDetaching([
            $request->user_id => ['role_in_project' => $request->role_in_project],
        ]);

        return response()->json(['success' => true, 'message' => 'Role anggota berhasil diatur']);
    }

    public function projectStorePost(Request $request, $id)
    {
        $request->validate(['content' => 'required|string']);

        $post = Post::create([
            'project_id' => $id,
            'user_id'    => $request->user()->id,
            'content'    => $request->content,
        ]);

        return response()->json(['success' => true, 'data' => $post], 201);
    }

    // ─── Task ─────────────────────────────────────────────────────────────────

    public function taskStore(Request $request)
    {
        if ($request->user()->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $task = Task::create($request->validate([
            'project_id'  => 'required|exists:projects,id',
            'user_id'     => 'required|exists:users,id',
            'title'       => 'required|string',
            'description' => 'nullable|string',
            'priority'    => 'required|in:low,medium,high,urgent',
            'status'      => 'required|in:todo,review,doing,done',
            'due_date'    => 'nullable|date',
        ]));

        return response()->json(['success' => true, 'message' => 'Tugas Berhasil Dibuat', 'task' => $task], 201);
    }

    // ─── Chat ─────────────────────────────────────────────────────────────────

    public function chatStore(Request $request, $projectId)
    {
        $request->validate(['message' => 'required|string']);

        $chat = ProjectChat::create([
            'project_id' => $projectId,
            'user_id'    => $request->user()->id,
            'message'    => $request->message,
        ]);

        return response()->json($chat->load('user:id,name'), 201);
    }
}