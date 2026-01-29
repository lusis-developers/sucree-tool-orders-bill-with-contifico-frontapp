<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import OrderService from '@/services/order.service'

import InvoiceEditModal from './components/InvoiceEditModal.vue'
import PaymentModal from './components/PaymentModal.vue'

const route = useRoute()
const order = ref<any>(null)
const isLoading = ref(false)
const showInvoiceModal = ref(false)
const showPaymentModal = ref(false)

const fetchOrder = async () => {
  const id = route.params.id as string
  if (!id) return

  isLoading.value = true
  try {
    const data = await OrderService.getOrder(id)
    order.value = data
  } catch (error) {
    console.error('Error fetching order:', error)
  } finally {
    isLoading.value = false
  }
}

const handleOrderUpdated = (updatedOrder: any) => {
  order.value = updatedOrder
}

const registerCollection = async (payload: any) => {
  if (!order.value) return;

  isLoading.value = true
  try {
    const response = await OrderService.registerCollection(order.value._id, payload);
    alert("Cobro registrado exitosamente en Contífico.");
    showPaymentModal.value = false;
    // Ideally reload order or update status, though we don't track collections in local DB yet.
    // fetchOrder(); 
  } catch (error: any) {
    console.error("Error registering collection:", error);
    alert(error.response?.data?.message || "Error al registrar el cobro.");
  } finally {
    isLoading.value = false;
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' })
}

onMounted(() => {
  fetchOrder()
})
</script>

<template>
  <div class="order-detail-page">
    <header class="app-header">
       <div class="container">
         <div class="header-left">
           <router-link to="/orders" class="back-link">← Volver</router-link>
           <h1>Detalle del Pedido</h1>
         </div>
       </div>
    </header>

    <main class="container" v-if="order">
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

      <div class="content-grid">
        <!-- Products -->
        <section class="card products-card">
          <h2>Productos</h2>
          <div class="table-wrapper">
             <table>
               <thead>
                 <tr>
                   <th>Producto</th>
                   <th class="text-right">Precio Unit.</th>
                   <th class="text-center">Cant.</th>
                   <th class="text-right">Total</th>
                 </tr>
               </thead>
               <tbody>
                 <tr v-for="(item, idx) in order.products" :key="idx">
                   <td>{{ item.name }}</td>
                   <td class="text-right">${{ item.price.toFixed(2) }}</td>
                   <td class="text-center">{{ item.quantity }}</td>
                   <td class="text-right font-bold">${{ (item.price * item.quantity).toFixed(2) }}</td>
                 </tr>
               </tbody>
               <tfoot>
                 <tr>
                   <td colspan="3" class="text-right label-total">Total:</td>
                   <td class="text-right value-total">${{ order.totalValue.toFixed(2) }}</td>
                 </tr>
               </tfoot>
             </table>
          </div>
        </section>

        <!-- Details -->
        <section class="side-info">
           <div class="card client-card">
              <h2>Cliente</h2>
              <div class="field">
                <label>Nombre</label>
                <p>{{ order.customerName }}</p>
              </div>
              <div class="field">
                <label>Teléfono</label>
                <p>{{ order.customerPhone }}</p>
              </div>
              <div class="field">
                <label>Entrega</label>
                <p class="capitalize">{{ order.deliveryType }}</p>
              </div>
              <div class="field" v-if="order.comments">
                <label>Notas Especiales</label>
                <p class="comments">{{ order.comments }}</p>
              </div>
           </div>

           <div class="card invoice-card">
              <div class="card-header-row">
                <h2>Datos Facturación</h2>
                <div style="display: flex; gap: 0.5rem;">
                  <button v-if="order.invoiceStatus === 'PROCESSED'" @click="showPaymentModal = true" class="btn-xs btn-primary">Registrar Cobro</button>
                  <button v-if="order.invoiceStatus !== 'PROCESSED'" @click="showInvoiceModal = true" class="btn-xs">Editar</button>
                </div>
              </div>
              
              <div v-if="order.invoiceNeeded">
                  <div class="field">
                    <label>Razón Social</label>
                    <p>{{ order.invoiceData.businessName }}</p>
                  </div>
                  <div class="field">
                    <label>RUC/CI</label>
                    <p>{{ order.invoiceData.ruc }}</p>
                  </div>
                  <div class="field">
                    <label>Email</label>
                    <p>{{ order.invoiceData.email }}</p>
                  </div>
                  <div class="field">
                    <label>Dirección</label>
                    <p>{{ order.invoiceData.address }}</p>
                  </div>
              </div>
              <div v-else class="empty-invoice">
                  <p>No requiere factura.</p>
              </div>
           </div>
        </section>
      </div>
    <InvoiceEditModal
      :is-open="showInvoiceModal"
      :order-id="order._id"
      :invoice-needed="order.invoiceNeeded"
      :current-invoice-data="order.invoiceData"
      @close="showInvoiceModal = false"
      @saved="handleOrderUpdated"
    />

    <PaymentModal
      v-if="order"
      :is-open="showPaymentModal"
      :order-id="order._id"
      :default-amount="order.totalValue"
      @close="showPaymentModal = false"
      @submit="registerCollection"
    />
    </main>

    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-detail-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.app-header {
  background-color: white;
  border-bottom: 1px solid $border-light;
  padding: 1rem 0;
  margin-bottom: 2rem;

  .container {
    display: flex;
    align-items: center;
    max-width: 1400px; // Match container
    margin: 0 auto;
    padding: 0 2rem;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  h1 {
    margin: 0;
    font-family: $font-principal;
    color: $NICOLE-PURPLE;
    font-size: 1.8rem;
    font-weight: 700;
  }

  .back-link {
    text-decoration: none;
    color: $text-light;
    font-weight: 600;
    background: white;
    padding: 0.5rem 1rem;
    border: 1px solid $border-light;
    border-radius: 8px;
    transition: all 0.2s;
    font-size: 0.9rem;

    &:hover {
      color: $NICOLE-PURPLE;
      border-color: $NICOLE-PURPLE;
      background: rgba($NICOLE-PURPLE, 0.05);
    }
  }
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

@media (max-width: 900px) {

  .app-header .container,
  .container {
    padding: 0 1rem;
  }
}

.header-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid $border-light;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);

  .info-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: relative;
    padding-left: 1rem;
    border-left: 3px solid rgba($NICOLE-PURPLE, 0.1);

    .label {
      font-size: 0.8rem;
      color: $text-light;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .value {
      font-weight: 700;
      font-size: 1.25rem;
      color: $text-dark;
      font-family: $font-principal;
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    padding: 1.5rem;
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px; // Fixed width sidebar for details
  gap: 2rem;
  padding-bottom: 4rem;
  align-items: start;
}

.card {
  background: white;
  border-radius: 16px;
  border: 1px solid $border-light;
  padding: 2rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -2px rgba(0, 0, 0, 0.01);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.01);
  }

  h2 {
    margin: 0 0 1.5rem 0;
    font-size: 1.25rem;
    color: $text-dark;
    font-weight: 700;
    border-bottom: 2px solid $gray-50;
    padding-bottom: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.side-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 2rem;
}

.field {
  margin-bottom: 1.25rem;
  border-bottom: 1px dashed $gray-100;
  padding-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
    padding-bottom: 0;
  }

  label {
    display: block;
    font-size: 0.8rem;
    color: $text-light;
    font-weight: 600;
    margin-bottom: 0.35rem;
    text-transform: uppercase;
  }

  p {
    margin: 0;
    font-weight: 500;
    color: $text-dark;
    font-size: 1rem;
    line-height: 1.4;
  }

  .comments {
    background: #fff8e1; // Light yellow
    color: #b45309;
    padding: 1rem;
    border-radius: 8px;
    font-size: 0.95rem;
    font-style: italic;
    border: 1px solid #fcd34d;
    margin-top: 0.5rem;
  }
}

.table-wrapper {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid $border-light;

  table {
    width: 100%;
    border-collapse: collapse;

    th {
      text-align: left;
      padding: 1rem;
      background: $gray-50;
      color: $text-dark;
      font-weight: 700;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 1.25rem 1rem;
      border-bottom: 1px solid $border-light;
      color: $text-dark;
      font-size: 0.95rem;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tfoot {
      background-color: $gray-50;

      td {
        border-top: 2px solid $border-light;
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
      }

      .label-total {
        font-weight: 700;
        font-size: 1.1rem;
        text-transform: uppercase;
      }

      .value-total {
        font-weight: 800;
        font-size: 1.5rem;
        color: $NICOLE-PURPLE;
      }
    }
  }
}

.text-right {
  text-align: right;
}

.text-center {
  text-align: center;
}

.font-bold {
  font-weight: 700;
}

.capitalize {
  text-transform: capitalize;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.3px;

  &.PENDING {
    background: #fff7ed;
    color: #c2410c;
    border: 1px solid #ffedd5;
  }

  &.PROCESSED {
    background: #f0fdf4;
    color: #15803d;
    border: 1px solid #dcfce7;
  }

  &.ERROR {
    background: #fef2f2;
    color: #b91c1c;
    border: 1px solid #fee2e2;
  }

  &.NONE {
    background: $gray-100;
    color: $text-light;
  }
}

.loading-state {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid rgba($NICOLE-PURPLE, 0.1);
    border-top-color: $NICOLE-PURPLE;
    border-radius: 50%;
    animation: spin 0.8s infinite cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .header-info {
    grid-template-columns: 1fr 1fr;
  }

  .side-info {
    position: static;
  }
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.btn-xs {
  background: white;
  border: 1px solid $border-light;
  padding: 0.4rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  color: $NICOLE-PURPLE;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: $NICOLE-PURPLE;
    color: white;
    border-color: $NICOLE-PURPLE;
  }

  &.btn-primary {
    background: $NICOLE-PURPLE;
    color: white;
    border-color: $NICOLE-PURPLE;

    &:hover {
      background: darken-color($NICOLE-PURPLE, 5%);
    }
  }
}

.empty-invoice {
  color: $text-light;
  font-size: 0.95rem;
  font-style: italic;
  padding: 1rem;
  background: $gray-50;
  border-radius: 8px;
  text-align: center;
}
</style>
