<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\ShowController;
use App\Http\Controllers\API\CreateController;
use App\Http\Controllers\API\UpdateController;
use App\Http\Controllers\API\DeleteController;


Route::post('/register', [CreateController::class, 'register']);
Route::post('/login',    [CreateController::class, 'login']);


Route::middleware('auth.manual')->group(function () {

    Route::post('/logout', [DeleteController::class, 'logout']);

   
    Route::get(   '/{model}/{id}/{action}', [ShowController::class,   'action']);
    Route::post(  '/{model}/{id}/{action}', [CreateController::class, 'action']);
    Route::get(   '/{model}',               [ShowController::class,   'index']);
    Route::post(  '/{model}',               [CreateController::class, 'store']);
    Route::get(   '/{model}/{id}',          [ShowController::class,   'show']);
    Route::put(   '/{model}/{id}',          [UpdateController::class, 'update']);
    Route::delete('/{model}/{id}',          [DeleteController::class, 'destroy']);
});