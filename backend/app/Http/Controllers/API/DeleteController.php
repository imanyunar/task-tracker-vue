<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;

class DeleteController extends Controller
{
    // ─── Auth ─────────────────────────────────────────────────────────────────

    public function logout(Request $request)
    {
        $request->user()->update(['api_token' => null]);

        return response()->json(['success' => true, 'message' => 'Berhasil logout']);
    }

    // ─── Department ───────────────────────────────────────────────────────────

    public function departmentDestroy($id)
    {
        Department::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Departemen berhasil dihapus']);
    }

    // ─── User ─────────────────────────────────────────────────────────────────

    public function userDestroy($id)
    {
        User::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'User telah dihapus dari sistem']);
    }

    // ─── Project ──────────────────────────────────────────────────────────────

    public function projectDestroy(Request $request, $id)
    {
        $user    = $request->user();
        $project = Project::findOrFail($id);
        $role    = $project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;

        if ($user->role_id != 1 && $role !== Project::OWNER) {
            return response()->json(['success' => false, 'message' => 'Hanya Owner proyek yang bisa menghapus'], 403);
        }

        $project->delete();

        return response()->json(['success' => true, 'message' => 'Proyek dihapus']);
    }

    // ─── Task ─────────────────────────────────────────────────────────────────

    public function taskDestroy(Request $request, $id)
    {
        if ($request->user()->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        Task::findOrFail($id)->delete();

        return response()->json(['success' => true, 'message' => 'Tugas Berhasil Dihapus']);
    }
}