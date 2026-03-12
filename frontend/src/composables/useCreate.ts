import { ref, reactive } from 'vue'
import apiClient from '@/services/api'
import { useToast } from '@/composables/useToast'

// POST /{endpoint}
// const { form, submitting, submit } = useCreate<Project>('projects', {
//   initial:    { name: '', status: 'planned' },
//   successMsg: 'Proyek berhasil dibuat!',
//   onSuccess:  (created) => router.push(`/projects/${created.id}`),
// })
//
// Multipart: useCreate('profile/avatar', { multipart: true })
//
// File Upload:
// const { upload, uploading, progress, files } = useCreate('tasks/attachments')
// await upload(file, { task_id: 1 })

export interface UploadFile {
  name: string
  size: number
  type: string
  file: File
}

export function useCreate<T = any, F extends Record<string, any> = Record<string, any>>(
  endpoint: string,
  options: {
    initial?: F
    successMsg?: string
    errorMsg?: string
    multipart?: boolean
    onSuccess?: (result: T) => void
    resetAfter?: boolean
  } = {}
) {
  const toast      = useToast()
  const form       = reactive<F>({ ...(options.initial ?? {}) } as F)
  const submitting = ref(false)
  const error      = ref<string | null>(null)

  const submit = async (overridePayload?: Partial<F>) => {
    submitting.value = true
    error.value      = null
    try {
      const payload = overridePayload ?? { ...form }
      let res

      if (options.multipart) {
        const fd = new FormData()
        Object.entries(payload).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v as any)
        })
        res = await apiClient.post(`/${endpoint}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        res = await apiClient.post(`/${endpoint}`, payload)
      }

      const result = (res.data?.data ?? res.data) as T
      if (options.successMsg) toast.success(options.successMsg)
      if (options.resetAfter !== false && options.initial) Object.assign(form, options.initial)
      options.onSuccess?.(result)
      return result
    } catch (err: any) {
      const msg = options.errorMsg ?? err?.response?.data?.message ?? 'Gagal menyimpan data.'
      error.value = msg
      toast.error(msg)
      return null
    } finally {
      submitting.value = false
    }
  }

  const reset = () => { if (options.initial) Object.assign(form, options.initial) }

  // ========== FILE UPLOAD FUNCTIONALITY ==========
  // Extended method for file upload with progress tracking
  // Usage: const { upload, uploading, progress } = useCreate('endpoint')
  // await upload(file, { related_id: 1 })
  
  const uploading = ref(false)
  const progress = ref(0)
  const uploadError = ref<string | null>(null)
  const uploadedFiles = ref<any[]>([])

  const upload = async (file: File, additionalData: Record<string, any> = {}) => {
    uploading.value = true
    progress.value = 0
    uploadError.value = null
    
    try {
      const fd = new FormData()
      fd.append('file', file)
      
      // Add any additional data
      Object.entries(additionalData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v as any)
      })

      const res = await apiClient.post(`/${endpoint}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            progress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          }
        },
      })

      const result = res.data?.data ?? res.data
      uploadedFiles.value.push(result)
      toast.success('File berhasil diupload!')
      return result
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal mengupload file.'
      uploadError.value = msg
      toast.error(msg)
      return null
    } finally {
      uploading.value = false
    }
  }

  const uploadMultiple = async (files: File[], additionalData: Record<string, any> = {}) => {
    uploading.value = true
    progress.value = 0
    uploadError.value = null
    const results: any[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData()
        fd.append('file', files[i])
        
        Object.entries(additionalData).forEach(([k, v]) => {
          if (v !== undefined && v !== null) fd.append(k, v as any)
        })

        const res = await apiClient.post(`/${endpoint}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const fileProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
              progress.value = Math.round(((i + fileProgress / 100) / files.length) * 100)
            }
          },
        })

        results.push(res.data?.data ?? res.data)
      }
      
      uploadedFiles.value = [...uploadedFiles.value, ...results]
      toast.success(`${files.length} file berhasil diupload!`)
      return results
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Gagal mengupload file.'
      uploadError.value = msg
      toast.error(msg)
      return null
    } finally {
      uploading.value = false
    }
  }

  const removeFile = (index: number) => {
    uploadedFiles.value.splice(index, 1)
  }

  const clearFiles = () => {
    uploadedFiles.value = []
    progress.value = 0
    uploadError.value = null
  }

  return { 
    form, 
    submitting, 
    error, 
    submit, 
    reset,
    // File upload exports
    upload,
    uploadMultiple,
    uploading,
    progress,
    uploadError,
    uploadedFiles,
    removeFile,
    clearFiles
  }
}
