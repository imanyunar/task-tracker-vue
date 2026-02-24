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
        
        $query = Project::with(['department', 'members'])->withCount([
            'tasks', 
            'tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }
        ]);

        /** * FIX LOGIKA: 
         * Admin (1) -> Lihat semua.
         * Manager (2) & Employee (3) -> Lihat proyek departemennya ATAU yang mereka ikuti.
         */
        if ((int)$user->role_id !== 1) {
            $query->where(function($q) use ($user) {
                 $q->where('department_id', $user->department_id) 
                   ->orWhereHas('members', function($sq) use ($user) {
                        $sq->where('user_id', $user->id);
                   });
            });
        } // <--- Tadi kamu menutup kurung di sini, itu salah.

        $projects = $query->get(); // <--- Sekarang variabel ini aman di dalam fungsi.

        $projects->transform(function ($project) use ($user) {
            $member = $project->members->where('id', $user->id)->first();
            $project->my_role_id = $member ? $member->pivot->role_in_project : null;

            $total = $project->tasks_count;
            $completed = $project->completed_tasks_count;
            $project->progress = $total > 0 ? round(($completed / $total) * 100, 2) : 0;
            return $project;
        });

        return response()->json($projects);
    }
    public function store(Request $request)
{
    $user = $request->user();

    // 1. Validasi dasar
    $validated = $request->validate([
        'name'          => 'required|string|max:255',
        'description'   => 'nullable|string',
        'start_date'    => 'required|date',
        'end_date'      => 'required|date|after_or_equal:start_date',
        'status'        => 'required|in:planned,on_progress,completed',
        // Jika admin, department_id wajib dikirim dari frontend. 
        // Jika manager, department_id tidak wajib dikirim karena akan diambil dari profilnya.
        'department_id' => $user->role_id == 1 ? 'required|exists:departments,id' : 'nullable',
    ]);

    // 2. Logika Penentuan Department
    if ($user->role_id == 1) {
        // Jika Admin: Gunakan ID departemen yang dipilih di form
        $deptId = $request->department_id;
    } else {
        // Jika Manager: Paksa menggunakan ID departemen tempat dia bekerja
        $deptId = $user->department_id;
    }

    // 3. Simpan Proyek
    $project = Project::create([
        'name'          => $request->name,
        'description'   => $request->description,
        'start_date'    => $request->start_date,
        'end_date'      => $request->end_date,
        'status'        => $request->status,
        'department_id' => $deptId,
    ]);

    // 4. Otomatis jadikan si pembuat sebagai 'OWNER' di tabel pivot
    $project->members()->attach($user->id, ['role_in_project' => Project::OWNER]);

    return response()->json([
        'message' => 'Project created successfully',
        'data'    => $project->load('department')
    ], 201);
}

    /**
     * Display the specified project
     */
    public function show(Request $request, $id) {
        $user = $request->user();
        $project = Project::with(['members', 'tasks', 'department'])->find($id);

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
        }

        $isMember = $project->members->contains('id', $user->id);
        $isSameDept = (int)$project->department_id === (int)$user->department_id;

        // Tolak akses jika: Bukan Admin DAN Bukan Member DAN Bukan satu departemen
        if ((int)$user->role_id !== 1 && !$isMember && !$isSameDept) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $member = $project->members->where('id', $user->id)->first();
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
    public function search(Request $request) {
        $user = $request->user();
        $katakunci = $request->input('search', '');
        
        $query = Project::where(function($q) use ($katakunci) {
            $q->where('name', 'ILIKE', "%$katakunci%")
              ->orWhere('description', 'ILIKE', "%$katakunci%");
        });
        
        // Samakan filter pencarian dengan filter index (untuk Role 2 & 3)
        if ((int)$user->role_id !== 1) {
            $query->where(function($q) use ($user) {
                $q->where('department_id', $user->department_id)
                  ->orWhereHas('members', function($sq) use ($user) {
                      $sq->where('user_id', $user->id);
                  });
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