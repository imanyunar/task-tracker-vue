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
                Task Management
              </span>
              <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight m-0">
                Tasks <span class="text-gradient-primary">Dashboard</span>
              </h1>
              <p class="text-slate-500 text-sm m-0 font-medium">Kelola daftar tugas berdasarkan peran Anda dalam proyek.</p>
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
                  placeholder="Cari tugas..."
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all"
                >
              </div>

              <!-- Add button -->
              <button
                v-if="canCreateAnyTask"
                @click="openModal()"
                class="btn btn-primary rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Tugas
              </button>
            </div>
          </div>

          <!-- Stats bar -->
          <div v-if="!loading" class="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-6">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ taskCounts.todo }} Todo</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ taskCounts.doing }} Doing</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ taskCounts.review }} Review</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ taskCounts.done }} Done</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ===== FILTER TABS ===== -->
      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="status in ['all', 'todo', 'doing', 'review', 'done']"
          :key="status"
          @click="filterStatus = status === 'all' ? '' : status"
          :class="[
            'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex-shrink-0',
            (filterStatus === status || (status === 'all' && filterStatus === ''))
              ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20'
              : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700'
          ]"
        >
          {{ status === 'all' ? 'Semua' : getStatusLabel(status) }}
          <span v-if="status !== 'all'" class="ml-1.5 opacity-60">
            {{ status === 'todo' ? taskCounts.todo : status === 'doing' ? taskCounts.doing : status === 'review' ? taskCounts.review : taskCounts.done }}
          </span>
        </button>
      </div>

      <!-- ===== LOADING ===== -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-40 gap-6">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400/50 rounded-full animate-spin"></div>
          <div class="absolute inset-3 border-2 border-t-purple-500/60 rounded-full animate-spin" style="animation-direction:reverse; animation-duration:0.8s;"></div>
        </div>
        <p class="text-slate-600 font-black tracking-[0.3em] uppercase text-xs">Memuat Tugas...</p>
      </div>

      <!-- ===== TASK GRID ===== -->
      <div v-else-if="filteredTasks.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div
          v-for="(task, idx) in filteredTasks"
          :key="task.id"
          class="group card flex flex-col hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:-translate-y-0.5 transition-all duration-300"
          :style="`animation-delay: ${idx * 40}ms`"
        >
          <div class="card-body pb-0 flex flex-col flex-1">
            <!-- Top row: badges + actions -->
            <div class="flex items-start justify-between gap-2 mb-4">
              <div class="flex flex-wrap gap-1.5">
                <!-- Priority badge -->
                <span :class="['badge text-[9px]', priorityBadgeClass(task.priority)]">
                  {{ task.priority }}
                </span>
                <!-- Status badge -->
                <span :class="['badge text-[9px]', statusBadgeClass(task.status)]">
                  {{ getStatusLabel(task.status) }}
                </span>
              </div>

              <!-- Action buttons (hover) -->
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  @click="$router.push(`/tasks/${task.id}`)"
                  class="p-1.5 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                  title="Detail"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                </button>
                <button
                  v-if="canEditFullTask(task)"
                  @click="openModal(task)"
                  class="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all"
                  title="Edit"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
                <button
                  v-if="canDeleteTask(task)"
                  @click="deleteTask(task.id)"
                  class="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  title="Hapus"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>

            <!-- Title + desc -->
            <h3 class="text-base font-bold text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors">{{ task.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-5">{{ task.description || 'Tidak ada deskripsi tugas.' }}</p>

            <!-- Meta info -->
            <div class="space-y-2.5 pt-4 border-t border-slate-800/70">
              <div class="flex items-center justify-between gap-2">
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Project</span>
                <span class="text-[11px] font-bold text-indigo-400 truncate max-w-[140px]">{{ task.project?.name || '—' }}</span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Deadline</span>
                <span :class="['text-[11px] font-bold tabular-nums', isOverdue(task.due_date) && task.status !== 'done' ? 'text-rose-400' : 'text-slate-400']">
                  {{ formatDeadline(task.due_date) }}
                </span>
              </div>
              <div class="flex items-center justify-between gap-2">
                <span class="text-[9px] font-black text-slate-600 uppercase tracking-widest">Assigned</span>
                <div class="flex items-center gap-1.5">
                  <img
                    :src="`https://ui-avatars.com/api/?name=${encodeURIComponent(task.user?.name || '?')}&background=4f46e5&color=fff&bold=true&size=40`"
                    class="w-5 h-5 rounded-md border border-slate-700"
                  >
                  <span class="text-[11px] font-bold text-slate-300 truncate max-w-[100px]">{{ task.user?.name || 'Unassigned' }}</span>
                </div>
              </div>
            </div>

            <!-- Quick status update (contributor) -->
            <div v-if="canUpdateStatusOnly(task)" class="mt-4 pb-1">
              <select
                :value="task.status"
                @change="(e) => handleQuickUpdate(task, e.target.value)"
                class="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-400 focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/40 outline-none transition-all hover:border-slate-700"
              >
                <option value="todo">→ To Do</option>
                <option value="doing">→ Doing</option>
                <option value="review">→ Review</option>
                <option value="done">→ Done</option>
              </select>
            </div>
          </div>

          <!-- Card bottom accent line -->
          <div :class="['h-0.5 w-full mt-4 rounded-b-2xl', task.status === 'done' ? 'bg-emerald-500/40' : task.status === 'doing' ? 'bg-indigo-500/40' : task.status === 'review' ? 'bg-amber-500/40' : 'bg-slate-700/40']"></div>
        </div>
      </div>

      <!-- ===== EMPTY STATE ===== -->
      <div v-else class="text-center py-24 card border-dashed">
        <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-800/60 flex items-center justify-center text-slate-600">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white mb-2">Belum ada tugas</h3>
        <p class="text-slate-500 text-sm max-w-xs mx-auto m-0">Tugas yang Anda buat atau yang ditugaskan kepada Anda akan muncul di sini.</p>
        <button v-if="canCreateAnyTask" @click="openModal()" class="btn btn-primary rounded-xl text-sm mt-6 inline-flex">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Tambah Tugas Pertama
        </button>
      </div>

    </div>

    <!-- ===== MODAL CREATE/EDIT ===== -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal max-w-lg w-full animate-slide-up task-modal-scroll">
          <div class="modal-header">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="editingTask ? 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' : 'M12 6v6m0 0v6m0-6h6m-6 0H6'" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-white m-0">{{ editingTask ? 'Edit Tugas' : 'Tugas Baru' }}</h3>
            </div>
            <button @click="closeModal" class="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div class="modal-body">
            <form @submit.prevent="saveTask" class="space-y-5">

              <div class="form-group">
                <label class="label-field">Judul Tugas <span class="text-rose-400">*</span></label>
                <input v-model="formData.title" type="text" required placeholder="Nama tugas..." class="input-field">
              </div>

              <div class="form-group">
                <label class="label-field">Deskripsi</label>
                <textarea v-model="formData.description" rows="3" placeholder="Detail tugas..." class="textarea-field"></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="label-field">Priority</label>
                  <select v-model="formData.priority" class="select-field">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="label-field">Status</label>
                  <select v-model="formData.status" class="select-field">
                    <option value="todo">To Do</option>
                    <option value="doing">Doing</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="label-field">Project <span class="text-rose-400">*</span></label>
                  <select v-model="formData.project_id" @change="onProjectChange" required class="select-field">
                    <option value="" disabled>Pilih Project</option>
                    <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="label-field">Deadline</label>
                  <input v-model="formData.due_date" type="datetime-local" class="input-field">
                </div>
              </div>

              <div class="form-group">
                <label class="label-field">Assign To <span class="text-rose-400">*</span></label>
                <select
                  v-model="formData.user_id"
                  required
                  :disabled="!formData.project_id"
                  class="select-field disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {{ formData.project_id ? 'Pilih Anggota Tim' : 'Pilih Proyek Terlebih Dahulu' }}
                  </option>
                  <option v-for="u in projectMembers" :key="u.id" :value="u.id">{{ u.name }}</option>
                </select>
                <p v-if="formData.project_id && projectMembers.length === 0" class="text-rose-400 text-[10px] mt-2 font-bold uppercase tracking-wider">
                  ⚠ Proyek ini belum memiliki anggota.
                </p>
              </div>

              <div class="modal-footer px-0 pb-0 border-t-0 mt-2">
                <button type="button" @click="closeModal" class="btn-secondary btn-sm rounded-xl">Batal</button>
                <button
                  type="submit"
                  :disabled="formData.project_id && projectMembers.length === 0"
                  class="btn btn-primary rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {{ editingTask ? 'Perbarui Tugas' : 'Simpan Tugas' }}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService, projectService } from '../services'

const authStore = useAuthStore()
const tasks = ref([])
const projects = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingTask = ref(null)
const filterStatus = ref('')

const formData = reactive({
  title: '', description: '', priority: 'medium', status: 'todo',
  project_id: '', user_id: '', due_date: ''
})

const user = computed(() => authStore.user)
const isAdminGlobal = computed(() => user.value?.role_id === 1)
const isManagerGlobal = computed(() => user.value?.role_id === 2)

const canCreateAnyTask = computed(() => {
  if (isAdminGlobal.value || isManagerGlobal.value) return true
  return projects.value.some(p => {
    const member = p.members?.find(m => m.id === user.value?.id)
    return member?.pivot?.role === 'owner' || member?.pivot?.role === 'manager'
  })
})

const getRoleInProject = (project) => {
  if (!project || !project.members) return 'none'
  const member = project.members.find(m => m.id === user.value?.id)
  return member?.pivot?.role || 'none'
}

const canEditFullTask = (task) => {
  if (isAdminGlobal.value) return true
  const role = getRoleInProject(task.project)
  return role === 'owner' || role === 'manager'
}

const canDeleteTask = (task) => {
  if (isAdminGlobal.value) return true
  const role = getRoleInProject(task.project)
  return role === 'owner'
}

const canUpdateStatusOnly = (task) => {
  const role = getRoleInProject(task.project)
  return role !== 'none' && role !== 'stakeholder'
}

const projectMembers = computed(() => {
  if (!formData.project_id) return []
  const selected = projects.value.find(p => p.id === formData.project_id)
  return selected?.members || []
})

const onProjectChange = () => { formData.user_id = '' }

const taskCounts = computed(() => ({
  todo: tasks.value.filter(t => t.status === 'todo').length,
  doing: tasks.value.filter(t => t.status === 'doing').length,
  review: tasks.value.filter(t => t.status === 'review').length,
  done: tasks.value.filter(t => t.status === 'done').length,
}))

const filteredTasks = computed(() => {
  let result = tasks.value.filter(t =>
    t.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  if (filterStatus.value) result = result.filter(t => t.status === filterStatus.value)
  return result
})

const getStatusLabel = (status) => {
  const labels = { todo: 'To Do', doing: 'Doing', review: 'Review', done: 'Done' }
  return labels[status] || status
}

const statusBadgeClass = (status) => {
  const map = { done: 'badge-success', doing: 'badge-primary', review: 'badge-warning', todo: 'badge-danger' }
  return map[status] || 'badge-danger'
}

const priorityBadgeClass = (priority) => {
  const map = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    medium: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    high: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    urgent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  }
  return map[priority] || 'bg-slate-700/30 text-slate-400 border-slate-700'
}

const formatDeadline = (dateStr) => {
  if (!dateStr) return 'No Deadline'
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const isOverdue = (dateStr) => {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

const fetchAllData = async () => {
  loading.value = true
  try {
    const [tasksRes, projectsRes] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects(),
    ])
    tasks.value = tasksRes.data.data || tasksRes.data || []
    projects.value = projectsRes.data.data || projectsRes.data || []
  } catch (error) {
    console.error('Error loading tasks:', error)
  } finally {
    loading.value = false }
}

onMounted(fetchAllData)

const openModal = (task = null) => {
  if (task) {
    editingTask.value = task
    let formattedDate = ''
    if (task.due_date) {
      const d = new Date(task.due_date)
      formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    }
    Object.assign(formData, { title: task.title, description: task.description, priority: task.priority, status: task.status, project_id: task.project_id, user_id: task.user_id, due_date: formattedDate })
  } else {
    editingTask.value = null
    Object.assign(formData, { title: '', description: '', priority: 'medium', status: 'todo', project_id: '', user_id: '', due_date: '' })
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editingTask.value = null }

const saveTask = async () => {
  try {
    if (editingTask.value) await taskService.updateTask(editingTask.value.id, { ...formData })
    else await taskService.createTask({ ...formData })
    closeModal()
    await fetchAllData()
  } catch (error) {
    alert('Gagal: ' + (error.response?.data?.message || error.message))
  }
}

const handleQuickUpdate = async (task, newStatus) => {
  try {
    await taskService.updateTask(task.id, { status: newStatus })
    task.status = newStatus
  } catch (error) {
    alert('Gagal update status.')
    await fetchAllData()
  }
}

const deleteTask = async (id) => {
  if (!confirm('Hapus tugas ini secara permanen?')) return
  try {
    await taskService.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (error) {
    alert('Gagal menghapus: ' + (error.response?.data?.message || 'Error'))
  }
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.task-modal-scroll {
  max-height: 92vh;
  overflow-y: auto;
}
.task-modal-scroll::-webkit-scrollbar { width: 4px; }
.task-modal-scroll::-webkit-scrollbar-track { background: transparent; }
.task-modal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

input[type="datetime-local"]::-webkit-calendar-picker-indicator {
  filter: invert(1) opacity(0.4);
  cursor: pointer;
}
</style>