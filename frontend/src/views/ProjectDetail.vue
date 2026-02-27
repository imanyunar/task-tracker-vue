<template>
  <div class="min-h-screen bg-[#0a0a0f] pt-20 pb-16 text-slate-200">

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-52 gap-5">
      <div class="relative w-16 h-16">
        <div class="absolute inset-0 rounded-full border-2 border-violet-500/20"></div>
        <div class="absolute inset-0 rounded-full border-2 border-t-violet-500 border-r-violet-400 animate-spin"></div>
        <div class="absolute inset-2 rounded-full border border-t-fuchsia-500/50 animate-spin" style="animation-direction:reverse;animation-duration:0.8s"></div>
      </div>
      <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Memuat Proyek</p>
    </div>

    <div v-else-if="project" class="max-w-6xl mx-auto px-4 sm:px-6">

      <!-- ===== HERO HEADER ===== -->
      <div class="relative mb-8 rounded-[2rem] overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-violet-950 via-indigo-950 to-slate-950"></div>
        <div class="absolute inset-0 opacity-30" style="background-image: radial-gradient(ellipse at 20% 50%, #7c3aed 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, #4f46e5 0%, transparent 50%)"></div>
        <div class="absolute inset-0" style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.02\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');"></div>

        <div class="relative z-10 p-8 md:p-10">
          <!-- Back -->
          <button @click="$router.push('/projects')" class="inline-flex items-center gap-2 text-violet-300/60 hover:text-violet-200 mb-6 text-xs font-bold transition-all group">
            <svg class="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Semua Proyek
          </button>

          <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div>
              <div class="inline-flex items-center gap-2 mb-4">
                <span :class="['px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border backdrop-blur-md', currentRoleClass]">
                  {{ currentRoleLabel }}
                </span>
                <span class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border bg-white/5 border-white/10 text-white/50">
                  {{ project.members?.length || 0 }} Anggota
                </span>
              </div>

              <h1 class="text-4xl md:text-6xl font-black text-white tracking-tight leading-none mb-3" style="font-style: italic; letter-spacing: -0.02em;">
                {{ project.name }}
              </h1>

              <div class="flex flex-wrap items-center gap-3 text-sm text-white/50">
                <span v-if="project.department?.name" class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {{ project.department.name }}
                </span>
                <span v-if="project.start_date" class="flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  {{ formatDate(project.start_date) }} — {{ formatDate(project.end_date) }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button v-if="canDeleteProject" @click="handleDeleteProject"
                class="flex items-center gap-2 px-5 py-3 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 text-rose-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Hapus
              </button>
              <button v-if="canManageProject" @click="isEditingProject = true"
                class="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Proyek
              </button>
            </div>
          </div>

          <!-- Progress -->
          <div class="mt-8 pt-6 border-t border-white/10">
            <div class="flex justify-between items-center mb-2">
              <span class="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Progress Tugas</span>
              <span class="text-[11px] font-black text-violet-300">{{ taskProgressPercent }}%</span>
            </div>
            <div class="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-700"
                :style="{ width: taskProgressPercent + '%' }"></div>
            </div>
            <div class="flex gap-6 mt-3 text-[9px] font-black uppercase tracking-widest text-white/30">
              <span>{{ doneTaskCount }} Selesai</span>
              <span>{{ totalTaskCount - doneTaskCount }} Berjalan</span>
              <span>{{ totalTaskCount }} Total</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== TABS ===== -->
      <div class="flex items-center gap-1 mb-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-1.5 backdrop-blur-md sticky top-[72px] z-20 overflow-x-auto no-scrollbar">
        <button v-for="tab in tabs" :key="tab.key" @click="currentTab = tab.key"
          :class="['flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 justify-center',
            currentTab === tab.key ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/50' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50']">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="tab.icon" /></svg>
          {{ tab.label }}
        </button>
      </div>

      <!-- ===== TAB CONTENT ===== -->
      <div class="max-w-4xl mx-auto">

        <!-- FORUM -->
        <div v-if="currentTab === 'stream'" class="space-y-5 animate-slide-up">
          <div v-if="canPostContent" class="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur-sm">
            <div class="flex items-start gap-4">
              <img :src="`https://ui-avatars.com/api/?name=${currentUser.name || 'U'}&background=7c3aed&color=fff&bold=true`" class="w-10 h-10 rounded-xl flex-shrink-0 mt-1">
              <div class="flex-1">
                <textarea v-model="newMessage" placeholder="Tulis pengumuman atau diskusi baru..."
                  class="w-full bg-slate-800/60 border border-slate-700/60 rounded-2xl px-5 py-4 text-white text-sm focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 outline-none transition-all resize-none min-h-[100px] placeholder-slate-600"></textarea>
                <div class="flex justify-end mt-3">
                  <button @click="postToStream" :disabled="!newMessage.trim() || isSubmitting"
                    class="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-900/40">
                    {{ isSubmitting ? 'Mengirim...' : 'Posting' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!project.posts?.length" class="text-center py-20 text-slate-600">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            <p class="text-xs font-black uppercase tracking-widest">Belum ada postingan</p>
          </div>

          <div v-for="post in project.posts" :key="post.id"
            class="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl group hover:border-slate-700 transition-all">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-3">
                <img :src="`https://ui-avatars.com/api/?name=${post.user?.name}&background=4f46e5&color=fff&bold=true`" class="w-10 h-10 rounded-xl">
                <div>
                  <p class="text-sm font-bold text-white leading-tight">{{ post.user?.name }}</p>
                  <p class="text-[9px] text-slate-500 uppercase font-black tracking-wider">{{ formatDate(post.created_at) }}</p>
                </div>
              </div>
              <button v-if="canManageProject || post.user_id === currentUser.id"
                @click="deletePost(post.id)"
                class="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-rose-500/10">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="1.5" stroke-linecap="round"/></svg>
              </button>
            </div>
            <p class="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{{ post.content }}</p>
          </div>
        </div>

        <!-- CHAT -->
        <div v-if="currentTab === 'chat'" class="animate-slide-up">
          <div class="bg-slate-900/60 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col shadow-2xl" style="height: 620px;">
            <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar" ref="chatContainer">
              <div v-if="!chatMessages.length" class="h-full flex flex-col items-center justify-center text-slate-600">
                <svg class="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                <p class="text-[10px] font-black uppercase tracking-widest">Mulai percakapan</p>
              </div>
              <div v-for="chat in chatMessages" :key="chat.id"
                :class="['flex flex-col', chat.user_id === currentUser.id ? 'items-end' : 'items-start']">
                <span class="text-[9px] font-black uppercase text-slate-500 mb-1.5 px-2 tracking-widest">{{ chat.user?.name }}</span>
                <div :class="['max-w-[78%] px-5 py-3 text-sm shadow-xl',
                  chat.user_id === currentUser.id
                    ? 'bg-violet-600 text-white rounded-2xl rounded-tr-sm'
                    : 'bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm border border-slate-700']">
                  {{ chat.message }}
                  <p class="text-[8px] opacity-50 mt-1.5 text-right font-bold">{{ formatTime(chat.created_at) }}</p>
                </div>
              </div>
            </div>
            <div v-if="canChat" class="p-4 bg-slate-950/80 border-t border-slate-800 flex gap-3 items-center">
              <input v-model="newChatMessage" @keyup.enter="sendChatMessage"
                placeholder="Ketik pesan..."
                class="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-5 py-3.5 text-sm text-white focus:ring-2 focus:ring-violet-500/50 outline-none placeholder-slate-600 transition-all" />
              <button @click="sendChatMessage"
                class="bg-violet-600 hover:bg-violet-500 p-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-violet-900/40">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
            <div v-else class="p-4 bg-slate-950/60 border-t border-slate-800 text-center text-[10px] font-black uppercase tracking-widest text-slate-600">
              Anda tidak dapat mengirim pesan
            </div>
          </div>
        </div>

        <!-- TASKS -->
        <div v-if="currentTab === 'tasks'" class="animate-slide-up">
          <div class="flex justify-between items-center mb-6">
            <div>
              <h3 class="text-white font-black text-xl italic">Daftar Tugas</h3>
              <p class="text-xs text-slate-500 mt-1">{{ project.tasks?.length || 0 }} tugas dalam proyek ini</p>
            </div>
            <button v-if="canManageProject" @click="openTaskModal"
              class="bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-900/40 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" /></svg>
              Tambah Tugas
            </button>
          </div>

          <div v-if="!project.tasks?.length" class="text-center py-20 text-slate-600">
            <svg class="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            <p class="text-xs font-black uppercase tracking-widest">Belum ada tugas</p>
          </div>

          <div class="space-y-3">
            <div v-for="task in project.tasks" :key="task.id" @click="$router.push(`/tasks/${task.id}`)"
              class="group bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:bg-slate-900/80 hover:border-violet-500/30 transition-all cursor-pointer">
              <div class="flex items-center gap-4">
                <div :class="['w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 transition-all group-hover:scale-110',
                  task.status === 'done' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                  task.status === 'doing' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  'bg-slate-800 border-slate-700 text-slate-500']">
                  <svg v-if="task.status === 'done'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" /></svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <h4 class="text-white font-bold text-sm group-hover:text-violet-300 transition-colors leading-tight">{{ task.title }}</h4>
                  <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">{{ task.user?.name }} · {{ formatDate(task.due_date) }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span :class="['text-[9px] px-3 py-1.5 rounded-lg font-black uppercase border tracking-wider',
                  task.status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  task.status === 'doing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                  task.status === 'review' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-slate-800 text-slate-500 border-slate-700']">{{ task.status }}</span>
                <svg class="w-4 h-4 text-slate-700 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <!-- PEOPLE -->
        <div v-if="currentTab === 'people'" class="animate-slide-up">
          <div class="mb-6">
            <h3 class="text-white text-xl font-black italic">Anggota Tim</h3>
            <p class="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">{{ project.members?.length || 0 }} Orang</p>
          </div>

          <!-- Form Undang Anggota -->
          <div v-if="canManageProject" class="mb-6 p-5 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <p class="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Undang Anggota Baru</p>
            <div class="flex flex-col sm:flex-row gap-3">
              <select v-model.number="newMemberId"
                class="flex-1 px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-300 outline-none transition-all">
                <option value="" disabled>Pilih User...</option>
                <option v-for="u in availableUsers" :key="u.id" :value="u.id">{{ u.name }} ({{ u.email }})</option>
              </select>
              <select v-model.number="newMemberRole"
                class="w-full sm:w-44 px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-300 outline-none transition-all">
                <option :value="2">Manager</option>
                <option :value="3">Contributor</option>
                <option :value="4">Stakeholder</option>
              </select>
              <button @click="addMember" :disabled="!newMemberId || isAddingMember"
                class="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-violet-900/40 whitespace-nowrap">
                {{ isAddingMember ? 'Memproses...' : 'Tambahkan' }}
              </button>
            </div>
          </div>

          <div class="grid gap-3">
            <div v-for="member in project.members" :key="member.id"
              class="group bg-slate-900/50 border border-slate-800 p-5 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all">
              <div class="flex items-center gap-4">
                <div class="relative flex-shrink-0">
                  <img :src="`https://ui-avatars.com/api/?name=${member.name}&background=random&color=fff&bold=true&size=80`"
                    class="w-12 h-12 rounded-xl border border-slate-700 shadow-xl transition-transform group-hover:scale-105">
                  <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0f] rounded-full"></div>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <p class="font-bold text-white text-sm leading-tight">{{ member.name }}</p>
                    <span v-if="member.id === currentUser.id" class="text-[8px] bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded font-black uppercase tracking-wide border border-violet-500/20">Anda</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-bold tracking-wide mt-0.5">{{ member.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <span :class="['px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border', getMemberRoleClass(member)]">
                  {{ getMemberRoleName(member) }}
                </span>
                <button v-if="canManageProject && member.id !== currentUser.id"
                  @click="removeMember(member.id)"
                  class="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-rose-500 transition-all p-2 rounded-lg hover:bg-rose-500/10">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="flex flex-col items-center justify-center py-40 gap-4 text-slate-600">
      <svg class="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <p class="text-sm font-black uppercase tracking-widest">Proyek tidak ditemukan</p>
      <button @click="$router.push('/projects')" class="text-violet-400 hover:text-violet-300 text-xs font-bold transition-colors">Kembali ke daftar proyek</button>
    </div>

    <!-- ===== MODAL BUAT TUGAS ===== -->
    <Teleport to="body">
      <div v-if="showTaskModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeTaskModal">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
        <div class="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] overflow-y-auto task-modal-scroll">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5">
            <div>
              <h3 class="text-xl font-bold text-white">Tugas Baru</h3>
              <p class="text-xs text-slate-400 mt-1">Lengkapi informasi detail tugas di bawah ini.</p>
            </div>
            <button @click="closeTaskModal" class="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6">
            <form @submit.prevent="saveTask" class="space-y-6">

              <!-- Informasi Utama -->
              <div class="space-y-4">
                <label class="text-violet-400 text-[10px] uppercase tracking-widest font-black block">Informasi Utama</label>
                <input
                  v-model="taskForm.title"
                  type="text"
                  placeholder="Judul Tugas..."
                  required
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                />
                <textarea
                  v-model="taskForm.description"
                  rows="3"
                  placeholder="Tambahkan deskripsi detail di sini..."
                  class="w-full px-4 py-3 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all resize-none"
                ></textarea>
              </div>

              <!-- Detail & Waktu -->
              <div class="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-4">
                <label class="text-violet-400 text-[10px] uppercase tracking-widest font-black block">Detail & Waktu</label>
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="text-[11px] text-slate-500 font-bold block mb-1.5 ml-1">Prioritas</label>
                    <select v-model="taskForm.priority" class="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-300 outline-none transition-all">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label class="text-[11px] text-slate-500 font-bold block mb-1.5 ml-1">Status</label>
                    <select v-model="taskForm.status" class="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-300 outline-none transition-all">
                      <option value="todo">To Do</option>
                      <option value="doing">Doing</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label class="text-[11px] text-slate-500 font-bold block mb-1.5 ml-1">Tenggat Waktu</label>
                  <input
                    v-model="taskForm.due_date"
                    type="datetime-local"
                    required
                    class="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-300 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
                  />
                </div>
              </div>

              <!-- Assignee -->
              <div>
                <label class="text-violet-400 text-[10px] uppercase tracking-widest font-black block mb-3">Penugasan</label>
                <div>
                  <label class="text-[11px] text-slate-500 font-bold block mb-1.5 ml-1">Assign To</label>
                  <select v-model.number="taskForm.user_id" required class="w-full px-3 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500 rounded-xl text-sm text-slate-300 outline-none transition-all">
                    <option value="" disabled>Pilih Anggota</option>
                    <option v-for="member in project?.members" :key="member.id" :value="member.id">{{ member.name }}</option>
                  </select>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
                <button type="button" @click="closeTaskModal"
                  class="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                  Batal
                </button>
                <button type="submit" :disabled="isSubmittingTask"
                  class="px-8 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold shadow-lg shadow-violet-600/20 active:scale-95 transition-all">
                  {{ isSubmittingTask ? 'Menyimpan...' : 'Simpan Tugas' }}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </Teleport>

  </div>
</template>


<script setup>
import { useProjectDetail } from '@/composables/useProjectDetail'

const {
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
  canManageProject,
  canDeleteProject,
  canPostContent,
  canChat,
  totalTaskCount,
  doneTaskCount,
  taskProgressPercent,
  tabs,
  formatDate,
  formatTime,
  getMemberRoleName,
  getMemberRoleClass,
  currentRoleLabel,
  currentRoleClass,
  postToStream,
  deletePost,
  sendChatMessage,
  handleDeleteProject,
  removeMember,
  availableUsers,
  newMemberId,
  newMemberRole,
  isAddingMember,
  addMember,
  showTaskModal,
  isSubmittingTask,
  taskForm,
  openTaskModal,
  closeTaskModal,
  saveTask
} = useProjectDetail()
</script>


<style scoped>
.animate-slide-up {
  animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { transform: translateY(24px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 10px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.task-modal-scroll::-webkit-scrollbar { width: 4px; }
.task-modal-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
</style>