<script setup>
import { useDashboardPage } from '../composables/useDashboard'
// Pastikan file ini ada di: src/composables/useDashboardPage.ts

const {
  stats, allTasks, loading,
  isViewAll, currentPage,
  user, greeting, timeString, dateString,
  displayTasks, totalPages,
  pendingCount, doingCount, doneCount,
  toggleViewAll, getStatusConfig, formatDate, isOverdue,
} = useDashboardPage()
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden pt-24 pb-16 px-4 sm:px-6">

    <!-- Ambient background blobs -->
    <div class="fixed top-0 -left-10 w-[500px] h-[500px] bg-indigo-600/8 rounded-full filter blur-[120px] animate-blob pointer-events-none"></div>
    <div class="fixed -bottom-20 -right-10 w-[500px] h-[500px] bg-purple-600/8 rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>
    <div class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-900/10 rounded-full filter blur-[100px] pointer-events-none"></div>

    <div class="max-w-7xl mx-auto relative z-10 space-y-8">

      <!-- ===== HEADER ===== -->
      <header class="animate-fade-in">
        <div class="glass rounded-3xl border border-white/5 p-6 md:p-8 shadow-2xl">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            <!-- Left: Greeting -->
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.25em]">
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                  {{ greeting }}
                </span>
                <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {{ user?.department?.name || 'Umum' }}
                </span>
              </div>
              <h1 class="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight m-0">
                {{ user?.name ? user.name.split(' ').slice(0, 2).join(' ') : 'Memuat...' }}
                
              </h1>
              <p class="text-slate-500 text-sm m-0 font-medium capitalize">{{ dateString }}</p>
            </div>

            <!-- Right: Clock -->
            <div class="flex flex-wrap items-center gap-4">
              <div class="flex items-center gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl px-5 py-4 shadow-inner min-w-[190px]">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5">Waktu WIB</p>
                  <p class="text-white font-mono font-bold text-xl tabular-nums leading-none">{{ timeString }}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <!-- ===== LOADING ===== -->
      <div v-if="loading && (!allTasks || allTasks.length === 0)" class="flex flex-col items-center justify-center py-40 gap-6">
        <div class="relative w-20 h-20">
          <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400/50 rounded-full animate-spin"></div>
          <div class="absolute inset-3 border-2 border-t-purple-500/60 rounded-full animate-spin" style="animation-direction:reverse; animation-duration: 0.8s;"></div>
        </div>
        <p class="text-slate-500 font-bold tracking-[0.3em] uppercase text-xs animate-pulse-soft">Menyinkronkan Data...</p>
      </div>

      <!-- ===== MAIN CONTENT ===== -->
      <div v-else class="space-y-8 animate-fade-in">

        <!-- STAT CARDS -->
        <section v-if="!isViewAll" class="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

          <!-- Completion Rate -->
          <div class="group card-elevated relative overflow-hidden cursor-default" style="animation-delay:0ms">
            <div class="card-body relative z-10 p-5 md:p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Completion</span>
              </div>
              <p class="text-4xl md:text-5xl font-black text-emerald-400 leading-none mb-1 group-hover:scale-105 transition-transform duration-500 tabular-nums">
                {{ stats?.completion_rate || 0 }}<span class="text-2xl">%</span>
              </p>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider m-0">Tugas Selesai</p>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
              <div class="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000" :style="{ width: (stats?.completion_rate || 0) + '%' }"></div>
            </div>
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-emerald-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <!-- Timeliness -->
          <div class="group card-elevated relative overflow-hidden cursor-default" style="animation-delay:100ms">
            <div class="card-body relative z-10 p-5 md:p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Timeliness</span>
              </div>
              <p class="text-4xl md:text-5xl font-black text-amber-400 leading-none mb-1 group-hover:scale-105 transition-transform duration-500 tabular-nums">
                {{ stats?.timeliness_rate || 0 }}<span class="text-2xl">%</span>
              </p>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider m-0">Tepat Waktu</p>
            </div>
            <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800">
              <div class="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-1000" :style="{ width: (stats?.timeliness_rate || 0) + '%' }"></div>
            </div>
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-amber-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <!-- KPI Score -->
          <div class="group card-elevated relative overflow-hidden cursor-default" style="animation-delay:200ms">
            <div class="card-body relative z-10 p-5 md:p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Performance</span>
              </div>
              <p class="text-4xl md:text-5xl font-black text-indigo-400 leading-none mb-1 group-hover:scale-105 transition-transform duration-500 tabular-nums">
                {{ stats?.kpi_score || 0 }}
              </p>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider m-0">Skor KPI</p>
            </div>
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-indigo-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>

          <!-- Total Projects -->
          <div class="group card-elevated relative overflow-hidden cursor-default" style="animation-delay:300ms">
            <div class="card-body relative z-10 p-5 md:p-6">
              <div class="flex items-start justify-between mb-4">
                <div class="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Projects</span>
              </div>
              <p class="text-4xl md:text-5xl font-black text-purple-400 leading-none mb-1 group-hover:scale-105 transition-transform duration-500 tabular-nums">
                {{ stats?.total_projects || 0 }}
              </p>
              <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider m-0">Proyek Aktif</p>
            </div>
            <div class="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>

        </section>

        <!-- MAIN GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          <!-- Task Table -->
          <div :class="isViewAll ? 'lg:col-span-12' : 'lg:col-span-8'" class="animate-slide-up">
            <div class="card overflow-hidden shadow-2xl">
              <!-- Header -->
              <div class="card-header px-6 py-5">
                <div class="flex items-center gap-3">
                  <span class="w-1.5 h-5 rounded-full bg-gradient-primary shadow-glow-primary flex-shrink-0"></span>
                  <div>
                    <h3 class="text-white font-bold text-base m-0 leading-tight">
                      {{ isViewAll ? 'Semua Tugas' : 'Tugas Terkini' }}
                    </h3>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest m-0 mt-0.5">
                      {{ allTasks?.length || 0 }} tugas total
                    </p>
                  </div>
                </div>
                <button @click="toggleViewAll" class="btn-secondary btn-sm rounded-xl text-[10px] font-black tracking-widest uppercase hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all">
                  {{ isViewAll ? '← Kembali' : 'Lihat Semua' }}
                </button>
              </div>

              <!-- Mini tabs (view all mode) -->
              <div v-if="isViewAll" class="px-6 pt-4 flex flex-wrap gap-2 border-b border-slate-800/50 pb-4">
                <span class="badge badge-danger">{{ pendingCount }} Todo</span>
                <span class="badge badge-primary">{{ doingCount }} Doing</span>
                <span class="badge badge-success">{{ doneCount }} Done</span>
              </div>

              <!-- Empty -->
              <div v-if="!displayTasks || displayTasks.length === 0" class="py-24 text-center">
                <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <p class="text-slate-500 font-bold text-sm m-0">Belum ada tugas.</p>
              </div>

              <!-- Table -->
              <div v-else class="overflow-x-auto">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th class="py-4 px-6 text-[10px]">Judul Tugas</th>
                      <th class="hidden md:table-cell py-4 px-6 text-[10px]">Batas Waktu</th>
                      <th class="hidden sm:table-cell py-4 px-6 text-[10px]">Assignee</th>
                      <th class="py-4 px-6 text-[10px] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(task, idx) in displayTasks" :key="task.id" class="group cursor-pointer" :style="`animation-delay: ${idx * 40}ms`">
                      <td class="py-4 px-6">
                        <div class="flex items-center gap-3">
                          <div :class="['w-2 h-2 rounded-full flex-shrink-0',
                            task.status === 'done' ? 'bg-emerald-500' :
                            task.status === 'doing' ? 'bg-indigo-500' :
                            task.status === 'review' ? 'bg-amber-500' : 'bg-slate-600']"></div>
                          <div>
                            <p class="font-bold text-white group-hover:text-indigo-400 transition-colors text-sm m-0 leading-tight">
                              {{ task.title || task.name }}
                            </p>
                            <p class="text-[10px] text-slate-600 font-mono mt-0.5 m-0">#{{ task.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="hidden md:table-cell py-4 px-6">
                        <span :class="['text-sm font-medium', isOverdue(task.due_date || task.deadline) && task.status !== 'done' ? 'text-rose-400' : 'text-slate-400']">
                          {{ formatDate(task.due_date || task.deadline) }}
                        </span>
                      </td>
                      <td class="hidden sm:table-cell py-4 px-6">
                        <div v-if="task.user?.name" class="flex items-center gap-2">
                          <img :src="`https://ui-avatars.com/api/?name=${task.user.name}&background=4f46e5&color=fff&size=24&bold=true`" class="w-6 h-6 rounded-lg flex-shrink-0">
                          <span class="text-slate-400 text-xs font-medium truncate max-w-[100px]">{{ task.user.name }}</span>
                        </div>
                        <span v-else class="text-slate-600 text-xs">—</span>
                      </td>
                      <td class="py-4 px-6 text-right">
                        <span :class="['badge text-[9px]', getStatusConfig(task.status).color]">
                          {{ getStatusConfig(task.status).label }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="isViewAll && totalPages > 1" class="card-footer">
                <p class="text-xs text-slate-500 font-medium">Halaman {{ currentPage }} dari {{ totalPages }}</p>
                <div class="flex gap-2">
                  <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" class="btn-secondary btn-sm rounded-lg disabled:opacity-20">← Sebelumnya</button>
                  <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages" class="btn btn-primary btn-sm rounded-lg disabled:opacity-20">Berikutnya →</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar -->
          <aside v-if="!isViewAll" class="lg:col-span-4 space-y-5 animate-slide-up">

            <!-- KPI Card -->
            <div class="card relative overflow-hidden bg-gradient-to-br from-indigo-950/80 via-slate-900/80 to-purple-950/80 border-indigo-500/10 shadow-2xl">
              <div class="absolute inset-0 opacity-40" style="background: radial-gradient(ellipse at center top, rgba(99,102,241,0.2) 0%, transparent 70%)"></div>
              <div class="card-body relative z-10 text-center py-8 px-6">
                <p class="text-[10px] font-black text-indigo-400/70 uppercase tracking-[0.35em] mb-5 m-0">Indeks Performa</p>
                <div class="relative inline-block my-2">
                  <div class="absolute inset-0 bg-indigo-500 blur-[60px] opacity-20 animate-pulse rounded-full"></div>
                  <span class="text-[7rem] font-black text-white leading-none relative tabular-nums" style="line-height:1">
                    {{ stats?.kpi_score || 0 }}
                  </span>
                </div>
                <p class="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-4 m-0">Skor KPI Pribadi</p>
                <div class="flex justify-center gap-1.5 mt-5">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-80"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-500 opacity-80"></span>
                </div>
                <p class="text-[10px] text-slate-600 italic mt-3 px-4 leading-relaxed m-0">
                  Berdasarkan penyelesaian & ketepatan waktu tugas pribadi.
                </p>
              </div>
            </div>

            <!-- Task breakdown -->
            <div class="card overflow-hidden">
              <div class="card-header px-5 py-4">
                <h3 class="text-sm font-bold text-white m-0">Ringkasan Tugas</h3>
              </div>
              <div class="card-body p-0">
                <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    </div>
                    <span class="text-sm text-slate-400 font-medium">Total Tugas</span>
                  </div>
                  <span class="text-xl font-black text-white tabular-nums">{{ stats?.total_tasks || 0 }}</span>
                </div>
                <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800/50">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </div>
                    <span class="text-sm text-slate-400 font-medium">Sedang Berjalan</span>
                  </div>
                  <span class="text-xl font-black text-indigo-400 tabular-nums">{{ doingCount }}</span>
                </div>
                <div class="flex items-center justify-between px-5 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <span class="text-sm text-slate-400 font-medium">Selesai</span>
                  </div>
                  <span class="text-xl font-black text-emerald-400 tabular-nums">{{ stats?.completed_tasks || 0 }}</span>
                </div>
              </div>
              <div class="px-5 pb-5">
                <div class="flex justify-between text-[10px] text-slate-600 font-bold uppercase tracking-widest mb-2">
                  <span>Progress Keseluruhan</span>
                  <span class="text-indigo-400">{{ stats?.completion_rate || 0 }}%</span>
                </div>
                <div class="h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full rounded-full bg-gradient-primary transition-all duration-1000" :style="{ width: (stats?.completion_rate || 0) + '%' }"></div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tabular-nums { font-variant-numeric: tabular-nums; }

.animate-pulse-soft {
  animation: pulse-soft 2s infinite;
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>