<template>
  <div class="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
    <!-- Skeleton Image -->
    <div class="relative">
      <div class="w-full h-64 bg-gray-200"></div>
      <!-- Skeleton Badge -->
      <div class="absolute top-3 right-3 w-16 h-6 bg-gray-300 rounded-full"></div>
    </div>

    <!-- Skeleton Content -->
    <div class="p-4 space-y-3">
      <!-- Skeleton Title -->
      <div class="h-5 bg-gray-200 rounded w-3/4"></div>
      
      <!-- Skeleton Rating -->
      <div class="flex items-center gap-2">
        <div class="flex gap-1">
          <div v-for="n in 5" :key="n" class="w-4 h-4 bg-gray-200 rounded"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-16"></div>
      </div>

      <!-- Skeleton Price -->
      <div class="flex items-baseline gap-2">
        <div class="h-6 bg-gray-300 rounded w-24"></div>
        <div class="h-4 bg-gray-200 rounded w-20"></div>
      </div>

      <!-- Skeleton Variants -->
      <div class="flex gap-2">
        <div v-for="n in 3" :key="n" class="w-12 h-8 bg-gray-200 rounded"></div>
      </div>

      <!-- Skeleton Button -->
      <div class="h-10 bg-gray-200 rounded-lg w-full mt-4"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SkeletonProductCard'
})
</script>