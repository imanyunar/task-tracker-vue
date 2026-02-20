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
</script>

<template>
  <div class="main-viewport">
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    <div class="blob blob-3"></div>

    <div class="dashboard-wrapper">
      <header class="top-header glass-panel">
        <div class="header-left">
          <h1>{{ isViewAll ? 'Daftar Tugas' : 'Overview' }}</h1>
          <p>Selamat datang kembali, <strong>{{ user?.name }}</strong>!</p>
        </div>
        <div class="header-right">
          <div class="user-badges">
            <span class="badge role">{{ user?.role?.name || 'User' }}</span>
            <span class="badge dept">{{ user?.department?.name || 'Department' }}</span>
          </div>
          <div class="avatar-circle">
            {{ user?.name?.charAt(0).toUpperCase() || 'U' }}
          </div>
        </div>
      </header>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Menyinkronkan data...</p>
      </div>

      <div v-else class="dashboard-grid fade-in">
        
        <div class="left-panel">
          
          <div v-if="!isViewAll" class="progress-cards-row">
            <div class="glass-card metric-card">
              <div class="metric-header">
                <div class="icon-box green-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span>Completion Rate</span>
              </div>
              <div class="metric-body">
                <h2>{{ stats.completionRate }}%</h2>
                <div class="progress-track">
                  <div class="progress-fill bg-green" :style="{ width: stats.completionRate + '%' }"></div>
                </div>
              </div>
            </div>

            <div class="glass-card metric-card">
              <div class="metric-header">
                <div class="icon-box orange-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <span>Timeliness Rate</span>
              </div>
              <div class="metric-body">
                <h2>{{ stats.timelinessRate }}%</h2>
                <div class="progress-track">
                  <div class="progress-fill bg-orange" :style="{ width: stats.timelinessRate + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-card table-section">
            <div class="section-header">
              <h3>{{ isViewAll ? 'Semua Tugas Anda' : 'Tugas Terbaru' }}</h3>
              <button @click="toggleViewAll" class="btn-text">
                {{ isViewAll ? '← Kembali ke Overview' : 'Lihat Semua' }}
              </button>
            </div>
            
            <div class="table-container">
              <div v-if="allTasks.length === 0" class="empty-state">Belum ada tugas tersedia</div>
              <table v-else class="data-table">
                <thead>
                  <tr>
                    <th>Nama Tugas</th>
                    <th>Project</th>
                    <th>Tenggat Waktu</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="task in displayTasks" :key="task.id">
                    <td class="primary-col">{{ task.title || task.name }}</td>
                    <td class="text-muted">{{ task.project?.name || '-' }}</td>
                    <td class="text-muted">{{ task.due_date || 'N/A' }}</td>
                    <td>
                      <span :class="['pill', `pill-${task.status?.toLowerCase().replace(/\s+/g, '-')}`]">
                        {{ task.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="isViewAll && totalPages > 1" class="pagination-area">
              <button class="page-btn" @click="prevPage" :disabled="currentPage === 1">Prev</button>
              <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
              <button class="page-btn" @click="nextPage" :disabled="currentPage === totalPages">Next</button>
            </div>
          </div>
        </div>

        <div class="right-panel">
          
          <div class="glass-card score-card">
            <div class="score-glow"></div>
            <h4>Overall KPI Score</h4>
            <div class="score-number">{{ stats.kpiScore }}</div>
            <p class="score-desc">Berdasarkan penyelesaian & ketepatan waktu</p>
          </div>

          <div class="mini-stats-grid">
            <div class="glass-card stat-box">
              <p class="stat-label">Total Tugas</p>
              <h3 class="stat-val">{{ stats.totalTasks }}</h3>
            </div>
            <div class="glass-card stat-box">
              <p class="stat-label">Selesai</p>
              <h3 class="stat-val text-green">{{ stats.completedTasks }}</h3>
            </div>
            <div class="glass-card stat-box">
              <p class="stat-label">Tertunda</p>
              <h3 class="stat-val text-orange">{{ stats.pendingTasks }}</h3>
            </div>
            <div class="glass-card stat-box">
              <p class="stat-label">Project Aktif</p>
              <h3 class="stat-val text-purple">{{ stats.totalProjects }}</h3>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.main-viewport {
  min-height: 100vh;
  width: 100%;
  background-color: #0a0c10;
  color: #f8fafc;
  font-family: 'Plus Jakarta Sans', sans-serif;
  position: relative;
  overflow-x: hidden;
  padding-bottom: 40px;
}

/* Glassmorphism Styles */
.glass-panel, .glass-card {
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
}

.dashboard-wrapper {
  max-width: 1300px;
  margin: 0 auto;
  padding: 24px;
  position: relative;
  z-index: 10;
}

/* Blobs */
.blob {
  position: absolute;
  filter: blur(90px);
  z-index: 0;
  border-radius: 50%;
  opacity: 0.25;
}
.blob-1 { width: 500px; height: 500px; background: #4f46e5; top: -150px; left: -100px; }
.blob-2 { width: 400px; height: 400px; background: #a855f7; bottom: 10%; right: -50px; }
.blob-3 { width: 300px; height: 300px; background: #3b82f6; top: 40%; left: 40%; opacity: 0.15; }

/* Header */
.top-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  margin-bottom: 30px;
}
.header-left h1 { font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.header-left p { margin: 4px 0 0; font-size: 14px; color: #94a3b8; }
.header-right { display: flex; align-items: center; gap: 20px; }
.badge { padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 700; }
.badge.role { background: rgba(99, 102, 241, 0.15); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
.badge.dept { background: rgba(255, 255, 255, 0.05); color: #cbd5e1; border: 1px solid rgba(255, 255, 255, 0.1); }
.avatar-circle {
  width: 44px; height: 44px;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
}

/* Panel Left */
.left-panel { display: flex; flex-direction: column; gap: 24px; }
.progress-cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.metric-card { padding: 24px; }
.metric-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.icon-box { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.green-box { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.orange-box { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.metric-body h2 { font-size: 32px; font-weight: 800; margin: 0 0 12px; }
.progress-track { width: 100%; height: 6px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 10px; transition: width 1s ease; }
.bg-green { background: #10b981; }
.bg-orange { background: #f59e0b; }

/* Table Section */
.table-section { padding: 24px; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-text { background: none; border: none; color: #818cf8; font-weight: 600; font-size: 13px; cursor: pointer; }
.btn-text:hover { color: #a855f7; text-decoration: underline; }

.data-table { width: 100%; border-collapse: separate; border-spacing: 0; text-align: left; }
.data-table th { padding: 14px 16px; color: #64748b; font-size: 12px; text-transform: uppercase; font-weight: 700; border-bottom: 1px solid rgba(255,255,255,0.05); }
.data-table td { padding: 16px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,0.03); }
.primary-col { font-weight: 600; color: #f8fafc; }
.text-muted { color: #94a3b8; }

/* Status Pills */
.pill { padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; }
.pill-todo, .pill-pending { background: rgba(245, 158, 11, 0.1); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.2); }
.pill-doing, .pill-in-progress { background: rgba(99, 102, 241, 0.1); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.2); }
.pill-done, .pill-completed { background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); }

/* Pagination Area */
.pagination-area {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.page-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.3s;
}
.page-btn:hover:not(:disabled) { background: #6366f1; border-color: #6366f1; }
.page-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.page-info { font-size: 14px; color: #94a3b8; }

/* Panel Right */
.right-panel { display: flex; flex-direction: column; gap: 24px; }
.score-card { position: relative; padding: 40px 24px; text-align: center; overflow: hidden; }
.score-glow { position: absolute; width: 150px; height: 150px; background: #6366f1; filter: blur(70px); top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.3; }
.score-number { font-size: 64px; font-weight: 800; background: linear-gradient(to right, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 10px; }
.mini-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.stat-box { padding: 20px 16px; text-align: center; }
.stat-label { color: #94a3b8; font-size: 13px; margin-bottom: 8px; }
.stat-val { font-size: 24px; font-weight: 800; margin: 0; }
.text-green { color: #34d399; }
.text-orange { color: #fbbf24; }
.text-purple { color: #c084fc; }

/* Utilities */
.loading-state { text-align: center; padding: 100px 0; }
.spinner { width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.1); border-top-color: #818cf8; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px; }
@keyframes spin { to { transform: rotate(360deg); } }
.fade-in { animation: fadeIn 0.8s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.empty-state { text-align: center; padding: 40px; color: #64748b; font-style: italic; }

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid { grid-template-columns: 1fr; }
  .right-panel { order: -1; }
}
</style>