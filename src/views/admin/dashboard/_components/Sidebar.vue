<template>
  <div class="bg-[#BAB772] text-white w-64 min-h-screen p-6">
    <!-- Brand Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">The Candil's</h1>
      <p class="text-sm opacity-90">Admin Panel</p>
    </div>

    <!-- Navigation Menu -->
    <nav class="space-y-2">
      <router-link
        to="/admin/dashboard"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-[#959253]"
        active-class="bg-[#959253]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          ></path>
        </svg>
        <span class="font-medium">Dashboard</span>
      </router-link>

      <router-link
        to="/admin/dashboard/sales"
        class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-[#959253]"
        active-class="bg-[#959253]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
        <span class="font-medium">Penjualan</span>
      </router-link>

      <!-- Produk Dropdown Menu -->
      <div class="space-y-1">
        <button
          @click="toggleProductDropdown"
          class="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors duration-200 hover:bg-[#959253]"
          :class="{ 'bg-[#959253]': isProductDropdownOpen || isProductRouteActive }"
        >
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              ></path>
            </svg>
            <span class="font-medium">Produk</span>
          </div>
          <svg
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': isProductDropdownOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        <!-- Dropdown Content -->
        <div v-show="isProductDropdownOpen" class="ml-8 space-y-1 transition-all duration-200">
          <router-link
            to="/admin/dashboard/products/kelola"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[#959253] text-sm"
            active-class="bg-[#959253]"
          >
            <span>Kelola Produk</span>
          </router-link>

          <router-link
            to="/admin/dashboard/products/detail"
            class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-[#959253] text-sm"
            active-class="bg-[#959253]"
          >
            <span>Detail Produk</span>
          </router-link>
        </div>
      </div>
    </nav>

    <!-- User Info -->
    <div class="absolute bottom-0 left-6 right-6">
      <button
        @click="handleLogout"
        class="w-53 mt-3 px-4 py-2 bg-[#959253] bg-opacity-20 rounded-lg text-sm font-medium hover:bg-[#69673b] transition-colors duration-200"
      >
        Logout
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Component name for linter
defineOptions({
  name: 'AdminSidebar',
})

const router = useRouter()
const route = useRoute()
const adminName = ref('Admin')
const isProductDropdownOpen = ref(false)

onMounted(() => {
  adminName.value = localStorage.getItem('adminId') || 'Admin'
})

// Check if any product route is active
const isProductRouteActive = computed(() => {
  return route.path.includes('/admin/dashboard/products')
})

// Toggle product dropdown
const toggleProductDropdown = () => {
  isProductDropdownOpen.value = !isProductDropdownOpen.value
}

const handleLogout = () => {
  // Clear authentication
  localStorage.removeItem('adminId')
  localStorage.removeItem('adminAuthenticated')

  // Redirect to login
  router.push('/admin/login')
}
</script>
