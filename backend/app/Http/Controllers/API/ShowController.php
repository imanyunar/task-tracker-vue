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

class ShowController extends Controller
{
    // =========================================================================
    // DYNAMIC ROUTE
    // =========================================================================

    /** GET /{model}/{id} */
    public function show(Request $request, string $model, $id)
    {
        return match ($model) {
            'departments' => $this->departmentShow($id),
            'users'       => $this->userShow($id),
            'projects'    => $this->projectShow($id),
            'tasks'       => $this->taskShow($id),
            'attachments' => $this->attachmentShow($id),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    // =========================================================================
    // ATTACHMENT
    // =========================================================================

    private function attachmentShow($id)
    {
        $attachment = Attachment::with('user:id,name')->find($id);

        if (!$attachment) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $attachment,
        ]);
    }

    /**
     * GET /{model}/{id}/download
     */
public function download(Request $request, $id)
    {
        $attachment = Attachment::find($id);

        if (!$attachment) {
            return response()->json(['message' => 'File tidak ditemukan'], 404);
        }

        $path = storage_path('app/public/' . $attachment->file_path);

        if (!file_exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan di storage'], 404);
        }

        return response()->download($path, $attachment->file_name);
    }

    // =========================================================================
    // DEPARTMENT
    // =========================================================================

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
                'members'     => $project->members->map(fn ($member) => [
                    'id'              => $member->id,
                    'name'            => $member->name,
                    'email'           => $member->email,
                    'role_in_project' => $member->pivot->role_in_project,
                    'avatar'          => $member->avatar,
                ]),
            ],
        ]);
    }

    // =========================================================================
    // TASK
    // =========================================================================

    private function taskShow($id)
    {
        $task = Task::with(['project.members', 'user.department', 'attachments'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $task]);
    }
}
