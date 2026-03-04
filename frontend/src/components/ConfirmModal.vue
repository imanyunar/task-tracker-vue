<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="visible" class="fixed inset-0 z-[9998] flex items-center justify-center p-4" @click.self="onCancel">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <!-- Modal -->
        <div class="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden">

          <!-- Top accent bar -->
          <div :class="['h-1 w-full', accentColor]"></div>

          <div class="p-7">
            <!-- Icon -->
            <div :class="['w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border', iconBg]">
              <!-- Danger: trash -->
              <svg v-if="options.type === 'danger' || !options.type" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <!-- Warning: exclamation -->
              <svg v-else-if="options.type === 'warning'" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <!-- Info: question -->
              <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Text -->
            <h3 class="text-white font-black text-lg leading-tight mb-2">
              {{ options.title || (options.type === 'danger' ? 'Konfirmasi Hapus' : 'Konfirmasi') }}
            </h3>
            <p class="text-slate-400 text-sm leading-relaxed">{{ options.message }}</p>

            <!-- Buttons -->
            <div class="flex gap-3 mt-7">
              <button @click="onCancel"
                class="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-sm font-bold transition-all">
                {{ options.cancelText || 'Batal' }}
              </button>
              <button @click="onConfirm"
                :class="['flex-1 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all active:scale-95 shadow-lg', confirmBtnClass]">
                {{ options.confirmText || (options.type === 'danger' ? 'Hapus' : 'Ya, Lanjutkan') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useConfirm } from '@/composables/useConfirm'

const { visible, options, onConfirm, onCancel } = useConfirm()

const accentColor = computed(() => {
  if (options.value.type === 'warning') return 'bg-amber-500'
  if (options.value.type === 'info')    return 'bg-indigo-500'
  return 'bg-rose-500'
})

const iconBg = computed(() => {
  if (options.value.type === 'warning') return 'bg-amber-500/10 border-amber-500/20 text-amber-400'
  if (options.value.type === 'info')    return 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
  return 'bg-rose-500/10 border-rose-500/20 text-rose-400'
})

const confirmBtnClass = computed(() => {
  if (options.value.type === 'warning') return 'bg-amber-500 hover:bg-amber-400 text-white shadow-amber-900/40'
  if (options.value.type === 'info')    return 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
  return 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
})
</script>

<style scoped>
.confirm-enter-active { animation: confirmIn 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
.confirm-leave-active { animation: confirmIn 0.2s cubic-bezier(0.4, 0, 1, 1) reverse; }

@keyframes confirmIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
</style>