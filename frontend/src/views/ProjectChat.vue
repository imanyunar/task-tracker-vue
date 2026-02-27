<template>
  <div class="min-h-screen bg-slate-900 pt-20 pb-12 text-slate-200 font-sans">
    <div v-if="loading" class="flex flex-col items-center justify-center py-40">
      <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-500 font-bold tracking-widest uppercase text-[10px]">Menyinkronkan...</p>
    </div>

    <div v-else-if="project" class="max-w-6xl mx-auto px-4 sm:px-6">
      <div class="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 mb-8 shadow-2xl border border-white/10 overflow-hidden">
        <div class="relative z-10">
          <button @click="$router.push('/projects')" class="flex items-center gap-2 text-indigo-100/70 hover:text-white transition-colors mb-4 text-xs font-bold uppercase tracking-wider">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Kembali ke Dashboard
          </button>
          <h1 class="text-4xl font-black text-white mb-2 tracking-tight">{{ project.name }}</h1>
          <p class="text-indigo-100/80 max-w-2xl text-sm leading-relaxed">{{ project.description }}</p>
        </div>
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      </div>

      <div class="flex border-b border-slate-800 mb-8 overflow-x-auto no-scrollbar">
        <button 
          v-for="tab in ['forum', 'chat', 'tasks', 'people']" :key="tab"
          @click="currentTab = tab"
          :class="['px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 whitespace-nowrap', 
          currentTab === tab ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' : 'border-transparent text-slate-500 hover:text-slate-300']"
        >
          {{ tab === 'forum' ? 'Forum Pengumuman' : tab === 'chat' ? 'Diskusi Chat' : tab === 'tasks' ? 'Daftar Tugas' : 'Anggota Tim' }}
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div class="lg:col-span-2">
          
          <div v-if="currentTab === 'forum'" class="space-y-6 animate-slide-up">
            <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
              <textarea 
                v-model="newPostContent" 
                placeholder="Tulis pengumuman atau diskusi panjang di sini..."
                class="w-full bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-sm text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all mb-4"
                rows="3"
              ></textarea>
              <div class="flex justify-end">
                <button @click="handleSendPost" :disabled="isSubmitting" class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                  {{ isSubmitting ? 'Mengirim...' : 'Posting ke Forum' }}
                </button>
              </div>
            </div>

            <div v-if="project.posts && project.posts.length > 0" class="space-y-4">
              <div v-for="post in project.posts" :key="post.id" class="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl">
                <div class="flex items-center gap-3 mb-4">
                  <img :src="`https://ui-avatars.com/api/?name=${post.user?.name}&background=4f46e5&color=fff`" class="w-10 h-10 rounded-full border-2 border-slate-700">
                  <div>
                    <p class="text-sm font-bold text-white">{{ post.user?.name }}</p>
                    <p class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{{ new Date(post.created_at).toLocaleString() }}</p>
                  </div>
                </div>
                <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
              </div>
            </div>
            <div v-else class="text-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
               <p class="text-slate-500 text-sm italic">Belum ada pengumuman di forum.</p>
            </div>
          </div>

          <div v-if="currentTab === 'chat'" class="flex flex-col h-[600px] animate-slide-up">
            <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-800/20 border border-slate-700/50 rounded-t-3xl no-scrollbar" ref="chatContainer">
              <div v-for="msg in chatMessages" :key="msg.id" 
                   :class="['flex flex-col', msg.user_id === currentUser.id ? 'items-end' : 'items-start']">
                <div :class="['max-w-[80%] px-4 py-3 rounded-2xl shadow-lg', 
                             msg.user_id === currentUser.id ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200']">
                  <p v-if="msg.user_id !== currentUser.id" class="text-[10px] font-black mb-1 opacity-50 uppercase tracking-widest">{{ msg.user?.name }}</p>
                  <p class="text-sm leading-relaxed">{{ msg.message }}</p>
                </div>
                <span class="text-[9px] text-slate-600 mt-1 font-bold">{{ new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
              </div>
            </div>
            <div class="p-4 bg-slate-800/60 border-x border-b border-slate-700/50 rounded-b-3xl flex gap-2 items-center">
              <input 
                v-model="newChatMessage" 
                @keyup.enter="handleSendChat"
                placeholder="Ketik pesan cepat ke tim..." 
                class="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500"
              >
              <button @click="handleSendChat" class="bg-indigo-600 hover:bg-indigo-500 p-3 rounded-xl transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </div>

        </div>

        <div class="space-y-6">
          <div class="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6">
            <h3 class="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Manajer Proyek</h3>
            <div class="space-y-3">
              <div v-for="m in managers" :key="m.id" class="flex items-center gap-3">
                <img :src="`https://ui-avatars.com/api/?name=${m.name}&background=6366f1&color=fff`" class="w-8 h-8 rounded-full border border-indigo-500/30">
                <span class="text-sm font-bold text-slate-200">{{ m.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useProjectChat } from '../composables/useProjectChat'

const {
  project,
  loading,
  isSubmitting,
  currentTab,
  newPostContent,
  chatMessages,
  newChatMessage,
  chatContainer,
  currentUser,
  managers,
  handleSendPost,
  handleSendChat,
} = useProjectChat()
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.animate-slide-up { animation: slideUp 0.4s ease-out; }
@keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
</style>