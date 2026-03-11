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
                Manajemen <span class="text-gradient-primary">Karyawan</span>
              </h1>
              <p class="text-slate-500 text-sm m-0 font-medium">Kelola data, role, dan status karyawan perusahaan.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input v-model="searchQuery" type="text" placeholder="Cari karyawan..." class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all">
              </div>
              <button v-if="isAdmin" @click="openCreateModal" class="btn btn-primary rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                Tambah Karyawan
              </button>
            </div>
          </div>

          <!-- Stats bar -->
          <div v-if="!loading" class="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-6">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ employees.length }} Karyawan</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ activeCount }} Aktif</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-rose-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ inactiveCount }} Nonaktif</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Filter tabs -->
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="tab in filterTabs" :key="tab.value"
          @click="filterStatus = tab.value"
          :class="['px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all',
            filterStatus === tab.value
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
              : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700']"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ===== LOADING ===== -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-40 gap-6">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400/50 rounded-full animate-spin"></div>
          <div class="absolute inset-3 border-2 border-t-purple-500/60 rounded-full animate-spin" style="animation-direction:reverse; animation-duration:0.8s;"></div>
        </div>
        <p class="text-slate-600 font-black tracking-[0.3em] uppercase text-xs">Memuat Data...</p>
      </div>

      <!-- ===== TABLE ===== -->
      <div v-else-if="filteredEmployees.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-800">
                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Karyawan</th>
                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden md:table-cell">Departemen</th>
                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hidden sm:table-cell">Role</th>
                <th class="text-left px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                <th v-if="isAdmin" class="text-right px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr
                v-for="emp in filteredEmployees" :key="emp.id"
                class="group hover:bg-slate-800/20 transition-colors"
                :class="{ 'opacity-60': !emp.is_active }"
              >
                <!-- Karyawan -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="relative flex-shrink-0">
                      <img
                        :src="emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=4f46e5&color=fff&bold=true&size=80`"
                        class="w-10 h-10 rounded-xl border border-slate-700 object-cover"
                      >
                      <span v-if="!emp.is_active" class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-slate-900"></span>
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-white m-0 leading-tight truncate">{{ emp.name }}</p>
                      <p class="text-[11px] text-slate-500 m-0 truncate">{{ emp.email }}</p>
                    </div>
                  </div>
                </td>

                <!-- Departemen -->
                <td class="px-6 py-4 hidden md:table-cell">
                  <span class="text-sm text-slate-400">{{ emp.department?.name ?? '-' }}</span>
                </td>

                <!-- Role -->
                <td class="px-6 py-4 hidden sm:table-cell">
                  <span :class="['inline-flex items-center px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border', roleConfig[emp.role_id]?.class ?? 'text-slate-400 border-slate-700 bg-slate-800/50']">
                    {{ roleConfig[emp.role_id]?.label ?? '-' }}
                  </span>
                </td>

                <!-- Status -->
                <td class="px-6 py-4">
                  <span :class="['inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg border', emp.is_active ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10']">
                    <span :class="['w-1.5 h-1.5 rounded-full', emp.is_active ? 'bg-emerald-400' : 'bg-rose-400']"></span>
                    {{ emp.is_active ? 'Aktif' : 'Nonaktif' }}
                  </span>
                </td>

                <!-- Aksi -->
                <td v-if="isAdmin" class="px-6 py-4">
                  <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button v-if="emp.is_active" @click="openEditModal(emp)" class="p-2 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all" title="Edit">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>

                    <button
                      v-if="emp.is_active && emp.id !== currentUser?.id"
                      @click="deactivateEmployee(emp)"
                      :disabled="togglingId === emp.id"
                      class="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all disabled:opacity-30"
                      title="Nonaktifkan"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                    </button>

                    <button
                      v-if="!emp.is_active"
                      @click="restoreEmployee(emp)"
                      :disabled="togglingId === emp.id"
                      class="p-2 text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all disabled:opacity-30"
                      title="Aktifkan kembali"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>

                    <button
                      v-if="emp.id !== currentUser?.id"
                      @click="deleteEmployee(emp.id)"
                      class="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                      title="Hapus permanen"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-else class="text-center py-24 card border-dashed">
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Tidak ada karyawan ditemukan</h3>
        <p class="text-slate-500 text-sm max-w-xs mx-auto m-0">Coba ubah filter atau kata kunci pencarian.</p>
      </div>

    </div>

    <!-- ===== MODAL CREATE/EDIT ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal max-w-lg w-full animate-slide-up">
          <div class="modal-header">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isEditing ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white m-0">{{ isEditing ? 'Edit Karyawan' : 'Tambah Karyawan' }}</h3>
            </div>
            <button @click="closeModal" class="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitEmployee" class="space-y-5">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group col-span-2">
                  <label class="label-field">Nama Lengkap <span class="text-rose-400">*</span></label>
                  <input v-model="formData.name" type="text" required placeholder="Nama karyawan" class="input-field">
                </div>

                <div class="form-group col-span-2">
                  <label class="label-field">Email <span class="text-rose-400">*</span></label>
                  <input v-model="formData.email" type="email" required placeholder="email@perusahaan.com" class="input-field">
                </div>

                <div class="form-group">
                  <label class="label-field">Departemen <span class="text-rose-400">*</span></label>
                  <select v-model="formData.department_id" required class="select-field">
                    <option value="" disabled>-- Pilih --</option>
                    <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="label-field">Role <span class="text-rose-400">*</span></label>
                  <select v-model="formData.role_id" required class="select-field">
                    <option value="" disabled>-- Pilih --</option>
                    <option :value="1">Admin</option>
                    <option :value="2">Manager</option>
                    <option :value="3">Employee</option>
                  </select>
                </div>

                <div v-if="!isEditing" class="form-group col-span-2">
                  <label class="label-field">Password <span class="text-rose-400">*</span></label>
                  <input v-model="formData.password" type="password" required placeholder="Min. 8 karakter" class="input-field">
                </div>

                <div v-if="isEditing" class="form-group col-span-2">
                  <label class="label-field">Password Baru <span class="text-slate-600">(kosongkan jika tidak diubah)</span></label>
                  <input v-model="formData.password" type="password" placeholder="Min. 8 karakter" class="input-field">
                </div>
              </div>

              <div class="modal-footer px-0 pb-0 border-t-0 mt-2">
                <button type="button" @click="closeModal" class="btn-secondary btn-sm rounded-xl">Batal</button>
                <button type="submit" :disabled="submitting" class="btn btn-primary rounded-xl">
                  {{ submitting ? 'Memproses...' : (isEditing ? 'Perbarui' : 'Tambah Karyawan') }}
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
// FIX: import dari useEmployees (plural) sesuai nama file yang benar
import { useEmployees } from "@/composables/useEmployees"

const {
  currentUser,
  isAdmin,

  employees,
  filteredEmployees,
  loading,

  searchQuery,
  filterStatus,
  filterTabs,

  activeCount,
  inactiveCount,

  roleConfig,

  deactivateEmployee,
  restoreEmployee,
  deleteEmployee,

  togglingId,

  showModal,
  isEditing,
  submitting,
  formData,

  openCreateModal,
  openEditModal,
  closeModal,
  submitEmployee,

  departments,
} = useEmployees()
</script>