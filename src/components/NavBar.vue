<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const logout = () => {
  localStorage.removeItem('access_token')
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <div class="brand">
        <router-link to="/orders">Nicole Pastry Arts</router-link>
      </div>
      
      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
        <router-link to="/orders" active-class="active" @click="closeMenu">Pedidos</router-link>
        <router-link to="/orders/new" active-class="active" @click="closeMenu">Nuevo Pedido</router-link>
        <router-link to="/reports/sales-by-responsible" active-class="active" @click="closeMenu">Ventas</router-link>
        <router-link to="/reports/delivery" active-class="active" @click="closeMenu">Reporte Transporte</router-link>
        
        <div class="mobile-only">
           <button @click="logout" class="btn-logout-mobile">Cerrar Sesión</button>
        </div>
      </div>

      <div class="user-actions desktop-only">
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.navbar {
  background: white;
  border-bottom: 1px solid $border-light;
  padding: 0.75rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);

  .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .brand {
    a {
      font-family: $font-principal;
      font-size: 1.25rem;
      color: $NICOLE-PURPLE;
      text-decoration: none;
      font-weight: 700;
    }
  }

  .nav-links {
    display: flex;
    gap: 2rem;

    a {
      text-decoration: none;
      color: $text-light;
      font-weight: 500;
      font-size: 0.95rem;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
      transition: all 0.2s;

      &:hover {
        color: $NICOLE-PURPLE;
      }

      &.active {
        color: $NICOLE-PURPLE;
        border-bottom-color: $NICOLE-PURPLE;
      }
    }
  }

  .btn-logout {
    background: transparent;
    border: 1px solid $border-light;
    padding: 0.4rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    color: $text-light;
    font-size: 0.85rem;
    transition: all 0.2s;

    &:hover {
      border-color: $NICOLE-PURPLE;
      color: $NICOLE-PURPLE;
    }
  }
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;

  span {
    display: block;
    width: 24px;
    height: 2px;
    background-color: $text-dark;
    transition: all 0.3s;
  }
}

.mobile-only {
  display: none;
}

.desktop-only {
  display: block;
}

@media (max-width: 768px) {
  .navbar {
    .menu-toggle {
      display: flex;
    }

    .desktop-only {
      display: none;
    }

    .mobile-only {
      display: block;
      margin-top: 1rem;
      border-top: 1px solid $border-light;
      padding-top: 1rem;
    }

    .nav-links {
      display: none; // Hidden by default
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      flex-direction: column;
      padding: 1rem 1.5rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-bottom: 1px solid $border-light;

      &.is-open {
        display: flex;
      }

      a {
        padding: 0.75rem 0;
        font-size: 1rem;
        display: block;
        width: 100%;
      }
    }

    .btn-logout-mobile {
      width: 100%;
      padding: 0.75rem;
      background: $gray-50;
      border: 1px solid $border-light;
      border-radius: 8px;
      color: $text-dark;
      font-weight: 500;

      &:hover {
        background: $error;
        color: white;
        border-color: $error;
      }
    }
  }
}
</style>
