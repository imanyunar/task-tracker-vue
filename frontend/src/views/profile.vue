<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useProfile } from '../composables/useProfile'
import { useToast } from '@/composables/useToast'
import apiClient from '@/services/api'

const { userStore, loading } = useProfile()
const toast = useToast()

/* ===========================
   TABS
=========================== */
const activeSection = ref('info') // 'info' | 'password' | 'activity'

/* ===========================
   EDIT INFO
=========================== */
const editing = ref(false)
const isSavingInfo = ref(false)

const infoForm = reactive({ name: '', email: '' })

const startEdit = () => {
  infoForm.name  = userStore.profile?.name  || ''
  infoForm.email = userStore.profile?.email || ''
  editing.value = true
}

const cancelEdit = () => { editing.value = false }

const saveInfo = async () => {
  isSavingInfo.value = true
  try {
    const res = await apiClient.put('/profile', infoForm)
    const updated = res.data.data ?? res.data
    Object.assign(userStore.profile, updated)
    editing.value = false
    toast.success('Profil berhasil diperbarui!')
  } catch (err) {
    toast.error('Gagal menyimpan profil.')
  } finally {
    isSavingInfo.value = false
  }
}

/* ===========================
   FOTO PROFIL
=========================== */
const avatarInput = ref(null)
const avatarPreview = ref(null)
const isUploadingAvatar = ref(false)
const isDraggingAvatar = ref(false)

const currentAvatar = computed(() => {
  if (avatarPreview.value) return avatarPreview.value
  return userStore.profile?.avatar || null
})

// Inisial dari nama user (maks 2 karakter)
const userInitials = computed(() => {
  const name = userStore.profile?.name || ''
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?'
})

// Track jika foto gagal dimuat
const avatarError = ref(false)

// Reset error setiap kali avatar URL berubah
watch(currentAvatar, () => { avatarError.value = false })

const triggerAvatarInput = () => avatarInput.value?.click()

const handleAvatarFile = (file) => {
  if (!file || !file.type.startsWith('image/')) {
    toast.error('File harus berupa gambar.')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Ukuran file maksimal 2MB.')
    return
  }
  const reader = new FileReader()
  reader.onload = (e) => { avatarPreview.value = e.target.result }
  reader.readAsDataURL(file)
}

const onAvatarChange = (e) => handleAvatarFile(e.target.files[0])

const onDrop = (e) => {
  isDraggingAvatar.value = false
  handleAvatarFile(e.dataTransfer.files[0])
}

const uploadAvatar = async () => {
  if (!avatarPreview.value) return
  isUploadingAvatar.value = true
  try {
    // Konversi base64 → Blob → FormData
    const res = await fetch(avatarPreview.value)
    const blob = await res.blob()
    const fd = new FormData()
    fd.append('avatar', blob, 'avatar.jpg')
    const response = await apiClient.post('/profile/avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    const updated = response.data.data ?? response.data
    if (updated?.avatar) userStore.profile.avatar = updated.avatar
    avatarPreview.value = null
    toast.success('Foto profil berhasil diperbarui!')
  } catch {
    toast.error('Gagal upload foto. Coba lagi.')
  } finally {
    isUploadingAvatar.value = false
  }
}

const cancelAvatarPreview = () => {
  avatarPreview.value = null
  if (avatarInput.value) avatarInput.value.value = ''
}

/* ===========================
   GANTI PASSWORD
=========================== */
const pwForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: ''
})
const isSavingPw = ref(false)
const showPw = reactive({ current: false, new: false, confirm: false })

const pwStrength = computed(() => {
  const p = pwForm.password
  if (!p) return { score: 0, label: '', color: '' }
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const map = [
    { label: '',         color: '' },
    { label: 'Lemah',   color: 'bg-rose-500' },
    { label: 'Sedang',  color: 'bg-amber-500' },
    { label: 'Baik',    color: 'bg-blue-500' },
    { label: 'Kuat',    color: 'bg-emerald-500' },
    { label: 'Sangat Kuat', color: 'bg-violet-500' },
  ]
  return { score, ...map[Math.min(score, 5)] }
})

