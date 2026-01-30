<script setup lang="ts">
import ActionHoldButton from '@/components/common/ActionHoldButton.vue'

interface OrderDetail {
  id: string
  quantity: number
  client: string
  delivery: string
  stage: string
}

interface Item {
  _id: string
  totalQuantity: number
  urgency: string
  category?: string
  orders: OrderDetail[]
  isExpanded?: boolean
  currentInput?: number
  mode?: 'all' | 'custom'
}

const props = defineProps<{
  item: Item
  urgencyType: string // 'delayed' | 'today' | 'tomorrow' | 'future'
}>()

const emit = defineEmits(['register', 'toggle-expand', 'void-item'])

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-EC', {
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const formatClient = (clientName: string) => {
  const parts = clientName.split(' ')
  return parts.slice(0, 2).join(' ')
}

const handleVoidTrigger = () => {
  console.log('ProductionItemRow: Void trigger activated for item', props.item._id)
  emit('void-item', props.item)
}

const setMode = (mode: 'all' | 'custom') => {
  // Direct mutation of prop object is generally discouraged/anti-pattern if strict, 
  // but common in Vue for this kind of "list item state" when not using a store. 
  // For specific refactor speed, we will emit update or just mutate if it's the pattern.
  // The user code was mutating `item.mode`. We will replicate that or emit.
  // Let's mutate for now to stay consistent with previous logic, 
  // but ideally we should emit 'update:item'.
  props.item.mode = mode
  if (mode === 'all') {
    props.item.currentInput = props.item.totalQuantity
  } else {
    props.item.currentInput = undefined
  }
}

const validateInput = () => {
  if (props.item.currentInput && props.item.currentInput > props.item.totalQuantity) {
    props.item.currentInput = props.item.totalQuantity
  }
  if (props.item.currentInput && props.item.currentInput < 0) {
    props.item.currentInput = undefined
  }
}

const triggerRegister = () => {
  emit('register', props.item)
}

const toggleExpand = () => {
  emit('toggle-expand', props.item)
}
</script>

<template>
    <div class="list-row" :class="{ expanded: item.isExpanded }">
        <div class="row-main">
            <!-- Left: Info -->
            <div class="info-col" @click="toggleExpand">
                <div class="urgency-tag" :class="urgencyType">
                    <i class="far fa-clock"></i>
                    {{ formatDate(item.urgency) }}
                </div>
                <h3 class="product-name">{{ item._id }}</h3>
                <button class="btn-expand-mobile" @click.stop="toggleExpand">
                    <i class="fas fa-chevron-down" :class="{ rotated: item.isExpanded }"></i>
                </button>
            </div>

            <!-- Center: Stats -->
            <div class="stats-col">
                <span class="qty-total">{{ item.totalQuantity }}</span>
                <span class="qty-label">PENDIENTES</span>
            </div>

            <!-- Right: Action -->
            <div class="action-col">
                <!-- Void Button (Left side of actions) -->
                 <div class="void-btn-wrapper" v-if="urgencyType === 'delayed'">
                    <ActionHoldButton 
                        label="Anular" 
                        color="#c0392b"
                        :hold-duration="1500"
                        @trigger="handleVoidTrigger"
                    />
                </div>

                <div class="mode-toggles">
                    <button 
                        class="mode-btn" 
                        :class="{ active: item.mode === 'all' }"
                        @click.stop="setMode('all')"
                    >
                        TODO
                    </button>
                    <button 
                        class="mode-btn" 
                        :class="{ active: item.mode === 'custom' }"
                        @click.stop="setMode('custom')"
                    >
                        MANUAL
                    </button>
                </div>

                <div class="input-wrapper" v-if="item.mode === 'custom'">
                    <input 
                        type="number" 
                        v-model="item.currentInput" 
                        placeholder="#"
                        min="1"
                        :max="item.totalQuantity"
                        class="qty-input"
                        @click.stop
                        @input="validateInput"
                    />
                </div>
                <div class="all-mode-label" v-else>
                    {{ item.totalQuantity }} Unid.
                </div>

                <div class="hold-btn-wrapper">
                    <ActionHoldButton 
                        v-if="urgencyType === 'today' || urgencyType === 'delayed'"
                        label="Completar" 
                        :color="urgencyType === 'today' || urgencyType === 'delayed' ? '#e74c3c' : '#2ecc71'"
                        :disabled="!item.currentInput"
                        @trigger="triggerRegister"
                    />
                    <div v-else class="view-only-badge">
                        Solo Visualización
                    </div>
                </div>

            </div>
        </div>

        <!-- Details Drawer -->
        <div v-if="item.isExpanded" class="row-details">
            <h4>Detalle de Pedidos</h4>
            <div class="orders-list">
                <div v-for="order in item.orders" :key="order.id" class="order-pill">
                    <b>{{ formatClient(order.client) }}</b>
                    <span>x{{ order.quantity }}</span> ({{ formatDate(order.delivery) }})
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
$color-urgent: #e74c3c;
$color-delayed: #c0392b;
$color-info: #3498db;

