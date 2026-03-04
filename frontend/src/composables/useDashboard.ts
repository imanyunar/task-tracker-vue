import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService } from '../services'
import type { Task } from '../services'

export interface DashboardStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  timeliness_rate: number
  kpi_score: number
  total_projects: number  // jumlah project on_progress yang diikuti user
}

// Hitung stats & KPI dari array tasks — tidak perlu request ke backend
function hitungStats(tasks: Task[], userId: number, activeProjectCount = 0): DashboardStats {
  const totalTasks     = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'done').length
  const pendingTasks   = tasks.filter(t => t.status !== 'done').length

  // Hanya hitung dari task yang ditugaskan ke user ini
  const myTasks  = tasks.filter(t => t.user_id === userId)
  const myTotal  = myTasks.length
  const myDone   = myTasks.filter(t => t.status === 'done').length
  const myOnTime = myTasks.filter(t => {
    if (t.status !== 'done' || !t.updated_at || !t.due_date) return false
    return new Date(t.updated_at) <= new Date(t.due_date)
  }).length

  const completionRate = myTotal > 0 ? (myDone / myTotal) * 100 : 0
  const timelinessRate = myDone  > 0 ? (myOnTime / myDone) * 100 : 0
  const kpiScore       = (completionRate * 0.6) + (timelinessRate * 0.4)

  return {
    total_tasks:     totalTasks,
    completed_tasks: completedTasks,
    pending_tasks:   pendingTasks,
    completion_rate: Math.round(completionRate * 10) / 10,
    timeliness_rate: Math.round(timelinessRate * 10) / 10,
    kpi_score:       Math.round(kpiScore * 100) / 100,
    total_projects:  activeProjectCount,
  }
}

export function useDashboardPage() {
  const authStore = useAuthStore()

  const stats    = ref<DashboardStats | null>(null)
  const allTasks = ref<Task[]>([])
  const loading  = ref(false)
  const isViewAll    = ref(false)
  const currentPage  = ref(1)
  const itemsPerPage = 8

  // Jam
  const currentTime = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null

  const user = computed(() => authStore.user)

  const greeting = computed(() => {
    const h = currentTime.value.getHours()
    if (h < 11) return 'Selamat Pagi'
    if (h < 15) return 'Selamat Siang'
    if (h < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  })

  const timeString = computed(() =>
    currentTime.value.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  )

  const dateString = computed(() =>
    currentTime.value.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  )

  const displayTasks = computed<Task[]>(() => {
    if (!isViewAll.value) return allTasks.value.slice(0, 6)
    const start = (currentPage.value - 1) * itemsPerPage
    return allTasks.value.slice(start, start + itemsPerPage)
  })

  const totalPages   = computed(() => Math.ceil(allTasks.value.length / itemsPerPage))
  const pendingCount = computed(() => allTasks.value.filter(t => t.status === 'todo').length)
  const doingCount   = computed(() => allTasks.value.filter(t => t.status === 'doing').length)
  const doneCount    = computed(() => allTasks.value.filter(t => t.status === 'done').length)

  const loadDashboard = async () => {
    loading.value = true
    try {
      // Fetch tasks dan projects secara paralel
      const { default: apiClient } = await import('../services/api')
      const [taskRes, projectRes] = await Promise.all([
        taskService.getAllTasks(),
        apiClient.get('/projects').catch(() => null),
      ])

      const raw   = (taskRes.data as any).data || taskRes.data
      const tasks = Array.isArray(raw) ? raw : []
      allTasks.value = tasks

      // Hitung proyek aktif (on_progress) yang diikuti user
      const rawProjects  = projectRes
        ? ((projectRes.data as any).data || projectRes.data || [])
        : []
      const projectList  = Array.isArray(rawProjects) ? rawProjects : []
      const activeCount  = projectList.filter(
        (p: any) => p.status === 'on_progress' || p.status === 'planned' 
      ).length

      // Hitung stats dari tasks + jumlah proyek aktif
      const userId   = user.value?.id ?? 0
      stats.value    = hitungStats(tasks, userId, activeCount)
    } catch (e) {
      console.error('Gagal memuat dashboard:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    timer = setInterval(() => { currentTime.value = new Date() }, 1000)
    if (!authStore.user) {
      try { await authStore.fetchProfile() } catch (e) { console.error(e) }
    }
    await loadDashboard()
  })

  onUnmounted(() => { if (timer) clearInterval(timer) })

  const toggleViewAll = () => {
    isViewAll.value = !isViewAll.value
    currentPage.value = 1
  }

  const getStatusConfig = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'done'   || s === 'selesai') return { color: 'badge-success', label: 'Selesai' }
    if (s === 'doing'  || s === 'proses')  return { color: 'badge-primary', label: 'Proses' }
    if (s === 'review')                    return { color: 'badge-warning', label: 'Review' }
    return { color: 'badge-danger', label: s || 'Todo' }
  }

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const isOverdue = (dateStr?: string): boolean => {
    if (!dateStr) return false
    return new Date(dateStr) < new Date()
  }

  return {
    stats, allTasks, loading, isViewAll, currentPage,
    user, greeting, timeString, dateString,
    displayTasks, totalPages, pendingCount, doingCount, doneCount,
    toggleViewAll, getStatusConfig, formatDate, isOverdue,
  }
}