const savePassword = async () => {
  if (pwForm.password !== pwForm.password_confirmation) {
    toast.error('Konfirmasi password tidak cocok.')
    return
  }
  if (pwForm.password.length < 8) {
    toast.warning('Password minimal 8 karakter.')
    return
  }
  isSavingPw.value = true
  try {
    await apiClient.put('/profile/password', {
      current_password:      pwForm.current_password,
      password:              pwForm.password,
      password_confirmation: pwForm.password_confirmation,
    })
    Object.assign(pwForm, { current_password: '', password: '', password_confirmation: '' })
    toast.success('Password berhasil diganti!')
  } catch (err) {
    const msg = err?.response?.data?.message || 'Gagal mengganti password.'
    toast.error(msg)
  } finally {
    isSavingPw.value = false
  }
}

/* ===========================
   ACTIVITY / STATS (opsional fetch)
=========================== */
const activityStats = ref(null)
const loadingStats  = ref(false)

const fetchStats = async () => {
  loadingStats.value = true
  try {
    const res = await apiClient.get('/profile')
    const d = res.data.data ?? res.data
    // Ambil field statistik jika ada dari backend
    activityStats.value = {
      total_tasks:     d.total_tasks     ?? 0,
      completed_tasks: d.completed_tasks ?? 0,
      total_projects:  d.total_projects  ?? 0,
      kpi_score:       d.kpi_score       ?? 0,
      completion_rate: d.completion_rate ?? 0,
      joined_at:       d.created_at      ?? null,
    }
  } catch { /* silent */ } finally {
    loadingStats.value = false
  }
}

onMounted(fetchStats)

