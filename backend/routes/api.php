<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ShowController;
use App\Http\Controllers\API\CreateController;
use App\Http\Controllers\API\UpdateController;
use App\Http\Controllers\API\DeleteController;

// ==========================================
// PUBLIC ROUTES
// ==========================================
Route::get('/login',    fn() => response()->file(public_path('login.html')));
Route::get('/register', fn() => response()->file(public_path('register.html')));

Route::post('/register', [CreateController::class, 'register']);
Route::post('/login',    [CreateController::class, 'login']);

// ==========================================
// PROTECTED ROUTES
// ==========================================
Route::middleware('auth.manual')->group(function () {

    // --- HTML Views ----------------------------------------------------------
    Route::get('/dashboard',     fn() => response()->file(public_path('dashboard.vue')));
    Route::get('/tasks-view',    fn() => response()->file(public_path('tasks.vue')));
    Route::get('/projects-view', fn() => response()->file(public_path('projects.vue')));
    Route::get('/profile-view',  fn() => response()->file(public_path('profile.vue')));

    // --- Auth ----------------------------------------------------------------
    Route::post('/logout', [DeleteController::class, 'logout']);

    // --- Profile -------------------------------------------------------------
    Route::get('/profile', [ShowController::class,   'profileShow']);
    Route::put('/profile', [UpdateController::class, 'profileUpdate']);

    // --- Department ----------------------------------------------------------
    Route::get('/departments',         [ShowController::class,   'departmentIndex']);
    Route::get('/departments/{id}',    [ShowController::class,   'departmentShow']);
    Route::post('/departments',        [CreateController::class, 'departmentStore']);
    Route::put('/departments/{id}',    [UpdateController::class, 'departmentUpdate']);
    Route::delete('/departments/{id}', [DeleteController::class, 'departmentDestroy']);

    // --- User ----------------------------------------------------------------
    Route::get('/users',         [ShowController::class,   'userIndex']);
    Route::get('/users/{id}',    [ShowController::class,   'userShow']);
    Route::post('/users',        [CreateController::class, 'userStore']);
    Route::put('/users/{id}',    [UpdateController::class, 'userUpdate']);
    Route::delete('/users/{id}', [DeleteController::class, 'userDestroy']);

    // --- Project -------------------------------------------------------------
    Route::get('/projects',               [ShowController::class,   'projectIndex']);
    Route::get('/projects/search',        [ShowController::class,   'projectSearch']);
    Route::post('/projects',              [CreateController::class, 'projectStore']);
    Route::get('/projects/{id}',          [ShowController::class,   'projectShow']);
    Route::put('/projects/{id}',          [UpdateController::class, 'projectUpdate']);
    Route::delete('/projects/{id}',       [DeleteController::class, 'projectDestroy']);
    Route::post('/projects/{id}/members', [CreateController::class, 'projectAddMember']);
    Route::post('/projects/{id}/posts',   [CreateController::class, 'projectStorePost']);

    // --- Task ----------------------------------------------------------------
    Route::get('/dashboard-stats',             [ShowController::class,   'taskDashboardStats']);
    Route::get('/tasks',                       [ShowController::class,   'taskIndex']);
    Route::get('/tasks/kpi',                   [ShowController::class,   'taskKPIStats']);
    Route::get('/tasks/{id}',                  [ShowController::class,   'taskShow']);
    Route::post('/tasks',                      [CreateController::class, 'taskStore']);
    Route::put('/tasks/{id}',                  [UpdateController::class, 'taskUpdate']);
    Route::delete('/tasks/{id}',               [DeleteController::class, 'taskDestroy']);
    Route::get('/projects/{projectId}/tasks',  [ShowController::class,   'tasksByProject']);
    Route::post('/projects/{projectId}/tasks', [CreateController::class, 'taskStore']);

    // --- Chat ----------------------------------------------------------------
    Route::get('/projects/{projectId}/chats',  [ShowController::class,   'chatIndex']);
    Route::post('/projects/{projectId}/chats', [CreateController::class, 'chatStore']);
});