<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent m-0">
          Projects
        </h1>
        <p class="text-slate-400 text-sm mt-1">Kelola proyek, tugas, dan anggota tim Anda secara real-time.</p>
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
            placeholder="Cari proyek..." 
            class="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
        </div>

        <button 
          v-if="canManage"
          @click="openCreateModal"
          class="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buat Proyek
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
      <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">Sinkronisasi Data...</p>
    </div>

    <div v-else-if="filteredProjects.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="project in filteredProjects" 
        :key="project.id"
        class="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/60 transition-all group flex flex-col hover:shadow-2xl hover:shadow-indigo-500/5"
      >
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-bold text-white line-clamp-1" :title="project.name">{{ project.name }}</h3>
          <span class="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Active
          </span>
        </div>
        
        <p class="text-slate-400 text-sm mb-6 line-clamp-2 flex-grow">
          {{ project.description || 'Tidak ada deskripsi proyek yang ditambahkan.' }}
        </p>

        <div class="flex items-center justify-between pt-4 border-t border-slate-700/50">
          <button 
            @click="openDetails(project)"
            class="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Lihat Detail &rarr;
          </button>

          <div v-if="canManage" class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button @click="openEditModal(project)" class="p-2 text-slate-400 hover:text-amber-400 bg-slate-700/30 rounded-lg transition-colors" title="Edit">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button @click="confirmDelete(project.id)" class="p-2 text-slate-400 hover:text-rose-400 bg-slate-700/30 rounded-lg transition-colors" title="Hapus">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20 bg-slate-800/10 border border-slate-700/50 rounded-3xl border-dashed">
      <div class="bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <svg class="h-8 w-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-white mb-1">Belum ada proyek</h3>
      <p class="text-slate-500 text-sm max-w-xs mx-auto">Mulai susun rencana kerja tim Anda dengan membuat proyek pertama hari ini.</p>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="closeModal"></div>
      <div class="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-lg p-8 transform transition-all animate-slide-up">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-2xl font-black text-white">
            {{ isEditing ? 'Edit Proyek' : 'Proyek Baru' }}
          </h3>
          <button @click="closeModal" class="text-slate-500 hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <form @submit.prevent="submitProject" class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nama Proyek</label>
            <input v-model="formData.name" type="text" required placeholder="Contoh: Website Redesign" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all">
          </div>
          
          <div>
            <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deskripsi</label>
            <textarea v-model="formData.description" rows="3" placeholder="Jelaskan tujuan utama proyek ini..." class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Tgl Mulai</label>
              <input v-model="formData.start_date" type="date" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deadline</label>
              <input v-model="formData.end_date" type="date" class="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-8">
            <button type="button" @click="closeModal" class="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
              Batal
            </button>
            <button type="submit" class="px-8 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95" :disabled="isSubmitting">
              {{ isSubmitting ? 'Memproses...' : (isEditing ? 'Perbarui Proyek' : 'Simpan Proyek') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="showDetailsModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/80 backdrop-blur-md" @click="closeDetailsModal"></div>
      <div class="relative bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
        
        <div class="p-8 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </span>
              <h2 class="text-2xl font-black text-white m-0">{{ selectedProject?.name }}</h2>
            </div>
            <p class="text-slate-400 text-sm max-w-2xl leading-relaxed">{{ selectedProject?.description || 'Tidak ada deskripsi.' }}</p>
          </div>
          <button @click="closeDetailsModal" class="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="flex border-b border-slate-800 px-8 bg-slate-900">
          <button @click="activeTab = 'tasks'" :class="['py-4 text-xs font-bold uppercase tracking-widest border-b-2 mr-8 transition-all', activeTab === 'tasks' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']">
            Daftar Tugas
          </button>
          <button @click="activeTab = 'members'" :class="['py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all', activeTab === 'members' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']">
            Anggota Tim
          </button>
        </div>

        <div class="p-8 overflow-y-auto flex-grow bg-slate-900/30">
          
          <div v-if="activeTab === 'tasks'" class="animate-fade-in">
            <div v-if="projectTasks.length === 0" class="text-center py-16">
              <p class="text-slate-500 text-sm font-medium italic">Belum ada tugas yang dibuat untuk proyek ini.</p>
            </div>
            <div v-else class="grid grid-cols-1 gap-3">
              <div v-for="task in projectTasks" :key="task.id" class="p-4 bg-slate-800/40 border border-slate-700/50 rounded-2xl flex justify-between items-center group hover:bg-slate-800/80 transition-all">
                <div>
                  <h4 class="text-white font-bold text-sm mb-1 group-hover:text-indigo-400 transition-colors">{{ task.title || task.name }}</h4>
                  <div class="flex items-center gap-2">
                    <div class="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[8px] text-slate-300">
                      {{ task.user?.name?.charAt(0) || '?' }}
                    </div>
                    <p class="text-[11px] text-slate-500 font-medium">Assigned: <span class="text-slate-300">{{ task.user?.name || 'Unassigned' }}</span></p>
                  </div>
                </div>
                <span :class="['px-3 py-1 text-[10px] font-black uppercase rounded-lg border', 
                  task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                  task.status === 'doing' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-slate-500/10 text-slate-400 border-slate-500/20']"
                >
                  {{ task.status || 'todo' }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="activeTab === 'members'" class="animate-fade-in">
            <div v-if="canManage" class="mb-8 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-inner">
              <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Tambah Anggota Baru</h4>
              <div class="flex flex-col sm:flex-row gap-3">
                <select v-model="newMemberId" class="flex-grow px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm">
                  <option value="" disabled>Pilih User...</option>
                  <option v-for="u in availableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
                </select>
                <select v-model="newMemberRole" class="w-full sm:w-48 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-medium">
                  <option value="Anggota Tim">Anggota Tim</option>
                  <option value="Reviewer">Reviewer</option>
                  <option value="Project Manager">Project Manager</option>
                </select>
                <button @click="addMember" :disabled="!newMemberId || isAddingMember" class="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-xl transition-all active:scale-95 whitespace-nowrap">
                  {{ isAddingMember ? 'Memproses...' : 'Tambahkan' }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="member in projectMembers" :key="member.id" class="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/30 group hover:border-indigo-500/30 transition-all">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-black text-white shadow-lg">
                    {{ member.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <p class="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{{ member.name }}</p>
                    <p class="text-[11px] text-slate-500 font-medium">{{ member.email }}</p>
                  </div>
                </div>
                <span class="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                  {{ member.pivot?.role_in_project || 'Member' }}
                </span>
              </div>
              <div v-if="projectMembers.length === 0" class="col-span-full text-center py-8 text-slate-500 text-sm italic">
                Belum ada tim yang ditugaskan.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useProjectStore } from '../stores/project'
import axios from 'axios'

const authStore = useAuthStore()
const projectStore = useProjectStore()

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
})

apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('api_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// State Utama
const projects = ref([])
const loading = ref(true)
const searchQuery = ref('')

// State Modals & Form Project
const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const formData = reactive({ 
  id: null, 
  name: '', 
  description: '',
  start_date: '',
  end_date: ''
})

// State Details Project Modal
const showDetailsModal = ref(false)
const activeTab = ref('tasks')
const selectedProject = ref(null)
const projectTasks = ref([])
const projectMembers = ref([])

// State Add Member
const availableUsers = ref([])
const newMemberId = ref('')
const newMemberRole = ref('Anggota Tim')
const isAddingMember = ref(false)

const user = computed(() => authStore.user)
const canManage = computed(() => user.value?.role_id === 1 || user.value?.role_id === 2)

const filteredProjects = computed(() => {
  if (!projects.value) return []
  return projects.value.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
    p.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  await loadProjects()
  if (canManage.value) loadAllUsers()
})

const loadProjects = async () => {
  loading.value = true
  try {
    await projectStore.fetchProjects()
    projects.value = projectStore.projects || []
  } catch (err) {
    console.error("Load Projects Error:", err)
  } finally {
    loading.value = false
  }
}

const loadAllUsers = async () => {
  try {
    const res = await apiClient.get('/users')
    availableUsers.value = res.data.data || res.data || []
  } catch (err) { console.error("Load Users Error:", err) }
}

// CRUD ACTIONS
const openCreateModal = () => {
  isEditing.value = false
  Object.assign(formData, { id: null, name: '', description: '', start_date: '', end_date: '' })
  showModal.value = true
}

const openEditModal = (project) => {
  isEditing.value = true
  Object.assign(formData, { 
    id: project.id, 
    name: project.name, 
    description: project.description,
    start_date: project.start_date || '', // Pastikan API mengirim format YYYY-MM-DD
    end_date: project.end_date || ''
  })
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitProject = async () => {
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      await projectStore.updateProject(formData.id, formData)
    } else {
      await projectStore.createProject(formData)
    }
    await loadProjects()
    closeModal()
  } catch (err) {
    alert("Terjadi kesalahan sistem.")
  } finally { isSubmitting.value = false }
}

const confirmDelete = async (id) => {
  if (confirm("Hapus proyek ini? Seluruh data di dalamnya akan hilang.")) {
    try {
      await projectStore.deleteProject(id)
      await loadProjects()
    } catch (err) { alert("Gagal menghapus.") }
  }
}

// DETAILS ACTIONS
const openDetails = async (project) => {
  selectedProject.value = project
  activeTab.value = 'tasks'
  showDetailsModal.value = true
  projectTasks.value = []
  projectMembers.value = []
  
  try {
    const [detailRes, taskRes] = await Promise.all([
      apiClient.get(`/projects/${project.id}`),
      apiClient.get('/tasks')
    ])
    
    const detailData = detailRes.data.data || detailRes.data
    projectMembers.value = detailData.members || []
    
    const allTasks = taskRes.data.data || taskRes.data || []
    projectTasks.value = allTasks.filter(t => t.project_id === project.id)
  } catch (err) { console.error("Load Details Error:", err) }
}

const closeDetailsModal = () => { showDetailsModal.value = false }

const addMember = async () => {
  if (!newMemberId.value || !selectedProject.value) return
  isAddingMember.value = true
  try {
    const payload = { user_id: newMemberId.value, role: newMemberRole.value }
    const res = await apiClient.post(`/projects/${selectedProject.value.id}/members`, payload)
    const updated = res.data.data || res.data
    projectMembers.value = updated.members || []
    newMemberId.value = ''
    alert("Anggota ditambahkan!")
  } catch (err) {
    alert(err.response?.data?.message || "Gagal menambahkan.")
  } finally { isAddingMember.value = false }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
.animate-slide-up { animation: slideUp 0.3s ease-out; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.overflow-y-auto::-webkit-scrollbar { width: 4px; }
.overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
.overflow-y-auto::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }

/* Menghilangkan border biru default pada input date di beberapa browser */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>