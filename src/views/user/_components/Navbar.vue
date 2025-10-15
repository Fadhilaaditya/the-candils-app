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

        <!-- Desktop links -->
        <div class="hidden md:flex gap-8 items-center">
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
          <router-link
            to="/admin/login"
            class="bg-[#BAB772] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-300"
          >
            Admin
          </router-link>
        </div>

        <!-- Hamburger button -->
        <button
          type="button"
          class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
          aria-label="Toggle navigation"
          @click="open = !open"
        >
          <svg
            v-if="!open"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Mobile menu -->
      <transition name="fade">
        <div v-if="open" class="md:hidden pt-3">
          <div class="flex flex-col gap-2">
            <router-link @click="open = false" to="/" class="px-3 py-2 rounded-md hover:bg-gray-50"
              >Home</router-link
            >
            <router-link
              @click="open = false"
              to="/products"
              class="px-3 py-2 rounded-md hover:bg-gray-50"
              >Products</router-link
            >
            <router-link
              @click="open = false"
              to="/AboutUs"
              class="px-3 py-2 rounded-md hover:bg-gray-50"
              >About</router-link
            >
            <router-link
              @click="open = false"
              to="/locations"
              class="px-3 py-2 rounded-md hover:bg-gray-50"
              >Locations</router-link
            >
            <router-link
              @click="open = false"
              to="/admin/login"
              class="mt-1 bg-[#BAB772] text-white px-4 py-2 rounded-lg font-medium text-center hover:bg-[#a8a668]"
              >Admin</router-link
            >
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

defineOptions({ name: 'UserNavbar' })

const open = ref(false)
const route = useRoute()

watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
