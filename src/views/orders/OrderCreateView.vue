<script setup lang="ts">
import { ref, reactive } from 'vue'
import OrderService from '@/services/order.service'
import { useRouter } from 'vue-router'
import type { Product, CartItem, OrderFormData } from '@/types/order'

// Components
import OrderProductSelector from './components/OrderProductSelector.vue'
import OrderForm from './components/OrderForm.vue'
import OrderCart from './components/OrderCart.vue'
import OrderWhatsAppModal from './components/OrderWhatsAppModal.vue'

const router = useRouter()

// UI State
const isSubmitting = ref(false)
const showWhatsAppModal = ref(false)
const generatedWhatsAppMessage = ref('')
const isCourtesyMode = ref(false)

// Form Data - Strictly Typed
const formData = reactive<OrderFormData>({
  customerName: '',
  customerPhone: '',
  deliveryDate: '',
  deliveryTime: '',
  deliveryType: 'pickup',
  branch: 'San Marino', // Default or undefined
  deliveryAddress: '',
  googleMapsLink: '',
  invoiceNeeded: false,
  comments: '',
  responsible: 'Web',
  salesChannel: 'Web',
  paymentMethod: 'Por confirmar',
  invoiceData: {
    ruc: '',
    businessName: '',
    email: '',
    address: ''
  },
  // Default Payment at Creation
  registerPaymentNow: false,
  paymentDetails: {
    forma_cobro: 'TRA',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0] || '',
    numero_comprobante: '',
    numero_tarjeta: '',
    cuenta_bancaria_id: '',
    tipo_ping: 'D'
  }
})

// Cart
const cart = ref<CartItem[]>([])

const addToCart = (product: Product) => {
  const existing = cart.value.find(item => item.contifico_id === product.id)

  if (existing) {
    existing.quantity++
  } else {
    // Determine price and courtesy status based on mode
    const price = isCourtesyMode.value ? 0 : parseFloat(product.pvp1 || '0')
    const isCourtesy = isCourtesyMode.value

    cart.value.push({
      id: product.id,
      contifico_id: product.id,
      name: product.nombre,
      price: price,
      quantity: 1,
      isCourtesy: isCourtesy // Add this property to CartItem type definition if needed, but JS will allow it. Ideally update Type.
    })
  }
}

const removeFromCart = (index: number) => {
  cart.value.splice(index, 1)
}

const updateQuantity = (index: number, change: number) => {
  const item = cart.value[index]
  if (item) {
    item.quantity += change
    if (item.quantity < 1) {
      removeFromCart(index)
    }
  }
}

const submitOrder = async () => {
  if (cart.value.length === 0) {
    alert("El carrito está vacío.")
    return
  }

  // Frontend Validation
  if (!formData.customerName) { alert("Nombre del cliente es obligatorio"); return; }
  if (!formData.customerPhone) { alert("Teléfono del cliente es obligatorio"); return; }
  if (!formData.deliveryDate) { alert("Fecha de entrega es obligatoria"); return; }
  if (!formData.deliveryTime) { alert("Hora de entrega es obligatoria"); return; }
  if (!formData.branch) { alert("Sucursal de origen es obligatoria"); return; }

  if (formData.deliveryType === 'delivery') {
    if (!formData.deliveryAddress) { alert("Dirección de entrega es obligatoria para Delivery"); return; }
    if (!formData.googleMapsLink) { alert("Link de Google Maps es obligatorio para Delivery"); return; }
  }

  if (formData.invoiceNeeded) {
    if (!formData.invoiceData.ruc) { alert("RUC/Cédula es obligatorio para factura"); return; }
  }

  isSubmitting.value = true
  try {
    const payload = {
      ...formData,
      products: cart.value.map(item => ({
        contifico_id: item.contifico_id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        isCourtesy: item.isCourtesy || false
      })),
    }

    const response = await OrderService.createOrder(payload)

    generatedWhatsAppMessage.value = response.whatsappMessage
    showWhatsAppModal.value = true
  } catch (e: any) {
    alert(e.response?.data?.message || 'Error creating order. Please try again.')
    console.error(e)
  } finally {
    isSubmitting.value = false
  }
}

const sendWhatsApp = () => {
  const encoded = encodeURIComponent(generatedWhatsAppMessage.value)
  window.open(`https://wa.me/?text=${encoded}`, '_blank')
  showWhatsAppModal.value = false
  cart.value = []
  router.push('/orders/new')
}
</script>

<template>
  <div class="order-page">
    <div class="container page-header">
      <h1>Nuevo Pedido</h1>
    </div>

    <main class="container main-content">
      <!-- Left Column: Product Selection -->
      <section class="left-column">
        <div class="mode-toggle-container">
           <button 
             class="btn-courtesy-toggle" 
             :class="{ active: isCourtesyMode }"
             @click="isCourtesyMode = !isCourtesyMode"
           >
             <i class="fa-solid fa-gift"></i>
             {{ isCourtesyMode ? 'Modo Cortesía ACTIVO' : 'Activar Modo Cortesía' }}
           </button>
           <div v-if="isCourtesyMode" class="courtesy-banner">
             <small>Los productos agregados tendrán costo $0.00</small>
           </div>
        </div>
        <OrderProductSelector @add-to-cart="addToCart" />
      </section>

      <!-- Right Column: Order Details & Cart -->
      <section class="order-form-section">
        <OrderForm v-model="formData" />
        
        <OrderCart 
          :cart="cart" 
          :isSubmitting="isSubmitting"
          @remove="removeFromCart"
          @update-quantity="updateQuantity"
          @submit="submitOrder"
        />
      </section>
    </main>

    <!-- WhatsApp Modal -->
    <OrderWhatsAppModal 
      :is-open="showWhatsAppModal" 
      :message="generatedWhatsAppMessage"
      @close="showWhatsAppModal = false"
      @send="sendWhatsApp"
    />
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  // Keeping header styles locally or global as needed, but for scoped:
  background-color: white;
  border-bottom: 1px solid $border-light;
  padding: 1rem 0;
  margin-bottom: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  margin-top: 1.5rem;

  h1 {
    margin: 0;
    font-family: $font-principal;
    color: $NICOLE-PURPLE;
    font-size: 1.8rem;
  }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding-bottom: 4rem;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
}

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

@media (max-width: 900px) {
  .main-content {
    grid-template-columns: 1fr;
    padding-bottom: 2rem;
  }

  .container {
    padding: 0 1rem;
  }
}

.mode-toggle-container {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-courtesy-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 2px solid $NICOLE-PURPLE;
  background-color: transparent;
  color: $NICOLE-PURPLE;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  font-family: $font-principal;
  font-size: 1rem;

  &:hover {
    background-color: rgba($NICOLE-PURPLE, 0.1);
  }

  &.active {
    background-color: $NICOLE-PURPLE;
    color: white;
    box-shadow: 0 4px 12px rgba($NICOLE-PURPLE, 0.4);
  }
}

.courtesy-banner {
  background-color: #e0f2fe; // Light blue
  border: 1px solid #bae6fd;
  color: #0369a1;
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 600;
}
</style>
