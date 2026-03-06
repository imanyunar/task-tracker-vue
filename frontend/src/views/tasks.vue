<template>
  <div class="relative min-h-screen overflow-x-hidden pt-24 pb-16 px-4 sm:px-6">
    <div class="fixed top-0 -left-10 w-[500px] h-[500px] bg-indigo-600/8 rounded-full filter blur-[120px] animate-blob pointer-events-none"></div>
    <div class="fixed -bottom-20 -right-10 w-[500px] h-[500px] bg-purple-600/8 rounded-full filter blur-[120px] animate-blob animation-delay-2000 pointer-events-none"></div>

    <div class="max-w-7xl mx-auto relative z-10 space-y-8 animate-fade-in">
      
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
              <div class="relative w-full sm:w-64">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input v-model="searchQuery" type="text" placeholder="Cari tugas..." class="w-full pl-10 pr-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all">
              </div>

              <button v-if="canCreateAnyTask" @click="openModal()" class="btn btn-primary rounded-xl text-sm shadow-lg shadow-indigo-500/20 active:scale-95 whitespace-nowrap">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Tambah Tugas
              </button>
            </div>
          </div>

          <div v-if="!loading" class="mt-6 pt-5 border-t border-white/5 flex flex-wrap gap-6">
            <div v-for="(count, status) in taskCounts" :key="status" class="flex items-center gap-2">
              <span :class="['w-2 h-2 rounded-full', status === 'todo' ? 'bg-slate-500' : status === 'doing' ? 'bg-indigo-500' : status === 'review' ? 'bg-amber-500' : 'bg-emerald-500']"></span>
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{{ count }} {{ getStatusLabel(status) }}</span>
            </div>
          </div>
        </div>
      </header>

      <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          v-for="status in ['all', 'todo', 'doing', 'review', 'done']"
          :key="status"
          @click="filterStatus = status === 'all' ? '' : status"
          :class="['px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border flex-shrink-0', (filterStatus === status || (status === 'all' && filterStatus === '')) ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' : 'bg-slate-900/50 text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-700']"
        >
          {{ status === 'all' ? 'Semua' : getStatusLabel(status) }}
          <span v-if="status !== 'all'" class="ml-1.5 opacity-60">{{ taskCounts[status] }}</span>
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center justify-center py-40 gap-6">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-indigo-500/10 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-t-indigo-500 border-r-indigo-400/50 rounded-full animate-spin"></div>
        </div>
        <p class="text-slate-600 font-black tracking-[0.3em] uppercase text-xs">Memuat Tugas...</p>
      </div>

      <div v-else-if="filteredTasks.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <div v-for="(task, idx) in filteredTasks" :key="task.id" class="group card flex flex-col hover:border-indigo-500/30 transition-all duration-300" :style="`animation-delay: ${idx * 40}ms`">
          <div class="card-body pb-0 flex flex-col flex-1">
            <div class="flex items-start justify-between gap-2 mb-4">
              <div class="flex flex-wrap gap-1.5">
                <span :class="['badge text-[9px]', priorityBadgeClass(task.priority)]">{{ task.priority }}</span>
                <span :class="['badge text-[9px]', statusBadgeClass(task.status)]">{{ getStatusLabel(task.status) }}</span>
              </div>
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button @click="$router.push(`/tasks/${task.id}`)" class="p-1.5 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></button>
                <button v-if="canEditFullTask(task)" @click="openModal(task)" class="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                <button v-if="canDeleteTask(task)" @click="deleteTask(task.id)" class="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
            <h3 class="text-base font-bold text-white mb-2 leading-snug group-hover:text-indigo-300 transition-colors">{{ task.title }}</h3>
            <p class="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1 mb-5">{{ task.description || 'Tidak ada deskripsi tugas.' }}</p>
            
            <div class="space-y-2.5 pt-4 border-t border-slate-800/70 text-[11px] font-bold">
              <div class="flex items-center justify-between"><span class="text-[9px] uppercase text-slate-600 tracking-widest">Project</span><span class="text-indigo-400">{{ task.project?.name || '—' }}</span></div>
              <div class="flex items-center justify-between"><span class="text-[9px] uppercase text-slate-600 tracking-widest">Assignee</span><span class="text-slate-300">{{ task.user?.name || 'Unassigned' }}</span></div>
            </div>

            <div v-if="canUpdateStatusOnly(task)" class="mt-4">
              <select :value="task.status" @change="(e) => handleQuickUpdate(task, (e.target as HTMLSelectElement).value)" class="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] font-bold text-slate-400 outline-none hover:border-slate-700">
                <option value="todo">→ To Do</option>
                <option value="doing">→ Doing</option>
                <option value="review">→ Review</option>
                <option value="done">→ Done</option>
              </select>
            </div>
          </div>
          <div :class="['h-0.5 w-full mt-4 rounded-b-2xl', task.status === 'done' ? 'bg-emerald-500/40' : task.status === 'doing' ? 'bg-indigo-500/40' : task.status === 'review' ? 'bg-amber-500/40' : 'bg-slate-700/40']"></div>
        </div>
      </div>

        <Teleport to="body">
          <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
            <div class="modal max-w-lg w-full animate-slide-up task-modal-scroll overflow-hidden bg-slate-900 border border-white/10 shadow-2xl rounded-3xl">
              <div class="modal-header border-b border-white/5 bg-white/5 px-6 py-4 flex items-center justify-between">
                <div>
                  <h3 class="text-xl font-bold text-white">{{ editingTask ? 'Edit Tugas' : 'Tugas Baru' }}</h3>
                  <p class="text-xs text-slate-400 mt-1">Lengkapi informasi detail tugas di bawah ini.</p>
                </div>
                <button @click="closeModal" class="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="modal-body p-6">
                <form @submit.prevent="saveTask" class="space-y-6">
                  
                  <div class="space-y-4">
                    <div class="form-group">
                      <label class="label-field text-indigo-400 text-[10px] uppercase tracking-widest font-bold mb-2 block">Informasi Utama</label>
                      <input 
                        v-model="formData.title" 
                        type="text" 
                        placeholder="Judul Tugas..." 
                        required 
                        class="input-field bg-slate-950/50 border-slate-800 focus:border-indigo-500"
                      >
                    </div>
                    <div class="form-group">
                      <textarea 
                        v-model="formData.description" 
                        rows="3" 
                        placeholder="Tambahkan deskripsi detail di sini..." 
                        class="textarea-field bg-slate-950/50 border-slate-800 focus:border-indigo-500"
                      ></textarea>
                    </div>
                  </div>

                  <div class="bg-white/5 p-4 rounded-2xl space-y-4 border border-white/5">
                    <label class="text-indigo-400 text-[10px] uppercase tracking-widest font-bold block mb-1">Detail & Waktu</label>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="form-group">
                        <label class="text-[11px] text-slate-500 mb-1.5 block ml-1">Prioritas</label>
                        <select v-model="formData.priority" class="select-field bg-slate-950">
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label class="text-[11px] text-slate-500 mb-1.5 block ml-1">Status</label>
                        <select v-model="formData.status" class="select-field bg-slate-950">
                          <option value="todo">To Do</option>
                          <option value="doing">Doing</option>
                          <option value="review">Review</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="text-[11px] text-slate-500 mb-1.5 block ml-1">Tenggat Waktu (Due Date)</label>
                      <div class="relative">
                        <input 
                          v-model="formData.due_date" 
                          type="datetime-local" 
                          required 
                          class="input-field bg-slate-950 pr-10"
                        >
                      </div>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <label class="text-indigo-400 text-[10px] uppercase tracking-widest font-bold block mb-1 ml-1">Penugasan</label>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="form-group">
                        <select v-model.number="formData.project_id" @change="onProjectChange" required class="select-field bg-slate-950/50">
                          <option value="" disabled>Pilih Proyek</option>
                          <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <select v-model.number="formData.user_id" required :disabled="!formData.project_id" class="select-field bg-slate-950/50 disabled:opacity-50">
                          <option value="" disabled>Assign To</option>
                          <option v-for="u in projectMembers" :key="u.id" :value="u.id">{{ u.name }}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                    <button 
                      type="button" 
                      @click="closeModal" 
                      class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useList }   from '@/composables/useList'
