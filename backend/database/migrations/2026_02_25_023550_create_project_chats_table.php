<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('project_chats', function (Blueprint $table) {
            $table->id();
            // Menghubungkan chat ke proyek tertentu
            $table->foreignId('project_id')->constrained('projects')->onDelete('cascade');
            
            // Menghubungkan chat ke pengirim (User)
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            
            // Isi pesan chat
            $table->text('message');
            
            // Waktu kirim (created_at & updated_at)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_chats');
    }
};