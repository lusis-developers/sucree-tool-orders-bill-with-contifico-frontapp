<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import ProductionService from '@/services/production.service'
import ConfirmationModal from '@/components/ConfirmationModal.vue'

interface SummaryItem {
  _id: string // Product Name
  totalQuantity: number
  urgency: string
  orders: {
    id: string
    quantity: number
    client: string
    delivery: string
    stage: string
  }[]
  isExpanded?: boolean
}

const items = ref<SummaryItem[]>([])
const isLoading = ref(true)
const error = ref('')

// Modal State
const isModalOpen = ref(false)
const itemToFinish = ref<SummaryItem | null>(null)

onMounted(async () => {
  await fetchSummary()
})

const fetchSummary = async () => {
  try {
    isLoading.value = true
    items.value = await ProductionService.getSummary()
  } catch (err) {
    console.error(err)
    error.value = 'No se pudo cargar el resumen de producción.'
  } finally {
    isLoading.value = false
  }
}

const toggleExpand = (item: SummaryItem) => {
  item.isExpanded = !item.isExpanded
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Logic to group items
const todayItems = computed(() => {
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  return items.value.filter(item => {
    const urgencyDate = new Date(item.urgency)
    return urgencyDate <= endOfToday
  })
})

const tomorrowItems = computed(() => {
  const now = new Date()
  const endOfToday = new Date(now)
  endOfToday.setHours(23, 59, 59, 999)

  const endOfTomorrow = new Date(now)
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
  endOfTomorrow.setHours(23, 59, 59, 999)

  return items.value.filter(item => {
    const urgencyDate = new Date(item.urgency)
    return urgencyDate > endOfToday && urgencyDate <= endOfTomorrow
  })
})

const futureItems = computed(() => {
  const now = new Date()
  const endOfTomorrow = new Date(now)
  endOfTomorrow.setDate(endOfTomorrow.getDate() + 1)
  endOfTomorrow.setHours(23, 59, 59, 999)

  return items.value.filter(item => {
    const urgencyDate = new Date(item.urgency)
    return urgencyDate > endOfTomorrow
  })
})

const promptBatchFinish = (item: SummaryItem, event: Event) => {
  event.stopPropagation() // Prevent card toggle
  itemToFinish.value = item
  isModalOpen.value = true
}

const confirmBatchFinish = async () => {
  if (!itemToFinish.value) return

  isModalOpen.value = false // Close immediately to show responsiveness

  try {
    const ids = itemToFinish.value.orders.map(o => o.id)
    await ProductionService.batchUpdate(ids, 'FINISHED')

    // Refresh list
    await fetchSummary()
  } catch (err) {
    alert('Error al actualizar items')
  } finally {
    itemToFinish.value = null
  }
}

</script>

<template>
  <div class="summary-view">
    <div class="header">
      <h1>Resumen de Producción</h1>
      <p>Vista consolidada y acciones masivas</p>
    </div>

    <div v-if="isLoading" class="loading-state">
      <span class="loader"></span>
      <p>Calculando totales...</p>
    </div>

    <div v-else-if="error" class="error-msg">
      {{ error }}
      <button @click="fetchSummary">Reintentar</button>
    </div>

    <div v-else class="content-wrapper">
      
      <!-- TODAY SECTION -->
      <section v-if="todayItems.length > 0" class="group-section today">
        <h2 class="section-title urgent">
          <i class="fas fa-exclamation-circle"></i>
          Para Hoy / Urgente
        </h2>
        <div class="items-list">
          <div 
            v-for="item in todayItems" 
            :key="item._id" 
            class="summary-card urgent"
            :class="{ expanded: item.isExpanded }"
            @click="toggleExpand(item)"
          >
            <div class="card-main">
              <div class="info">
                <h3 class="product-name">{{ item._id }}</h3>
                <span class="next-delivery">
                  Vence: <strong>{{ formatDate(item.urgency) }}</strong>
                </span>
              </div>
              <div class="actions">
                 <button class="btn-check" @click="(e) => promptBatchFinish(item, e)" title="Marcar TODO como Terminado">
                   <span class="icon">✓</span>
                   <span class="btn-label">Todo</span>
                 </button>
                 <div class="total-badge urgent">
                    <span class="qty">{{ item.totalQuantity }}</span>
                    <span class="label">unid.</span>
                 </div>
              </div>
            </div>

            <div v-if="item.isExpanded" class="breakdown">
              <h4>Detalle por Orden</h4>
              <ul>
                <li v-for="order in item.orders" :key="order.id" class="breakdown-item">
                  <div class="order-info">
                    <strong>{{ order.client }}</strong>
                    <span class="order-date">{{ formatDate(order.delivery) }}</span>
                  </div>
                  <div class="order-qty">
                    x{{ order.quantity }}
                    <span class="stage-tag" :class="order.stage.toLowerCase()">
                      {{ order.stage === 'IN_PROCESS' ? 'PROCESO' : 'PEND.' }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- TOMORROW SECTION -->
      <section v-if="tomorrowItems.length > 0" class="group-section tomorrow">
        <h2 class="section-title warning">
          <i class="fas fa-clock"></i>
          Para Mañana
        </h2>
        <div class="items-list">
          <div 
            v-for="item in tomorrowItems" 
            :key="item._id" 
            class="summary-card warning"
            :class="{ expanded: item.isExpanded }"
            @click="toggleExpand(item)"
          >
            <div class="card-main">
              <div class="info">
                <h3 class="product-name">{{ item._id }}</h3>
                <span class="next-delivery">
                   Vence: {{ formatDate(item.urgency) }}
                </span>
              </div>
               <div class="actions">
                 <button class="btn-check warning" @click="(e) => promptBatchFinish(item, e)">
                   <span class="icon">✓</span>
                 </button>
                 <div class="total-badge warning">
                  <span class="qty">{{ item.totalQuantity }}</span>
                  <span class="label">unid.</span>
                </div>
               </div>
            </div>

            <div v-if="item.isExpanded" class="breakdown">
              <h4>Detalle por Orden</h4>
              <ul>
                <li v-for="order in item.orders" :key="order.id" class="breakdown-item">
                  <div class="order-info">
                    <strong>{{ order.client }}</strong>
                    <span class="order-date">{{ formatDate(order.delivery) }}</span>
                  </div>
                  <div class="order-qty">
                    x{{ order.quantity }}
                    <span class="stage-tag" :class="order.stage.toLowerCase()">
                      {{ order.stage === 'IN_PROCESS' ? 'PROCESO' : 'PEND.' }}
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- FUTURE SECTION -->
      <section v-if="futureItems.length > 0" class="group-section future">
        <h2 class="section-title future">
          <i class="fas fa-calendar-alt"></i>
          Futuro (Pasado Mañana +)
        </h2>
        <div class="items-list">
          <div 
            v-for="item in futureItems" 
            :key="item._id" 
            class="summary-card future"
            :class="{ expanded: item.isExpanded }"
            @click="toggleExpand(item)"
          >
            <div class="card-main">
              <div class="info">
                <h3 class="product-name">{{ item._id }}</h3>
                <span class="next-delivery">
                   Vence: {{ formatDate(item.urgency) }}
                </span>
              </div>
              <div class="actions">
                <div class="total-badge future">
                  <span class="qty">{{ item.totalQuantity }}</span>
                  <span class="label">unid.</span>
                </div>
              </div>
            </div>
            
            <div v-if="item.isExpanded" class="breakdown">
              <!-- Content similar to above -->
               <ul>
                <li v-for="order in item.orders" :key="order.id" class="breakdown-item">
                  <div class="order-info">
                    <strong>{{ order.client }}</strong>
                    <span class="order-date">{{ formatDate(order.delivery) }}</span>
                  </div>
                  <div class="order-qty">
                    x{{ order.quantity }}
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div v-if="items.length === 0" class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>¡Todo al día!</p>
      </div>

    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal 
      :is-open="isModalOpen"
      title="Completar Producción"
      :message="`¿Confirmas que se terminaron los ${itemToFinish?.totalQuantity} items de '${itemToFinish?._id}'?`"
      confirm-text="¡Sí, terminado!"
      @close="isModalOpen = false"
      @confirm="confirmBatchFinish"
    />
  </div>
</template>

<style lang="scss" scoped>
/* Keeping existing styles, plus Modal is managed inside standard template */
.summary-view {
  min-height: 100vh;
  background-color: $gray-50;
  padding: 1rem;
  padding-bottom: 4rem;
}

.header {
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    color: $NICOLE-PURPLE;
    margin: 0;
    font-family: $font-principal;
  }

  p {
    color: $text-light;
    margin: 0;
    font-size: 0.9rem;
  }
}

.section-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: $font-principal;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &.urgent {
    color: $error;
  }

  &.warning {
    color: $warning;
  }

  &.future {
    color: #3498db;
  }
}

