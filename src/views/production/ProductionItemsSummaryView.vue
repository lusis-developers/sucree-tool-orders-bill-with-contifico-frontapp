<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductionService from '@/services/production.service'
import ProductionCategoryGroup from './components/ProductionCategoryGroup.vue'
import ProductionHistoryPanel from './components/ProductionHistoryPanel.vue'
import { useProductionSummary } from '@/composables/useProductionSummary'
import type { SummaryItem } from '@/types/production'

const {
  isLoading,
  error,
  delayedGroups,
  todayGroups,
  tomorrowGroups,
  futureGroups,
  fetchSummary,
  toggleCategory,
  toggleExpand,
  showHistory
} = useProductionSummary()

const isRegisterModalOpen = ref(false)
const selectedItem = ref<SummaryItem | null>(null)

// Actions
const handleRegisterItem = async (item: SummaryItem) => {
  const qty = item.currentInput
  if (!qty || qty <= 0) {
    alert('Ingrese una cantidad válida')
    return
  }

  if (qty > item.totalQuantity) {
    alert(`La cantidad no puede exceder ${item.totalQuantity}`)
    item.currentInput = item.totalQuantity
    return
  }

  try {
    isLoading.value = true
    await ProductionService.registerProgress(item._id, qty)
    await fetchSummary()
  } catch (err) {
    console.error(err)
    alert('Error al registrar progreso')
    isLoading.value = false
  }
}

const toggleHistoryPanel = () => {
  showHistory.value = !showHistory.value
  if (!showHistory.value) {
    fetchSummary()
  }
}

onMounted(async () => {
  await fetchSummary()
})
</script>

<template>
  <div class="summary-view">
    <div class="header-section">
      <div class="header-content">
        <h1>Resumen de Producción</h1>
        <p>Control de items pendientes y registro de progreso</p>
      </div>
      <div class="header-actions">
        <button class="btn-history" @click="toggleHistoryPanel" :class="{ active: showHistory }">
          <i class="fas" :class="showHistory ? 'fa-arrow-left' : 'fa-history'"></i>
          {{ showHistory ? 'Volver' : 'Ver Completados' }}
        </button>
        <button class="btn-refresh" @click="fetchSummary" :disabled="isLoading" v-if="!showHistory">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
          Actualizar
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <span class="loader"></span>
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="error-msg">
      <i class="fas fa-exclamation-triangle"></i>
      {{ error }}
      <button @click="fetchSummary">Reintentar</button>
    </div>

    <!-- History View -->
    <ProductionHistoryPanel 
        v-else-if="showHistory" 
        @close="toggleHistoryPanel"
    />

    <div v-else class="content-wrapper">

      <!-- Loop for Delayed, Today, Tomorrow, Future -->
      <div v-for="(timeGroup, type) in { delayed: delayedGroups, today: todayGroups, tomorrow: tomorrowGroups, future: futureGroups }" :key="type">
        
        <section v-if="timeGroup.length > 0" class="list-section" :class="type">
          <div class="section-title" :class="type">
            <h2>
              <i v-if="type === 'delayed'" class="fas fa-exclamation-triangle"></i>
              <i v-else-if="type === 'today'" class="fas fa-calendar-day"></i>
              <i v-else-if="type === 'tomorrow'" class="fas fa-sun"></i>
              <i v-else class="fas fa-calendar-alt"></i>
              
              {{ type === 'delayed' ? 'ATRASADO / PENDIENTE' : type === 'today' ? 'PARA HOY / URGENTE' : type === 'tomorrow' ? 'PARA MAÑANA' : 'FUTURO' }}
            </h2>
            <span class="count-badge">
              {{timeGroup.reduce((acc, cat) => acc + cat.items.length, 0)}} items
            </span>
          </div>

          <div class="groups-container">
            <ProductionCategoryGroup
              v-for="cat in timeGroup"
              :key="cat.id"
              :category="cat"
              :urgency-type="String(type)"
              @toggle-category="toggleCategory"
              @toggle-item="toggleExpand"
              @register-item="handleRegisterItem"
            />
          </div>

          <hr class="section-divider" />
        </section>
      </div>

      <div v-if="!isLoading && !error && delayedGroups.length === 0 && todayGroups.length === 0 && tomorrowGroups.length === 0 && futureGroups.length === 0" class="empty-state">
        <i class="fas fa-check-circle"></i>
        <p>No hay producción pendiente</p>
        <span>Buen trabajo, el tablero está limpio.</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$font-stack-system: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
$color-urgent: #e74c3c;
$color-warning: #f1c40f;
$color-info: #3498db;
$color-delayed: #e67e22;

.summary-view {
  min-height: 100vh;
  background: #f8f9fa;
  color: #2c3e50;
  padding-bottom: 4rem;
  font-family: $font-stack-system;
}

.header-section {
  background: white;
  padding: 1.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-content {
    h1 {
      font-size: 1.8rem;
      color: #2c3e50;
      margin: 0 0 0.5rem 0;
      font-weight: 700;
      letter-spacing: -0.5px;
    }

    p {
      color: #7f8c8d;
      margin: 0;
      font-size: 0.95rem;
    }
  }

  .header-actions {
    display: flex;
    gap: 1rem;

    button {
      background: white;
      border: 1px solid #e1e8ed;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      color: #2c3e50;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;

      &:hover {
        background: #f1f3f5;
        transform: translateY(-1px);
      }

      i {
        font-size: 1rem;
      }

      &.btn-history.active {
        background: #2c3e50;
        color: white;
        border-color: #2c3e50;
      }

      &.btn-refresh {
        color: $color-info;
        border-color: rgba($color-info, 0.3);

        &:hover {
          background: rgba($color-info, 0.05);
        }
      }
    }
  }
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.list-section {
  margin-bottom: 3rem;

  &.delayed .section-title h2 {
    color: $color-delayed;
  }

  &.today .section-title h2 {
    color: $color-urgent;
  }

  &.tomorrow .section-title h2 {
    color: $color-warning;
  }

  &.future .section-title h2 {
    color: $color-info;
  }
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e1e8ed;

  h2 {
    font-size: 1.2rem;
    font-weight: 800;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    gap: 0.8rem;

    i {
      font-size: 1.4rem;
    }
  }

  .count-badge {
    background: #e1e8ed;
    color: #7f8c8d;
    padding: 0.3rem 0.8rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
  }
}

.section-divider {
  border: 0;
  height: 1px;
  background: #e1e8ed;
  margin: 2rem 0;
}

.loading-state,
.error-msg,
.empty-state {
  padding: 4rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #7f8c8d;

  .loader {
    width: 32px;
    height: 32px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
  }

  i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #bdc3c7;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
