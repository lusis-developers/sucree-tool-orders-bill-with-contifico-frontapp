<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  order: any
}>()

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })
}
</script>

<template>
  <div class="header-info">
    <div class="info-group">
      <span class="label">Pedido #</span>
      <span class="value">{{ order._id.substr(-6).toUpperCase() }}</span>
    </div>
    <div class="info-group">
       <span class="label">Estado Factura</span>
       <span class="badge" :class="order.invoiceStatus || 'NONE'">{{ order.invoiceStatus || 'No Requiere' }}</span>
    </div>
    <div class="info-group">
       <span class="label">Fecha Entrega</span>
       <span class="value">{{ formatDate(order.deliveryDate) }}</span>
    </div>
    <div class="info-group">
       <span class="label">Responsable</span>
       <span class="value">{{ order.responsible }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid $border-light;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  width: 100%;
  box-sizing: border-box;

  .info-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-left: 0.75rem;
    border-left: 3px solid rgba($NICOLE-PURPLE, 0.1);
    /* Mobile: 2 items per row */
    flex: 1 1 calc(50% - 1rem);
    min-width: 140px;

    .label {
      font-size: 0.7rem;
      color: $text-light;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .value {
      font-weight: 700;
      font-size: 1rem;
      color: $text-dark;
      font-family: $font-principal;
      word-break: break-word;
    }
  }

  @media (min-width: 768px) {
    padding: 2rem;

    .info-group {
      /* Desktop: 4 items per row */
      flex: 1 1 calc(25% - 1rem);

      .value {
        font-size: 1.25rem;
      }
    }
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 700;
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