import { useDelete } from '@/composables/useDelete'
import { useToast }  from '@/composables/useToast'
import apiClient from '@/services/api'

const authStore = useAuthStore()
const toast     = useToast()
const user      = computed(() => authStore.user)

const isAdminGlobal   = computed(() => user.value?.role_id === 1)
const isManagerGlobal = computed(() => user.value?.role_id === 2)

// ── Fetch ─────────────────────────────────────────────────
const { items: tasks,    fetch: fetchTasks    } = useList('tasks',    { immediate: false })
const { items: projects, fetch: fetchProjects } = useList('projects', { immediate: false })
const loading = ref(false)

const fetchAllData = async () => {
  loading.value = true
  await Promise.all([fetchTasks(), fetchProjects()])
  loading.value = false
}

// ── Filter ────────────────────────────────────────────────
const searchQuery  = ref('')
const filterStatus = ref('')

const filteredTasks = computed(() => {
  let res = tasks.value.filter(t =>
    t.title?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  if (filterStatus.value) res = res.filter(t => t.status === filterStatus.value)
  return res
})

const taskCounts = computed(() => ({
  todo:   tasks.value.filter(t => t.status === 'todo').length,
  doing:  tasks.value.filter(t => t.status === 'doing').length,
  review: tasks.value.filter(t => t.status === 'review').length,
  done:   tasks.value.filter(t => t.status === 'done').length,
}))

// ── Permissions ───────────────────────────────────────────
const getRoleInProject = (project) => {
  if (!project?.members) return null
  const m   = project.members.find(m => m.id === user.value?.id)
  const raw = m?.pivot?.role_in_project ?? m?.role_in_project
  return raw != null ? Number(raw) : null
}

const canCreateAnyTask = computed(() =>
  isAdminGlobal.value || isManagerGlobal.value ||
  projects.value.some(p => { const r = getRoleInProject(p); return r === 1 || r === 2 })
)
const canEditFullTask     = (task) => { if (isAdminGlobal.value) return true; const r = getRoleInProject(task.project); return r === 1 || r === 2 }
const canDeleteTask       = (task) => { if (isAdminGlobal.value) return true; return getRoleInProject(task.project) === 1 }
const canUpdateStatusOnly = (task) => { const r = getRoleInProject(task.project); return r !== null && r !== 4 }

// ── Form ──────────────────────────────────────────────────
const showModal   = ref(false)
const editingTask = ref(null)

const formData = reactive({
  title: '', description: '', priority: 'medium', status: 'todo',
  project_id: '' as string | number, user_id: '' as string | number, due_date: '',
})

const projectMembers = computed(() => {
  if (!formData.project_id) return []
  return projects.value.find(p => p.id === formData.project_id)?.members || []
})

const onProjectChange = () => { formData.user_id = '' }

const openModal = (task = null) => {
  if (task) {
    editingTask.value = task
    const d = task.due_date ? new Date(task.due_date) : null
    Object.assign(formData, {
      title: task.title, description: task.description, priority: task.priority,
      status: task.status, project_id: task.project_id, user_id: task.user_id,
      due_date: d ? new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '',
    })
  } else {
    editingTask.value = null
    Object.assign(formData, { title: '', description: '', priority: 'medium', status: 'todo', project_id: '', user_id: '', due_date: '' })
  }
  showModal.value = true
}

const closeModal = () => { showModal.value = false; editingTask.value = null }

// ── Save task ─────────────────────────────────────────────
const saveTask = async () => {
  if (!formData.due_date) { toast.warning('Deadline wajib diisi.'); return }
  const payload = { ...formData, project_id: Number(formData.project_id), user_id: Number(formData.user_id) }
  try {
    if (editingTask.value) {
      await apiClient.put(`/tasks/${editingTask.value.id}`, payload)
      toast.success('Tugas berhasil diperbarui!')
    } else {
      await apiClient.post('/tasks', payload)
      toast.success('Tugas berhasil dibuat!')
    }
    closeModal()
    await fetchAllData()
  } catch (err) {
    toast.error('Gagal: ' + (err?.response?.data?.message ?? err.message))
  }
}

// ── Quick status update ───────────────────────────────────
const handleQuickUpdate = async (task, newStatus) => {
  try {
    await apiClient.put(`/tasks/${task.id}`, { status: newStatus })
    task.status = newStatus
    toast.success('Status tugas diperbarui.')
  } catch {
    toast.error('Gagal update status.')
    await fetchAllData()
  }
}

// ── Delete ────────────────────────────────────────────────
const { remove: deleteTask } = useDelete('tasks', {
  confirmMessage: 'Hapus tugas ini secara permanen?',
  confirmText:    'Hapus Tugas',
  successMsg:     'Tugas berhasil dihapus.',
  onSuccess:      (id) => { tasks.value = tasks.value.filter(t => t.id !== id) },
})

// ── Helpers ───────────────────────────────────────────────
const getStatusLabel = (s) => ({ todo: 'To Do', doing: 'Doing', review: 'Review', done: 'Done' }[s] ?? s)
const statusBadgeClass   = (s) => ({ done: 'badge-success', doing: 'badge-primary', review: 'badge-warning', todo: 'badge-danger' }[s] ?? 'badge-danger')
const priorityBadgeClass = (p) => ({
  low:    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  medium: 'bg-amber-500/10  text-amber-400  border-amber-500/20',
  high:   'bg-rose-500/10   text-rose-400   border-rose-500/20',
  urgent: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
}[p] ?? 'bg-slate-700/30 text-slate-400 border-slate-700')

onMounted(fetchAllData)
</script>

<style scoped>
/* Style tetap sama persis seperti kode asli Anda */
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.task-modal-scroll { max-height: 92vh; overflow-y: auto; }
.task-modal-scroll::-webkit-scrollbar { width: 4px; }
.task-modal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>