.list-row {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow: hidden;
  transition: all 0.2s;
  margin-bottom: 0.8rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.06);
  }

  .row-main {
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;

    @media (min-width: 768px) {
      flex-wrap: nowrap;
    }
  }

  .info-col {
    flex: 1;
    min-width: 200px;
    cursor: pointer;

    .urgency-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      margin-bottom: 6px;
      text-transform: uppercase;

      &.delayed {
        color: $color-delayed;
        background: rgba($color-delayed, 0.1);
      }

      &.today {
        color: $color-urgent;
        background: rgba($color-urgent, 0.1);
      }

      &.tomorrow {
        color: #d35400;
        background: rgba(#d35400, 0.1);
      }

      &.future {
        color: $color-info;
        background: rgba($color-info, 0.1);
      }
    }

    .product-name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: #2c3e50;
      line-height: 1.3;
    }

    .btn-expand-mobile {
      display: none;
    }
  }

  .stats-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 80px;
    padding: 0 1rem;
    border-right: 1px solid #f1f2f6;
    border-left: 1px solid #f1f2f6;

    .qty-total {
      font-size: 1.5rem;
      font-weight: 900;
      color: #2c3e50;
      line-height: 1;
    }

    .qty-label {
      font-size: 0.6rem;
      color: #95a5a6;
      font-weight: 800;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }
  }

  .action-col {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-left: auto;

    .mode-toggles {
      display: flex;
      background: #f1f2f6;
      padding: 3px;
      border-radius: 8px;
      margin-right: 0.5rem;

      .mode-btn {
        border: none;
        background: transparent;
        padding: 6px 10px;
        font-size: 0.7rem;
        font-weight: 700;
        color: #95a5a6;
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;

        &.active {
          background: white;
          color: #2c3e50;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .input-wrapper {
      width: 80px;

      .qty-input {
        width: 100%;
        padding: 0.5rem;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1.2rem;
        font-weight: 800;
        text-align: center;
        transition: all 0.2s;
        color: #2c3e50;

        &:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
        }
      }
    }

    .all-mode-label {
      font-size: 1rem;
      font-weight: 800;
      color: #2c3e50;
      padding: 0 1rem;
      background: #e8f6f3;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      color: #16a085;
    }

    .hold-btn-wrapper {
      width: 140px;
    }

    .view-only-badge {
      font-size: 0.7rem;
      color: #95a5a6;
      background: #f1f2f6;
      padding: 4px 8px;
      border-radius: 4px;
      text-align: center;
      font-weight: 600;
      width: 100%;
    }

    .void-btn-wrapper {
      margin-left: 0.5rem;

      .btn-void {
        background: #ffebee;
        color: #c0392b;
        border: 1px solid rgba(192, 57, 43, 0.2);
        padding: 0.4rem 0.8rem;
        border-radius: 6px;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.2s;

        &:hover {
          background: #c0392b;
          color: white;
        }
      }
    }
  }
}

.row-details {
  background: #fafbfc;
  padding: 1rem 1.5rem;
  border-top: 1px solid #f1f2f6;

  h4 {
    margin: 0 0 0.8rem 0;
    font-size: 0.75rem;
    text-transform: uppercase;
    color: #95a5a6;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .orders-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem;

    .order-pill {
      background: white;
      border: 1px solid #e0e0e0;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.85rem;
      color: #34495e;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

      span {
        color: #7f8c8d;
        margin-left: 6px;
        font-weight: 600;
        background: #f5f6fa;
        padding: 2px 6px;
        border-radius: 4px;
      }

      b {
        font-weight: 700;
        color: #2c3e50;
      }
    }
  }
}
</style>
