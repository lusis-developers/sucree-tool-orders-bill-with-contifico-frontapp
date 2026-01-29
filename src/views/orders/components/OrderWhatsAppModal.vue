<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean
  message: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'send'): void
}>()
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
    <div class="modal whatsapp-theme">
      
      <!-- WA Header -->
      <div class="wa-header">
         <div class="wa-profile">
            <div class="wa-avatar">
              <i class="fab fa-whatsapp"></i>
            </div>
            <div class="wa-info">
               <h3>Resumen del Pedido</h3>
               <span>Generado autom.</span>
            </div>
         </div>
         <button @click="emit('close')" class="close-btn" title="Cerrar">
           <i class="fas fa-times"></i>
         </button>
      </div>

      <!-- WA Body -->
      <div class="wa-body">
         <div class="date-divider">
            <span>HOY</span>
         </div>
         
         <div class="message-bubble sent">
            <pre>{{ message }}</pre>
            <div class="msg-meta">
               <span>{{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</span>
               <i class="fas fa-check-double"></i>
            </div>
         </div>
      </div>

      <!-- WA Footer Actions -->
      <div class="wa-footer">
          <p class="hint">
            <i class="fas fa-check-circle"></i> Texto copiado al portapapeles
          </p>
          <button @click="emit('send')" class="btn-send-wa">
             Ir a WhatsApp <i class="fas fa-external-link-alt"></i>
          </button>
      </div>
    
    </div>
  </div>
</template>

<style lang="scss" scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal.whatsapp-theme {
  background: #E5DDD5;
  /* WA Background */
  width: 90%;
  max-width: 450px;
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
  height: 80vh;
  max-height: 700px;
}

/* Header */
.wa-header {
  background: #008069;
  /* WA Header Green */
  color: white;
  padding: 0.8rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 10;

  .wa-profile {
    display: flex;
    align-items: center;
    gap: 0.8rem;

    .wa-avatar {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #008069;
      font-size: 1.5rem;
    }

    .wa-info {
      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      span {
        font-size: 0.75rem;
        opacity: 0.8;
        display: block;
      }
    }
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;

    &:hover {
      opacity: 0.8;
    }
  }
}

/* Body */
.wa-body {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  position: relative;
  background-image: url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png');
  /* Subtle pattern if possible, or just color */
  background-blend-mode: overlay;
  background-color: #E5DDD5;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .date-divider {
    text-align: center;
    margin-bottom: 1rem;

    span {
      background: #badcff;
      color: #444;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    }
  }

  .message-bubble {
    background: white;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    max-width: 90%;
    margin-bottom: 0.5rem;
    position: relative;
    font-size: 0.9rem;
    color: #111;
    line-height: 1.4;

    &.sent {
      background: #dcf8c6;
      margin-left: auto;
      /* Push right */
      border-top-right-radius: 0;
    }

    pre {
      white-space: pre-wrap;
      font-family: inherit;
      margin: 0;
      padding-bottom: 0.5rem;
      /* Space for meta */
    }

    .msg-meta {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.65rem;
      color: rgba(0, 0, 0, 0.45);
      margin-top: -0.2rem;

      i {
        color: #34B7F1;
        /* WA Blue ticks */
      }
    }
  }
}

/* Footer */
.wa-footer {
  background: #f0f0f0;
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  border-top: 1px solid #ddd;

  .hint {
    margin: 0;
    font-size: 0.85rem;
    color: $success;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 500;
  }

  .btn-send-wa {
    width: 100%;
    padding: 0.8rem;
    background: #008069;
    color: white;
    border: none;
    border-radius: 20px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.1s;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:hover {
      background: #006c59;
    }

    &:active {
      transform: scale(0.98);
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }

  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
