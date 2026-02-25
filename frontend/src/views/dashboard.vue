<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useDashboard } from '../composables/useDashboard'

// Inisialisasi Store & Composable
const authStore = useAuthStore()
const { stats, allTasks, loading, loadDashboard } = useDashboard()

// State UI
const isViewAll = ref(false)
const currentPage = ref(1)
const itemsPerPage = 8

/**
 * LOGIKA JAM REAL-TIME (DENGAN DETIK)
 */
const currentTime = ref(new Date())
let timer = null
const updateClock = () => { currentTime.value = new Date() }

/**
 * AMBIL DATA USER
 */
const user = computed(() => authStore.user)

onMounted(async () => {
  // 1. Jalankan Jam
  timer = setInterval(updateClock, 1000)
  
  // 2. Load Profile (Menjamin Nama Tampil Setelah Refresh Halaman)
  if (!authStore.user) {
    try {
      await authStore.fetchProfile()
    } catch (e) {
      console.error("Gagal mengambil profil user:", e)
    }
  }
  
  // 3. Load Statistik & Tugas dari useDashboard
  await loadDashboard()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

/**
 * LOGIKA LIST TASK & PAGINASI
 */
const displayTasks = computed(() => {
  const data = allTasks.value || []
  if (!isViewAll.value) {
    return data.slice(0, 6)
  }
  const start = (currentPage.value - 1) * itemsPerPage
  return data.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil((allTasks.value?.length || 0) / itemsPerPage))

const toggleViewAll = () => {
  isViewAll.value = !isViewAll.value
  currentPage.value = 1
}

/**
 * HELPERS
 */
const getStatusColor = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'done' || s === 'selesai' || s.includes('completed')) return 'success'
  if (s === 'doing' || s === 'proses' || s.includes('progress')) return 'primary'
  if (s === 'review' || s === 'urgent') return 'warning'
  return 'danger' 
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  })
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden pt-24 pb-12 px-4 sm:px-6">
    <div class="absolute top-0 -left-10 w-96 h-96 bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
    <div class="absolute -bottom-20 -right-10 w-96 h-96 bg-purple-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>

    <div class="max-w-7xl mx-auto relative z-10">
      
      <header class="mb-12 animate-fade-in">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <span class="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em]">
              Sistem Manajemen Tugas
            </span>
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Halo, <span class="text-gradient-primary">{{ user?.name || 'Memuat...' }}</span>! 👋
            </h1>
            <p class="text-slate-400 text-lg max-w-2xl leading-relaxed">
              Unit Kerja: <span class="text-slate-200 font-medium">{{ user?.department?.name || 'Umum' }}</span>
            </p>
          </div>
          
          <div class="hidden md:flex glass p-4 rounded-2xl items-center gap-4 border-white/5 shadow-2xl min-w-[200px]">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Waktu Sekarang</p>
              <p class="text-white font-mono font-bold text-2xl tabular-nums">
                {{ currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }} 
                <span class="text-[10px] text-indigo-400">WIB</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <div v-if="loading && (!allTasks || allTasks.length === 0)" class="flex flex-col items-center justify-center py-40">
        <div class="relative w-20 h-20 mb-6">
          <div class="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
        <p class="text-slate-400 animate-pulse-soft font-medium tracking-widest uppercase text-xs">Menyinkronkan Data...</p>
      </div>

      <div v-else class="space-y-10 animate-fade-in">
        
        <section v-if="!isViewAll" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div class="card-elevated group relative overflow-hidden" v-for="(item, idx) in [
            { label: 'My Completion', val: (stats?.completion_rate || 0) + '%', sub: 'Tugas Pribadi Selesai', color: 'text-emerald-400' },
            { label: 'My Timeliness', val: (stats?.timeliness_rate || 0) + '%', sub: 'Tepat Waktu Saya', color: 'text-amber-400' },
            { label: 'My Performance', val: stats?.kpi_score || 0, sub: 'Skor KPI Pribadi', color: 'text-indigo-400' },
            { label: 'Unit Projects', val: stats?.total_projects || 0, sub: 'Total Proyek Aktif', color: 'text-purple-400' }
          ]" :key="idx">
            <div class="card-body relative z-10">
              <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">{{ item.label }}</p>
              <h2 class="text-5xl font-black mb-1 group-hover:scale-105 transition-transform duration-500" :class="item.color">{{ item.val }}</h2>
              <p class="text-slate-500 text-xs">{{ item.sub }}</p>
            </div>
            <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white/[0.02] rounded-full group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </section>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div :class="isViewAll ? 'lg:col-span-12' : 'lg:col-span-8'" class="animate-slide-up">
            <div class="card glass border-white/5 shadow-2xl overflow-hidden">
              <div class="card-header flex items-center justify-between border-white/5 bg-white/[0.01] p-6">
                <h3 class="flex items-center gap-3 text-white font-bold text-xl">
                  <span class="w-2 h-4 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
                  {{ isViewAll ? 'Database Semua Tugas' : 'Tugas Terkini' }}
                </h3>
                <button @click="toggleViewAll" class="btn-secondary btn-sm px-6 rounded-xl bg-white/5 hover:bg-indigo-600 transition-all border-none text-[10px] font-black tracking-widest uppercase">
                  {{ isViewAll ? 'Kembali' : 'Lihat Semua' }}
                </button>
              </div>

              <div class="card-body p-0">
                <div v-if="!displayTasks || displayTasks.length === 0" class="py-32 text-center">
                  <p class="text-slate-500 italic font-medium">Belum ada tugas yang tersedia.</p>
                </div>

                <div v-else class="table-wrapper">
                  <table class="table w-full">
                    <thead>
                      <tr class="bg-white/[0.02] text-left">
                        <th class="py-5 px-6 text-slate-400 uppercase text-[10px] tracking-widest font-bold">Judul Tugas</th>
                        <th class="hidden md:table-cell py-5 px-6 text-slate-400 uppercase text-[10px] tracking-widest font-bold">Batas Waktu</th>
                        <th class="text-right py-5 px-6 text-slate-400 uppercase text-[10px] tracking-widest font-bold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="task in displayTasks" :key="task.id" class="group border-b border-white/5 hover:bg-white/[0.01] transition-all">
                        <td class="py-5 px-6">
                          <div class="font-bold text-white group-hover:text-indigo-400 transition-colors">
                            {{ task.title || task.name }}
                          </div>
                          <div class="text-[10px] text-slate-600 font-mono mt-1 font-bold">#{{ task.id }}</div>
                        </td>
                        <td class="hidden md:table-cell py-5 px-6 text-slate-400 text-sm">
                          {{ formatDate(task.due_date || task.deadline) }}
                        </td>
                        <td class="text-right py-5 px-6">
                          <span :class="['badge inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', `badge-${getStatusColor(task.status)}`]">
                            {{ task.status }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div v-if="isViewAll && totalPages > 1" class="p-6 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                  <p class="text-xs text-slate-500">Halaman {{ currentPage }} dari {{ totalPages }}</p>
                  <div class="flex gap-2">
                    <button @click="currentPage > 1 && currentPage--" :disabled="currentPage === 1" class="btn-secondary btn-sm px-4 rounded-lg disabled:opacity-20 transition-all">Sebelumnya</button>
                    <button @click="currentPage < totalPages && currentPage++" :disabled="currentPage === totalPages" class="btn btn-primary btn-sm px-4 rounded-lg disabled:opacity-20 transition-all">Berikutnya</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <aside v-if="!isViewAll" class="lg:col-span-4 space-y-6 animate-slide-up">
            <div class="card-elevated text-center py-12 relative overflow-hidden bg-gradient-to-br from-indigo-900/40 to-slate-900/40 border border-white/5 shadow-2xl rounded-3xl">
              <div class="relative z-10">
                <p class="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Indeks Performa Saya</p>
                <div class="inline-block relative">
                   <div class="absolute inset-0 bg-indigo-500 blur-[50px] opacity-20 animate-pulse"></div>
                   <h2 class="text-8xl font-black text-white relative leading-none">{{ stats?.kpi_score || 0 }}</h2>
                </div>
                <div class="mt-8 flex justify-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                </div>
                <p class="text-slate-500 text-[10px] mt-8 px-10 leading-relaxed italic">
                  Data performa murni berdasarkan tugas pribadi Anda.
                </p>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="glass p-6 rounded-3xl border border-white/5 shadow-lg">
                <p class="text-slate-500 text-[10px] font-bold uppercase mb-1">Total Unit</p>
                <p class="text-3xl font-bold text-white">{{ stats?.total_tasks || 0 }}</p>
              </div>
              <div class="glass p-6 rounded-3xl border border-white/5 shadow-lg">
                <p class="text-slate-500 text-[10px] font-bold uppercase mb-1">Unit Selesai</p>
                <p class="text-3xl font-bold text-emerald-400">{{ stats?.completed_tasks || 0 }}</p>
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
.text-gradient-primary {
  background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.glass {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
}
.animate-pulse-soft {
  animation: pulse-soft 2s infinite;
}
@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.badge-success { @apply bg-emerald-500/10 text-emerald-400 border border-emerald-500/20; }
.badge-primary { @apply bg-indigo-500/10 text-indigo-400 border border-indigo-500/20; }
.badge-warning { @apply bg-amber-500/10 text-amber-400 border border-amber-500/20; }
.badge-danger { @apply bg-rose-500/10 text-rose-400 border border-rose-500/20; }
</style>