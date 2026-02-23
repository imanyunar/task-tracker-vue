<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent m-0">
          Tasks Management
        </h1>
        <p class="text-slate-400 text-sm mt-1">Kelola daftar tugas dan pantau progres kerja tim Anda.</p>
      </div>

      <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
        <div class="relative w-full sm:w-64">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Cari tugas..." 
            class="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
        </div>

        <button 
          v-if="canCreate"
          @click="openModal()"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Tambah Tugas
        </button>
      </div>
    </div>

    <div class="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
      <button 
        v-for="status in ['all', 'todo', 'doing', 'review', 'done']" 
        :key="status"
        @click="filterStatus = status === 'all' ? '' : status"
        :class="[
          'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border',
          (filterStatus === status || (status === 'all' && filterStatus === '')) 
            ? 'bg-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-500/20' 
            : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
        ]"
      >
        {{ status === 'all' ? 'Semua' : getStatusLabel(status) }}
      </button>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">Memuat Tugas...</p>
    </div>

    <div v-else-if="filteredTasks.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="task in filteredTasks" 
        :key="task.id"
        class="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all group flex flex-col hover:shadow-2xl hover:shadow-indigo-500/5"
      >
        <div class="flex justify-between items-start mb-4">
          <div class="flex gap-2">
            <span class="px-2 py-1 text-[10px] font-black uppercase rounded-lg border border-white/5" :style="{ backgroundColor: getPriorityColor(task.priority) + '20', color: getPriorityColor(task.priority) }">
              {{ task.priority }}
            </span>
            <span class="px-2 py-1 text-[10px] font-black uppercase rounded-lg border border-white/5" :style="{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }">
              {{ getStatusLabel(task.status) }}
            </span>
          </div>
          
          <div v-if="canEditTask(task) || canDelete" class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openModal(task)" class="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-700/30 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button v-if="canDelete" @click="deleteTask(task.id)" class="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-700/30 rounded-lg transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>

        <h3 class="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{{ task.title }}</h3>
        <p class="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">{{ task.description || 'Tidak ada deskripsi tugas.' }}</p>

        <div class="space-y-3 pt-4 border-t border-slate-700/50">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Project</span>
            <span class="text-xs font-bold text-indigo-300">{{ task.project?.name || 'No Project' }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Assigned To</span>
            <div class="flex items-center gap-2">
              <div class="w-5 h-5 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                <span v-if="!task.user?.avatar">{{ task.user?.name?.charAt(0) }}</span>
                <img v-else :src="task.user.avatar" class="w-full h-full object-cover">
              </div>
              <span class="text-xs font-bold text-slate-300">{{ task.user?.name || 'Unassigned' }}</span>
            </div>
          </div>
        </div>

        <div v-if="isEmployee && canEditTask(task)" class="mt-4 pt-4 border-t border-slate-700/30">
          <select 
            :value="task.status" 
            @change="(e) => handleQuickUpdate(task, e.target.value)"
            class="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-[11px] font-bold text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="todo">Update: To Do</option>
            <option value="doing">Update: Doing</option>
            <option value="review">Update: Review</option>
            <option value="done">Update: Done</option>
          </select>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-slate-800/10 border border-slate-700/50 rounded-3xl border-dashed">
      <div class="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
      <h3 class="text-lg font-bold text-white mb-1">Belum ada tugas</h3>
      <p class="text-slate-500 text-sm max-w-xs mx-auto">Tugas yang Anda buat atau yang ditugaskan kepada Anda akan muncul di sini.</p>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="closeModal"></div>
      <div class="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-slide-up max-h-[95vh] overflow-y-auto custom-scrollbar">
        <div class="flex justify-between items-center mb-8">
          <h3 class="text-2xl font-black text-white italic tracking-tight">
            {{ editingTask ? 'EDIT TASK' : 'NEW TASK' }}
          </h3>
          <button @click="closeModal" class="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-500 hover:text-white">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveTask" class="space-y-5">
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Task Title</label>
            <input v-model="formData.title" type="text" required placeholder="Nama tugas..." class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600">
          </div>
          
          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Description</label>
            <textarea v-model="formData.description" rows="3" placeholder="Detail tugas..." class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Priority</label>
              <select v-model="formData.priority" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Status</label>
              <select v-model="formData.status" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="todo">To Do</option>
                <option value="doing">Doing</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Project</label>
              <select 
                v-model="formData.project_id" 
                @change="onProjectChange"
                required 
                class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="" disabled>Pilih Project</option>
                <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Deadline</label>
              <input v-model="formData.due_date" type="date" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Assign To (Project Members)</label>
            <select 
              v-model="formData.user_id" 
              required 
              :disabled="!formData.project_id"
              class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="" disabled>
                {{ formData.project_id ? 'Pilih Anggota Tim' : 'Pilih Proyek Terlebih Dahulu' }}
              </option>
              <option v-for="u in projectMembers" :key="u.id" :value="u.id">
                {{ u.name }}
              </option>
            </select>
            <p v-if="formData.project_id && projectMembers.length === 0" class="text-rose-400 text-[10px] mt-2 font-bold uppercase italic tracking-tighter">
              ⚠️ Proyek ini belum memiliki anggota. Silakan tambah anggota di menu Proyek.
            </p>
          </div>

          <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-800">
            <button type="button" @click="closeModal" class="px-6 py-2.5 text-xs font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Cancel</button>
            <button 
              type="submit" 
              :disabled="formData.project_id && projectMembers.length === 0"
              class="px-8 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 uppercase tracking-widest"
            >
              {{ editingTask ? 'Update' : 'Save Task' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { taskService, projectService, userService } from '../services'

const authStore = useAuthStore()
const tasks = ref([])
const projects = ref([])
const users = ref([]) // Cadangan jika diperlukan list semua user
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const editingTask = ref(null)
const filterStatus = ref('')

const formData = reactive({
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  project_id: '',
  user_id: '',
  due_date: ''
})

// Auth Computed
const user = computed(() => authStore.user)
const isAdmin = computed(() => user.value?.role_id === 1)
const isManager = computed(() => user.value?.role_id === 2)
const isEmployee = computed(() => user.value?.role_id === 3)
const canCreate = computed(() => isAdmin.value || isManager.value)
const canDelete = computed(() => isAdmin.value || isManager.value)
const canEditAll = computed(() => isAdmin.value || isManager.value)

// --- LOGIKA FILTER MEMBER ---
const projectMembers = computed(() => {
  if (!formData.project_id) return []
  // Cari proyek dari list projects yang sudah di-load
  const selectedProject = projects.value.find(p => p.id === formData.project_id)
  return selectedProject?.members || []
})

const onProjectChange = () => {
  // Reset user_id jika project diganti, agar tidak terjadi salah penugasan
  formData.user_id = ''
}
// ----------------------------

const filteredTasks = computed(() => {
  let result = tasks.value.filter(task => 
    task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
  if (filterStatus.value) {
    result = result.filter(t => t.status === filterStatus.value)
  }
  return result
})

const getPriorityColor = (priority) => {
  const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', urgent: '#7c3aed' }
  return colors[priority] || '#6b7280'
}

const getStatusColor = (status) => {
  const colors = { todo: '#94a3b8', doing: '#3b82f6', review: '#f59e0b', done: '#10b981' }
  return colors[status] || '#6b7280'
}

const getStatusLabel = (status) => {
  const labels = { todo: 'To Do', doing: 'Doing', review: 'Review', done: 'Done' }
  return labels[status] || status
}

const fetchAllData = async () => {
  loading.value = true
  try {
    // Note: Project service harus mengembalikan data beserta 'members'
    const [tasksRes, projectsRes] = await Promise.all([
      taskService.getAllTasks(),
      projectService.getAllProjects()
    ])
    tasks.value = tasksRes.data.data || tasksRes.data || []
    projects.value = projectsRes.data.data || projectsRes.data || []
  } catch (error) {
    console.error('Error loading tasks data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAllData)

const openModal = (task = null) => {
  if (task) {
    editingTask.value = task
    Object.assign(formData, { 
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      project_id: task.project_id,
      user_id: task.user_id,
      due_date: task.due_date ? task.due_date.substring(0, 10) : ''
    })
  } else {
    editingTask.value = null
    Object.assign(formData, {
      title: '', description: '', priority: 'medium', status: 'todo',
      project_id: '', user_id: '', due_date: ''
    })
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingTask.value = null
}

const saveTask = async () => {
  try {
    if (editingTask.value) {
      if (isEmployee.value) {
        await taskService.updateTask(editingTask.value.id, { status: formData.status })
      } else {
        await taskService.updateTask(editingTask.value.id, { ...formData })
      }
    } else {
      await taskService.createTask({ ...formData })
    }
    closeModal()
    await fetchAllData()
  } catch (error) {
    alert('Action failed: ' + (error.response?.data?.message || error.message))
  }
}

const handleQuickUpdate = async (task, newStatus) => {
  try {
    await taskService.updateTask(task.id, { status: newStatus })
    task.status = newStatus // Update UI local
  } catch (error) {
    alert('Gagal update status')
  }
}

const deleteTask = async (id) => {
  if (!confirm('Hapus tugas ini secara permanen?')) return
  try {
    await taskService.deleteTask(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
  } catch (error) {
    alert('Gagal menghapus tugas')
  }
}

const canEditTask = (task) => {
  return canEditAll.value || (isEmployee.value && task.user_id === user.value?.id)
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }

input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.8); cursor: pointer; }
</style>