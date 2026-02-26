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
                Project Management
              </span>
              <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight m-0">
                Projects <span class="text-gradient-primary">Dashboard</span>
              </h1>
              <p class="text-slate-500 text-sm m-0 font-medium">Pantau progres dan kelola tugas tim Anda dalam satu tempat.</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <!-- Search -->
              <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Cari proyek..."
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                >
              </div>

              <!-- Create button -->
              <button
                v-if="canManageGlobal"
                @click="openCreateModal"
                class="btn btn-primary rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buat Proyek
              </button>
            </div>
          </div>

          <!-- Stats bar -->
          <div v-if="!loading" class="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-6">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ filteredProjects.length }} Proyek</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ completedCount }} Selesai</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ activeCount }} Aktif</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ===== LOADING ===== -->
      <div v-if="loading && projects.length === 0" class="flex flex-col items-center justify-center py-40 gap-6">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400/50 rounded-full animate-spin"></div>
          <div class="absolute inset-3 border-2 border-t-purple-500/60 rounded-full animate-spin" style="animation-direction:reverse; animation-duration:0.8s;"></div>
        </div>
        <p class="text-slate-600 font-black tracking-[0.3em] uppercase text-xs">Sinkronisasi Data...</p>
      </div>

      <!-- ===== PROJECT GRID ===== -->
      <div v-else-if="filteredProjects.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div
            v-for="(project, idx) in filteredProjects"
            :key="project.id"
            class="group card flex flex-col hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300"
            :style="`animation-delay: ${idx * 50}ms`"
          >
            <!-- Card top -->
            <div class="card-body pb-0 flex flex-col flex-1">
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="flex-1 min-w-0">
                  <h3 class="text-base font-bold text-white leading-tight line-clamp-1 group-hover:text-indigo-300 transition-colors mb-2" :title="project.name">
                    {{ project.name }}
                  </h3>
                  <div class="flex flex-wrap items-center gap-1.5">
                    <span v-if="project.my_role_id" :class="['inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border', roleConfig[project.my_role_id]?.class]">
                      {{ roleConfig[project.my_role_id]?.label }}
                    </span>
                    <span v-if="user?.role_id === 1 && project.department?.name" class="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border border-slate-700 text-slate-500 bg-slate-800/50">
                      {{ project.department.name }}
                    </span>
                  </div>
                </div>
                <span :class="[
                  'flex-shrink-0 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border',
                  project.progress >= 100
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                ]">
                  {{ project.progress >= 100 ? 'Selesai' : 'Aktif' }}
                </span>
              </div>

              <p class="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-5">
                {{ project.description || 'Tidak ada deskripsi proyek yang ditambahkan.' }}
              </p>

              <!-- Progress -->
              <div class="mb-5">
                <div class="flex justify-between items-center mb-2">
                  <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Progress</span>
                  <span class="text-[11px] font-black text-indigo-400 tabular-nums">{{ project.progress }}%</span>
                </div>
                <div class="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
                    :style="{ width: project.progress + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Card footer -->
            <div class="px-6 py-4 border-t border-slate-800/70 flex items-center justify-between gap-2 bg-slate-950/20">
              <button
                @click="openDetails(project)"
                class="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Detail
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
              </button>

              <div v-if="project.my_role_id <= 2 || user?.role_id === 1" class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  @click="openEditModal(project)"
                  class="p-2 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                  title="Edit"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  v-if="project.my_role_id === 1 || user?.role_id === 1"
                  @click="confirmDelete(project.id)"
                  class="p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Hapus"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Load more -->
        <div v-if="hasMore" class="mt-10 flex justify-center">
          <button
            @click="loadMore"
            :disabled="loading"
            class="flex items-center gap-3 px-8 py-3 bg-slate-900/60 border border-slate-700 rounded-2xl text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-slate-800/60 transition-all shadow-xl disabled:opacity-40 font-bold text-sm uppercase tracking-widest"
          >
            <div v-if="loading" class="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 13l-7 7-7-7" /></svg>
            Tampilkan Lebih Banyak
          </button>
        </div>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-else class="text-center py-24 card border-dashed">
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Belum ada proyek</h3>
        <p class="text-slate-500 text-sm max-w-xs mx-auto m-0">Mulai susun rencana kerja tim Anda dengan membuat proyek pertama hari ini.</p>
        <button v-if="canManageGlobal" @click="openCreateModal" class="btn btn-primary rounded-xl text-sm mt-6 inline-flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Buat Proyek Pertama
        </button>
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
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="isEditing ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white m-0">{{ isEditing ? 'Edit Proyek' : 'Proyek Baru' }}</h3>
            </div>
            <button @click="closeModal" class="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="submitProject" class="space-y-5">
              <div class="form-group">
                <label class="label-field">Nama Proyek <span class="text-rose-400">*</span></label>
                <input v-model="formData.name" type="text" required placeholder="Contoh: Website Redesign" class="input-field">
              </div>

              <div v-if="user?.role_id === 1" class="form-group">
                <label class="label-field">Departemen <span class="text-rose-400">*</span></label>
                <select v-model="formData.department_id" required class="select-field">
                  <option value="" disabled>-- Pilih Departemen --</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
                </select>
              </div>

              <div v-else-if="user?.role_id === 2" class="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                <p class="text-[11px] text-indigo-300/80 font-medium m-0">
                  Proyek otomatis terdaftar di departemen <strong class="text-indigo-300">{{ user.department?.name }}</strong>.
                </p>
              </div>

              <div class="form-group">
                <label class="label-field">Deskripsi</label>
                <textarea v-model="formData.description" rows="3" placeholder="Jelaskan tujuan utama proyek ini..." class="textarea-field"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="label-field">Tanggal Mulai</label>
                  <input v-model="formData.start_date" type="date" class="input-field">
                </div>
                <div class="form-group">
                  <label class="label-field">Deadline</label>
                  <input v-model="formData.end_date" type="date" class="input-field">
                </div>
              </div>

              <div class="modal-footer px-0 pb-0 border-t-0 mt-2">
                <button type="button" @click="closeModal" class="btn-secondary btn-sm rounded-xl">Batal</button>
                <button type="submit" :disabled="isSubmitting" class="btn btn-primary rounded-xl">
                  {{ isSubmitting ? 'Memproses...' : (isEditing ? 'Perbarui Proyek' : 'Simpan Proyek') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ===== MODAL DETAIL ===== -->
    <Teleport to="body">
      <div v-if="showDetailsModal" class="modal-overlay" @click.self="closeDetailsModal">
        <div class="relative bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden animate-slide-up">

          <!-- Detail header -->
          <div class="p-7 border-b border-slate-800 flex items-start justify-between gap-6 bg-gradient-to-r from-indigo-950/40 to-slate-900/40">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span v-if="selectedProject?.my_role_id" :class="['px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded border', roleConfig[selectedProject.my_role_id]?.class]">
                  {{ roleConfig[selectedProject.my_role_id]?.label }}
                </span>
                <span :class="[
                  'px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border',
                  selectedProject?.progress >= 100 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                ]">{{ selectedProject?.progress >= 100 ? 'Selesai' : 'Aktif' }}</span>
              </div>
              <h2 class="text-2xl font-black text-white m-0 leading-tight truncate">{{ selectedProject?.name }}</h2>
              <p class="text-slate-500 text-sm mt-1.5 line-clamp-2 m-0 leading-relaxed">{{ selectedProject?.description || 'Tidak ada deskripsi.' }}</p>

              <!-- Progress bar -->
              <div class="mt-4 flex items-center gap-3">
                <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden max-w-xs">
                  <div class="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                    :style="{ width: (selectedProject?.progress || 0) + '%' }"></div>
                </div>
                <span class="text-[11px] font-black text-indigo-400 tabular-nums">{{ selectedProject?.progress || 0 }}%</span>
              </div>

              <button
                @click="goToWorkspace(selectedProject.id)"
                class="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-900/40 active:scale-95"
              >
                Buka Workspace
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </button>
            </div>

            <button @click="closeDetailsModal" class="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-800 px-7 bg-slate-900/80">
            <button
              @click="activeTab = 'tasks'"
              :class="['py-4 text-[10px] font-black uppercase tracking-widest border-b-2 mr-8 transition-all',
                activeTab === 'tasks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']"
            >
              Daftar Tugas
              <span v-if="projectTasks.length" class="ml-2 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[8px] font-black">{{ projectTasks.length }}</span>
            </button>
            <button
              @click="activeTab = 'members'"
              :class="['py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all',
                activeTab === 'members' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']"
            >
              Anggota Tim
              <span v-if="projectMembers.length" class="ml-2 px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[8px] font-black">{{ projectMembers.length }}</span>
            </button>
          </div>

          <!-- Tab content -->
          <div class="overflow-y-auto flex-1 p-7 detail-scroll bg-slate-950/30">

            <!-- Tasks tab -->
            <div v-if="activeTab === 'tasks'" class="animate-fade-in">
              <div v-if="!projectTasks.length" class="text-center py-16">
                <div class="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-600">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p class="text-slate-500 text-sm font-bold m-0">Belum ada tugas untuk proyek ini.</p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="task in projectTasks"
                  :key="task.id"
                  class="group flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 hover:bg-slate-900/80 transition-all"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <div :class="['w-2 h-2 rounded-full flex-shrink-0',
                      task.status === 'done' ? 'bg-emerald-500' :
                      task.status === 'doing' ? 'bg-indigo-500' :
                      task.status === 'review' ? 'bg-amber-500' : 'bg-slate-600']"></div>
                    <div class="min-w-0">
                      <p class="text-white font-bold text-sm m-0 leading-tight truncate group-hover:text-indigo-300 transition-colors">
                        {{ task.name || task.title }}
                      </p>
                      <p class="text-[10px] text-slate-500 m-0 mt-0.5">
                        {{ task.user?.name ? `Assigned: ${task.user.name}` : 'Unassigned' }}
                      </p>
                    </div>
                  </div>
                  <span :class="['flex-shrink-0 badge text-[9px]',
                    task.status === 'done' ? 'badge-success' :
                    task.status === 'doing' ? 'badge-primary' :
                    task.status === 'review' ? 'badge-warning' : 'badge-danger']">
                    {{ task.status || 'todo' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Members tab -->
            <div v-if="activeTab === 'members'" class="animate-fade-in">

              <!-- Invite form -->
              <div v-if="selectedProject?.my_role_id <= 2 || user?.role_id === 1" class="mb-6 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Undang Anggota Baru</p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <select v-model="newMemberId" class="select-field flex-1 text-sm">
                    <option value="" disabled>Pilih User...</option>
                    <option v-for="u in availableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
                  </select>
                  <select v-model="newMemberRole" class="select-field w-full sm:w-44 text-sm">
                    <option :value="2">Manager</option>
                    <option :value="3">Contributor</option>
                    <option :value="4">Stakeholder</option>
                  </select>
                  <button
                    @click="addMember"
                    :disabled="!newMemberId || isAddingMember"
                    class="btn btn-primary rounded-xl text-sm disabled:opacity-40 whitespace-nowrap"
                  >
                    {{ isAddingMember ? 'Memproses...' : 'Tambahkan' }}
                  </button>
                </div>
              </div>

              <!-- Member list -->
              <div v-if="!projectMembers.length" class="text-center py-12">
                <p class="text-slate-500 text-sm font-bold m-0">Belum ada anggota.</p>
              </div>
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="member in projectMembers"
                  :key="member.id"
                  class="group/member flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all"
                >
                  <div class="flex items-center gap-3 min-w-0">
                    <img
                      :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4f46e5&color=fff&bold=true&size=80`"
                      class="w-10 h-10 rounded-xl border border-slate-700 flex-shrink-0"
                    >
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-white m-0 leading-tight truncate">{{ member.name }}</p>
                      <p class="text-[10px] text-slate-500 m-0 truncate">{{ member.email }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <span v-if="member.pivot?.role_in_project" :class="['badge text-[9px]', roleConfig[member.pivot.role_in_project]?.class]">
                      {{ roleConfig[member.pivot.role_in_project]?.label || 'Member' }}
                    </span>
                    <button
                      v-if="(selectedProject?.my_role_id === 1 || user?.role_id === 1) && member.pivot?.role_in_project !== 1"
                      @click="removeMember(member.id)"
                      class="opacity-0 group-hover/member:opacity-100 p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'
import apiClient from '../services/api'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const router = useRouter()

const roleConfig = {
  1: { label: 'Owner',       class: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  2: { label: 'Manager',     class: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  3: { label: 'Contributor', class: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  4: { label: 'Stakeholder', class: 'text-slate-400 border-slate-600 bg-slate-800/50' },
}

const projects = computed(() => projectStore.projects || [])
const loading = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const departments = ref([])

const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formData = reactive({ id: null, name: '', description: '', start_date: '', end_date: '', department_id: '' })

const showDetailsModal = ref(false)
const activeTab = ref('tasks')
const selectedProject = ref(null)
const projectTasks = ref([])
const projectMembers = ref([])

const availableUsers = ref([])
const newMemberId = ref('')
const newMemberRole = ref(3)
const isAddingMember = ref(false)

const user = computed(() => authStore.user)
const canManageGlobal = computed(() => user.value?.role_id === 1 || user.value?.role_id === 2)
const hasMore = computed(() => projectStore.pagination?.current_page < projectStore.pagination?.last_page)

const filteredProjects = computed(() =>
  projects.value.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

const completedCount = computed(() => filteredProjects.value.filter(p => p.progress >= 100).length)
const activeCount = computed(() => filteredProjects.value.filter(p => p.progress < 100).length)

onMounted(async () => {
  await loadProjects(1)
  if (canManageGlobal.value) {
    loadAllUsers()
    loadDepartments()
  }
})

const loadProjects = async (page = 1) => {
  loading.value = true
  try {
    await projectStore.fetchProjects(page)
    currentPage.value = page
  } catch (err) { console.error('Fetch Error:', err) }
  finally { loading.value = false }
}

const loadDepartments = async () => {
  if (user.value?.role_id === 1) {
    try {
      const res = await apiClient.get('/departments')
      departments.value = res.data.data || res.data || []
    } catch (err) { console.error(err) }
  }
}

const loadMore = async () => {
  if (hasMore.value && !loading.value) await loadProjects(currentPage.value + 1)
}

const loadAllUsers = async () => {
  try {
    const res = await apiClient.get('/users')
    availableUsers.value = res.data.data || res.data || []
  } catch (err) { console.error(err) }
}

const openCreateModal = () => {
  isEditing.value = false
  Object.assign(formData, { id: null, name: '', description: '', start_date: '', end_date: '', department_id: user.value?.role_id === 1 ? '' : user.value?.department_id })
  showModal.value = true
}

const openEditModal = (project) => {
  isEditing.value = true
  Object.assign(formData, {
    id: project.id,
    name: project.name,
    description: project.description,
    start_date: project.start_date ? project.start_date.substring(0, 10) : '',
    end_date: project.end_date ? project.end_date.substring(0, 10) : '',
    department_id: project.department_id,
  })
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitProject = async () => {
  isSubmitting.value = true
  try {
    if (isEditing.value) await projectStore.updateProject(formData.id, formData)
    else await projectStore.createProject(formData)
    await loadProjects(1)
    closeModal()
  } catch (err) { alert(err.response?.data?.message || 'Gagal memproses data.') }
  finally { isSubmitting.value = false }
}

const confirmDelete = async (id) => {
  if (confirm('Hapus proyek ini secara permanen?')) {
    try {
      await projectStore.deleteProject(id)
      await loadProjects(1)
    } catch (err) { alert('Gagal menghapus.') }
  }
}

const openDetails = async (project) => {
  selectedProject.value = project
  activeTab.value = 'tasks'
  showDetailsModal.value = true
  projectTasks.value = []
  projectMembers.value = []
  try {
    const [detailRes, taskRes] = await Promise.all([
      apiClient.get(`/projects/${project.id}`),
      apiClient.get('/tasks'),
    ])
    const detailData = detailRes.data.data || detailRes.data
    projectMembers.value = detailData.members || []
    const allTasks = taskRes.data.data || taskRes.data || []
    projectTasks.value = allTasks.filter(t => t.project_id === project.id)
  } catch (err) { console.error(err) }
}

const goToWorkspace = (projectId) => {
  router.push({ name: 'ProjectDetail', params: { id: projectId } })
}

const closeDetailsModal = () => { showDetailsModal.value = false }

const addMember = async () => {
  if (!newMemberId.value || !selectedProject.value) return
  isAddingMember.value = true
  try {
    await apiClient.post(`/projects/${selectedProject.value.id}/members`, {
      user_id: newMemberId.value,
      role_in_project: parseInt(newMemberRole.value),
    })
    const detailRes = await apiClient.get(`/projects/${selectedProject.value.id}`)
    projectMembers.value = (detailRes.data.data || detailRes.data).members || []
    newMemberId.value = ''
    alert('Anggota berhasil ditambahkan!')
  } catch (err) { alert(err.response?.data?.message || 'Gagal menambahkan.') }
  finally { isAddingMember.value = false }
}

const removeMember = async (memberId) => {
  if (!confirm('Hapus anggota ini dari proyek?')) return
  try {
    await apiClient.delete(`/projects/${selectedProject.value.id}/members/${memberId}`)
    projectMembers.value = projectMembers.value.filter(m => m.id !== memberId)
  } catch (err) { alert('Gagal menghapus anggota.') }
}
</script>

<style scoped>
.detail-scroll::-webkit-scrollbar { width: 4px; }
.detail-scroll::-webkit-scrollbar-track { background: transparent; }
.detail-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.4);
  cursor: pointer;
}
</style>