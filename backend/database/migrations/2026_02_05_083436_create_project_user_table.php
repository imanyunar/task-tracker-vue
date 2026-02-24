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
        Schema::create('project_user', function (Blueprint $table) {
            $table->id();
            
            // Relasi ke tabel projects
            $table->foreignId('project_id')
                  ->constrained()
                  ->onDelete('cascade');
            
            // Relasi ke tabel users
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');
            
            /**
             * Role per Project (ID Corporate):
             * 1 = OWNER       (Bisa atur tim & hapus proyek)
             * 2 = MANAGER     (Bisa kelola task & timeline)
             * 3 = CONTRIBUTOR (Bisa update progress task)
             * 4 = STAKEHOLDER (Hanya bisa melihat/view)
             */
            $table->integer('role_in_project')->default(3); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('project_user');
    }
};