import {
  ref,
  computed,
  nextTick,
  onUnmounted,
  watch,
  type Ref
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/services/api'
import { PROJECT_ROLES, ROLE_CONFIG } from '@/constants/projectRoles'

/* =========================
   TYPES
========================= */

interface User {
  id: number
  name: string
  email?: string
  role_id?: number
  role?: { id: number }
}

interface Member extends User {
  // Controller show() mengirim role_in_project langsung (bukan dalam pivot)
  role_in_project?: number | string
  // Untuk backward compat jika ada endpoint lain yang pakai pivot
  pivot?: {
    role_in_project?: number | string
  }
}

interface Task {
  id: number
  title: string
  status: string
  due_date?: string
  user?: User
}

interface Post {
  id: number
  content: string
  user_id: number
  user?: User
  created_at: string
}

interface ChatMessage {
  id: number
  message: string
  user_id: number
  user?: User
  created_at: string
}

interface Project {
  id: number
  name: string
  members?: Member[]
  tasks?: Task[]
  posts?: Post[]
  department?: { name: string }
  start_date?: string
  end_date?: string
}

/* =========================
   COMPOSABLE
========================= */

export function useProjectDetail() {
  const route = useRoute()
  const router = useRouter()

  const project: Ref<Project | null> = ref<Project | null>(null)
  const loading = ref<boolean>(true)
  const currentTab = ref<string>('stream')
  const isEditingProject = ref<boolean>(false)

  const newMessage = ref<string>('')
  const isSubmitting = ref<boolean>(false)

  const newChatMessage = ref<string>('')
  const chatMessages = ref<ChatMessage[]>([])
  const chatContainer = ref<HTMLDivElement | null>(null)

  let chatInterval: ReturnType<typeof setInterval> | null = null
  let isFetchingChat = false

  /* =========================
     AUTH
  ========================= */

  // Baca sekali dari sessionStorage, bukan tiap computed evaluation
  const currentUser = ref<User>((() => {
    const raw = sessionStorage.getItem('user_data')
    if (!raw) return {} as User
    try { return JSON.parse(raw) as User } catch { return {} as User }
  })())

  const globalRole = computed<number>(() => {
    const roleId = currentUser.value?.role_id ?? currentUser.value?.role?.id
    return roleId ? Number(roleId) : 99
  })

  // Resolve role_in_project current user sebagai number
  // Handle string dari API (e.g. "3") dan global admin
  const currentProjectRoleId = computed<number | null>(() => {
    // Global admin/superadmin → owner penuh
    if (globalRole.value === 1 || globalRole.value === 2) {
      return PROJECT_ROLES.OWNER
    }

    const members = project.value?.members ?? []
    const currentId = currentUser.value?.id

    if (!currentId) return null

    // Bandingkan sebagai string agar aman (API kadang return id sebagai string)
    const member = members.find(
      (m: Member) => String(m.id) === String(currentId)
    )

    if (!member) return null

    // Controller show() mengirim role_in_project langsung di member, bukan dalam pivot
    const raw = member?.role_in_project ?? member?.pivot?.role_in_project
    if (raw === undefined || raw === null || raw === '') return null

    const id = Number(raw)
    return ROLE_CONFIG[id] ? id : null
  })

  const canManageProject = computed<boolean>(() =>
    currentProjectRoleId.value === PROJECT_ROLES.OWNER ||
    currentProjectRoleId.value === PROJECT_ROLES.MANAGER
  )

  const canDeleteProject = computed<boolean>(() =>
    currentProjectRoleId.value === PROJECT_ROLES.OWNER
  )

  // Forum (stream): owner, manager, contributor — bukan stakeholder
  const canPostContent = computed<boolean>(() =>
    currentProjectRoleId.value !== null &&
    currentProjectRoleId.value !== PROJECT_ROLES.STAKEHOLDER
  )

  // Chat: semua member terdaftar termasuk stakeholder
  const canChat = computed<boolean>(() =>
    currentProjectRoleId.value !== null
  )

  /* =========================
     ROLE HELPERS
  ========================= */

  const getMemberRoleId = (member: Member): number | null => {
    // Controller show() flatten role_in_project langsung ke member, bukan dalam pivot
    const raw = member?.role_in_project ?? member?.pivot?.role_in_project
    if (raw === undefined || raw === null || raw === '') return null
    const id = Number(raw)
    return ROLE_CONFIG[id] ? id : null
  }

  const getMemberRoleName = (member: Member): string => {
    const id = getMemberRoleId(member)
    return id !== null ? ROLE_CONFIG[id].label : 'Tamu'
  }

  const getMemberRoleClass = (member: Member): string => {
    const id = getMemberRoleId(member)
    return id !== null
      ? ROLE_CONFIG[id].color
      : 'text-slate-500 border-slate-700 bg-slate-800'
  }

  // Badge role current user di hero header
  const currentRoleLabel = computed<string>(() =>
    currentProjectRoleId.value !== null
      ? ROLE_CONFIG[currentProjectRoleId.value].label
      : 'Tamu'
  )

  const currentRoleClass = computed<string>(() =>
    currentProjectRoleId.value !== null
      ? ROLE_CONFIG[currentProjectRoleId.value].color
      : 'text-slate-500 border-slate-700 bg-slate-800'
  )

  /* =========================
     FORMAT HELPERS
  ========================= */

  const formatDate = (date?: string): string => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  const formatTime = (date?: string): string => {
    if (!date) return ''
    return new Date(date).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    })
  }

  /* =========================
     TABS
  ========================= */

  const tabs = [
    {
      key: 'stream',
      label: 'Forum',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
    },
    {
      key: 'tasks',
      label: 'Tugas',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      key: 'people',
      label: 'Tim',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ]

  /* =========================
     TASK STATS
  ========================= */

  const totalTaskCount = computed<number>(() =>
    project.value?.tasks?.length ?? 0
  )

  const doneTaskCount = computed<number>(() =>
    project.value?.tasks?.filter((t: Task) => t.status === 'done').length ?? 0
  )

  const taskProgressPercent = computed<number>(() => {
    if (totalTaskCount.value === 0) return 0
    return Math.round((doneTaskCount.value / totalTaskCount.value) * 100)
  })

  /* =========================
     FETCH PROJECT
  ========================= */

  const fetchProjectDetail = async (): Promise<void> => {
    try {
      loading.value = true
      const res = await apiClient.get(`/projects/${route.params.id}`)
      project.value = (res.data.data ?? res.data) as Project

      try { await fetchChatMessages() } catch { /* ignore */ }
    } catch (error) {
      console.error('Failed fetch project', error)
      router.push('/projects')
    } finally {
      loading.value = false
    }
  }

  /* =========================
     STREAM
  ========================= */

  const postToStream = async (): Promise<void> => {
    if (!newMessage.value.trim() || !project.value) return
    try {
      isSubmitting.value = true
      const res = await apiClient.post(
        `/projects/${route.params.id}/posts`,
        { content: newMessage.value }
      )
      if (!project.value.posts) project.value.posts = []
      project.value.posts.unshift(res.data.data ?? res.data)
      newMessage.value = ''
    } finally {
      isSubmitting.value = false
    }
  }

  const deletePost = async (postId: number): Promise<void> => {
    if (!project.value) return
    if (!confirm('Hapus postingan ini?')) return
    await apiClient.delete(`/projects/${route.params.id}/posts/${postId}`)
    project.value.posts = project.value.posts?.filter((p: Post) => p.id !== postId) ?? []
  }

  /* =========================
     CHAT
  ========================= */

  const fetchChatMessages = async (): Promise<void> => {
    if (isFetchingChat) return
    isFetchingChat = true
    try {
      const res = await apiClient.get(`/projects/${route.params.id}/chats`)
      chatMessages.value = res.data.data ?? res.data
      const el = chatContainer.value
      if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 120) {
        scrollToBottom()
      }
    } finally {
      isFetchingChat = false
    }
  }

  const sendChatMessage = async (): Promise<void> => {
    if (!newChatMessage.value.trim()) return
    const message = newChatMessage.value
    newChatMessage.value = ''
    const res = await apiClient.post(
      `/projects/${route.params.id}/chats`,
      { message }
    )
    chatMessages.value.push(res.data.data ?? res.data)
    scrollToBottom()
  }

  const scrollToBottom = (): void => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  }

  /* =========================
     MEMBERS
  ========================= */

  const allUsers = ref<User[]>([])
  const newMemberId = ref<number | ''>('')
  const newMemberRole = ref<number>(PROJECT_ROLES.CONTRIBUTOR)
  const isAddingMember = ref<boolean>(false)

  const availableUsers = computed<User[]>(() => {
    const memberIds = new Set(project.value?.members?.map(m => m.id) ?? [])
    return allUsers.value.filter(u => !memberIds.has(u.id))
  })

  const fetchAllUsers = async (): Promise<void> => {
    if (allUsers.value.length > 0) return
    try {
      const res = await apiClient.get('/users')
      allUsers.value = res.data.data ?? res.data
    } catch (error) {
      console.error('Failed to fetch users', error)
    }
  }

  const addMember = async (): Promise<void> => {
    if (!newMemberId.value || !project.value) return
    try {
      isAddingMember.value = true
      await apiClient.post(`/projects/${route.params.id}/members`, {
        user_id: newMemberId.value,
        role_in_project: newMemberRole.value
      })
      // Pakai data dari allUsers agar name/email langsung tersedia tanpa reload
      const userToAdd = allUsers.value.find(u => u.id === newMemberId.value)
      if (userToAdd) {
        if (!project.value.members) project.value.members = []
        project.value.members.push({
          ...userToAdd,
          pivot: { role_in_project: newMemberRole.value }
        })
      }
      newMemberId.value = ''
      newMemberRole.value = PROJECT_ROLES.CONTRIBUTOR
    } catch (error) {
      console.error('Failed to add member', error)
    } finally {
      isAddingMember.value = false
    }
  }

  const removeMember = async (memberId: number): Promise<void> => {
    if (!project.value) return
    if (!confirm('Keluarkan anggota ini?')) return
    await apiClient.delete(`/projects/${route.params.id}/members/${memberId}`)
    project.value.members = project.value.members?.filter((m: Member) => m.id !== memberId) ?? []
  }

  /* =========================
     TASK MODAL (Create)
  ========================= */

  const showTaskModal = ref<boolean>(false)
  const isSubmittingTask = ref<boolean>(false)

  const taskForm = ref({
    title: '',
    description: '',
    priority: 'medium',
    status: 'todo',
    due_date: '',
    user_id: '' as number | ''
  })

  const openTaskModal = (): void => {
    taskForm.value = {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      user_id: ''
    }
    showTaskModal.value = true
  }

  const closeTaskModal = (): void => {
    showTaskModal.value = false
  }

  const saveTask = async (): Promise<void> => {
    if (!taskForm.value.title.trim() || !taskForm.value.due_date || !taskForm.value.user_id) return
    try {
      isSubmittingTask.value = true
      const res = await apiClient.post(`/projects/${route.params.id}/tasks`, {
        ...taskForm.value,
        project_id: route.params.id
      })
      if (!project.value!.tasks) project.value!.tasks = []
      project.value!.tasks.push(res.data.data ?? res.data)
      closeTaskModal()
    } catch (error) {
      console.error('Failed to create task', error)
    } finally {
      isSubmittingTask.value = false
    }
  }

  /* =========================
     DELETE PROJECT
  ========================= */

  const handleDeleteProject = async (): Promise<void> => {
    if (!confirm('Hapus seluruh proyek ini?')) return
    await apiClient.delete(`/projects/${route.params.id}`)
    router.push('/projects')
  }

  /* =========================
     LIFECYCLE
  ========================= */

  watch(
    () => route.params.id,
    (id) => { if (id) fetchProjectDetail() },
    { immediate: true }
  )

  watch(currentTab, (val: string) => {
    if (val === 'chat') {
      fetchChatMessages()
      chatInterval = setInterval(fetchChatMessages, 4000)
    } else {
      if (chatInterval) { clearInterval(chatInterval); chatInterval = null }
    }
    if (val === 'people') fetchAllUsers()
  })

  onUnmounted(() => {
    if (chatInterval) clearInterval(chatInterval)
  })

  /* =========================
     RETURN
  ========================= */

  return {
    // State
    project,
    loading,
    currentTab,
    isEditingProject,
    newMessage,
    isSubmitting,
    newChatMessage,
    chatMessages,
    chatContainer,
    currentUser,

    // Permissions
    canManageProject,
    canDeleteProject,
    canPostContent,
    canChat,

    // Task stats
    totalTaskCount,
    doneTaskCount,
    taskProgressPercent,

    // UI
    tabs,

    // Format helpers
    formatDate,
    formatTime,

    // Role helpers
    getMemberRoleName,
    getMemberRoleClass,
    currentRoleLabel,
    currentRoleClass,

    // Stream
    postToStream,
    deletePost,

    // Chat
    sendChatMessage,

    // Members
    availableUsers,
    newMemberId,
    newMemberRole,
    isAddingMember,
    addMember,
    removeMember,

    // Task modal
    showTaskModal,
    isSubmittingTask,
    taskForm,
    openTaskModal,
    closeTaskModal,
    saveTask,

    // Project
    handleDeleteProject
  }
}