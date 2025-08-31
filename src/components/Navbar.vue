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
          <router-link to="/" class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300">
            Home
          </router-link>
          <router-link to="/products" class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300">
            Products
          </router-link>
          <router-link to="/about" class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300">
            About
          </router-link>
          <router-link to="/locations" class="text-gray-600 font-medium py-2 border-b-2 border-transparent hover:text-[#BAB772] transition-colors duration-300">
            Locations
          </router-link>
          <router-link to="/admin/login" class="bg-[#BAB772] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-300">
            Admin
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Navbar component logic
</script>
