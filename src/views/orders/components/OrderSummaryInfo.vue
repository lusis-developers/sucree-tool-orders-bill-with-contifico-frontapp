<script setup lang="ts">
import { computed } from 'vue'
import { formatECT } from '@/utils/dateUtils'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  }
})

const displayDate = computed(() => {
  if (!props.order.deliveryDate) return 'N/A'
  // If we have a deliveryTime, we use it for display
  const datePart = formatECT(props.order.deliveryDate, false)
  return `${datePart} ${props.order.deliveryTime || ''}`
})

const isDelivery = computed(() => props.order.deliveryType === 'delivery')
const branchLabel = computed(() => props.order.branch || 'Centro de Producción')

const deliveryBadgeClass = computed(() => ({
  'badge-delivery': isDelivery.value,
  'badge-pickup': !isDelivery.value
}))
</script>

<template>
  <div class="order-summary-container">
    <div class="main-stats">
      <div class="stat-card primary">
        <span class="label">Pedido</span>
        <span class="value">#{{ order._id.substr(-6).toUpperCase() }}</span>
      </div>
      <div class="stat-card">
        <span class="label">Fecha Entrega</span>
        <span class="value">{{ displayDate }}</span>
      </div>
      <div class="stat-card">
        <span class="label">Facturación</span>
        <span class="badge" :class="order.invoiceStatus || 'NONE'">
          {{ order.invoiceStatus || 'No Requiere' }}
        </span>
      </div>
      <div class="stat-card">
        <span class="label">Responsable</span>
        <span class="value">{{ order.responsible }}</span>
      </div>
    </div>

    <div class="delivery-highlight" :class="{ 'is-delivery': isDelivery }">
      <div class="highlight-header">
        <div class="type-indicator" :class="deliveryBadgeClass">
          <i :class="isDelivery ? 'fas fa-truck' : 'fas fa-store'"></i>
          {{ isDelivery ? 'Servicio de Delivery' : 'Retiro en Local' }}
        </div>
      </div>
      
      <div class="highlight-content">
        <div v-if="!isDelivery" class="pickup-info">
          <div class="info-item">
            <i class="fas fa-map-marker-alt"></i>
            <div>
              <span class="item-label">Local de Retiro</span>
              <span class="item-value">{{ branchLabel }}</span>
            </div>
          </div>
        </div>

        <div v-else class="delivery-info">
          <div class="info-item">
            <i class="fas fa-map-pin"></i>
            <div>
              <span class="item-label">Dirección de Entrega</span>
              <span class="item-value">{{ order.deliveryAddress }}</span>
            </div>
          </div>
          <div v-if="order.googleMapsLink" class="info-item link-item">
            <i class="fas fa-external-link-alt"></i>
            <a :href="order.googleMapsLink" target="_blank" class="maps-link">
              Ver en Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-summary-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
  width: 100%;
}

.main-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  &.primary {
    border-left: 4px solid $NICOLE-PURPLE;
  }

  .label {
    font-size: 0.65rem;
    color: $text-light;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 0.95rem;
    font-weight: 700;
    color: $text-dark;
    font-family: $font-principal;
  }
}

.delivery-highlight {
  background: white;
  border-radius: 12px;
  border: 1px solid $border-light;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-left: 4px solid #0ea5e9; // Pickup blue

  &.is-delivery {
    border-left-color: #f43f5e; // Delivery red
  }

  .highlight-header {
    display: flex;
    align-items: center;
  }

  .type-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 800;
    text-transform: uppercase;
    font-size: 0.8rem;
    letter-spacing: 0.5px;

    &.badge-delivery {
      color: #f43f5e;
    }

    &.badge-pickup {
      color: #0ea5e9;
    }
  }

  .highlight-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-item {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;

    i {
      margin-top: 0.25rem;
      color: $text-light;
      font-size: 1rem;
    }

    div {
      display: flex;
      flex-direction: column;
    }

    .item-label {
      font-size: 0.7rem;
      color: $text-light;
      font-weight: 600;
    }

    .item-value {
      font-size: 1rem;
      font-weight: 700;
      color: $text-dark;
    }
  }

  .maps-link {
    color: $NICOLE-PURPLE;
    text-decoration: none;
    font-weight: 700;
    font-size: 0.9rem;
    border-bottom: 2px solid rgba($NICOLE-PURPLE, 0.2);
    transition: all 0.2s;

    &:hover {
      color: $purple-dark;
      border-bottom-color: $NICOLE-PURPLE;
    }
  }
}

.badge {
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  width: fit-content;

  &.PENDING {
    background: #fff7ed;
    color: #c2410c;
  }

  &.PROCESSED {
    background: #f0fdf4;
    color: #15803d;
  }

  &.ERROR {
    background: #fef2f2;
    color: #b91c1c;
  }

  &.NONE {
    background: $gray-100;
    color: #64748b;
  }
}
</style>
