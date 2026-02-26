<template>
  <div class="min-h-screen bg-slate-900 pt-20 pb-12 text-slate-200">
    <div v-if="loading" class="flex flex-col items-center justify-center py-40">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-500 font-bold tracking-widest uppercase text-xs">Menyinkronkan...</p>
    </div>

    <div v-else-if="project" class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl border border-white/10">
        <div class="relative z-10">
          <button @click="$router.push('/projects')" class="flex items-center gap-2 text-indigo-100/70 hover:text-white transition-colors mb-4 text-sm font-bold">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali
          </button>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight mb-2">{{ project.name }}</h1>
          <p class="text-indigo-100 text-lg opacity-80">{{ project.department }}</p>
        </div>
      </div>

      <div class="flex items-center justify-center border-b border-slate-800 mb-8 sticky top-[72px] bg-slate-900/80 backdrop-blur-md z-20">
        <button 
          v-for="tab in ['stream', 'tasks', 'people']" :key="tab"
          @click="currentTab = tab"
          :class="['px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2', 
          currentTab === tab ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300']"
        >
          {{ tab === 'stream' ? 'Forum' : tab === 'tasks' ? 'Daftar Tugas' : 'Anggota Tim' }}
        </button>
      </div>

      <div class="max-w-4xl mx-auto">
        
        <div v-if="currentTab === 'stream'" class="space-y-6 animate-slide-up">
          <div class="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl flex items-center gap-4 shadow-lg">
            <img :src="`https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff`" class="w-10 h-10 rounded-full">
            <div class="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 text-sm cursor-pointer hover:bg-slate-800/50 transition-all">
              Umumkan sesuatu ke tim Anda...
            </div>
          </div>

          <div v-if="project.tasks && project.tasks.length > 0" class="space-y-4">
            <div v-for="task in project.tasks.slice().reverse()" :key="'stream-'+task.id" class="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-start gap-4 hover:border-indigo-500/30 transition-all">
              <div class="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <p class="text-sm text-slate-300">
                    <span class="font-bold text-white">Sistem</span> memposting tugas baru: 
                    <span class="text-indigo-400 font-semibold">{{ task.title }}</span>
                  </p>
                  <span class="text-[10px] text-slate-500 uppercase font-black">Baru saja</span>
                </div>
                <p class="text-xs text-slate-500 mt-1">Silakan cek detail tugas di tab Daftar Tugas.</p>
              </div>
            </div>
          </div>
          <p v-else class="text-center py-20 text-slate-500 italic">Belum ada aktivitas di forum ini.</p>
        </div>

        <div v-if="currentTab === 'tasks'" class="space-y-4 animate-slide-up">
          <div v-if="project.tasks && project.tasks.length > 0" class="grid gap-4">
            <div v-for="task in project.tasks" :key="task.id" class="bg-slate-800/40 border border-slate-700/50 p-5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <h4 class="text-white font-bold group-hover:text-indigo-400 transition-colors">{{ task.title }}</h4>
                  <div class="flex items-center gap-3 mt-1">
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-900 rounded-md border border-slate-700">Status: {{ task.status }}</p>
                    <p v-if="task.due_date" class="text-[10px] text-rose-400 font-bold uppercase tracking-widest">Deadline: {{ task.due_date }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p v-else class="text-center py-20 text-slate-500 italic">Belum ada tugas.</p>
        </div>

        <div v-if="currentTab === 'people'" class="animate-slide-up grid grid-cols-1 md:grid-cols-2 gap-6">
           <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
              <div class="p-5 border-b border-slate-700 bg-slate-800/20 font-black text-[10px] uppercase tracking-widest text-indigo-400">Managers / Owners</div>
              <div class="p-6 space-y-4">
                 <div v-if="managers.length > 0">
                    <div v-for="m in managers" :key="m.id" class="flex items-center gap-4 mb-4 last:mb-0">
                        <img :src="m.avatar" class="w-10 h-10 rounded-full border-2 border-indigo-500/30">
                        <span class="font-bold text-white">{{ m.name }}</span>
                    </div>
                 </div>
                 <p v-else class="text-slate-600 text-sm italic">Tidak ada manager terdaftar.</p>
              </div>
           </div>

           <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl overflow-hidden shadow-xl">
              <div class="p-5 border-b border-slate-700 bg-slate-800/20 font-black text-[10px] uppercase tracking-widest text-slate-400">Team Members</div>
              <div class="p-6 space-y-4">
                 <div v-if="staff.length > 0">
                    <div v-for="s in staff" :key="s.id" class="flex items-center gap-4 mb-4 last:mb-0">
                        <img :src="s.avatar" class="w-10 h-10 rounded-full border-2 border-slate-700">
                        <span class="font-bold text-white">{{ s.name }}</span>
                    </div>
                 </div>
                 <p v-else class="text-slate-600 text-sm italic">Belum ada anggota tim.</p>
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
const currentTab = ref('stream'); // Default tab diubah ke 'stream' agar mirip Classroom

const managers = computed(() => {
  return project.value?.members?.filter(m => m.role_in_project <= 2) || [];
});

const staff = computed(() => {
  return project.value?.members?.filter(m => m.role_in_project > 2) || [];
});

const fetchProjectDetail = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get(`/projects/${route.params.id}`);
    project.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchProjectDetail);
</script>

<style scoped>
.animate-slide-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { transform: translateY(15px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
</style>