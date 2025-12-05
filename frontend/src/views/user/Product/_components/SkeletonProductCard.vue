<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse flex flex-col">
    <!-- Skeleton Image -->
    <div class="relative">
      <div class="w-full h-48 bg-gray-200"></div>
    </div>

    <!-- Skeleton Content -->
    <div class="p-4 flex flex-col flex-1">
      <!-- Skeleton Title -->
      <div class="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
      
      <!-- Skeleton Size -->
      <div class="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>

      <!-- Skeleton Price -->
      <div class="h-6 bg-gray-300 rounded w-1/2 mb-3"></div>

      <!-- Skeleton Description -->
      <div class="space-y-2 mb-4">
        <div class="h-3 bg-gray-200 rounded w-full"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6"></div>
      </div>

      <!-- Skeleton Rating & Reviews -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-1">
          <div v-for="n in 5" :key="n" class="w-4 h-4 bg-gray-200 rounded"></div>
          <div class="h-4 bg-gray-200 rounded w-8 ml-1"></div>
        </div>
        <div class="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      
      <!-- Skeleton Button -->
      <div class="mt-auto">
        <div class="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SkeletonProductCard'
})
</script>