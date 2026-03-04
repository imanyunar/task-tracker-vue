<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ShowController;
use App\Http\Controllers\API\CreateController;
use App\Http\Controllers\API\UpdateController;
use App\Http\Controllers\API\DeleteController;

// ==========================================
// PUBLIC ROUTES (tidak perlu login)
// ==========================================
Route::post('/register', [CreateController::class, 'register']);
Route::post('/login',    [CreateController::class, 'login']);

// ==========================================
// PROTECTED ROUTES (wajib pakai token)
// ==========================================
Route::middleware('auth.manual')->group(function () {

    Route::post('/logout', [DeleteController::class, 'logout']);

    // =========================================================================
    // DYNAMIC MODEL ROUTES
    //
    // Model tersedia  : users | departments | projects | tasks | profile
    // Action tersedia : members | posts | tasks | chats  (khusus projects)
    //
    //   GET    /{model}                → ShowController@index
    //   POST   /{model}                → CreateController@store
    //   GET    /{model}/{id}           → ShowController@show
    //   PUT    /{model}/{id}           → UpdateController@update
    //   DELETE /{model}/{id}           → DeleteController@destroy
    //   GET    /{model}/{id}/{action}  → ShowController@action
    //   POST   /{model}/{id}/{action}  → CreateController@action
    //
    // Catatan penting — urutan route:
    // /{model}/{id}/{action} WAJIB ditulis SEBELUM /{model}/{id}
    // agar Laravel tidak salah menangkap 'action' sebagai 'id'
    // =========================================================================
    Route::get(   '/{model}/{id}/{action}', [ShowController::class,   'action']);
    Route::post(  '/{model}/{id}/{action}', [CreateController::class, 'action']);
    Route::get(   '/{model}',               [ShowController::class,   'index']);
    Route::post(  '/{model}',               [CreateController::class, 'store']);
    Route::get(   '/{model}/{id}',          [ShowController::class,   'show']);
    Route::put(   '/{model}/{id}',          [UpdateController::class, 'update']);
    Route::delete('/{model}/{id}',          [DeleteController::class, 'destroy']);
});