/* ===========================
   UTIL
=========================== */
const formatDate = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20 pb-16 px-4 sm:px-6">

    <!-- ===== LOADING ===== -->
    <div v-if="loading" class="flex items-center justify-center py-40">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 rounded-full border-2 border-indigo-500/20"></div>
        <div class="absolute inset-0 rounded-full border-2 border-t-indigo-500 animate-spin"></div>
      </div>
    </div>

    <div v-else-if="userStore.profile" class="max-w-5xl mx-auto space-y-6">

      <!-- ===== HERO CARD ===== -->
      <div class="relative rounded-[2rem] overflow-hidden">
        <!-- Background layers -->
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950"></div>
        <div class="absolute inset-0" style="background: radial-gradient(ellipse at 30% 0%, rgba(99,102,241,0.25) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(139,92,246,0.15) 0%, transparent 60%)"></div>
        <div class="absolute inset-0 opacity-[0.03]" style="background-image: url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'1\' cy=\'1\' r=\'1\' fill=\'%23fff\'/%3E%3C/svg%3E'); background-size: 20px 20px;"></div>

        <div class="relative z-10 p-8 md:p-10">
          <div class="flex flex-col md:flex-row items-center md:items-end gap-8">

            <!-- Avatar dengan drag-drop & click upload -->
            <div class="relative flex-shrink-0 group">
              <!-- Drop zone -->
              <div
                @dragover.prevent="isDraggingAvatar = true"
                @dragleave="isDraggingAvatar = false"
                @drop.prevent="onDrop"
                :class="['relative w-32 h-32 rounded-3xl overflow-hidden border-2 transition-all duration-300 cursor-pointer shadow-2xl',
                  isDraggingAvatar ? 'border-indigo-400 scale-105' : 'border-white/10 group-hover:border-indigo-500/50']"
                @click="triggerAvatarInput"
              >
                <!-- Foto jika ada dan berhasil load -->
                <img
                  v-if="currentAvatar && !avatarError"
                  :src="currentAvatar"
                  class="w-full h-full object-cover"
                  alt="Avatar"
                  @error="avatarError = true"
                >
                <!-- Inisial fallback: tidak ada foto ATAU foto gagal load -->
                <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700 select-none">
                  <span class="text-4xl font-black text-white tracking-tight">{{ userInitials }}</span>
                </div>

                <!-- Overlay hover -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="text-[9px] text-white font-black uppercase tracking-widest">Ganti Foto</span>
                </div>

                <!-- Drag overlay -->
                <div v-if="isDraggingAvatar" class="absolute inset-0 bg-indigo-500/40 flex items-center justify-center">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
              </div>

              <!-- Online indicator -->
              <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-lg"></div>

              <!-- Input hidden -->
              <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatarChange">
            </div>

            <!-- Name & info -->
            <div class="text-center md:text-left flex-1">
              <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                <span class="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[9px] font-black uppercase tracking-widest">
                  {{ userStore.profile.role?.name || 'User' }}
                </span>
                <span class="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest">
                  {{ userStore.profile.department?.name || 'Umum' }}
                </span>
              </div>
              <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
                {{ userStore.profile.name }}
              </h1>
              <p class="text-slate-400 mt-2 font-medium">{{ userStore.profile.email }}</p>
              <p class="text-slate-600 text-xs mt-1 font-bold uppercase tracking-widest">
                Bergabung {{ formatDate(userStore.profile.created_at) }}
              </p>
            </div>

            <!-- Preview avatar actions -->
            <div v-if="avatarPreview" class="flex flex-col gap-2 flex-shrink-0">
              <p class="text-[10px] text-slate-500 uppercase tracking-widest font-black text-center">Preview</p>
              <button @click="uploadAvatar" :disabled="isUploadingAvatar"
                class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                <div v-if="isUploadingAvatar" class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                {{ isUploadingAvatar ? 'Mengupload...' : 'Simpan Foto' }}
              </button>
              <button @click="cancelAvatarPreview"
                class="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-center">
                Batal
              </button>
            </div>
          </div>

          <!-- Hint upload -->
          <p v-if="!avatarPreview" class="mt-4 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Klik atau drag & drop foto ke avatar · Maks 2MB · JPG / PNG
          </p>
        </div>
      </div>

      <!-- ===== SECTION TABS ===== -->
      <div class="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-1.5 backdrop-blur-md">
        <button v-for="tab in [
          { key: 'info',     label: 'Informasi Profil', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { key: 'password', label: 'Ganti Password',   icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
          { key: 'activity', label: 'Statistik',         icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        ]" :key="tab.key" @click="activeSection = tab.key"
          :class="['flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex-1 justify-center',
            activeSection === tab.key
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50']">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon"/>
          </svg>
          <span class="hidden sm:inline">{{ tab.label }}</span>
        </button>
      </div>

      <!-- ===== SECTION: INFO PROFIL ===== -->
      <div v-if="activeSection === 'info'" class="animate-slide-up">
        <div class="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">

          <div class="flex items-center justify-between px-8 py-6 border-b border-slate-800">
            <div>
              <h2 class="text-xl font-black text-white">Informasi Profil</h2>
              <p class="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Detail akun pribadi Anda</p>
            </div>
            <button v-if="!editing" @click="startEdit"
              class="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/40">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Edit Profil
            </button>
          </div>

          <!-- View Mode -->
          <div v-if="!editing" class="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div v-for="(val, label) in {
              'Nama Lengkap': userStore.profile.name,
              'Email':        userStore.profile.email,
              'Departemen':   userStore.profile.department?.name || '—',
              'Jabatan / Role': userStore.profile.role?.name || '—',
            }" :key="label">
              <p class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">{{ label }}</p>
              <p class="text-white text-lg font-semibold break-all">{{ val }}</p>
            </div>
            <div>
              <p class="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1.5">Bergabung Sejak</p>
              <p class="text-white text-lg font-semibold">{{ formatDate(userStore.profile.created_at) }}</p>
            </div>
          </div>

          <!-- Edit Mode -->
          <form v-else @submit.prevent="saveInfo" class="p-8 space-y-5">
            <div>
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Nama Lengkap</label>
              <input v-model="infoForm.name" type="text" required placeholder="Masukkan nama lengkap..."
                class="w-full px-5 py-3.5 bg-slate-950/60 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium">
            </div>
            <div>
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Alamat Email</label>
              <input v-model="infoForm.email" type="email" required placeholder="nama@email.com"
                class="w-full px-5 py-3.5 bg-slate-950/60 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium">
            </div>
            <!-- Read-only fields -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Departemen</label>
                <div class="px-5 py-3.5 bg-slate-950/30 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                  {{ userStore.profile.department?.name || '—' }}
                </div>
              </div>
              <div>
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Role</label>
                <div class="px-5 py-3.5 bg-slate-950/30 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                  {{ userStore.profile.role?.name || '—' }}
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-3 pt-2 border-t border-slate-800">
              <button type="button" @click="cancelEdit"
                class="px-6 py-2.5 text-slate-400 hover:text-white font-bold rounded-xl hover:bg-white/5 transition-all text-sm">
                Batal
              </button>
              <button type="submit" :disabled="isSavingInfo"
                class="flex items-center gap-2 px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/40">
                <div v-if="isSavingInfo" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {{ isSavingInfo ? 'Menyimpan...' : 'Simpan Perubahan' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ===== SECTION: GANTI PASSWORD ===== -->
      <div v-if="activeSection === 'password'" class="animate-slide-up">
        <div class="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">

          <div class="px-8 py-6 border-b border-slate-800">
            <h2 class="text-xl font-black text-white">Ganti Password</h2>
            <p class="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Perbarui kata sandi akun Anda</p>
          </div>

          <form @submit.prevent="savePassword" class="p-8 space-y-5 max-w-lg">

            <!-- Current password -->
            <div>
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Password Saat Ini</label>
              <div class="relative">
                <input v-model="pwForm.current_password"
                  :type="showPw.current ? 'text' : 'password'"
                  required placeholder="Masukkan password lama..."
                  class="w-full px-5 py-3.5 pr-12 bg-slate-950/60 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium">
                <button type="button" @click="showPw.current = !showPw.current"
                  class="absolute right-4 inset-y-0 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!showPw.current" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- New password -->
            <div>
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Password Baru</label>
              <div class="relative">
                <input v-model="pwForm.password"
                  :type="showPw.new ? 'text' : 'password'"
                  required placeholder="Minimal 8 karakter..."
                  class="w-full px-5 py-3.5 pr-12 bg-slate-950/60 border border-slate-700 focus:border-indigo-500 rounded-2xl text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium">
                <button type="button" @click="showPw.new = !showPw.new"
                  class="absolute right-4 inset-y-0 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!showPw.new" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>

              <!-- Password strength meter -->
              <div v-if="pwForm.password" class="mt-2.5 space-y-1.5">
                <div class="flex gap-1">
                  <div v-for="i in 5" :key="i"
                    :class="['h-1 flex-1 rounded-full transition-all duration-300',
                      i <= pwStrength.score ? pwStrength.color : 'bg-slate-800']">
                  </div>
                </div>
                <p :class="['text-[10px] font-black uppercase tracking-widest',
                  pwStrength.score <= 1 ? 'text-rose-400' :
                  pwStrength.score <= 2 ? 'text-amber-400' :
                  pwStrength.score <= 3 ? 'text-blue-400'  : 'text-emerald-400']">
                  {{ pwStrength.label }}
                </p>
              </div>
            </div>

            <!-- Confirm password -->
            <div>
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block mb-2 ml-1">Konfirmasi Password Baru</label>
              <div class="relative">
                <input v-model="pwForm.password_confirmation"
                  :type="showPw.confirm ? 'text' : 'password'"
                  required placeholder="Ulangi password baru..."
                  :class="['w-full px-5 py-3.5 pr-12 bg-slate-950/60 border rounded-2xl text-white placeholder-slate-600 outline-none focus:ring-2 transition-all font-medium',
                    pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation
                      ? 'border-rose-500/60 focus:ring-rose-500/30 focus:border-rose-500'
                      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/30']">
                <button type="button" @click="showPw.confirm = !showPw.confirm"
                  class="absolute right-4 inset-y-0 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="!showPw.confirm" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <p v-if="pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation"
                class="mt-1.5 text-[10px] text-rose-400 font-bold ml-1">
                Password tidak cocok
              </p>
            </div>

            <!-- Tips -->
            <div class="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl">
              <p class="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Tips Password Kuat</p>
              <ul class="space-y-1">
                <li v-for="tip in ['Minimal 8 karakter', 'Kombinasi huruf besar & kecil', 'Tambahkan angka & simbol', 'Hindari kata yang mudah ditebak']"
                  :key="tip" class="flex items-center gap-2 text-[11px] text-slate-500">
                  <span class="w-1 h-1 rounded-full bg-indigo-500/60 flex-shrink-0"></span>
                  {{ tip }}
                </li>
              </ul>
            </div>

            <div class="pt-2 border-t border-slate-800">
              <button type="submit" :disabled="isSavingPw || (pwForm.password_confirmation && pwForm.password !== pwForm.password_confirmation)"
                class="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-900/40">
                <div v-if="isSavingPw" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                {{ isSavingPw ? 'Menyimpan...' : 'Ganti Password' }}
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- ===== SECTION: STATISTIK ===== -->
      <div v-if="activeSection === 'activity'" class="animate-slide-up space-y-5">

        <div v-if="loadingStats" class="flex justify-center py-16">
          <div class="w-10 h-10 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>

        <template v-else>
          <!-- Stat cards -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(stat, idx) in [
              { label: 'KPI Score',       value: activityStats?.kpi_score       ?? 0,  color: 'indigo',   icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
              { label: 'Total Tugas',     value: activityStats?.total_tasks      ?? 0,  color: 'violet',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
              { label: 'Tugas Selesai',   value: activityStats?.completed_tasks  ?? 0,  color: 'emerald',  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { label: 'Total Proyek',    value: activityStats?.total_projects   ?? 0,  color: 'amber',    icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            ]" :key="idx"
              class="group bg-slate-900/40 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all hover:-translate-y-0.5 duration-300">
              <div :class="['w-9 h-9 rounded-xl flex items-center justify-center mb-4 border',
                stat.color === 'indigo'  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                stat.color === 'violet'  ? 'bg-violet-500/10 border-violet-500/20 text-violet-400' :
                stat.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                           'bg-amber-500/10  border-amber-500/20  text-amber-400']">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon"/>
                </svg>
              </div>
              <p class="text-3xl font-black text-white tabular-nums group-hover:scale-105 transition-transform duration-500 leading-none mb-1">
                {{ stat.value }}
              </p>
              <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest">{{ stat.label }}</p>
            </div>
          </div>

          <!-- Completion rate bar -->
          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-3">
              <p class="text-sm font-black text-white">Completion Rate</p>
              <p class="text-indigo-400 font-black text-lg tabular-nums">{{ activityStats?.completion_rate ?? 0 }}%</p>
            </div>
            <div class="h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-1000"
                :style="{ width: (activityStats?.completion_rate ?? 0) + '%' }">
              </div>
            </div>
            <div class="flex justify-between mt-2 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
              <span>{{ activityStats?.completed_tasks ?? 0 }} selesai</span>
              <span>{{ (activityStats?.total_tasks ?? 0) - (activityStats?.completed_tasks ?? 0) }} pending</span>
            </div>
          </div>

          <!-- Info akun -->
          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Informasi Akun</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div v-for="(val, label) in {
                'Bergabung': formatDate(userStore.profile.created_at),
                'Departemen': userStore.profile.department?.name || '—',
                'Role': userStore.profile.role?.name || '—',
              }" :key="label">
                <p class="text-[10px] text-slate-600 uppercase font-black tracking-widest mb-1">{{ label }}</p>
                <p class="text-white font-bold text-sm">{{ val }}</p>
              </div>
            </div>
          </div>
        </template>
      </div>

    </div>

    <!-- Not found state -->
    <div v-else class="flex flex-col items-center justify-center py-40 gap-4 text-slate-600">
      <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
      <p class="text-sm font-black uppercase tracking-widest">Data profil tidak ditemukan</p>
    </div>

  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.tabular-nums { font-variant-numeric: tabular-nums; }
</style>