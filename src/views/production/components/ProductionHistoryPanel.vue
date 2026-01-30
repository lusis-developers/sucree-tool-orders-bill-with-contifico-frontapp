<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductionService from '@/services/production.service'

/**
 * PRODUCTION HISTORY PANEL
 * 
 * Displays strict list of items completed TODAY.
 * Allows reverting items to production in case of error.
 */

interface HistoryItem {
  _id: string
  totalQuantity: number
  urgency: string
  orders: {
    id: string
  }[]
}

const emit = defineEmits(['close'])

const isLoading = ref(true)
const historyItems = ref<HistoryItem[]>([])
const error = ref('')

const fetchHistory = async () => {
  try {
    isLoading.value = true
    error.value = ''
    const allOrders = await ProductionService.getAllOrders()

    // Filter: Finished AND Updated Today (Strict Local)
    const todayStr = new Date().toISOString().split('T')[0]

    const finishedToday = allOrders.filter(o =>
      o.productionStage === 'FINISHED' &&
      o.updatedAt &&
      o.updatedAt.startsWith(todayStr)
    )

    // Group by Product Name
    const groupedMap = new Map<string, { total: number, ids: string[], lastUpdate: string }>()

    finishedToday.forEach(o => {
      o.products.forEach(p => {
        const key = p.name
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { total: 0, ids: [], lastUpdate: o.updatedAt })
        }
        const entry = groupedMap.get(key)!
        entry.total += p.quantity

        // Track unique Order IDs for this product to enable Revert
        if (!entry.ids.includes(o._id)) {
          entry.ids.push(o._id)
        }
      })
    })

    const results: HistoryItem[] = []
    groupedMap.forEach((val, key) => {
      results.push({
        _id: key,
        totalQuantity: val.total,
        urgency: val.lastUpdate,
        orders: val.ids.map(id => ({ id }))
      })
    })

    // Sort by most recent
    results.sort((a, b) => new Date(b.urgency).getTime() - new Date(a.urgency).getTime())

    historyItems.value = results

  } catch (err) {
    console.error(err)
    error.value = 'Error al cargar el historial.'
  } finally {
    isLoading.value = false
  }
}

const handleRevert = async (item: HistoryItem) => {
  if (!confirm(`¿Estás seguro de devolver ${item.totalQuantity} unidades de "${item._id}" a producción?`)) return

  try {
    isLoading.value = true
    const idsToRevert = item.orders.map(o => o.id)

    if (idsToRevert.length === 0) return

    await ProductionService.batchUpdate(idsToRevert, 'PENDING')

    await fetchHistory()

  } catch (err) {
    console.error(err)
    alert('Error al revertir item')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchHistory()
})
</script>

<template>
  <div class="history-panel">
      <div class="panel-header">
          <div class="title-group">
               <h2><i class="fas fa-check-circle"></i> Producción Finalizada</h2>
               <span class="subtitle">Items completados hoy {{ new Date().toLocaleDateString() }}</span>
          </div>
          <button class="btn-close" @click="emit('close')">
              <i class="fas fa-times"></i> Cerrar
          </button>
      </div>

      <div v-if="isLoading" class="state-msg">
          <div class="loader"></div>
          <span>Cargando historial...</span>
      </div>

      <div v-else-if="error" class="state-msg error">
          <i class="fas fa-exclamation-circle"></i>
          {{ error }}
      </div>

      <div v-else-if="historyItems.length === 0" class="state-msg empty">
          <div class="icon-box"><i class="fas fa-clipboard-check"></i></div>
          <p>No hay producción finalizada hoy.</p>
          <span>Los items marcados como completos aparecerán aquí.</span>
      </div>

      <div v-else class="history-list">
           <div v-for="item in historyItems" :key="item._id" class="history-card">
               
               <div class="card-left">
                   <div class="status-icon">
                       <i class="fas fa-check"></i>
                   </div>
                   <div class="info">
                       <h3 class="product-name">{{ item._id }}</h3>
                       <div class="meta">
                           <span class="time">
                               <i class="far fa-clock"></i> 
                               {{ new Date(item.urgency).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                           </span>
                           <span class="qty-badge">{{ item.totalQuantity }} unids.</span>
                       </div>
                   </div>
               </div>

               <div class="card-right">
                   <button class="btn-revert" @click="handleRevert(item)" title="Devolver a Producción (Deshacer)">
                       <i class="fas fa-undo-alt"></i>
                       <span>Devolver</span>
                   </button>
               </div>
           </div>
      </div>
  </div>
</template>

<style lang="scss" scoped>
$color-success: #2ecc71;
$color-text: #2c3e50;
$color-sub: #7f8c8d;
$color-bg: #f8f9fa;
$color-danger: #e74c3c;

.history-panel {
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #f1f2f6;
  padding-bottom: 1rem;

  .title-group {
    h2 {
      margin: 0;
      font-size: 1.5rem;
      color: $color-success;
      display: flex;
      align-items: center;
      gap: 0.8rem;
    }

    .subtitle {
      display: block;
      margin-top: 4px;
      color: $color-sub;
      font-size: 0.9rem;
    }
  }

  .btn-close {
    background: $color-bg;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: 30px;
    color: $color-sub;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background: #e0e0e0;
      color: $color-text;
    }
  }
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 600px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.history-card {
  background: white;
  border: 1px solid #f1f2f6;
  border-radius: 16px;
  padding: 1.2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.06);
    border-color: #e1e2e6;
  }

  .card-left {
    display: flex;
    align-items: center;
    gap: 1.2rem;

    .status-icon {
      width: 42px;
      height: 42px;
      background: linear-gradient(135deg, $color-success, #27ae60);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.1rem;
      box-shadow: 0 4px 10px rgba(46, 204, 113, 0.3);
    }

    .info {
      .product-name {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 700;
        color: $color-text;
      }

      .meta {
        display: flex;
        gap: 1rem;
        margin-top: 0.3rem;
        align-items: center;

        .time {
          font-size: 0.85rem;
          color: $color-sub;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .qty-badge {
          background: #eafaf1;
          color: $color-success;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
        }
      }
    }
  }

  .card-right {
    .btn-revert {
      background: transparent;
      border: 1px solid #ffecec;
      color: $color-danger;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;

      &:hover {
        background: #fff5f5;
        border-color: $color-danger;
        transform: translateX(-2px);
      }

      i {
        font-size: 0.9rem;
      }
    }
  }
}

.state-msg {
  text-align: center;
  padding: 3rem;
  color: $color-sub;

  &.empty {
    .icon-box {
      font-size: 3rem;
      color: #dcdde1;
      margin-bottom: 1rem;
    }

    p {
      font-size: 1.1rem;
      font-weight: 600;
    }
  }

  .loader {
    /* Standard loader styles - or import spinner */
    width: 30px;
    height: 30px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid $color-success;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}
</style>
