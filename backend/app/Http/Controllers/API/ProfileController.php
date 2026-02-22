<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
  public function show(Request $request)
  {
    $user = $request->user(); 

    if (!$user) {
        return response()->json(['message' => 'Sesi tidak valid'], 401);
    }

    $user->load(['department', 'role']);

    return response()->json([
        'success' => true,
        'message' => 'Data profil berhasil diambil',
        'data' => $user
    ], 200);
  }

  public function update(Request $request)
  {
    $user = $request->user();

    if (!$user) {
        return response()->json(['message' => 'Sesi tidak valid'], 401);
    }

    $validated = $request->validate([
        'name' => 'string|max:255',
        'email' => 'email|max:255|unique:users,email,' . $user->id,
    ]);

    $user->update($validated);
    $user->load(['department', 'role']);

    return response()->json([
        'success' => true,
        'message' => 'Profil berhasil diperbarui',
        'data' => $user
    ], 200);
  }
}