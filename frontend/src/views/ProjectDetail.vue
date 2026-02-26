<template>
  <div class="min-h-screen bg-slate-900 pt-20 pb-12 text-slate-200">
    <div v-if="loading" class="flex flex-col items-center justify-center py-40">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Memuat Proyek...</p>
    </div>

    <div v-else-if="project" class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl border border-white/10 overflow-hidden">
        <div class="relative z-10">
          <button @click="$router.push('/projects')" class="flex items-center gap-2 text-indigo-100/70 hover:text-white mb-4 text-sm font-bold transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Dashboard
          </button>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">{{ project.name }}</h1>
          <p class="text-indigo-100 text-lg opacity-80">{{ project.department?.name || 'General Project' }}</p>
        </div>
        <div class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div class="flex items-center justify-center border-b border-slate-800 mb-8 sticky top-[72px] bg-slate-900/80 backdrop-blur-md z-20 overflow-x-auto no-scrollbar">
        <button 
          v-for="tab in ['stream', 'chat', 'tasks', 'people']" :key="tab"
          @click="currentTab = tab"
          :class="['px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap', 
          currentTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']"
        >
          {{ tab === 'stream' ? 'Forum' : tab === 'chat' ? 'Diskusi Chat' : tab === 'tasks' ? 'Tugas' : 'Anggota' }}
        </button>
      </div>

      <div class="max-w-4xl mx-auto">
        
        <div v-if="currentTab === 'stream'" class="space-y-6 animate-slide-up">
          <div class="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl shadow-lg">
            <div class="flex items-start gap-4 mb-3">
              <img :src="`https://ui-avatars.com/api/?name=${currentUser.name}&background=4f46e5&color=fff`" class="w-10 h-10 rounded-full shrink-0">
              <textarea 
                v-model="newMessage"
                placeholder="Bagikan sesuatu dengan tim..." 
                class="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none min-h-[100px]"
              ></textarea>
            </div>
            <div class="flex justify-end">
              <button 
                @click="postToStream" 
                :disabled="!newMessage.trim() || isSubmitting"
                class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2 rounded-xl text-xs font-black uppercase transition-all"
              >
                {{ isSubmitting ? 'Mengirim...' : 'Posting' }}
              </button>
            </div>
          </div>

          <div v-if="project.posts && project.posts.length > 0" class="space-y-4">
            <div v-for="post in project.posts" :key="post.id" class="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl shadow-sm">
              <div class="flex items-center gap-3 mb-4">
                <img :src="`https://ui-avatars.com/api/?name=${post.user?.name || 'User'}&background=4f46e5&color=fff`" class="w-9 h-9 rounded-full">
                <div>
                  <p class="text-sm font-bold text-white">{{ post.user?.name || 'Unknown' }}</p>
                  <p class="text-[10px] text-slate-500 uppercase font-black">{{ formatDate(post.created_at) }}</p>
                </div>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
            </div>
          </div>
          <p v-else class="text-center py-20 text-slate-500 italic text-sm">Belum ada diskusi di forum ini.</p>
        </div>

        <div v-if="currentTab === 'chat'" class="animate-slide-up bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-2xl">
          <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" ref="chatContainer">
            <div v-for="chat in chatMessages" :key="chat.id" 
              :class="['flex flex-col', chat.user_id === currentUser.id ? 'items-end' : 'items-start']">
              <div class="flex items-center gap-2 mb-1 px-1">
                <span class="text-[9px] font-black uppercase text-slate-500">{{ chat.user?.name }}</span>
              </div>
              <div :class="['max-w-[85%] px-4 py-2 rounded-2xl text-sm shadow-sm relative group', 
                chat.user_id === currentUser.id ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-700 text-slate-200 rounded-tl-none']">
                {{ chat.message }}
                <p class="text-[8px] opacity-60 mt-1 text-right italic">{{ formatTime(chat.created_at) }}</p>
              </div>
            </div>
            <p v-if="chatMessages.length === 0" class="text-center text-slate-600 text-xs py-20 italic">Belum ada chat. Mulai percakapan sekarang!</p>
          </div>
          
          <div class="p-4 bg-slate-900/80 border-t border-slate-700 flex gap-2 items-center">
            <input 
              v-model="newChatMessage" 
              @keyup.enter="sendChatMessage"
              placeholder="Ketik pesan cepat..." 
              class="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
            />
            <button @click="sendChatMessage" class="bg-indigo-600 p-3 rounded-2xl hover:bg-indigo-500 transition-all shadow-lg active:scale-95">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>

        <div v-if="currentTab === 'tasks'" class="space-y-4 animate-slide-up">
           <div v-if="project.tasks && project.tasks.length > 0" class="grid gap-4">
              <div v-for="task in project.tasks" :key="task.id" class="group bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between hover:bg-slate-800/60 transition-all border-l-4 border-l-transparent hover:border-l-indigo-500">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <div>
                    <h4 class="text-white font-bold">{{ task.title }}</h4>
                    <p class="text-[10px] text-slate-500 uppercase font-black tracking-widest">Status: {{ task.status }}</p>
                  </div>
                </div>
                <div class="text-right">
                    <span :class="['text-[10px] px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-slate-400 uppercase font-black']">
                        {{ task.status }}
                    </span>
                </div>
              </div>
           </div>
           <p v-else class="text-center py-20 text-slate-500 italic">Belum ada tugas yang ditambahkan.</p>
        </div>

        <div v-if="currentTab === 'people'" class="animate-slide-up grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl p-6">
            <h3 class="text-indigo-400 text-[10px] font-black uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <span class="w-2 h-2 bg-indigo-500 rounded-full"></span>
                Managers
            </h3>
            <div v-for="m in managers" :key="m.id" class="flex items-center gap-4 mb-4 hover:translate-x-1 transition-transform">
              <img :src="`https://ui-avatars.com/api/?name=${m.name}&background=4f46e5&color=fff`" class="w-10 h-10 rounded-full border-2 border-indigo-500/30">
              <div>
                  <p class="font-bold text-white text-sm">{{ m.name }}</p>
                  <p class="text-[9px] text-slate-500 uppercase font-bold">{{ m.email }}</p>
              </div>
            </div>
          </div>
          <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl p-6">
            <h3 class="text-slate-400 text-[10px] font-black uppercase mb-6 tracking-[0.2em] flex items-center gap-2">
                <span class="w-2 h-2 bg-slate-600 rounded-full"></span>
                Staff Members
            </h3>
            <div v-for="s in staff" :key="s.id" class="flex items-center gap-4 mb-4 hover:translate-x-1 transition-transform">
              <img :src="`https://ui-avatars.com/api/?name=${s.name}&background=334155&color=fff`" class="w-10 h-10 rounded-full border-2 border-slate-700">
              <div>
                  <p class="font-bold text-white text-sm">{{ s.name }}</p>
                  <p class="text-[9px] text-slate-500 uppercase font-bold">{{ s.email }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../services/api';

const route = useRoute();
const project = ref(null);
const loading = ref(true);
const currentTab = ref('stream');

// Form States
const newMessage = ref('');
const isSubmitting = ref(false);
const newChatMessage = ref('');
const chatMessages = ref([]);
const chatContainer = ref(null);
const currentUser = ref(JSON.parse(sessionStorage.getItem('user_data') || '{}'));

// Interval untuk Polling Chat
let chatInterval = null;

// Filter Members berdasarkan Role
const managers = computed(() => {
  if (!project.value || !project.value.members) return [];
  return project.value.members.filter(m => {
      // Cek di pivot (jika dari relation) atau di level object langsung
      const role = m.pivot?.role_in_project || m.role_in_project;
      return role <= 2;
  });
});

const staff = computed(() => {
  if (!project.value || !project.value.members) return [];
  return project.value.members.filter(m => {
      const role = m.pivot?.role_in_project || m.role_in_project;
      return role > 2;
  });
});

// Fetching Data Proyek
const fetchProjectDetail = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/projects/${route.params.id}`);
    project.value = response.data.data;
    
    // Ambil data chat pertama kali
    await fetchChatMessages();
  } catch (error) {
    console.error("Gagal mengambil data proyek:", error);
  } finally {
    loading.value = false;
  }
};

// Logika Stream (Forum)
const postToStream = async () => {
  if (!newMessage.value.trim()) return;
  
  try {
    isSubmitting.value = true;
    const response = await apiClient.post(`/projects/${route.params.id}/posts`, {
      content: newMessage.value
    });

    if (!project.value.posts) project.value.posts = [];
    project.value.posts.unshift(response.data.data);
    newMessage.value = '';
  } catch (error) {
    console.error("Gagal posting:", error);
    alert("Gagal mengirim postingan.");
  } finally {
    isSubmitting.value = false;
  }
};

// Logika Diskusi Chat
const fetchChatMessages = async () => {
  try {
    const response = await apiClient.get(`/projects/${route.params.id}/chats`);
    chatMessages.value = response.data;
    if (currentTab.value === 'chat') {
        scrollToBottom();
    }
  } catch (error) {
    console.warn("Fitur chat tidak tersedia atau error.");
  }
};

const sendChatMessage = async () => {
  if (!newChatMessage.value.trim()) return;
  
  const tempMessage = newChatMessage.value;
  newChatMessage.value = ''; // Clear input langsung biar terasa cepat (optimistic UI)

  try {
    const response = await apiClient.post(`/projects/${route.params.id}/chats`, {
      message: tempMessage
    });
    chatMessages.value.push(response.data);
    scrollToBottom();
  } catch (error) {
    console.error("Gagal kirim chat:", error);
    newChatMessage.value = tempMessage; // Kembalikan teks jika gagal
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// Utils
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const formatTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });
};

onMounted(() => {
  fetchProjectDetail();
  // Jalankan polling chat setiap 4 detik
  chatInterval = setInterval(fetchChatMessages, 4000);
});

onUnmounted(() => {
  if (chatInterval) clearInterval(chatInterval);
});
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { 
  from { transform: translateY(20px); opacity: 0; } 
  to { transform: translateY(0); opacity: 1; } 
}

.custom-scrollbar::-webkit-scrollbar { width: 5px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 10px; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>