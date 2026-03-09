import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { projectService } from '../services'
import type { ChatMessage } from '../services'

export function useProjectChat() {
  const route     = useRoute()
  const projectId = computed(() => Number(route.params.id))

  const messages      = ref<ChatMessage[]>([])
  const newMessage    = ref('')
  const loading       = ref(false)
  const error         = ref('')
  const chatContainer = ref<HTMLElement | null>(null)

  // Simpan id pesan terakhir agar hanya fetch pesan baru (tidak fetch ulang semua)
  let lastId = 0

  const fetchMessages = async () => {
    loading.value = true
    error.value   = ''
    try {
      // Endpoint yang benar: /chats bukan /messages
      // Kirim last_id agar backend hanya return pesan baru
      const res  = await projectService.getChats(projectId.value, lastId)
      const data = Array.isArray(res.data) ? res.data : (res.data as any).data ?? []

      if (data.length > 0) {
        messages.value.push(...data)
        lastId = data[data.length - 1].id
        scrollToBottom()
      }
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat pesan'
    } finally {
      loading.value = false
    }
  }

  const sendMessage = async () => {
    if (!newMessage.value.trim()) return
    try {
      // Field yang dikirim adalah 'message', bukan 'content'
      const res  = await projectService.sendChat(projectId.value, newMessage.value)
      const sent = (res.data as any).data ?? res.data
      messages.value.push(sent)
      lastId = sent.id
      newMessage.value = ''
      scrollToBottom()
    } catch (err: any) {
      error.value = err.message || 'Gagal mengirim pesan'
    }
  }

  const scrollToBottom = () => {
    nextTick(() => {
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    })
  }

  onMounted(fetchMessages)

  return {
    messages, newMessage, loading, error,
    sendMessage, chatContainer,
  }
}