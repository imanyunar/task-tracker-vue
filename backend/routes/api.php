<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\TaskController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\DepartmentController;
use App\Http\Controllers\API\ProjectController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\ChatController;

// ==========================================
// PUBLIC ROUTES (Tidak perlu login)
// ==========================================
Route::get('/login', function () {
    return response()->file(public_path('login.html'));
});

Route::get('/register', function () {
    return response()->file(public_path('register.html'));
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// ==========================================
// PROTECTED ROUTES (Wajib login / memiliki token)
// ==========================================
Route::middleware('auth.manual')->group(function () {
    
    // ------------------------------------------
    // 1. RUTE HTML VIEWS
    // ------------------------------------------
    Route::get('/dashboard', function () {
        return response()->file(public_path('dashboard.vue'));
    });
    
    Route::get('/tasks-view', function () {
        return response()->file(public_path('tasks.vue'));
    });
    
    Route::get('/projects-view', function () {
        return response()->file(public_path('projects.vue'));
    });

    Route::get('/profile-view', function () { 
        return response()->file(public_path('profile.vue')); 
    });

    // ------------------------------------------
    // 2. RUTE SPESIFIK (WAJIB DI ATAS RESOURCE!)
    // ------------------------------------------
    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Dashboard Stats (KPI)
    Route::get('/dashboard-stats', [TaskController::class, 'getDashboardStats']);
    
    //Tasks Specific Actions
    Route::get('/tasks/search', [TaskController::class, 'search']);
    Route::get('/tasks/status/{status}', [TaskController::class, 'tasksByStatus']);
    Route::get('/tasks/{id}', [TaskController::class, 'show']);
    // Project Specific Actions
    Route::get('/projects/search', [ProjectController::class, 'search']);
    Route::get('/projects/{projectId}/chats', [ChatController::class, 'index']);
    Route::post('/projects/{projectId}/chats', [ChatController::class, 'store']);
    Route::post('/projects/{id}/members', [ProjectController::class, 'addMember']);
    Route::get('/projects/{projectId}/tasks', [TaskController::class, 'tasksByProject']);
    Route::post('/projects/{id}/posts', [ProjectController::class, 'storePost']);
    
    // ------------------------------------------
    // 3. RUTE RESOURCE (WAJIB DI BAWAH!)
    // ------------------------------------------
    Route::apiResource('/departments', DepartmentController::class);
    Route::apiResource('/users', UserController::class);
    Route::apiResource('/projects', ProjectController::class);
    Route::apiResource('/tasks', TaskController::class);
    
    // ------------------------------------------
    // 4. LOGOUT
    // ------------------------------------------
    Route::post('/logout', [AuthController::class, 'logout']);
});