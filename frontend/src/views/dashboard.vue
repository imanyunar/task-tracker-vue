<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService } from '../services'

const authStore = useAuthStore()
const user = computed(() => authStore.user)

// State Statistik
const stats = ref({
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  totalProjects: 0,
  completionRate: 0,
  timelinessRate: 0,
  kpiScore: 0
})

// State Data & UI
const loading = ref(false)
const allTasks = ref([]) // Menyimpan seluruh data tugas dari API
const isViewAll = ref(false) // Toggle untuk mode "Lihat Semua"
const currentPage = ref(1)
const itemsPerPage = 8 // Jumlah baris per halaman saat mode Lihat Semua

onMounted(async () => {
  loading.value = true
  try {
    // 1. Ambil Statistik Dashboard
    const response = await taskService.getDashboardStats()
    const data = response.data
    stats.value = {
      totalTasks: data.total_tasks || 0,
      completedTasks: data.completed_tasks || 0,
      pendingTasks: data.pending_tasks || 0,
      totalProjects: data.total_projects || 0,
      completionRate: data.completion_rate || 0,
      timelinessRate: data.timeliness_rate || 0,
      kpiScore: data.kpi_score || 0
    }
    
    // 2. Ambil Semua Tugas
    const tasksResponse = await taskService.getAllTasks()
    const tasksList = tasksResponse.data.data || tasksResponse.data || []
    allTasks.value = Array.isArray(tasksList) ? tasksList : []
  } catch (error) {
    console.error('Error loading dashboard:', error)
  } finally {
    loading.value = false
  }
})

// Logika Pemotongan Data (Ringkasan vs Pagination)
const displayTasks = computed(() => {
  if (!isViewAll.value) {
    // Jika mode normal, tampilkan hanya 6 data teratas
    return allTasks.value.slice(0, 6)
  }
  // Jika mode Lihat Semua, gunakan logika pagination
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return allTasks.value.slice(start, end)
})

// Hitung total halaman
const totalPages = computed(() => {
  return Math.ceil(allTasks.value.length / itemsPerPage)
})

// Fungsi Toggle Lihat Semua
const toggleViewAll = () => {
  isViewAll.value = !isViewAll.value
  currentPage.value = 1 // Reset ke halaman pertama saat ganti mode
}

