<template>
  <nav class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-4">
      <div class="flex justify-between items-center">
        <!-- Logo -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2 no-underline">
            <img src="/logo-candils.jpg" alt="The Candils Logo" class="h-12 w-auto object-contain" />
            <span class="text-xl font-semibold text-gray-800">The Candil's</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex gap-8 items-center">
          <router-link
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300 no-underline"
            active-class="text-[#BAB772] border-[#BAB772]"
          >
            {{ link.label }}
          </router-link>

          <!-- Cart Button with Badge -->
          <router-link
            to="/cart"
            class="relative inline-flex text-gray-600 hover:text-[#BAB772] transition-colors duration-300 p-2 rounded-lg hover:bg-gray-50"
            aria-label="Shopping Cart"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>

            <!-- Badge dengan animasi -->
            <Transition name="badge">
              <span
                v-if="cartItemCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg"
              >
                {{ cartItemCount > 99 ? '99+' : cartItemCount }}
              </span>
            </Transition>
          </router-link>

        </div>

        <!-- Mobile Menu Button -->
        <div class="md:hidden flex items-center gap-4">
          <!-- Cart Icon (Visible on Mobile) -->
          <router-link
            to="/cart"
            class="relative inline-flex text-gray-600 hover:text-[#BAB772] transition-colors duration-300 p-2"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span v-if="cartItemCount > 0" class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 shadow-lg">
              {{ cartItemCount > 99 ? '99+' : cartItemCount }}
            </span>
          </router-link>

          <button @click="isMenuOpen = !isMenuOpen" class="text-gray-600 hover:text-[#BAB772] focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!isMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Dropdown -->
    <div v-show="isMenuOpen" class="md:hidden bg-white border-t border-gray-100">
      <div class="px-4 pt-2 pb-4 space-y-1">
        <router-link
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#BAB772] hover:bg-gray-50 transition-colors duration-200"
          active-class="text-[#BAB772] bg-gray-50"
          @click="isMenuOpen = false"
        >
          {{ link.label }}
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router' // Tambahkan impor ini

const isMenuOpen = ref(false)

const API_BASE_URL = import.meta.env.PROD
  ? 'https://backend-the-candils.vercel.app/api/cart'
  : 'http://localhost:3000/api/cart'

// Navigation links data
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/locations', label: 'Locations' },
]

// Cart state
const cartItemCount = ref<number>(0)

// --- [PERBAIKAN 1]: Gunakan logika Session ID yang KONSISTEN ---
// (Disalin dari Cart.vue / ProductInfo.vue)
const getCartSessionId = (): string => {
  let cartSessionId = localStorage.getItem('cartSessionId')
  if (!cartSessionId) {
    // Buat session baru jika tidak ada (misal: saat kunjungan pertama)
    // Kita tidak akan menyimpannya di sini, biarkan 'add to cart' yang membuatnya
    // Kita hanya perlu ID "sementara" jika belum ada
    return `session_temp_${Date.now()}` // ID sementara jika keranjang kosong
  }
  return cartSessionId
}

// --- [PERBAIKAN 2]: Panggil API 'summary' yang benar ---
const loadCartCount = async () => {
  try {
    const cartSessionId = getCartSessionId()

    // Panggil endpoint 'summary' dengan 'cartSessionId' sebagai route parameter
    const response = await fetch(`${API_BASE_URL}/summary/${cartSessionId}`)

    if (!response.ok) {
      throw new Error('Gagal mengambil ringkasan keranjang')
    }

    const result = await response.json()

    if (result.success && result.data) {
      // Gunakan 'total_items' yang sudah dihitung oleh backend
      cartItemCount.value = result.data.total_items || 0
    } else {
      cartItemCount.value = 0
    }
  } catch (error) {
    console.error('Error loading cart count:', error)
    cartItemCount.value = 0
  }
}

// Lifecycle hooks (Kode Anda di sini sudah benar)
onMounted(() => {
  loadCartCount() // Muat saat Navbar pertama kali muncul

  // Dengarkan sinyal 'cartUpdated' dari komponen lain
  window.addEventListener('cartUpdated', loadCartCount)
})

onUnmounted(() => {
  // Hapus listener saat komponen dihancurkan
  window.removeEventListener('cartUpdated', loadCartCount)
})
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}

/* Animasi untuk badge */
.badge-enter-active,
.badge-leave-active {
  transition: all 0.3s ease;
}

.badge-enter-from {
  opacity: 0;
  transform: scale(0);
}

.badge-leave-to {
  opacity: 0;
  transform: scale(0);
}

/* Hover effect untuk cart icon */
.router-link-active svg {
  color: #bab772;
}
</style>
