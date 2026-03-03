<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UpdateController extends Controller
{
    // ─── Profile ──────────────────────────────────────────────────────────────

    public function profileUpdate(Request $request)
    {
        $user = $request->user();

        $user->update($request->validate([
            'name'  => 'string|max:255',
            'email' => 'email|max:255|unique:users,email,' . $user->id,
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data'    => $user->load('department', 'role'),
        ]);
    }

    // ─── Department ───────────────────────────────────────────────────────────

    public function departmentUpdate(Request $request, $id)
    {
        $department = Department::findOrFail($id);

        $request->validate([
            'name' => 'string|max:255|unique:departments,name,' . $id,
        ]);

        $department->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil diperbarui',
            'data'    => $department,
        ]);
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    public function userUpdate(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $data = $request->all();

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diperbarui',
            'data'    => $user,
        ]);
    }

    // ─── Project ──────────────────────────────────────────────────────────────

    public function projectUpdate(Request $request, $id)
    {
        $user    = $request->user();
        $project = Project::findOrFail($id);
        $role    = $project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;

        if ($user->role_id != 1 && !in_array($role, [Project::OWNER, Project::MANAGER])) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $project->update($request->all());

        return response()->json(['success' => true, 'data' => $project]);
    }

    // ─── Task ─────────────────────────────────────────────────────────────────

    public function taskUpdate(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::with('project.members')->findOrFail($id);
        $role = $task->project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;

        if ($role == 4 && $user->role_id > 2) {
            return response()->json(['success' => false, 'message' => 'Stakeholder hanya memiliki akses baca.'], 403);
        }

        if ($user->role_id <= 2 || in_array($role, [1, 2])) {
            $task->update($request->all());
        } elseif ($task->user_id === $user->id) {
            $task->update($request->only('status'));
        } else {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        return response()->json(['success' => true, 'task' => $task]);
    }
}