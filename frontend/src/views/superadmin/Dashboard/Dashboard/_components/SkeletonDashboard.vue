<template>
  <div class="animate-pulse space-y-8">
    <!-- Header Skeleton Removed -->

    <!-- Stats Cards Skeleton -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between h-48">
        <!-- Header: Icon + Title -->
        <div class="flex items-center space-x-3 mb-4">
          <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div class="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        
        <!-- Body: Label + Value -->
        <div class="flex flex-col space-y-2 mb-4">
          <div class="h-3 bg-gray-200 rounded w-20"></div>
          <div class="h-8 bg-gray-200 rounded w-32"></div>
        </div>

        <!-- Footer: Divider + Stats -->
        <div class="pt-4 border-t border-gray-50 flex justify-between items-center">
          <div class="h-3 bg-gray-200 rounded w-20"></div>
          <div class="h-6 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Main Charts Row Skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Graph Chart Skeleton -->
      <div class="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-[400px]">
        <div class="flex justify-between items-center mb-6">
          <div class="h-6 bg-gray-200 rounded w-48"></div>
          <div class="h-8 bg-gray-200 rounded w-32"></div>
        </div>
        <div class="h-64 bg-gray-200 rounded w-full"></div>
      </div>

      <!-- Pie Chart Skeleton -->
      <div class="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-[400px]">
        <div class="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div class="flex items-center justify-center h-64">
          <div class="h-48 w-48 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    </div>

    <!-- Secondary Row Skeleton -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Charts (Stacked Vertically) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <!-- Revenue Chart Skeleton -->
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-[350px]">
          <div class="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div class="h-56 bg-gray-200 rounded w-full"></div>
        </div>
        
        <!-- OrderTypeChart Skeleton -->
        <div class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-[400px]">
          <div class="h-6 bg-gray-200 rounded w-48 mb-6"></div>
          <div class="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      <!-- Reviews List Skeleton -->
      <div class="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-full min-h-[774px]">
        <div class="flex justify-between items-center mb-6">
          <div class="h-6 bg-gray-200 rounded w-32"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div class="space-y-6">
          <div v-for="j in 10" :key="j" class="flex items-center space-x-3">
            <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
            <div class="flex-1 space-y-2">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
              <div class="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