.group-section {
  margin-bottom: 2.5rem;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.summary-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  border-left-width: 6px;
  border-left-style: solid;

  &.urgent {
    border-left-color: $error;
  }

  &.warning {
    border-left-color: $warning;
  }

  &.future {
    border-left-color: #3498db;
  }

  &:active {
    transform: scale(0.98);
  }

  &.expanded {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

.card-main {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  margin: 0;
  font-size: 1.1rem;
  color: $text-dark;
  font-family: $font-secondary;
  font-weight: 600;
}

.next-delivery {
  font-size: 0.85rem;
  color: $text-light;
  display: block;
  margin-top: 0.35rem;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-check {
  background: $success;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 5px rgba($success, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba($success, 0.4);
  }

  .icon {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .btn-label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  &.warning {
    background: $warning;
    box-shadow: 0 2px 5px rgba($warning, 0.3);
  }
}

.total-badge {
  text-align: center;
  min-width: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  &.urgent .qty {
    color: $error;
  }

  &.warning .qty {
    color: darken($warning, 10%);
  }

  &.future .qty {
    color: #3498db;
  }

  .qty {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1;
  }

  .label {
    font-size: 0.65rem;
    color: $text-light;
    text-transform: uppercase;
  }
}

/* Breakdown styles (reused) */
.breakdown {
  background: $gray-50;
  padding: 1rem 1.25rem;
  border-top: 1px solid $border-light;
  animation: slideDown 0.2s ease-out;

  h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.8rem;
    color: $text-light;
    text-transform: uppercase;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid $gray-200;
    font-size: 0.95rem;
  }

  .order-info {
    display: flex;
    flex-direction: column;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: $text-light;

  i {
    font-size: 3rem;
    color: $success;
    margin-bottom: 1rem;
  }
}

.loading-state {
  text-align: center;
  padding: 2rem;

  .loader {
    width: 32px;
    height: 32px;
    border: 3px solid $gray-200;
    border-bottom-color: $NICOLE-PURPLE;
    border-radius: 50%;
    display: inline-block;
    animation: rotation 1s linear infinite;
    margin-bottom: 1rem;
  }
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
