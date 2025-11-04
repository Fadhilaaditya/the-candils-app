<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
    <!-- Header Card: Avatar, Nama, Bintang -->
    <div class="flex items-center mb-4">
      <!-- Avatar Skeleton -->
      <div class="w-10 h-10 bg-gray-200 rounded-full mr-3 flex-shrink-0"></div>
      
      <div class="flex-1 space-y-2">
        <!-- Nama Skeleton -->
        <div class="h-4 bg-gray-200 rounded w-1/3"></div>
        <!-- Bintang Skeleton -->
        <div class="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    
    <!-- Body Card: Komentar Skeleton -->
    <div class="space-y-2">
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
      <div class="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Komponen ini murni untuk tampilan, tidak memerlukan script
</script>
