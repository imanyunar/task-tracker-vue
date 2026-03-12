<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DeleteController extends Controller
{
    // =========================================================================
    // DYNAMIC ROUTES
    // =========================================================================

    /** DELETE /{model}/{id} */
    public function destroy(Request $request, string $model, $id)
    {
        return match ($model) {
            'departments' => $this->departmentDestroy($request, $id),
            'users'       => $this->userDestroy($request, $id),
            'projects'    => $this->projectDestroy($request, $id),
            'tasks'       => $this->taskDestroy($request, $id),
            'attachments' => $this->attachmentDestroy($request, $id),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    // =========================================================================
    // ATTACHMENT
    // =========================================================================

    private function attachmentDestroy(Request $request, $id)
    {
        $attachment = Attachment::find($id);

        if (!$attachment) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        // Delete file from storage
        if ($attachment->file_path && Storage::disk('public')->exists($attachment->file_path)) {
            Storage::disk('public')->delete($attachment->file_path);
        }

        $attachment->delete();

        return response()->json(['success' => true, 'message' => 'File berhasil dihapus']);
    }

    // =========================================================================
    // DEPARTMENT
    // =========================================================================

    private function departmentDestroy(Request $request, $id)
    {
        if ($request->user()->role_id > 1) {
            return response()->json(['message' => 'Hanya Admin'], 403);
        }

        $dept = Department::find($id);

        if (!$dept) {
            return response()->json(['message' => 'Departemen tidak ditemukan'], 404);
        }

        // Peringatan: onDelete cascade di migrasi akan hapus semua user di departemen ini
        $dept->delete();

        return response()->json(['success' => true, 'message' => 'Departemen berhasil dihapus']);
    }

    // =========================================================================
    // USER
    // =========================================================================

    private function userDestroy(Request $request, $id)
    {
        if ($request->user()->role_id > 1) {
            return response()->json(['message' => 'Hanya Admin'], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $user->delete();

        return response()->json(['success' => true, 'message' => 'User telah dihapus dari sistem']);
    }

    // =========================================================================
    // PROJECT
    // =========================================================================

    private function projectDestroy(Request $request, $id)
    {
        $user    = $request->user();
        $project = Project::findOrFail($id);

        $member        = $project->members()->where('user_id', $user->id)->first();
        $roleInProject = $member ? $member->pivot->role_in_project : null;

        // Hanya Admin global atau Owner project yang boleh hapus
        if ((int) $user->role_id !== 1 && $roleInProject !== Project::OWNER) {
            return response()->json(['success' => false, 'message' => 'Hanya Owner Proyek yang bisa menghapus'], 403);
        }

        $project->delete();

        return response()->json(['success' => true, 'message' => 'Proyek dihapus']);
    }

    // =========================================================================
    // TASK
    // =========================================================================

    private function taskDestroy(Request $request, $id)
    {
        // Employee tidak boleh hapus task
        if ($request->user()->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $task = Task::findOrFail($id);
        $task->delete();

        return response()->json(['success' => true, 'message' => 'Tugas Berhasil Dihapus']);
    }

    // =========================================================================
    // AUTH (fixed route)
    // =========================================================================

    public function logout(Request $request)
    {
        $user = $request->user();

        if ($user) {
            $user->update(['api_token' => null]);
            return response()->json(['success' => true, 'message' => 'Berhasil logout']);
        }

        return response()->json(['success' => false, 'message' => 'User tidak ditemukan'], 401);
    }
}