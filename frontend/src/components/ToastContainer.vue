<template>
  <Teleport to="body">
    <div class="toast-wrapper" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast" tag="div" class="toast-stack">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast-item', `toast-${toast.type}`]"
          @click="removeToast(toast.id)"
        >
          <!-- Icon -->
          <div class="toast-icon">
            <!-- Success -->
            <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
            <!-- Error -->
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <!-- Warning -->
            <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <!-- Info -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <!-- Message -->
          <span class="toast-message">{{ toast.message }}</span>

          <!-- Progress bar -->
          <div class="toast-progress" :style="{ animationDuration: toast.duration + 'ms' }"></div>

          <!-- Close -->
          <button class="toast-close" @click.stop="removeToast(toast.id)" aria-label="Tutup">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: max-content;
  max-width: calc(100vw - 32px);
}

.toast-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

/* ===== TOAST ITEM ===== */
.toast-item {
  pointer-events: all;
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px 13px 14px;
  border-radius: 16px;
  border: 1px solid;
  backdrop-filter: blur(16px);
  cursor: pointer;
  overflow: hidden;
  min-width: 280px;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.04) inset;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.toast-item:hover {
  transform: translateY(-1px) scale(1.01);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
}

/* ===== TYPES ===== */
.toast-success {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.25);
  color: #6ee7b7;
}
.toast-error {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
  color: #fca5a5;
}
.toast-warning {
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fcd34d;
}
.toast-info {
  background: rgba(99, 102, 241, 0.12);
  border-color: rgba(99, 102, 241, 0.25);
  color: #a5b4fc;
}

/* ===== ICON ===== */
.toast-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}
.toast-icon svg {
  width: 100%;
  height: 100%;
}

/* ===== MESSAGE ===== */
.toast-message {
  flex: 1;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: 0.01em;
}

/* ===== CLOSE ===== */
.toast-close {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  opacity: 0.4;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: inherit;
  transition: opacity 0.15s;
}
.toast-close:hover { opacity: 1; }
.toast-close svg { width: 100%; height: 100%; }

/* ===== PROGRESS BAR ===== */
.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  width: 100%;
  transform-origin: left;
  animation: shrink linear forwards;
}
.toast-success .toast-progress { background: #10b981; }
.toast-error   .toast-progress { background: #ef4444; }
.toast-warning .toast-progress { background: #f59e0b; }
.toast-info    .toast-progress { background: #6366f1; }

@keyframes shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* ===== TRANSITIONS ===== */
.toast-enter-active {
  animation: toastIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-leave-active {
  animation: toastOut 0.25s cubic-bezier(0.4, 0, 1, 1) forwards;
}
.toast-move {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.92);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}

@keyframes toastOut {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
  to {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
    filter: blur(4px);
  }
}
</style>