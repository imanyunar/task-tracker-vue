<template>
  <div class="min-h-screen bg-slate-900 pt-20 pb-12 text-slate-200">
    <div v-if="loading" class="flex flex-col items-center justify-center py-40">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Memuat Detail Tugas...</p>
    </div>

    <div v-else-if="task" class="max-w-4xl mx-auto px-4 sm:px-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <button @click="$router.back()" class="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm font-bold group">
          <svg class="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

        <div class="flex items-center gap-3">
          <button 
            v-if="canManageFull && !isEditing"
            @click="startEdit"
            class="px-4 py-2 bg-amber-500/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Edit Tugas
          </button>

          <button 
            v-if="canDelete && !isEditing"
            @click="deleteTask"
            class="px-4 py-2 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          >
            Hapus Tugas
          </button>

          <button v-if="isEditing" @click="isEditing = false" class="text-xs font-bold text-slate-400 uppercase hover:text-white transition-colors">Batal</button>
        </div>
      </div>

      <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div class="p-8 md:p-12">
          
          <form @submit.prevent="saveChanges">
            <div class="mb-6 flex items-center gap-2">
              <span :class="[
                'px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border',
                projectRole === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              ]">
                Akses Anda: {{ projectRole.toUpperCase() }}
              </span>
              <span v-if="task.status === 'done'" class="px-3 py-1 bg-emerald-500/10 rounded-lg text-[9px] font-black text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                Selesai
              </span>
            </div>

            <div class="mb-8">
              <h1 v-if="!isEditing" class="text-3xl md:text-5xl font-black text-white italic tracking-tight leading-tight">{{ task.title }}</h1>
              <div v-else>
                <label class="text-[10px] font-black text-slate-500 uppercase mb-2 block tracking-widest">Judul Tugas</label>
                <input v-model="editForm.title" class="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4 text-xl font-bold text-white focus:ring-2 focus:ring-indigo-500 outline-none">
              </div>
            </div>

            <div class="mb-10">
              <label class="text-[10px] font-black text-slate-500 uppercase mb-3 block tracking-widest">Deskripsi</label>
              <div v-if="!isEditing" class="text-slate-300 text-lg leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-700/30 whitespace-pre-line min-h-[120px]">
                {{ task.description || 'Tidak ada deskripsi detail.' }}
              </div>
              <textarea v-else v-model="editForm.description" rows="5" class="w-full bg-slate-900 border border-slate-700 rounded-3xl px-6 py-4 text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50">
                <p class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Penanggung Jawab</p>
                <div v-if="!isEditing" class="flex items-center gap-4">
                  <img :src="`https://ui-avatars.com/api/?name=${task.user?.name}&background=6366f1&color=fff&bold=true`" class="w-12 h-12 rounded-2xl">
                  <div>
                    <p class="text-sm font-black text-white leading-tight">{{ task.user?.name }}</p>
                    <p class="text-[10px] text-indigo-400 font-bold uppercase mt-1 tracking-wider">{{ task.user?.department?.name || 'Staff' }}</p>
                  </div>
                </div>
                <div v-else>
                  <select v-model="editForm.user_id" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none">
                    <option v-for="member in task.project?.members" :key="member.id" :value="member.id">
                      {{ member.name }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="bg-slate-900/60 p-6 rounded-2xl border border-slate-700/50">
                <p class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-4">Batas Waktu</p>
                <div v-if="!isEditing" class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" stroke-width="2"/></svg>
                  </div>
                  <p class="text-sm font-black text-white">{{ formatDate(task.due_date) }}</p>
                </div>
                <div v-else>
                  <input v-model="editForm.due_date" type="datetime-local" class="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none">
                </div>
              </div>
            </div>

            <button v-if="isEditing" type="submit" :disabled="isUpdating" class="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-indigo-500/30">
              {{ isUpdating ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </button>
          </form>
        </div>

        <div v-if="!isEditing && canChangeStatus" class="bg-slate-900/80 p-10 border-t border-slate-700/50 text-center">
          <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Update Status Tugas</p>
          <div class="flex flex-wrap justify-center gap-4">
            <button 
              v-for="s in ['todo', 'doing', 'review', 'done']" 
              :key="s"
              @click="updateStatusOnly(s)"
              :disabled="isUpdating || task.status === s"
              :class="[
                'px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all',
                task.status === s ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
              ]"
            >
              {{ s }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '../services/api' // Sesuai file api.ts Anda

const route = useRoute()
const router = useRouter()
const task = ref(null)
const loading = ref(true)
const isUpdating = ref(false)
const isEditing = ref(false)

// 1. Ambil Data User - coba berbagai key yang mungkin dipakai saat login
const currentUser = computed(() => {
  const keys = ['user_data', 'user', 'current_user', 'auth_user', 'userData']
  for (const key of keys) {
    const raw = sessionStorage.getItem(key)
    if (raw) {
      try { return JSON.parse(raw) } catch { continue }
    }
  }
  return {}
})

// 2. Deteksi Role Global (Admin = 1, Manager = 2)
const globalRole = computed(() => {
  const user = currentUser.value
  const roleId = user?.role_id ?? user?.role?.id
  console.log('[TaskDetail Debug] currentUser:', user, '| role_id:', roleId)
  return roleId !== undefined ? parseInt(roleId) : 99
})

// 3. Logika Role Project dengan Bypass Admin
const projectRole = computed(() => {
  // JIKA ADMIN GLOBAL (1) ATAU MANAGER (2), LANGSUNG BERI AKSES ADMIN
  if (globalRole.value === 1 || globalRole.value === 2) return 'admin'

  if (!task.value?.project?.members) return 'none'
  
  // Cari di tabel pivot
  const member = task.value.project.members.find(m => m.id === currentUser.value.id)
  const roleId = member?.pivot?.role_in_project

  const mapping = { 1: 'owner', 2: 'manager', 3: 'contributor', 4: 'stakeholder' }
  return mapping[roleId] || 'none'
})

// 4. Permission Logic Berdasarkan Role yang Dihitung
const canManageFull = computed(() => {
  return projectRole.value === 'admin' || projectRole.value === 'owner' || projectRole.value === 'manager'
})

const canDelete = computed(() => {
  return projectRole.value === 'admin' || projectRole.value === 'owner'
})

const canChangeStatus = computed(() => {
  return projectRole.value !== 'stakeholder' && projectRole.value !== 'none'
})

const editForm = reactive({
  title: '', description: '', priority: '', due_date: '', status: '', user_id: ''
})

const fetchTaskDetail = async () => {
  try {
    loading.value = true
    const res = await apiClient.get(`/tasks/${route.params.id}`) // Memanggil TaskController@show
    task.value = res.data.data
  } catch (err) {
    console.error(err)
    router.back()
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  editForm.title = task.value.title
  editForm.description = task.value.description
  editForm.priority = task.value.priority
  editForm.status = task.value.status
  editForm.user_id = task.value.user_id
  if (task.value.due_date) {
    editForm.due_date = new Date(task.value.due_date).toISOString().slice(0, 16)
  }
  isEditing.value = true
}

const saveChanges = async () => {
  try {
    isUpdating.value = true
    await apiClient.put(`/tasks/${route.params.id}`, editForm) // Memanggil TaskController@update
    await fetchTaskDetail()
    isEditing.value = false
  } catch (err) {
    alert("Gagal memperbarui tugas.")
  } finally {
    isUpdating.value = false
  }
}

const updateStatusOnly = async (newStatus) => {
  try {
    isUpdating.value = true
    await apiClient.put(`/tasks/${route.params.id}`, { status: newStatus })
    task.value.status = newStatus
  } catch (err) {
    alert("Izin ditolak.")
  } finally {
    isUpdating.value = false
  }
}

const deleteTask = async () => {
  if (!confirm("Hapus tugas ini?")) return
  try {
    await apiClient.delete(`/tasks/${route.params.id}`) // Memanggil TaskController@destroy
    router.back()
  } catch (err) {
    alert("Gagal menghapus.")
  }
}

const formatDate = (date) => {
  if (!date) return 'No Deadline'
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB'
}

onMounted(fetchTaskDetail)
</script>