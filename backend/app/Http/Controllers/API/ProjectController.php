<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Response;

class ProjectController extends Controller
{
    /**
     * Display a listing of projects
     * Role 3 (Employee): hanya melihat proyek yang mereka ikuti
     * Admin/Manager: melihat semua proyek
     */
    public function index(Request $request) {
        $user = $request->user();
        
        $query = Project::with('members')->withCount([
            'tasks', 
            'tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }
        ]);

        // Role 3 Global (Employee) hanya lihat project yang mereka ikuti
        if ((int)$user->role_id === 3) {
            $query->whereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }

        $projects = $query->get();

        $projects->transform(function ($project) use ($user) {
            // Inject Role ID Project ke tiap project agar Frontend tahu aksesnya
            $member = $project->members->where('id', $user->id)->first();
            $project->my_role_id = $member ? $member->pivot->role_in_project : null;

            // Hitung Progress
            $total = $project->tasks_count;
            $completed = $project->completed_tasks_count;
            $project->progress = $total > 0 ? round(($completed / $total) * 100, 2) : 0;
            return $project;
        });

        return response()->json($projects);
    }
    public function store(Request $request) {
    $user = $request->user();

    // Hanya Global Admin (1) atau Global Manager (2) yang bisa buat proyek
    if (!$user || (int)$user->role_id === 3) { 
        return response()->json(['success' => false, 'message' => 'Anda tidak memiliki izin global untuk membuat proyek'], 403);
    }

    $validator = Validator::make($request->all(), [
        'name'       => 'required|string|max:255',
        'start_date' => 'required|date',
        'end_date'   => 'required|date|after:start_date',
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    // 1. Simpan data proyek
    $project = Project::create($request->all());

    // 2. AUTO-SET OWNER: User yang membuat otomatis jadi Owner di project ini
    $project->members()->attach($user->id, [
        'role_in_project' => Project::OWNER // ID 1
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Proyek berhasil dibuat. Anda otomatis menjadi Owner.',
        'data' => $project->load('members')
    ], 201);
}

    /**
     * Display the specified project
     */
    public function show(Request $request, $id)
{
    $user = $request->user();
    $project = Project::with(['members', 'tasks'])->find($id);

    if (!$project) {
        return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
    }

    // Cek keanggotaan untuk Role 3
    $member = $project->members->where('id', $user->id)->first();
    if ((int)$user->role_id === 3 && !$member) {
        return response()->json(['success' => false, 'message' => 'Anda bukan anggota tim'], 403);
    }

    // Inject role info
    $project->my_role_id = $member ? $member->pivot->role_in_project : null;

    return response()->json(['success' => true, 'data' => $project], 200);
}

    /**
     * Update the specified project
     */
    public function update(Request $request, $id) {
        $user = $request->user();
        $project = Project::findOrFail($id);
        
        // Cek Role di Project: Hanya OWNER (1) atau MANAGER (2) yang bisa edit
        $member = $project->members()->where('user_id', $user->id)->first();
        $projectRoleId = $member ? $member->pivot->role_in_project : null;

        if ((int)$user->role_id !== 1 && $projectRoleId !== Project::OWNER && $projectRoleId !== Project::MANAGER) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak: Anda bukan Manager/Owner proyek ini'], 403);
        }

        $project->update($request->all());
        return response()->json(['success' => true, 'data' => $project]);
    }

    /**
     * Remove the specified project
     */
   public function destroy(Request $request, $id) {
        $user = $request->user();
        $project = Project::findOrFail($id);

        $member = $project->members()->where('user_id', $user->id)->first();
        $projectRoleId = $member ? $member->pivot->role_in_project : null;

        // Hanya Admin Global atau Project OWNER yang bisa hapus proyek
        if ((int)$user->role_id !== 1 && $projectRoleId !== Project::OWNER) {
            return response()->json(['success' => false, 'message' => 'Hanya Owner Proyek yang bisa menghapus'], 403);
        }

        $project->delete();
        return response()->json(['success' => true, 'message' => 'Proyek dihapus']);
    }

    /**
     * Search projects
     */
    public function search(Request $request)
    {
        $user = $request->user();
        $katakunci = $request->input('search', '');
        
        $query = Project::where(function($q) use ($katakunci) {
            $q->where('name', 'ILIKE', "%$katakunci%")
              ->orWhere('description', 'ILIKE', "%$katakunci%");
        });
        
        if ($user->role_id == 3) {
            $query->whereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        
        $projects = $query->get();
        
        return response()->json([
            'success' => true,
            'data' => $projects,
            'count' => $projects->count()
        ], 200);
    }

    /**
     * Add member to project
     */
    public function addMember(Request $request, $id) {
    $user = $request->user();
    $project = Project::findOrFail($id);

    // Proteksi: Hanya Project Owner atau Global Admin yang bisa ngeset role orang lain
    $myMemberInfo = $project->members()->where('user_id', $user->id)->first();
    $myRoleInProject = $myMemberInfo ? $myMemberInfo->pivot->role_in_project : null;

    if ((int)$user->role_id !== 1 && $myRoleInProject !== Project::OWNER) {
        return response()->json(['success' => false, 'message' => 'Hanya Owner proyek yang bisa mengelola anggota'], 403);
    }

    $validator = Validator::make($request->all(), [
        'user_id'         => 'required|exists:users,id',
        'role_in_project' => 'required|integer|in:1,2,3,4', // 1:Owner, 2:Manager, 3:Contributor, 4:Stakeholder
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    // Gunakan syncWithoutDetaching agar data member lain tidak terhapus
    $project->members()->syncWithoutDetaching([
        $request->user_id => ['role_in_project' => $request->role_in_project]
    ]);

    return response()->json(['success' => true, 'message' => 'Role anggota berhasil diatur']);
}
}