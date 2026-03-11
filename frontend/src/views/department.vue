<template>
  <div class="relative min-h-screen overflow-x-hidden pt-24 pb-16 px-4 sm:px-6">

    <!-- Ambient blobs -->
    <div class="fixed top-0 -left-10 w-[500px] h-[500px] bg-indigo-600/8 rounded-full filter blur-[120px] animate-blob pointer-events-none"></div>
    <div class="fixed -bottom-20 -right-10 w-[500px] h-[500px] bg-purple-600/8 rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>

    <div class="max-w-7xl mx-auto relative z-10 space-y-8 animate-fade-in">

      <!-- ===== HEADER ===== -->
      <header>
        <div class="glass rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div class="space-y-2">
              <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em]">
                <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                HR Management
              </span>
              <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight m-0">
                Manajemen <span class="text-gradient-primary">Departemen</span>
              </h1>
              <p class="text-slate-500 text-sm m-0 font-medium">Kelola struktur departemen perusahaan.</p>
            </div>

            <button v-if="isAdmin" @click="openCreateModal" class="btn btn-primary rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap self-start lg:self-auto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              Tambah Departemen
            </button>
          </div>

          <!-- Stats -->
          <div v-if="!loading" class="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-6">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ departments.length }} Departemen</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ totalEmployees }} Total Karyawan</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ===== LOADING ===== -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-40 gap-6">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400/50 rounded-full animate-spin"></div>
          <div class="absolute inset-3 border-2 border-t-purple-500/60 rounded-full animate-spin" style="animation-direction:reverse; animation-duration:0.8s;"></div>
        </div>
        <p class="text-slate-600 font-black tracking-[0.3em] uppercase text-xs">Memuat Data...</p>
      </div>

      <!-- ===== GRID ===== -->
      <div v-else-if="departments.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="(dept, idx) in departments" :key="dept.id"
          class="group card flex flex-col hover:border-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
          :style="`animation-delay: ${idx * 50}ms`"
        >
          <div class="card-body flex flex-col flex-1">
            <div class="flex items-start justify-between gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              </div>
              <div v-if="isAdmin" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEditModal(dept)" class="p-2 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all" title="Edit">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button @click="deleteDepartment(dept.id)" class="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all" title="Hapus">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <h3 class="text-base font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors mb-1">{{ dept.name }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed flex-1 m-0">{{ dept.description || 'Tidak ada deskripsi.' }}</p>

            <div class="mt-4 pt-4 border-t border-slate-800/70 flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {{ dept.users_count ?? dept.users?.length ?? 0 }} Karyawan
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-else class="text-center py-24 card border-dashed">
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Belum ada departemen</h3>
        <p class="text-slate-500 text-sm max-w-xs mx-auto m-0">Buat departemen pertama untuk mulai mengorganisasi karyawan.</p>
        <button v-if="isAdmin" @click="openCreateModal" class="btn btn-primary rounded-xl text-sm mt-6 inline-flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Buat Departemen
        </button>
      </div>

    </div>

    <!-- ===== MODAL CREATE/EDIT ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal max-w-md w-full animate-slide-up">
          <div class="modal-header">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isEditing ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white m-0">{{ isEditing ? 'Edit Departemen' : 'Departemen Baru' }}</h3>
            </div>
            <button @click="closeModal" class="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitDepartment" class="space-y-5">
              <div class="form-group">
                <label class="label-field">Nama Departemen <span class="text-rose-400">*</span></label>
                <input v-model="formData.name" type="text" required placeholder="Contoh: Engineering" class="input-field">
              </div>
              <div class="form-group">
                <label class="label-field">Deskripsi</label>
                <textarea v-model="formData.description" rows="3" placeholder="Deskripsi singkat departemen..." class="textarea-field"></textarea>
              </div>

              <div class="modal-footer px-0 pb-0 border-t-0 mt-2">
                <button type="button" @click="closeModal" class="btn-secondary btn-sm rounded-xl">Batal</button>
                <button type="submit" :disabled="submitting" class="btn btn-primary rounded-xl">
                  {{ submitting ? 'Memproses...' : (isEditing ? 'Perbarui' : 'Buat Departemen') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDepartments } from '@/composables/useDepartments'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role_id === 1)

const {
  departments,
  loading,
  totalEmployees,

  showModal,
  isEditing,
  submitting,
  formData,

  openCreateModal,
  openEditModal,
  closeModal,
  submitDepartment,
  deleteDepartment,
} = useDepartments()
</script>