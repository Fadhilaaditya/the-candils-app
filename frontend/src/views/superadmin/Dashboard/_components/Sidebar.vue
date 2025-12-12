<template>
  <div class="flex flex-col w-50 lg:w-64 h-[100dvh] px-4 py-4 lg:py-8 bg-white border-r">
    
    <!-- Header Sidebar -->
    <div class="flex items-center justify-between px-4 mb-8">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <span class="inline-block p-2 text-xl font-bold text-white bg-[#BAB772] rounded-lg">TC</span>
        </div>
        <div class="ml-3">
          <h2 class="text-sm font-bold text-gray-800">The Candil's</h2>
          <span class="text-xs text-gray-500">TBC ADMIN</span>
        </div>
      </div>
      <!-- Close Button (Mobile Only) -->
      <button @click="$emit('close')" class="lg:hidden text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
    </div>

    <!-- Menu Navigasi -->
    <nav class="flex-1 space-y-2 overflow-y-auto">
      <router-link
        v-for="item in menuItems"
        :key="item.name"
        :to="{ name: item.routeName }"
        class="flex items-center px-4 py-2.5 text-gray-600 transition-colors duration-200 transform rounded-lg hover:bg-gray-100 hover:text-gray-800"
        :class="{ 'bg-gray-100 text-gray-900 font-medium': isActive(item) }"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" v-html="item.icon"></svg>
        <span class="ml-3 text-sm font-medium">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Footer Sidebar (Profil Admin) -->
    <div class="pt-4 border-t border-gray-200 mt-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <img
            class="w-10 h-10 rounded-full object-cover"
            src="https://placehold.co/40x40/eeeeee/999999?text=A"
            alt="Admin Avatar"
          />
          <div>
            <p class="text-sm font-medium text-gray-800">{{ adminName }}</p>
            <p class="text-xs text-gray-500">{{ adminRole }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="p-2 text-gray-500 rounded-lg hover:bg-gray-100"
          title="Logout"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'AdminSidebar' })
defineEmits(['close'])

const route = useRoute()
const router = useRouter()
const adminName = ref(localStorage.getItem('adminName') || 'Admin')
const adminRole = ref(localStorage.getItem('adminRole') || 'Super Admin')

interface MenuItem {
  name: string
  routeName: string
  path: string
  icon: string
  exactPath?: string // Path yang harus di-exclude
}

// Definisi Menu
const menuItems: MenuItem[] = [
  { 
    name: 'Dashboard', 
    routeName: 'superadmin-dashboard-main', 
    path: '/superadmin/dashboard', 
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>'
  },
  { 
    name: 'Penjualan', 
    routeName: 'superadmin-sales', 
    path: '/superadmin/dashboard/sales', 
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>' 
  },
  { 
    name: 'Produk', 
    routeName: 'superadmin-products-kelola',
    path: '/superadmin/dashboard/products',
    exactPath: '/superadmin/dashboard/products/review', // Exclude review dari produk
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>' 
  },
  { 
    name: 'Review', 
    routeName: 'superadmin-review', 
    path: '/superadmin/dashboard/products/review', 
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>'
  },
  { 
    name: 'Pemesanan', 
    routeName: 'superadmin-orders', 
    path: '/superadmin/dashboard/orders', 
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>'
  },
  { 
    name: 'Kelola Akun', 
    routeName: 'superadmin-accounts', 
    path: '/superadmin/dashboard/accounts', 
    icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>'
  },
]

// Logika untuk highlight menu aktif
const isActive = (item: MenuItem) => {
  const currentPath = route.path
  
  // 1. Cek berdasarkan route name (paling akurat)
  if (route.name === item.routeName) {
    return true
  }
  
  // 2. Untuk Dashboard, harus exact match
  if (item.path === '/superadmin/dashboard') {
    return route.name === 'superadmin-dashboard-main'
  }
  
  // 3. Untuk Produk, exclude path review
  if (item.name === 'Produk' && item.exactPath) {
    // Jika sedang di review, jangan highlight produk
    if (currentPath.startsWith(item.exactPath)) {
      return false
    }
    // Highlight produk jika di /products (tapi bukan /products/review)
    return currentPath.startsWith(item.path) && !currentPath.includes('/review')
  }
  
  // 4. Untuk menu lain, cek prefix path
  return currentPath.startsWith(item.path)
}

const handleLogout = () => {
  localStorage.removeItem('authToken')
  localStorage.removeItem('adminName')
  router.push({ name: 'home' })
}
</script>