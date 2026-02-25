<?php

namespace App\Http\Controllers\API; // Pastikan ini ada \API

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ProjectChat; 

class ChatController extends Controller
{
    /**
     * Menampilkan pesan berdasarkan Project ID
     */
    public function index(Request $request, $projectId)
    {        
        $lastId = $request->query('last_id', 0);

        // Filter berdasarkan project_id agar chat antar project tidak bercampur
        $messages = ProjectChat::where('project_id', $projectId)
            ->where('id', '>', $lastId)
            ->with('user:id,name')
            ->orderBy('created_at', 'asc')
            ->get();
        
        return response()->json($messages);
    }

    /**
     * Menyimpan pesan baru
     */
   public function store(Request $request, $projectId)
{
    $request->validate([
        'message' => 'required|string'
    ]);

    // PERBAIKAN: Ambil user_id dari request yang sudah diset oleh middleware auth.manual
    // Jika middleware Anda menyimpan user di atribut 'user', gunakan $request->user->id
    $userId = auth()->id() ?? $request->attributes->get('user_id') ?? $request->user()?->id;

    if (!$userId) {
        return response()->json(['message' => 'User tidak terautentikasi'], 401);
    }

    $chat = ProjectChat::create([
        'project_id' => $projectId,
        'user_id' => $userId, 
        'message' => $request->input('message'),
    ]);

    return response()->json($chat->load('user:id,name'), 201);
}
}