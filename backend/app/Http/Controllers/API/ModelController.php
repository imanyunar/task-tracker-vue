<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ModelController extends Controller
{
    /**
     * Registry — semua konfigurasi per model ada di sini.
     * Untuk tambah model baru, cukup tambah satu entry.
     *
     * Struktur tiap entry:
     *   class  → Eloquent model class
     *   load   → relasi yang di-eager load saat show/index
     *   rules  → validation rules saat store
     *   guard  → role check per aksi [aksi => closure($user, $record?)]
     *   create → (opsional) override logic saat store
     */
    private function registry(Request $request): array
    {
        $user = $request->user();

        return [

            // ─── User ─────────────────────────────────────────────────────────
            'users' => [
                'class' => User::class,
                'load'  => ['department', 'tasks', 'projects', 'attendances'],
                'rules' => [
                    'name'          => 'required|string|max:255',
                    'email'         => 'required|email|max:255|unique:users',
                    'password'      => 'required|string|min:8',
                    'department_id' => 'required|exists:departments,id',
                ],
                'guard' => [
                    'index'   => fn()        => $user->role_id > 1 ? $this->deny('Hanya Admin') : null,
                    'store'   => fn()        => $user->role_id > 1 ? $this->deny('Hanya Admin') : null,
                    'update'  => fn($record) => ($user->role_id > 1 && $user->id != $record->id) ? $this->deny() : null,
                    'destroy' => fn()        => $user->role_id > 1 ? $this->deny('Hanya Admin') : null,
                ],
                'create' => fn($data) => User::create([
                    ...$data,
                    'password' => Hash::make($data['password']),
                    'role_id'  => 3,
                ]),
            ],

            // ─── Department ───────────────────────────────────────────────────
            'departments' => [
                'class' => Department::class,
                'load'  => ['users'],
                'rules' => [
                    'name'        => 'required|string|max:255|unique:departments',
                    'description' => 'nullable|string',
                ],
                'guard' => [
                    'store'   => fn() => $user->role_id > 1 ? $this->deny('Hanya Admin') : null,
                    'update'  => fn() => $user->role_id > 1 ? $this->deny('Hanya Admin') : null,
                    'destroy' => fn() => $user->role_id > 1 ? $this->deny('Hanya Admin') : null,
                ],
            ],

            // ─── Project ──────────────────────────────────────────────────────
            'projects' => [
                'class' => Project::class,
                'load'  => ['members', 'tasks.user', 'department', 'posts.user'],
                'rules' => [
                    'name'          => 'required|string|max:255',
                    'description'   => 'nullable|string',
                    'start_date'    => 'required|date',
                    'end_date'      => 'required|date|after_or_equal:start_date',
                    'status'        => 'required|in:planned,on_progress,completed',
                    'department_id' => $user->role_id == 1 ? 'required|exists:departments,id' : 'nullable',
                ],
                'guard' => [
                    'store'   => fn()        => !in_array($user->role_id, [1, 2]) ? $this->deny('Hanya Admin/Manager') : null,
                    'update'  => fn($record) => $this->checkProjectRole($user, $record, [Project::OWNER, Project::MANAGER]),
                    'destroy' => fn($record) => $this->checkProjectRole($user, $record, [Project::OWNER], 'Hanya Owner proyek yang bisa menghapus'),
                ],
                'create' => fn($data) => tap(
                    Project::create([
                        ...$data,
                        'department_id' => $user->role_id == 1 ? $data['department_id'] : $user->department_id,
                    ]),
                    fn($p) => $p->members()->attach($user->id, ['role_in_project' => Project::OWNER])
                ),
            ],

            // ─── Task ─────────────────────────────────────────────────────────
            'tasks' => [
                'class' => Task::class,
                'load'  => ['project.members', 'user.department'],
                'rules' => [
                    'project_id'  => 'required|exists:projects,id',
                    'user_id'     => 'required|exists:users,id',
                    'title'       => 'required|string',
                    'description' => 'nullable|string',
                    'priority'    => 'required|in:low,medium,high,urgent',
                    'status'      => 'required|in:todo,review,doing,done',
                    'due_date'    => 'nullable|date',
                ],
                'guard' => [
                    'store'   => fn()        => $user->role_id == 3 ? $this->deny() : null,
                    'destroy' => fn()        => $user->role_id == 3 ? $this->deny() : null,
                    'update'  => fn($record) => $this->checkTaskRole($user, $record),
                ],
            ],

        ];
    }

    // =========================================================================
    // CRUD
    // =========================================================================

    /** GET /{model} */
    public function index(Request $request, string $model)
    {
        ['class' => $class] = $config = $this->resolve($model, $request);
        $user = $request->user();

        $this->gate($config, 'index');

        $query = match ($model) {
            'users' => $user->role->name === 'employee'
                ? $class::where('id', $user->id)
                : $class::query(),

            'projects' => $class::with(['department', 'members'])
                ->withCount([
                    'tasks',
                    'tasks as completed_tasks_count' => fn($q) => $q->where('status', 'done'),
                ])
                ->when($user->role_id != 1, fn($q) => $q->where(fn($q) =>
                    $q->where('department_id', $user->department_id)
                      ->orWhereHas('members', fn($q) => $q->where('user_id', $user->id))
                )),

            'tasks' => $class::with(['project', 'user'])
                ->when(!in_array($user->role_id, [1, 2]), fn($q) => $q->where(fn($q) =>
                    $q->where('user_id', $user->id)
                      ->orWhereHas('project.members', fn($q) =>
                          $q->where('user_id', $user->id)->whereIn('role_in_project', [1, 2])
                      )
                ))->latest(),

            default => $class::query(),
        };

        $results = $query->get();

        if ($model === 'projects') {
            $results->each(function ($project) use ($user) {
                $member = $project->members->firstWhere('id', $user->id);
                $project->my_role_id = $member?->pivot->role_in_project;
                $project->progress   = $project->tasks_count > 0
                    ? round(($project->completed_tasks_count / $project->tasks_count) * 100, 2)
                    : 0;
            });
        }

        return response()->json(['success' => true, 'data' => $results]);
    }

    /** GET /{model}/{id} */
    public function show(Request $request, string $model, int $id)
    {
        ['class' => $class, 'load' => $load] = $config = $this->resolve($model, $request);

        $record = $class::with($load)->findOrFail($id);
        $this->gate($config, 'show', $record);

        return response()->json(['success' => true, 'data' => $record]);
    }

    /** POST /{model} */
    public function store(Request $request, string $model)
    {
        $config = $this->resolve($model, $request);

        $this->gate($config, 'store');

        $data   = $request->validate($config['rules']);
        $record = isset($config['create'])
            ? ($config['create'])($data)
            : $config['class']::create($data);

        return response()->json(['success' => true, 'message' => 'Berhasil dibuat', 'data' => $record], 201);
    }

    /** PUT /{model}/{id} */
    public function update(Request $request, string $model, int $id)
    {
        ['class' => $class, 'load' => $load] = $config = $this->resolve($model, $request);
        $user   = $request->user();
        $record = $class::with($load)->findOrFail($id);

        $this->gate($config, 'update', $record);

        // Task contributor: hanya boleh update status tugasnya sendiri
        if ($model === 'tasks') {
            $role = $record->project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;
            if ($user->role_id > 2 && !in_array($role, [1, 2])) {
                abort_if($record->user_id !== $user->id, 403);
                $record->update($request->only('status'));
                return response()->json(['success' => true, 'data' => $record]);
            }
        }

        // User: hash password kalau dikirim
        if ($model === 'users' && $request->has('password')) {
            $record->update([...$request->except('password'), 'password' => Hash::make($request->password)]);
        } else {
            $record->update($request->all());
        }

        return response()->json(['success' => true, 'data' => $record]);
    }

    /** DELETE /{model}/{id} */
    public function destroy(Request $request, string $model, int $id)
    {
        ['class' => $class] = $config = $this->resolve($model, $request);

        $record = $class::findOrFail($id);
        $this->gate($config, 'destroy', $record);
        $record->delete();

        return response()->json(['success' => true, 'message' => 'Berhasil dihapus']);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /** Resolve config dari registry, abort 404 kalau tidak terdaftar */
    private function resolve(string $model, Request $request): array
    {
        $registry = $this->registry($request);
        abort_unless(isset($registry[$model]), 404, "Model [{$model}] tidak ditemukan.");
        return $registry[$model];
    }

    /** Jalankan guard closure untuk aksi tertentu */
    private function gate(array $config, string $action, $record = null): void
    {
        $guard = $config['guard'][$action] ?? null;
        if ($guard) $record ? $guard($record) : $guard();
    }

    private function deny(string $message = 'Akses ditolak'): never
    {
        abort(403, $message);
    }

    /** Cek role user di dalam project */
    private function checkProjectRole($user, $project, array $allowedRoles, string $message = 'Akses ditolak'): void
    {
        if ($user->role_id == 1) return;
        $role = $project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;
        if (!in_array($role, $allowedRoles)) $this->deny($message);
    }

    /** Cek role user di dalam task (untuk stakeholder) */
    private function checkTaskRole($user, $task): void
    {
        $role = $task->project->members()->where('user_id', $user->id)->first()?->pivot->role_in_project;
        if ($role == 4 && $user->role_id > 2) $this->deny('Stakeholder hanya akses baca');
    }
}