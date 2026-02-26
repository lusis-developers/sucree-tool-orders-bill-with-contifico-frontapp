<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ProductionService from '@/services/production.service'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close', 'success'])

const step = ref<1 | 2>(1)
const selectedDestination = ref('')
const isLoading = ref(false)
const rawOrders = ref<any[]>([])
const items = ref<{ name: string; pending: number; toSend: number }[]>([])
const filterMode = ref<'today' | 'tomorrow' | 'all'>('today')

// Destinations
const destinations = ['Entre Ríos', 'Centro de Producción', 'Domicilio / Delivery']

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

const calculatePendingItems = () => {
  if (!rawOrders.value.length) return Promise.resolve()

  const agg: Record<string, number> = {}
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  rawOrders.value.forEach((o: any) => {
    // 1. Filter by Destination
    let destMatch = false
    if (selectedDestination.value === 'Domicilio / Delivery') {
      if (o.deliveryType === 'delivery') destMatch = true
    } else {
      const branch = (o.branch || '').toLowerCase()
      // Simple match
      if (selectedDestination.value === 'Entre Ríos' && (branch.includes('entre') || branch.includes('ríos'))) destMatch = true
      else if (selectedDestination.value === 'Centro de Producción' && (branch.includes('centro') || branch.includes('producc'))) destMatch = true
    }

    if (!destMatch) return

    // 2. Filter by Date (New Requirement)
    const dDate = new Date(o.deliveryDate)
    let dateMatch = false
    if (filterMode.value === 'all') dateMatch = true
    else if (filterMode.value === 'today' && isSameDay(dDate, today)) dateMatch = true
    else if (filterMode.value === 'tomorrow' && isSameDay(dDate, tomorrow)) dateMatch = true

    if (!dateMatch) return

    // 3. Filter Active Orders
    if (o.dispatchStatus === 'SENT') return

    // 4. Aggregate Products
    o.products.forEach((p: any) => {
      let sentSum = 0
      if (o.dispatches) {
        o.dispatches.forEach((d: any) => {
          d.items.forEach((i: any) => {
            // Robust Match: Try ID first, then Name
            const isMatch = (p._id && i.productId && i.productId === p._id) || (i.name === p.name)
            if (isMatch) sentSum += i.quantitySent
          })
        })
      }

      // LOGIC CHANGE: Only allow dispatching what has been PRODUCED
      // Available = Produced - Already Sent
      const produced = p.produced || 0
      const availableToSend = produced - sentSum

      if (availableToSend > 0) {
        agg[p.name] = (agg[p.name] || 0) + availableToSend
      }
    })
  })

  // Convert to Array
  const resultItems: { name: string; pending: number; toSend: number }[] = Object.keys(agg).map(key => ({
    name: key,
    pending: agg[key] || 0,
    toSend: 0
  }))

  items.value = resultItems.sort((a, b) => b.pending - a.pending)
}

const fetchPendingItems = async () => {
  if (!selectedDestination.value) return

  try {
    isLoading.value = true
    const orders = await ProductionService.getAllOrders()
    rawOrders.value = orders
    calculatePendingItems()
    step.value = 2
  } catch (e) {
    console.error(e)
    alert('Error cargando ítems pendientes')
  } finally {
    isLoading.value = false
  }
}

const handleDestinationSelect = (dest: string) => {
  selectedDestination.value = dest
  filterMode.value = 'today' // Reset to today by default
  fetchPendingItems()
}

// Re-calculate when filter changes
watch(filterMode, () => {
  calculatePendingItems()
})

import { watch } from 'vue' // Add watch import

const errorMessage = ref('')

const handleConfirm = async () => {
  errorMessage.value = ''
  const payloadItems = items.value
    .filter(i => i.toSend > 0)
    .map(i => ({ name: i.name, quantity: i.toSend }))

  if (payloadItems.length === 0) {
    errorMessage.value = 'Ingresa una cantidad a enviar.'
    return
  }

  try {
    isLoading.value = true
    await ProductionService.registerDispatchProgress(selectedDestination.value, payloadItems)

    // Success: Emit and Close
    emit('success')
    emit('close')
  } catch (e) {
    console.error(e)
    errorMessage.value = 'Error al registrar el envío. Por favor intenta de nuevo.'
  } finally {
    isLoading.value = false
  }
}

const reset = () => {
  step.value = 1
  selectedDestination.value = ''
  items.value = []
  errorMessage.value = ''
}

