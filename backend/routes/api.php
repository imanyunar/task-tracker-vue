<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ListController;
use App\Http\Controllers\API\ShowController;
use App\Http\Controllers\API\CreateController;
use App\Http\Controllers\API\UpdateController;
use App\Http\Controllers\API\DeleteController;

// MANUAL CORS FALLBACK (Bila config/cors.php tidak mempan)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Origin, Content-Type, Accept, Authorization, X-Request-With');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}


Route::post('/register', [CreateController::class, 'register']);
Route::post('/login',    [CreateController::class, 'login']);


Route::middleware('auth.manual')->group(function () {

    Route::post('/logout', [DeleteController::class, 'logout']);

    // Specific route for attachment download (must be before dynamic routes)
    Route::get('/attachments/{id}/download', [ShowController::class, 'download']);

    Route::get(   '/{model}/{id}/{action}', [ListController::class,   'action']);   // GET /projects/{id}/tasks, /chats
    Route::post(  '/{model}/{id}/{action}', [CreateController::class, 'action']);   // POST /projects/{id}/members, /posts, /chats
    Route::get(   '/{model}',               [ListController::class,   'index']);    // GET /projects, /tasks, /users, /profile, /attachments
    Route::post(  '/{model}',               [CreateController::class, 'store']);    // POST /projects, /tasks, /users, /attachments
    Route::get(   '/{model}/{id}',          [ShowController::class,   'show']);     // GET /projects/{id}, /tasks/{id}, /attachments/{id}
    Route::put(   '/{model}/{id}',          [UpdateController::class, 'update']);   // PUT /projects/{id}, /tasks/{id}
    Route::patch( '/{model}/{id}/{action}',  [UpdateController::class, 'action']);   // PATCH /users/{id}/deactivate, /restore
    Route::post(  '/{model}/{action}',      [UpdateController::class, 'action']);   // POST /profile/avatar, /profile/password
    Route::delete('/{model}/{id}',          [DeleteController::class, 'destroy']);  // DELETE /projects/{id}, /tasks/{id}, /attachments/{id}
});
