<script setup lang="ts">
import type { Product } from '@/types/order'
import { useProductImage } from '@/composables/useProductImage'

const props = defineProps<{
  product: Product
}>()

const emit = defineEmits<{
  (e: 'add', product: Product): void
}>()

// Use the cached image loader
const { imageSrc, isLoading } = useProductImage(props.product.imagen)

</script>

<template>
  <div class="product-card">
    <div class="product-image" :class="{ 'is-loading': isLoading }">
      <img 
        :src="imageSrc" 
        :alt="product.nombre" 
      />
      <div v-if="isLoading" class="loading-overlay">
        <span class="spinner-sm"></span>
      </div>
    </div>
    <div class="product-content">
      <div class="product-info">
        <h3>{{ product.nombre }}</h3>
        <p class="description">{{ product.descripcion || 'Deliciosas creaciones de Nicole Pastry Arts' }}</p>
      </div>
      <div class="product-actions">
        <span class="price">${{ parseFloat(product.pvp1 || '0').toFixed(2) }}</span>
        <button @click="emit('add', product)" class="btn-add">Agregar</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.product-card {
  background: white;
  border: 1px solid $border-light;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);

  &:hover {
    border-color: $NICOLE-PURPLE;
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.08);
  }

  .product-image {
    width: 100%;
    height: 140px;
    background: $gray-100;
    position: relative;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &.is-loading {
      img {
        opacity: 0.5;
      }
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .spinner-sm {
      width: 20px;
      height: 20px;
      border: 2px solid rgba($NICOLE-PURPLE, 0.3);
      border-radius: 50%;
      border-top-color: $NICOLE-PURPLE;
      animation: spin 1s ease-in-out infinite;
    }
  }

  .product-content {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 1rem;
  }

  .product-info {
    flex-grow: 1;

    h3 {
      font-size: 1rem;
      margin: 0 0 0.5rem 0;
      color: $text-dark;
      font-weight: 600;
      line-height: 1.3;
    }

    .description {
      font-size: 0.85rem;
      color: $text-light;
      margin: 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .product-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid $gray-100;
    padding-top: 0.75rem;
    margin-top: auto;

    .price {
      font-weight: 700;
      color: $NICOLE-SECONDARY;
      font-size: 1.1rem;
    }

    .btn-add {
      background: $gray-50;
      border: 1px solid $gray-200;
      color: $text-dark;
      font-weight: 600;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
      width: auto;
      height: auto;

      &:hover {
        background: $NICOLE-PURPLE;
        border-color: $NICOLE-PURPLE;
        color: white;
      }
    }
  }
}
</style>