// Reset state when modal is opened
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    reset()
  }
})
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      
      <!-- STEP 1: DESTINATION -->
      <div v-if="step === 1">
        <header>
          <h2>Selecciona Destino</h2>
          <button class="btn-close" @click="$emit('close')">&times;</button>
        </header>

        <div class="dest-grid">
            <button 
                v-for="dest in destinations" 
                :key="dest"
                class="btn-dest"
                @click="handleDestinationSelect(dest)"
            >
                <i class="fas fa-store-alt" v-if="dest.includes('Entre')"></i>
                <i class="fas fa-industry" v-else-if="dest.includes('Centro')"></i>
                <i class="fas fa-motorcycle" v-else></i>
                <span>{{ dest }}</span>
            </button>
        </div>
      </div>

      <!-- STEP 2: ITEMS -->
      <div v-if="step === 2">
        <header>
            <button class="btn-back" @click="reset"><i class="fas fa-arrow-left"></i></button>
            <div class="title-col">
                <div class="dest-title">
                    <h2>{{ selectedDestination }}</h2>
                </div>
            </div>
            <button class="btn-close" @click="$emit('close')">&times;</button>
        </header>

        <div v-if="errorMessage" class="error-banner">
          <i class="fas fa-exclamation-circle"></i> {{ errorMessage }}
        </div>
        
        <!-- Date Filters -->
        <div class="filter-tabs">
            <button :class="{ active: filterMode === 'today' }" @click="filterMode = 'today'">Hoy</button>
            <button :class="{ active: filterMode === 'tomorrow' }" @click="filterMode = 'tomorrow'">Mañana</button>
            <button :class="{ active: filterMode === 'all' }" @click="filterMode = 'all'">Todos</button>
        </div>

        <div v-if="isLoading" class="loading">Cargando...</div>

        <div v-else class="items-list">
             <div class="list-header">
                <span>Producto</span>
                <span>Pendiente</span>
                <span>A Enviar</span>
             </div>
             
             <div class="item-row" v-for="item in items" :key="item.name">
                <div class="prod-name">{{ item.name }}</div>
                <div class="prod-pending">{{ item.pending }}</div>
                <div class="prod-input">
                    <input type="number" v-model.number="item.toSend" min="0" :max="item.pending">
                    <button @click="item.toSend = item.pending" class="btn-max" title="Enviar Todo">
                        <i class="fas fa-check-double"></i>
                    </button>
                </div>
             </div>
             
             <div v-if="items.length === 0" class="empty">
                <p>No hay ítems <strong>producidos</strong> pendientes de envío para <strong>{{ filterMode === 'today' ? 'HOY' : 'esta selección' }}</strong>.</p>
                <small>Recuerda marcar la producción antes de despachar.</small>
             </div>
        </div>

        <div class="actions">
            <button class="btn-confirm" @click="handleConfirm" :disabled="items.length === 0">
                <i class="fas fa-paper-plane"></i> Registrar Envío
            </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style lang="scss" scoped>
$font-stack: 'Inter', system-ui, sans-serif;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 500px;
  border-radius: 16px;
  padding: 1.5rem;
  font-family: $font-stack;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  height: 80vh;
  display: flex;
  flex-direction: column;
}

header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }

  .btn-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #95a5a6;
  }

  .btn-back {
    background: transparent;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    color: #2c3e50;
    margin-right: 1rem;
  }
}

.filter-tabs {
  display: flex;
  background: #f1f2f6;
  padding: 4px;
  border-radius: 8px;
  margin-bottom: 1rem;

  button {
    flex: 1;
    border: none;
    background: transparent;
    padding: 6px;
    border-radius: 6px;
    font-weight: 600;
    color: #7f8c8d;
    cursor: pointer;
    font-size: 0.85rem;

    &.active {
      background: white;
      color: #2c3e50;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
  }
}

.dest-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  .btn-dest {
    background: #f8f9fa;
    border: 2px solid transparent;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;

    i {
      font-size: 1.8rem;
      color: #34495e;
    }

    span {
      font-weight: 600;
      color: #2c3e50;
      font-size: 0.9rem;
    }

    &:hover {
      background: #eaf2f8;
      border-color: #3498db;

      i {
        color: #3498db;
      }
    }
  }
}

.items-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1rem;
  border-top: 1px solid #eee;

  .list-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    padding: 0.8rem 0;
    font-size: 0.75rem;
    font-weight: 700;
    color: #95a5a6;
    text-transform: uppercase;
    border-bottom: 1px solid #eee;
    position: sticky;
    top: 0;
    background: white;
  }

  .item-row {
    display: grid;
    grid-template-columns: 2fr 1fr 1.5fr;
    padding: 0.8rem 0;
    align-items: center;
    border-bottom: 1px solid #f9f9f9;

    .prod-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #2c3e50;
    }

    .prod-pending {
      color: #e67e22;
      font-weight: 700;
      text-align: center;
    }

    .prod-input {
      display: flex;
      align-items: center;
      gap: 4px;

      .btn-max {
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #eaf2f8;
        border: 1px solid #d4e6f1;
        border-radius: 6px;
        cursor: pointer;
        color: #3498db;
        transition: all 0.2s;

        &:hover {
          background: #3498db;
          color: white;
        }

        i {
          font-size: 0.8rem;
        }
      }

      input {
        width: 100%;
        padding: 6px;
        border: 1px solid #dfe6e9;
        border-radius: 6px;
        text-align: center;
        font-weight: 700;
        color: #2ecc71;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #2ecc71;
        }
      }
    }
  }
}

.actions {
  .btn-confirm {
    width: 100%;
    padding: 1rem;
    background: #2ecc71;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: 700;
    cursor: pointer;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: all 0.2s;

    &:hover:not(:disabled) {
      background: #27ae60;
      transform: translateY(-1px);
    }

    &:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  }
}

.empty {
  padding: 2rem;
  text-align: center;
  color: #95a5a6;
  font-size: 0.9rem;
}
</style>
