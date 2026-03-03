<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AppController;

// ── Public ────────────────────────────────────────────────────────────────────
Route::get('/login',    fn() => response()->file(public_path('login.html')));
Route::get('/register', fn() => response()->file(public_path('register.html')));
Route::post('/register', [AppController::class, 'register']);
Route::post('/login',    [AppController::class, 'login']);

// ── Protected ─────────────────────────────────────────────────────────────────
Route::middleware('auth.manual')->group(function () {

    // HTML Views
    Route::get('/dashboard',     fn() => response()->file(public_path('dashboard.vue')));
    Route::get('/tasks-view',    fn() => response()->file(public_path('tasks.vue')));
    Route::get('/projects-view', fn() => response()->file(public_path('projects.vue')));
    Route::get('/profile-view',  fn() => response()->file(public_path('profile.vue')));

    // Auth & Profile
    Route::post('/logout',  [AppController::class, 'logout']);
    Route::get( '/profile', [AppController::class, 'profileShow']);
    Route::put( '/profile', [AppController::class, 'profileUpdate']);

    // Stats
    Route::get('/dashboard-stats', [AppController::class, 'dashboardStats']);
    Route::get('/tasks/kpi',       [AppController::class, 'kpiStats']);

    // Project extras (WAJIB sebelum /{model})
    Route::get( '/projects/search',       [AppController::class, 'projectSearch']);
    Route::post('/projects/{id}/members', [AppController::class, 'projectAddMember']);
    Route::post('/projects/{id}/posts',   [AppController::class, 'projectStorePost']);
    Route::get( '/projects/{id}/chats',   [AppController::class, 'chatIndex']);
    Route::post('/projects/{id}/chats',   [AppController::class, 'chatStore']);
    Route::get( '/projects/{id}/tasks',   [AppController::class, 'index'])->defaults('model', 'tasks');
    Route::post('/projects/{id}/tasks',   [AppController::class, 'store'])->defaults('model', 'tasks');

    // Dynamic CRUD — users | departments | projects | tasks
    Route::get(   '/{model}',      [AppController::class, 'index']);
    Route::post(  '/{model}',      [AppController::class, 'store']);
    Route::get(   '/{model}/{id}', [AppController::class, 'show']);
    Route::put(   '/{model}/{id}', [AppController::class, 'update']);
    Route::delete('/{model}/{id}', [AppController::class, 'destroy']);
});