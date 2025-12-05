<template>
  <div class="animate-pulse space-y-8">
    <!-- Grid Layout: Image (Left) + Info (Right) -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Skeleton Image -->
      <div>
        <div class="aspect-square w-full bg-gray-200 rounded-lg"></div>
        <div class="grid grid-cols-4 gap-4 mt-4">
          <div v-for="n in 4" :key="n" class="aspect-square bg-gray-200 rounded-lg"></div>
        </div>
      </div>

      <!-- Skeleton Info -->
      <div class="space-y-6">
        <!-- Title -->
        <div class="h-8 bg-gray-200 rounded w-3/4"></div>
        
        <!-- Description -->
        <div class="space-y-2">
          <div class="h-4 bg-gray-200 rounded w-full"></div>
          <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          <div class="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>

        <!-- Price -->
        <div class="h-10 bg-gray-200 rounded w-1/3"></div>

        <!-- Variants -->
        <div class="space-y-3">
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          <div class="flex gap-3">
            <div v-for="n in 3" :key="n" class="h-12 w-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <!-- Quantity -->
        <div class="space-y-3">
          <div class="h-6 bg-gray-200 rounded w-1/4"></div>
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div class="h-10 w-16 bg-gray-200 rounded-lg"></div>
            <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex gap-3 pt-4">
          <div class="h-14 flex-1 bg-gray-200 rounded-lg"></div>
          <div class="h-14 flex-1 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    </div>

    <!-- Skeleton Details (Tabs) -->
    <div class="space-y-4 pt-8 border-t border-gray-100">
      <div class="flex gap-8 border-b border-gray-200 pb-4">
        <div class="h-6 w-32 bg-gray-200 rounded"></div>
        <div class="h-6 w-32 bg-gray-200 rounded"></div>
      </div>
      <div class="space-y-2 py-4">
        <div v-for="n in 3" :key="n" class="h-4 bg-gray-200 rounded w-full"></div>
      </div>
    </div>

    <!-- Skeleton Reviews -->
    <div class="space-y-6 pt-8 border-t border-gray-100">
      <div class="h-8 w-48 bg-gray-200 rounded"></div>
      <div class="space-y-6">
        <div v-for="n in 2" :key="n" class="flex gap-4">
          <div class="h-12 w-12 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-1/4 bg-gray-200 rounded"></div>
            <div class="h-4 w-1/6 bg-gray-200 rounded"></div>
            <div class="h-4 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
