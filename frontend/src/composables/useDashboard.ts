import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService } from '../services'
import type { DashboardStats, Task } from '../services'

// ===== TYPES =====
export interface DashboardTask {
  id: number
  title?: string
  name?: string
  status: string
  due_date?: string
  deadline?: string
  user?: { name: string }
}

// ===== COMPOSABLE =====
export function useDashboardPage() {
  const authStore = useAuthStore()

  // ===== STATE =====
  const stats = ref<DashboardStats | null>(null)
  const allTasks = ref<DashboardTask[]>([])
  const loading = ref(false)
  const isViewAll = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = 8

  // ===== CLOCK =====
  const currentTime = ref(new Date())
  let timer: ReturnType<typeof setInterval> | null = null
  const updateClock = () => { currentTime.value = new Date() }

  // ===== COMPUTED =====
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

  const displayTasks = computed<DashboardTask[]>(() => {
    if (!isViewAll.value) return allTasks.value.slice(0, 6)
    const start = (currentPage.value - 1) * itemsPerPage
    return allTasks.value.slice(start, start + itemsPerPage)
  })

  const totalPages = computed(() => Math.ceil(allTasks.value.length / itemsPerPage))

  const pendingCount = computed(() => allTasks.value.filter((t: DashboardTask) => t.status === 'todo').length)
  const doingCount = computed(() => allTasks.value.filter((t: DashboardTask) => t.status === 'doing').length)
  const doneCount = computed(() => allTasks.value.filter((t: DashboardTask) => t.status === 'done').length)

  // ===== LIFECYCLE =====
  const loadDashboard = async () => {
    loading.value = true
    try {
      const [statsRes, tasksRes] = await Promise.all([
        taskService.getDashboardStats(),
        taskService.getAllTasks(),
      ])
      stats.value = (statsRes.data as any).data || statsRes.data
      const raw = (tasksRes.data as any).data || tasksRes.data
      allTasks.value = Array.isArray(raw) ? raw : []
    } catch (e) {
      console.error('Gagal memuat dashboard:', e)
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    timer = setInterval(updateClock, 1000)
    if (!authStore.user) {
      try { await authStore.fetchProfile() } catch (e) { console.error('Gagal mengambil profil user:', e) }
    }
    await loadDashboard()
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  // ===== METHODS =====
  const toggleViewAll = () => {
    isViewAll.value = !isViewAll.value
    currentPage.value = 1
  }

  const getStatusConfig = (status: string) => {
    const s = (status || '').toLowerCase()
    if (s === 'done' || s === 'selesai') return { color: 'badge-success', label: 'Selesai' }
    if (s === 'doing' || s === 'proses') return { color: 'badge-primary', label: 'Proses' }
    if (s === 'review') return { color: 'badge-warning', label: 'Review' }
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

  // ===== RETURN =====
  return {
    stats,
    allTasks,
    loading,
    isViewAll,
    currentPage,
    user,
    greeting,
    timeString,
    dateString,
    displayTasks,
    totalPages,
    pendingCount,
    doingCount,
    doneCount,
    toggleViewAll,
    getStatusConfig,
    formatDate,
    isOverdue,
  }
}