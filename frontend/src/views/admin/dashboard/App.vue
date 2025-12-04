<template>
  <div class="flex h-screen overflow-hidden bg-gray-100">

    <!-- Mobile Sidebar Backdrop -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="fixed inset-0 z-20 transition-opacity bg-black opacity-50 lg:hidden"
    ></div>

    <!-- Sidebar -->
    <AdminSidebar 
      :class="[
        'fixed inset-y-0 left-0 z-30 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      ]"
      @close="isSidebarOpen = false"
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      
      <!-- Header Wrapper with Hamburger -->
      <div class="flex flex-col">
        <div class="flex items-center justify-between p-4 bg-white border-b lg:hidden">
          <button @click="isSidebarOpen = true" class="text-gray-500 focus:outline-none">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <span class="font-bold text-gray-700">The Candil's Admin</span>
          <div class="w-6"></div> <!-- Spacer for centering -->
        </div>
        <AdminHeader />
      </div>
      
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AdminSidebar from './_components/Sidebar.vue'
import AdminHeader from './_components/AdminHeader.vue'

defineOptions({
  name: 'AdminLayout',
})

const isSidebarOpen = ref(false)
</script>