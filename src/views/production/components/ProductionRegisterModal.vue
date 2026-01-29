<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  productName: string
  pendingQuantity: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm', quantity: number): void
}>()

const quantityInput = ref(0)

// Reset input when modal opens or item changes
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    quantityInput.value = props.pendingQuantity
  }
})

const handleConfirm = () => {
  if (quantityInput.value <= 0) return
  emit('confirm', quantityInput.value)
}
</script>

<template>
  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="emit('close')">
      <div class="modal-content">
        <div class="modal-header">
          <div class="icon-wrapper">
             <i class="fas fa-box-open"></i>
          </div>
          <h3>Registrar Producción</h3>
          <span class="product-title">{{ productName }}</span>
        </div>
        
        <div class="modal-body">
          <div class="info-row">
            <span class="label"><i class="fas fa-hourglass-half"></i> Pendiente Total:</span>
            <span class="value">{{ pendingQuantity }} unid.</span>
          </div>

          <div class="input-group">
            <label><i class="fas fa-pencil-alt"></i> ¿Cuántas hiciste hoy?</label>
            <div class="input-wrapper">
               <input 
                type="number" 
                v-model.number="quantityInput" 
                min="1" 
                :max="pendingQuantity"
                class="qty-input"
              />
            </div>
          </div>

           <p v-if="quantityInput < pendingQuantity" class="hint">
             <i class="fas fa-info-circle"></i>
             Quedarán <strong>{{ pendingQuantity - quantityInput }}</strong> pendientes.
           </p>
           <p v-else class="hint success">
             <i class="fas fa-check-circle"></i>
             ¡Excelente! Se completará todo el pedido.
           </p>
        </div>

        <div class="modal-actions">
          <button class="btn-cancel" @click="emit('close')">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button class="btn-confirm" @click="handleConfirm">
            <i class="fas fa-save"></i> Confirmar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
/* Fallbacks */
$gray-100: #f1f2f6;
$gray-200: #dfe4ea;
$text-light: #7f8c8d;
$text-dark: #2c3e50;
$NICOLE-PURPLE: #8e44ad;
$success: #2ecc71;
$border-light: #f1f2f6;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(44, 62, 80, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;

  .icon-wrapper {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, $NICOLE-PURPLE, lighten-color($NICOLE-PURPLE, 20%));
    border-radius: 50%;
    margin: 0 auto 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    box-shadow: 0 4px 10px rgba($NICOLE-PURPLE, 0.3);
  }

  h3 {
    margin: 0;
    font-size: 0.9rem;
    color: $text-light;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
  }

  .product-title {
    display: block;
    margin-top: 0.5rem;
    font-size: 1.4rem;
    font-weight: 700;
    color: $text-dark;
    line-height: 1.3;
  }
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
  background: $gray-100;
  padding: 1rem;
  border-radius: 12px;

  .label {
    color: $text-light;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .value {
    font-weight: 700;
    color: $text-dark;
    font-size: 1.1rem;
  }
}

.input-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.8rem;
    color: $text-dark;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .qty-input {
    width: 100%;
    padding: 1rem;
    font-size: 2rem;
    text-align: center;
    border: 2px solid $gray-200;
    border-radius: 12px;
    outline: none;
    font-weight: 700;
    color: $NICOLE-PURPLE;
    transition: border-color 0.2s;

    &:focus {
      border-color: $NICOLE-PURPLE;
      box-shadow: 0 0 0 4px rgba($NICOLE-PURPLE, 0.1);
    }
  }
}

.hint {
  text-align: center;
  font-size: 0.9rem;
  color: $text-light;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;

  &.success {
    color: $success;
  }
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;

  button {
    flex: 1;
    padding: 0.9rem;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    font-size: 0.95rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    transition: transform 0.1s;

    &:active {
      transform: scale(0.98);
    }
  }

  .btn-cancel {
    background: white;
    border: 1px solid $gray-200;
    color: $text-light;

    &:hover {
      background: $gray-100;
      color: $text-dark;
    }
  }

  .btn-confirm {
    background: $NICOLE-PURPLE;
    color: white;
    box-shadow: 0 4px 15px rgba($NICOLE-PURPLE, 0.3);

    &:hover {
      background: darken-color($NICOLE-PURPLE, 5%);
    }
  }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
