<script setup lang="ts">
import type { OrderFormData } from '@/types/order'

const props = defineProps<{
  modelValue: OrderFormData
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: OrderFormData): void
}>()

// Helper to update individual fields while maintaining reactivity
// However, since formData is a nested object, direct mutation of props.modelValue works in Vue 3 
// if it's a reactive object passed down, BUT "props down events up" is cleaner.
// For deep objects, v-model often implies we replace the object or rely on reactivity.
// Let's use direct binding to props properties for simplicity if the parent passed a reactive object,
// OR emit updates. Given the complexity, let's assume the parent passes a reactive object and we bind directly to it
// knowing Vue's reactivity system handles it, OR we emit deep updates.
// Standard acceptable pattern in forms: v-model="formData.field" where formData is a prop.
// Check if "modelValue" is reactive. Yes.
// To be strict:
</script>

<template>
  <div class="card">
    <h2>Datos del Cliente</h2>
    <div class="form-grid">
      <div class="form-group">
        <label>Nombre Cliente</label>
        <input v-model="modelValue.customerName" required />
      </div>
      <div class="form-group">
        <label>Teléfono</label>
        <input v-model="modelValue.customerPhone" required />
      </div>
      <div class="form-group">
        <label>Fecha Entrega</label>
        <input type="datetime-local" v-model="modelValue.deliveryDate" required />
      </div>
      <div class="form-group">
        <label>Tipo Entrega</label>
        <select v-model="modelValue.deliveryType">
          <option value="pickup">Retiro en Local</option>
          <option value="delivery">Delivery</option>
        </select>
      </div>
      <div class="form-group">
        <label>Responsable</label>
        <select v-model="modelValue.responsible">
          <option value="Web">Web</option>
          <option value="Hillary">Hillary</option>
          <option value="E">E</option>
          <option value="Ivin">Ivin</option>
        </select>
      </div>
    </div>

    <div class="form-group" style="margin-top: 1rem;">
      <label>Notas Especiales (Comentarios)</label>
      <textarea v-model="modelValue.comments" rows="3" placeholder="Detalles adicionales del pedido..."></textarea>
    </div>


    <div class="invoice-toggle">
      <label>
        <input type="checkbox" v-model="modelValue.invoiceNeeded" />
        Requiere Factura
      </label>
    </div>

    <div v-if="modelValue.invoiceNeeded" class="invoice-fields">
      <h3>Datos de Facturación</h3>
      <div class="form-group">
        <label>RUC / Cédula</label>
        <input v-model="modelValue.invoiceData.ruc" />
      </div>
      <div class="form-group">
        <label>Razón Social / Nombre</label>
        <input v-model="modelValue.invoiceData.businessName" />
      </div>
      <div class="form-group">
        <label>Email</label>
        <input v-model="modelValue.invoiceData.email" type="email" />
      </div>
      <div class="form-group">
        <label>Dirección</label>
        <input v-model="modelValue.invoiceData.address" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid $border-light;
  margin-bottom: 1.5rem;

  h2 {
    font-family: $font-principal;
    font-size: 1.25rem;
    color: $NICOLE-SECONDARY;
    margin-top: 0;
    border-bottom: 1px solid $border-light;
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  label {
    font-size: 0.85rem;
    color: $text-light;
    font-weight: 500;
  }

  input,
  select {
    padding: 0.5rem;
    border: 1px solid $border-light;
    border-radius: 6px;

    &:focus {
      outline: none;
      border-color: $NICOLE-PURPLE;
    }
  }
}

.invoice-toggle {
  margin: 1.5rem 0 1rem;
  padding: 0.5rem;
  background: $gray-50;
  border-radius: 6px;

  label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-weight: 500;
    color: $text-dark;
  }
}

.invoice-fields {
  display: grid;
  gap: 1rem;
  animation: fadeIn 0.3s ease;

  h3 {
    font-size: 1rem;
    color: $text-dark;
    margin: 0.5rem 0 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
