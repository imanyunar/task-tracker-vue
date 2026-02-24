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
    public function index(Request $request)
    {
        $user = $request->user();
        
        $query = Project::with('members')->withCount([
            'tasks', 
            'tasks as completed_tasks_count' => function ($q) {
                $q->where('status', 'done');
            }
        ]);

        // Jika user adalah Employee (Role ID 3)
        if ($user->role_id == 3) {
            $query->whereHas('members', function($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        }
        $projects = $query->get();
        $projects->transform(function ($project) {
            $total = $project->tasks_count;
            $completed = $project->completed_tasks_count;
            $project->progress = $total > 0 ? round(($completed / $total) * 100, 2) : 0;
            return $project;
        });

        return response()->json($projects);
    }

    /**
     * Store a newly created project
     * Hanya Admin/Manager yang bisa membuat
     */
    public function store(Request $request)
{
    $user = $request->user(); // Diambil dari ManualTokenAuth

    // DEBUG: Tambahkan ini sementara untuk melihat ID role di log jika masih tembus
    // \Log::info('User Role ID: ' . $user->role_id);

    // Gunakan (int) untuk memastikan tipe data angka
    if (!$user || (int)$user->role_id === 3) { 
        return response()->json([
            'success' => false,
            'message' => 'Akses ditolak: Anda tidak memiliki izin untuk membuat proyek'
        ], 403);
    }

    // Validasi data
    $validator = Validator::make($request->all(), [
        'name'        => 'required|string|max:255',
        'start_date'  => 'required|date',
        'end_date'    => 'required|date|after:start_date',
    ]);

    if ($validator->fails()) {
        return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    $project = Project::create($request->all());
    
    return response()->json([
        'success' => true,
        'message' => 'Projek berhasil dibuat',
        'data' => $project
    ], 201);
}

    /**
     * Display the specified project
     */
    public function show(Request $request, $id)
    {
        $user = $request->user();
        
        $query = Project::with(['members', 'tasks']);

        if ($user->role_id == 3) {
            $project = $query->where('id', $id)
                ->whereHas('members', function($q) use ($user) {
                    $q->where('user_id', $user->id);
                })->first();

            if (!$project) {
                return response()->json([
                    'success' => false,
                    'message' => 'Proyek tidak ditemukan atau Anda bukan anggota tim'
                ], 404);
            }
        } else {
            $project = $query->find($id);
            if (!$project) {
                return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
            }
        }
        
        return response()->json(['success' => true, 'data' => $project], 200);
    }

    /**
     * Update the specified project
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:255',
            'end_date'    => 'sometimes|date|after:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $project->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Projek berhasil diperbarui',
            'data' => $project
        ], 200);
    }

    /**
     * Remove the specified project
     */
    public function destroy(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
        }

        $project->delete();
        
        return response()->json(['success' => true, 'message' => 'Project berhasil dihapus'], 200);
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
    public function addMember(Request $request, $id)
    {
        $user = $request->user();
        
        if ($user->role_id == 3) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak'], 403);
        }

        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $project = Project::find($id);
        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Project tidak ditemukan'], 404);
        }

        if ($project->members()->where('user_id', $request->user_id)->exists()) {
            return response()->json(['success' => false, 'message' => 'User sudah menjadi anggota'], 422);
        }

        $project->members()->attach($request->user_id, [
            'role_in_project' => $request->role ?? 'Anggota Tim'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil ditambahkan',
            'data' => $project->load('members')
        ], 200);
    }
}