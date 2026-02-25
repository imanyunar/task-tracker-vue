<template>
  <div class="p-6 max-w-7xl mx-auto">
    <div class="mb-6">
      <h1 class="text-3xl font-extrabold text-white tracking-tight">
        Project <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Discussion</span>
      </h1>
      <p class="text-slate-400 mt-2 text-sm">Berkomunikasi secara real-time dengan anggota tim dalam proyek ini.</p>
    </div>

    <div class="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[70vh]">
      
      <div class="p-4 bg-slate-800/60 border-b border-slate-700/50 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h2 class="text-white font-bold text-lg leading-tight">Grup Diskusi</h2>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p class="text-xs text-slate-400 font-medium uppercase tracking-wider">Live Polling Active</p>
            </div>
          </div>
        </div>
      </div>

      <div ref="chatContainer" class="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
          <div class="p-4 bg-slate-800/50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <p class="italic">Belum ada percakapan. Mulailah diskusi tim Anda di sini.</p>
        </div>
        
        <div v-for="chat in messages" :key="chat.id" 
             :class="['flex w-full', chat.user_id === authStore.user?.id ? 'justify-end' : 'justify-start']">
          
          <div :class="['flex flex-col max-w-[75%]', chat.user_id === authStore.user?.id ? 'items-end' : 'items-start']">
            <div class="flex items-center gap-2 mb-1 px-1">
              <span class="text-xs font-bold text-slate-300" v-if="chat.user_id !== authStore.user?.id">
                {{ chat.user.name }}
              </span>
              <span class="text-[10px] text-slate-500 font-medium italic">{{ formatTime(chat.created_at) }}</span>
            </div>
            
            <div :class="[
              'px-4 py-3 rounded-2xl text-sm shadow-lg transition-all duration-300 transform hover:scale-[1.01]',
              chat.user_id === authStore.user?.id 
                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none border border-indigo-500/30' 
                : 'bg-slate-800/80 backdrop-blur-md text-slate-200 rounded-tl-none border border-slate-700 hover:border-slate-600'
            ]">
              {{ chat.message }}
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-slate-800/80 border-t border-slate-700/50 backdrop-blur-md">
        <form @submit.prevent="handleSendMessage" class="flex items-center gap-3">
          <div class="relative flex-grow">
            <input 
              v-model="newMessage" 
              type="text" 
              placeholder="Tulis pesan untuk tim..." 
              class="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              :disabled="isSending"
            />
          </div>
          <button 
            type="submit" 
            :disabled="isSending || !newMessage.trim()"
            class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 group"
          >
            <span v-if="isSending" class="animate-pulse">Mengirim...</span>
            <template v-else>
              <span>Kirim</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </template>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { projectService } from '../services'

const route = useRoute()
const authStore = useAuthStore()
const projectId = route.params.id

const messages = ref([])
const newMessage = ref('')
const lastMessageId = ref(0)
const isSending = ref(false)
const chatContainer = ref(null)
let pollInterval = null

// Scroll ke pesan terbaru
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTo({
      top: chatContainer.value.scrollHeight,
      behavior: 'smooth'
    })
  }
}

// Format waktu dari server
const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Polling pesan baru
const fetchMessages = async () => {
  try {
    const response = await projectService.getMessages(projectId, lastMessageId.value)
    const newMessages = response.data
    
    if (newMessages.length > 0) {
      messages.value.push(...newMessages)
      lastMessageId.value = newMessages[newMessages.length - 1].id
      scrollToBottom()
    }
  } catch (err) {
    console.error('Polling error:', err)
  }
}

// Kirim pesan baru
const handleSendMessage = async () => {
  if (!newMessage.value.trim() || isSending.value) return

  const messageText = newMessage.value
  newMessage.value = '' 
  isSending.value = true

  try {
    // 1. Kirim ke server
    await projectService.sendMessage(projectId, messageText)
    
    // 2. JANGAN push manual di sini. 
    // Langsung panggil fetchMessages untuk mengambil data resmi dari server
    await fetchMessages() 
    
  } catch (err) {
    console.error(err)
    alert('Gagal mengirim pesan.')
    newMessage.value = messageText 
  } finally {
    isSending.value = false
  }
}
onMounted(() => {
  fetchMessages()
  // Polling setiap 3 detik (bisa diatur sesuai beban server)
  pollInterval = setInterval(fetchMessages, 3000)
})

onUnmounted(() => {
  if (pollInterval) clearInterval(pollInterval)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569;
}

/* Animasi gelembung chat baru */
.flex-grow > div {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>