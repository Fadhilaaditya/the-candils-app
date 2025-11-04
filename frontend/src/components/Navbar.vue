<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-8 py-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2 text-decoration-none text-inherit">
            <span class="text-2xl font-bold text-[#BAB772] font-serif">TC</span>
            <span class="text-xl font-semibold text-gray-800">The Candil's</span>
          </router-link>
        </div>

        <div class="flex gap-8 items-center">
          <router-link 
            to="/" 
            class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300"
          >
            Home
          </router-link>
          <router-link 
            to="/products" 
            class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300"
          >
            Products
          </router-link>
          <router-link 
            to="/about" 
            class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300"
          >
            About
          </router-link>
          <router-link 
            to="/locations" 
            class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300"
          >
            Locations
          </router-link>
          
          <!-- Cart Button (New) -->
          <router-link 
            to="/cart" 
            class="relative text-gray-600 hover:text-[#BAB772] transition-colors duration-300 p-2"
          >
            <svg 
              class="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            
            <!-- Badge untuk jumlah item di keranjang -->
            <span 
              v-if="cartItemCount > 0"
              class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartItemCount > 9 ? '9+' : cartItemCount }}
            </span>
          </router-link>
          
          <router-link 
            to="/admin/login" 
            class="bg-[#BAB772] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-300"
          >
            Admin
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// State untuk jumlah item di keranjang
const cartItemCount = ref<number>(0)

// Function untuk mengambil data dari localStorage
const loadCartCount = () => {
  try {
    const cart = localStorage.getItem('cart')
    if (cart) {
      const cartData = JSON.parse(cart)
      cartItemCount.value = Array.isArray(cartData) ? cartData.length : 0
    } else {
      cartItemCount.value = 0
    }
  } catch (error) {
    console.error('Error loading cart count:', error)
    cartItemCount.value = 0
  }
}

// Load saat component mounted
onMounted(() => {
  loadCartCount()
  
  // Listen untuk update dari localStorage (untuk sync antar tab)
  window.addEventListener('storage', loadCartCount)
  
  // Listen untuk custom event dari add to cart
  window.addEventListener('cartUpdated', loadCartCount)
})

// TODO: Jika menggunakan Pinia/Vuex, ganti dengan:
// import { useCartStore } from '@/stores/cart'
// const cartStore = useCartStore()
// const cartItemCount = computed(() => cartStore.itemCount)
</script>