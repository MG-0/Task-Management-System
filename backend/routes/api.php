<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\TaskController;


Route::get('/test', function(){
    return response()->json([
        "message" => 'API IS WORKING!'
    ]);
});


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register'] );
Route::post('/login', [AuthController::class, 'login']);
//sanctum
Route::middleware('auth:sanctum')->group(function (){
 Route::post('/logout', [AuthController::class,'logout'] );
 Route::get('/me', [AuthController::class, 'me']);
 Route::put('/profile', [ProfileController::class, 'update']);
Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar' ]);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('tasks', TaskController::class);
Route::patch('/tasks/{task}/assign', [TaskController::class, 'assign']);
Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus']);
 Route::get('/users', function() {
     return response()->json(['users' => \App\Models\User::all()]);
 });
});
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);