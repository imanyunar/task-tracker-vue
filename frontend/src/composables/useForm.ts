import { ref, reactive, computed } from 'vue'
import { useCreate } from '@/composables/useCreate'
import { useUpdate } from '@/composables/useUpdate'

// Manages modal open/close, isEditing state, and routes submit to useCreate or useUpdate.
// Eliminates the need to manually wire showModal, isEditing, editingId, and formData.
//
// Basic:
//   const { formData, showModal, isEditing, submitting, openCreateModal, openEditModal, closeModal, submitForm } =
//     useForm({
//       fields:    { name: '', description: '' },
//       endpoint:  'departments',
//       createMsg: 'Departemen berhasil dibuat.',
//       updateMsg: 'Departemen berhasil diperbarui.',
//       onSuccess: (_result, _action) => { fetchDepartments(); closeModal() },
//     })
//
// Map existing record fields to form on edit:
//   mapToForm: (record) => ({ name: record.name, description: record.description ?? '' })
//
// Use PATCH instead of PUT:
//   method: 'patch'
//
// File upload form:
//   multipart: true
//
// Override payload on submit (e.g. omit empty password):
//   await submitForm({ payload: { ...formData, password: formData.password || undefined } })
//
// Access underlying creator/updater for advanced use:
//   const { creator, updater } = useForm(...)
//   creator.form.extraField = 'value'

export function useForm<
  F extends Record<string, any> = Record<string, any>,
  T = any,
>(options: {
  fields:          F
  endpoint:        string
  createMsg?:      string
  updateMsg?:      string
  createErrorMsg?: string
  updateErrorMsg?: string
  method?:         'put' | 'patch'
  multipart?:      boolean
  mapToForm?:      (record: any) => Partial<F>
  onSuccess?:      (result: T, action: 'create' | 'update') => void
}) {
  const showModal = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | string | null>(null)

  const formData = reactive<F>({ ...options.fields } as F)

  const creator = useCreate<T, F>(options.endpoint, {
    initial:    options.fields,
    successMsg: options.createMsg,
    errorMsg:   options.createErrorMsg,
    multipart:  options.multipart,
    resetAfter: false,
    onSuccess:  (result) => options.onSuccess?.(result, 'create'),
  })

  const updater = useUpdate<T, F>(options.endpoint, {
    successMsg: options.updateMsg,
    errorMsg:   options.updateErrorMsg,
    method:     options.method ?? 'put',
    onSuccess:  (result) => options.onSuccess?.(result, 'update'),
  })

  const submitting = computed(() => creator.submitting.value || updater.submitting.value)

  const resetForm = () => Object.assign(formData, options.fields)

  const openCreateModal = () => {
    isEditing.value = false
    editingId.value = null
    resetForm()
    creator.reset()
    showModal.value = true
  }

  const openEditModal = (record: any) => {
    isEditing.value = true
    editingId.value = record.id
    const mapped    = options.mapToForm ? options.mapToForm(record) : (record as Partial<F>)
    Object.assign(formData, options.fields, mapped)
    showModal.value = true
  }

  const closeModal = () => { showModal.value = false }

  const submitForm = async (overrides?: { payload?: Partial<F> }): Promise<T | null> => {
    const payload = overrides?.payload ?? { ...formData }
    if (isEditing.value && editingId.value !== null) {
      updater.fill(payload as Partial<F>)
      return await updater.submit(editingId.value)
    } else {
      return await creator.submit(payload as Partial<F>)
    }
  }

  return {
    formData,
    showModal,
    isEditing,
    editingId,
    submitting,
    openCreateModal,
    openEditModal,
    closeModal,
    submitForm,
    resetForm,
    // Exposed for advanced use (e.g. setting extra fields before submit)
    creator,
    updater,
  }
}