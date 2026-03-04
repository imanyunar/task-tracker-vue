<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UpdateController extends Controller
{

    // Tambahkan ini di bagian Dynamic Routes di UpdateController.php

/** POST /{model}/{id}/{action} atau POST /{model}/{action} */
public function action(Request $request, string $model, $id = null, $action = null)
{
    // Jika URL-nya /api/profile/avatar, maka $id akan berisi 'avatar' 
    // dan $action akan null. Kita perlu menghandle pergeseran parameter ini.
    $targetAction = $action ?: $id; 

    return match (true) {
        $model === 'profile' && $targetAction === 'avatar'   => $this->avatarUpload($request),
        $model === 'profile' && $targetAction === 'password' => $this->passwordUpdate($request),
        default => response()->json(['message' => 'Action tidak ditemukan'], 404),
    };
}
    // =========================================================================
    // DYNAMIC ROUTES
    // =========================================================================

    /** PUT /{model}/{id} */
    public function update(Request $request, string $model, $id)
    {
        return match ($model) {
            'departments' => $this->departmentUpdate($request, $id),
            'users'       => $this->userUpdate($request, $id),
            'projects'    => $this->projectUpdate($request, $id),
            'tasks'       => $this->taskUpdate($request, $id),
            'profile'     => $this->profileUpdate($request),
            default       => response()->json(['message' => 'Model tidak ditemukan'], 404),
        };
    }

    // =========================================================================
    // DEPARTMENT
    // =========================================================================

    private function departmentUpdate(Request $request, $id)
    {
        if ($request->user()->role_id > 1) {
            return response()->json(['message' => 'Hanya Admin'], 403);
        }

        $dept = Department::find($id);

        if (!$dept) {
            return response()->json(['message' => 'Departemen tidak ditemukan'], 404);
        }

        $request->validate([
            'name' => 'string|max:255|unique:departments,name,' . $id,
        ]);

        $dept->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Departemen berhasil diperbarui',
            'data'    => $dept,
        ]);
    }

    // =========================================================================
    // USER
    // =========================================================================

    private function userUpdate(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User tidak ditemukan'], 404);
        }

        $data = $request->all();

        // Hash password kalau dikirim
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

    // =========================================================================
    // PROJECT
    // =========================================================================

    private function projectUpdate(Request $request, $id)
    {
        $user    = $request->user();
        $project = Project::findOrFail($id);

        $member        = $project->members()->where('user_id', $user->id)->first();
        $roleInProject = $member ? $member->pivot->role_in_project : null;

        // Hanya Admin global, Owner, atau Manager project yang boleh edit
        if ((int) $user->role_id !== 1 && $roleInProject !== Project::OWNER && $roleInProject !== Project::MANAGER) {
            return response()->json(['success' => false, 'message' => 'Akses ditolak: Anda bukan Manager/Owner proyek ini'], 403);
        }

        $project->update($request->all());

        return response()->json(['success' => true, 'data' => $project]);
    }

    // =========================================================================
    // TASK
    // =========================================================================

    private function taskUpdate(Request $request, $id)
    {
        $user = $request->user();
        $task = Task::with('project.members')->findOrFail($id);

        $member        = $task->project->members()->where('user_id', $user->id)->first();
        $roleInProject = $member ? $member->pivot->role_in_project : null;

        // Stakeholder tidak boleh edit apapun
        if ($roleInProject == 4 && $user->role_id > 2) {
            return response()->json(['success' => false, 'message' => 'Stakeholder hanya memiliki akses baca.'], 403);
        }

        // Admin/Manager global atau Owner/Manager project → boleh edit semua field
        if ($user->role_id <= 2 || in_array($roleInProject, [1, 2])) {
            $task->update($request->all());

        // Contributor → hanya boleh update status tugasnya sendiri
        } elseif ($task->user_id === $user->id) {
            $task->update($request->only('status'));

        } else {
            return response()->json(['message' => 'Akses ditolak'], 403);
        }

        return response()->json(['success' => true, 'task' => $task]);
    }

    // =========================================================================
    // PROFILE — update nama & email
    // PUT /profile  (via dynamic route)
    // =========================================================================

    private function profileUpdate(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Sesi tidak valid'], 401);
        }

        $validated = $request->validate([
            'name'  => 'string|max:255',
            'email' => 'email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);
        $user->load('department', 'role');

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui',
            'data'    => $user,
        ]);
    }

    // =========================================================================
    // PROFILE — ganti password
    // PUT /profile/password
    // =========================================================================

    public function passwordUpdate(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Sesi tidak valid'], 401);
        }

        $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        // Verifikasi password lama
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password saat ini tidak sesuai.',
            ], 422);
        }

        // Pastikan password baru berbeda dari yang lama
        if (Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Password baru tidak boleh sama dengan password lama.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password berhasil diperbarui.',
        ]);
    }

    // =========================================================================
    // PROFILE — upload avatar
    // POST /profile/avatar
    // =========================================================================

    public function avatarUpload(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Sesi tidak valid'], 401);
        }

        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:2048', // maks 2 MB
        ]);

        // Hapus avatar lama jika bukan URL eksternal (ui-avatars dll)
        if ($user->avatar && !str_starts_with($user->avatar, 'http')) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Simpan file baru → storage/app/public/avatars/{user_id}/filename
        $path = $request->file('avatar')->store(
            'avatars/' . $user->id,
            'public'
        );

        $user->update(['avatar' => $path]);
        $user->load('department', 'role');

        return response()->json([
            'success' => true,
            'message' => 'Foto profil berhasil diperbarui.',
            'data'    => array_merge($user->toArray(), [
                // URL lengkap agar langsung bisa dipakai di <img src>
                'avatar' => asset('storage/' . $path),
            ]),
        ]);
    }
}