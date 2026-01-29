<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import ToastNotification from './ToastNotification.vue'

const { toasts, remove } = useToast()
</script>

<template>
  <div class="toast-container">
    <ToastNotification
      v-for="toast in toasts"
      :key="toast.id"
      :show="true"
      :message="toast.message"
      :type="toast.type"
      @close="remove(toast.id)"
    />
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  pointer-events: none;
  /* Allow clicks through empty areas */
}

/* Ensure children (toasts) are clickable if needed (e.g. close button) */
.toast-container>* {
  pointer-events: auto;
}

@media (max-width: 768px) {
  .toast-container {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    align-items: center;
  }
}
</style>