// Fungsi Navigasi Halaman
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const getStatusColor = (status) => {
  const statusLower = (status || '').toLowerCase()
  if (statusLower.includes('selesai') || statusLower.includes('completed') || statusLower.includes('done')) return 'success'
  if (statusLower.includes('proses') || statusLower.includes('progress') || statusLower.includes('doing')) return 'primary'
  if (statusLower.includes('tertunda') || statusLower.includes('pending') || statusLower.includes('todo')) return 'warning'
  return 'warning'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 animate-slide-up">
        <h1 class="text-4xl font-bold text-white mb-2">{{ isViewAll ? 'Semua Tugas' : 'Dashboard' }}</h1>
        <p class="text-slate-400">Selamat datang kembali, <strong class="text-white">{{ user?.name }}</strong>!</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-32">
        <div class="text-center">
          <svg class="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <p class="text-slate-400">Menyinkronkan data...</p>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <!-- Main Panel -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Metric Cards -->
          <div v-if="!isViewAll" class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Completion Rate -->
            <div class="card-elevated animate-slide-up" style="animation-delay: 0.1s">
              <div class="card-body">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <p class="text-slate-400 text-sm font-medium mb-2">Tingkat Penyelesaian</p>
                    <h2 class="text-3xl font-bold text-white">{{ stats.completionRate }}%</h2>
                  </div>
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-success/20 text-success">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full transition-all" :style="{ width: stats.completionRate + '%' }"></div>
                </div>
              </div>
            </div>

            <!-- Timeliness Rate -->
            <div class="card-elevated animate-slide-up" style="animation-delay: 0.2s">
              <div class="card-body">
                <div class="flex items-start justify-between mb-4">
                  <div>
                    <p class="text-slate-400 text-sm font-medium mb-2">Ketepatan Waktu</p>
                    <h2 class="text-3xl font-bold text-white">{{ stats.timelinessRate }}%</h2>
                  </div>
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-warning/20 text-warning">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div class="w-full bg-slate-700 rounded-full h-2">
                  <div class="bg-yellow-500 h-2 rounded-full transition-all" :style="{ width: stats.timelinessRate + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tasks Table -->
          <div class="card-elevated animate-slide-up" style="animation-delay: 0.3s">
            <div class="card-header flex items-center justify-between">
              <h3 class="text-lg font-semibold text-white">{{ isViewAll ? 'Semua Tugas' : 'Tugas Terbaru' }}</h3>
              <button @click="toggleViewAll" class="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors">
                {{ isViewAll ? '← Kembali' : 'Lihat Semua →' }}
              </button>
            </div>

            <div class="card-body">
              <div v-if="allTasks.length === 0" class="text-center py-12">
                <svg class="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <p class="text-slate-400">Belum ada tugas</p>
              </div>

              <div v-else class="table-wrapper">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Nama Tugas</th>
                      <th>Project</th>
                      <th>Tenggat</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="task in displayTasks" :key="task.id">
                      <td class="font-medium">{{ task.title || task.name }}</td>
                      <td class="text-slate-400">{{ task.project?.name || '-' }}</td>
                      <td class="text-slate-400 text-sm">{{ task.deadline?.split('T')[0] || task.due_date || 'N/A' }}</td>
                      <td>
                        <span :class="['badge', `badge-${getStatusColor(task.status)}`]">
                          {{ task.status || 'Unknown' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div v-if="isViewAll && totalPages > 1" class="flex items-center justify-center gap-3 mt-6 pt-6 border-t border-slate-700">
                <button @click="prevPage" :disabled="currentPage === 1" class="btn-secondary btn-sm" :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }">Sebelumnya</button>
                <span class="text-slate-400 text-sm">Halaman {{ currentPage }} dari {{ totalPages }}</span>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="btn-secondary btn-sm" :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }">Berikutnya</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Side Panel -->
        <div class="space-y-6">
          <!-- KPI Score Card -->
          <div class="card-elevated text-center animate-slide-up" style="animation-delay: 0.1s">
            <div class="card-body py-8">
              <p class="text-slate-400 text-sm font-medium mb-3">Skor KPI</p>
              <h2 class="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">{{ stats.kpiScore }}</h2>
              <p class="text-slate-500 text-xs mt-3">Penyelesaian & Ketepatan Waktu</p>
            </div>
          </div>

          <!-- Stats Grid -->
          <div class="space-y-3">
            <!-- Total Tasks -->
            <div class="card-elevated animate-slide-up" style="animation-delay: 0.2s">
              <div class="card-body">
                <p class="text-slate-400 text-sm mb-2">Total Tugas</p>
                <h3 class="text-3xl font-bold text-white">{{ stats.totalTasks }}</h3>
              </div>
            </div>

            <!-- Completed -->
            <div class="card-elevated animate-slide-up" style="animation-delay: 0.3s">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-slate-400 text-sm">Selesai</p>
                    <h3 class="text-2xl font-bold text-green-400">{{ stats.completedTasks }}</h3>
                  </div>
                  <div class="text-green-500/20">
                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pending -->
            <div class="card-elevated animate-slide-up" style="animation-delay: 0.4s">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-slate-400 text-sm">Tertunda</p>
                    <h3 class="text-2xl font-bold text-yellow-400">{{ stats.pendingTasks }}</h3>
                  </div>
                  <div class="text-yellow-500/20">
                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.2 3.2.9-1.6-4.6-2.6V7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- Active Projects -->
            <div class="card-elevated animate-slide-up" style="animation-delay: 0.5s">
              <div class="card-body">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-slate-400 text-sm">Project Aktif</p>
                    <h3 class="text-2xl font-bold text-primary-400">{{ stats.totalProjects }}</h3>
                  </div>
                  <div class="text-primary-500/20">
                    <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out forwards;
  opacity: 0;
}

[style*="animation-delay"] {
  opacity: 1;
}
</style>