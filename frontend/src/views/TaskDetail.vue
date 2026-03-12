<template>
  <div class="min-h-screen bg-slate-900 text-white p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Detail Tugas</h1>
        <router-link to="/tasks" class="text-indigo-400 hover:text-indigo-300">
          ← Kembali ke Tasks
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>

      <!-- Task Detail Content -->
      <div v-else-if="task" class="space-y-6">
        <!-- Title & Status -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="flex items-start justify-between">
            <div>
              <h2 class="text-xl font-bold mb-2">{{ task.title }}</h2>
              <p class="text-slate-400">{{ task.description || 'Tidak ada deskripsi' }}</p>
            </div>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium', statusBadgeClass(task.status)]">
              {{ getStatusLabel(task.status) }}
            </span>
          </div>
        </div>

        <!-- Task Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p class="text-slate-400 text-sm">Priority</p>
            <span :class="['inline-block mt-1 px-2 py-1 rounded text-sm', priorityBadgeClass(task.priority)]">
              {{ task.priority?.toUpperCase() }}
            </span>
          </div>
          <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p class="text-slate-400 text-sm">Due Date</p>
            <p class="text-white font-medium mt-1">{{ task.due_date ? new Date(task.due_date).toLocaleDateString('id-ID') : '-' }}</p>
          </div>
          <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p class="text-slate-400 text-sm">Project</p>
            <p class="text-white font-medium mt-1">{{ task.project?.name || '-' }}</p>
          </div>
          <div class="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <p class="text-slate-400 text-sm">Assigned To</p>
            <p class="text-white font-medium mt-1">{{ task.user?.name || '-' }}</p>
          </div>
        </div>

        <!-- Attachments Section -->
        <div class="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold">Lampiran</h3>
            <label class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg cursor-pointer transition-colors">
              <input type="file" class="hidden" @change="handleFileUpload" :disabled="uploading">
              <span v-if="uploading">Mengupload... {{ progress }}%</span>
              <span v-else>+ Tambah File</span>
            </label>
          </div>

          <!-- Upload Progress -->
          <div v-if="uploading" class="mb-4">
            <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div class="h-full bg-indigo-500 transition-all" :style="{ width: progress + '%' }"></div>
            </div>
          </div>

          <!-- File List -->
          <div v-if="attachments.length > 0" class="space-y-2">
            <div v-for="file in attachments" :key="file.id" class="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
              <div class="flex items-center gap-3">
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span class="text-sm">{{ file.file_name }}</span>
                <span class="text-xs text-slate-500">({{ formatFileSize(file.file_size) }})</span>
              </div>
              <div class="flex gap-2">
                <button @click="downloadFile(file.id, file.file_name)" class="text-indigo-400 hover:text-indigo-300 text-sm">
                  Download
                </button>
                <button @click="deleteFile(file.id)" class="text-rose-400 hover:text-rose-300 text-sm">
                  Hapus
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-slate-500 text-sm">Belum ada lampiran.</p>
        </div>
      </div>

      <!-- Not Found -->
      <div v-else class="text-center py-12">
        <p class="text-slate-400">Tugas tidak ditemukan.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useCreate } from '@/composables/useCreate'
import { useShow } from '@/composables/useShow'
import { useDelete } from '@/composables/useDelete'
import { useList } from '@/composables/useList'
import apiClient from '@/services/api'

const route = useRoute()
const toast = useToast()
const { confirm } = useConfirm()

// Task data
const task = ref<any>(null)
const loading = ref(false)

// File upload composables
const { upload, uploading, progress } = useCreate('attachments')
const { download } = useShow('attachments')
const { remove: deleteAttachment } = useDelete('attachments')
const { items: attachments, fetch: fetchAttachments } = useList('attachments', { immediate: false })

const loadTask = async () => {
  loading.value = true
  try {
    const taskId = route.params.id
    const res = await apiClient.get(`/tasks/${taskId}`)
    task.value = res.data.data || res.data
    if (task.value) {
      await fetchAttachments({ task_id: task.value.id })
    }
  } catch (error) {
    console.error('Error loading task:', error)
    toast.error('Gagal memuat detail tugas')
  } finally {
    loading.value = false
  }
}

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !task.value) return

  await upload(file, { task_id: task.value.id })
  await fetchAttachments({ task_id: task.value.id })
  input.value = ''
}

const downloadFile = async (fileId: number, filename: string) => {
  await download(fileId, filename)
}

const deleteFile = async (fileId: number) => {
  const ok = await confirm({
    message: 'Hapus file ini?',
    type: 'danger',
    confirmText: 'Hapus'
  })
  if (!ok) return
  await deleteAttachment(fileId, { skipConfirm: true })
  await fetchAttachments({ task_id: task.value.id })
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = { todo: 'To Do', doing: 'Doing', review: 'Review', done: 'Done' }
  return labels[status] || status
}

const statusBadgeClass = (status: string) => {
  const map: Record<string, string> = {
    done: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    doing: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    review: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    todo: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  }
  return map[status] || map.todo
}

const priorityBadgeClass = (priority: string) => {
  const map: Record<string, string> = {
    low: 'bg-emerald-500/20 text-emerald-400',
    medium: 'bg-amber-500/20 text-amber-400',
    high: 'bg-rose-500/20 text-rose-400',
    urgent: 'bg-purple-500/20 text-purple-400',
  }
  return map[priority] || map.medium
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

onMounted(loadTask)
</script>

