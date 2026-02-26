<template>
  <div class="min-h-screen bg-slate-900 pt-20 pb-12 text-slate-200">
    <div v-if="loading" class="flex flex-col items-center justify-center py-40">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Memuat Proyek...</p>
    </div>

    <div v-else-if="project" class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl border border-white/10">
        <button @click="$router.push('/projects')" class="flex items-center gap-2 text-indigo-100/70 hover:text-white mb-4 text-sm font-bold transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali
        </button>
        <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">{{ project.name }}</h1>
        <p class="text-indigo-100 text-lg opacity-80">{{ project.department }}</p>
      </div>

      <div class="flex items-center justify-center border-b border-slate-800 mb-8 sticky top-[72px] bg-slate-900/80 backdrop-blur-md z-20">
        <button 
          v-for="tab in ['stream', 'tasks', 'people']" :key="tab"
          @click="currentTab = tab"
          :class="['px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2', 
          currentTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']"
        >
          {{ tab === 'stream' ? 'Forum' : tab === 'tasks' ? 'Tugas' : 'Anggota' }}
        </button>
      </div>

      <div class="max-w-4xl mx-auto">
        
        <div v-if="currentTab === 'stream'" class="space-y-6 animate-slide-up">
          <div class="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl shadow-lg">
            <div class="flex items-start gap-4 mb-3">
              <img src="https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff" class="w-10 h-10 rounded-full shrink-0">
              <textarea 
                v-model="newMessage"
                placeholder="Tuliskan sesuatu untuk tim..." 
                class="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none min-h-[100px]"
              ></textarea>
            </div>
            <div class="flex justify-end">
              <button 
                @click="postToStream" 
                :disabled="!newMessage || newMessage.trim() === '' || isSubmitting"
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
                  <p class="text-[10px] text-slate-500 uppercase font-black">{{ post.created_at ? new Date(post.created_at).toLocaleDateString() : '' }}</p>
                </div>
              </div>
              <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
            </div>
          </div>
          <p v-else class="text-center py-20 text-slate-500 italic text-sm">Belum ada diskusi di forum ini.</p>
        </div>

        <div v-if="currentTab === 'tasks'" class="space-y-4 animate-slide-up">
           <div v-if="project.tasks && project.tasks.length > 0" class="grid gap-4">
              <div v-for="task in project.tasks" :key="task.id" class="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  </div>
                  <h4 class="text-white font-bold">{{ task.title }}</h4>
                </div>
                <span class="text-[10px] px-3 py-1 bg-slate-900 border border-slate-700 rounded-full text-slate-400 uppercase font-black">{{ task.status }}</span>
              </div>
           </div>
           <p v-else class="text-center py-20 text-slate-500 italic">Belum ada tugas.</p>
        </div>

        <div v-if="currentTab === 'people'" class="animate-slide-up grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl p-6">
            <h3 class="text-indigo-400 text-[10px] font-black uppercase mb-4 tracking-widest">Managers</h3>
            <div v-for="m in managers" :key="m.id" class="flex items-center gap-4 mb-4">
              <img :src="m.avatar" class="w-10 h-10 rounded-full border-2 border-indigo-500/30">
              <span class="font-bold text-white">{{ m.name }}</span>
            </div>
          </div>
          <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl p-6">
            <h3 class="text-slate-400 text-[10px] font-black uppercase mb-4 tracking-widest">Staff</h3>
            <div v-for="s in staff" :key="s.id" class="flex items-center gap-4 mb-4">
              <img :src="s.avatar" class="w-10 h-10 rounded-full border-2 border-slate-700">
              <span class="font-bold text-white">{{ s.name }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '../services/api';

const route = useRoute();
const project = ref(null);
const loading = ref(true);
const currentTab = ref('stream');

// Form States (PENTING: Pastikan ini ada agar tidak error putih)
const newMessage = ref('');
const isSubmitting = ref(false);

const managers = computed(() => {
  if (!project.value || !project.value.members) return [];
  return project.value.members.filter(m => m.role_in_project <= 2);
});

const staff = computed(() => {
  if (!project.value || !project.value.members) return [];
  return project.value.members.filter(m => m.role_in_project > 2);
});

const fetchProjectDetail = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/projects/${route.params.id}`);
    // Laravel mengembalikan { success: true, data: { ... } }
    project.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  } finally {
    loading.value = false;
  }
};

const postToStream = async () => {
  if (!newMessage.value.trim()) return;
  
  try {
    isSubmitting.value = true;
    const response = await apiClient.post(`/projects/${route.params.id}/posts`, {
      content: newMessage.value
    });

    // Masukkan post baru ke array
    if (!project.value.posts) {
      project.value.posts = [];
    }
    project.value.posts.unshift(response.data.data);
    
    newMessage.value = ''; // Kosongkan input
  } catch (error) {
    console.error("Gagal posting:", error);
    alert("Gagal mengirim postingan. Pastikan tabel posts sudah ada.");
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  fetchProjectDetail();
});
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { 
  from { transform: translateY(20px); opacity: 0; } 
  to { transform: translateY(0); opacity: 1; } 
}
</style>