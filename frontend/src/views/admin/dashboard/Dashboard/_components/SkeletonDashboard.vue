<template>
  <div class="animate-pulse space-y-8">
    <!-- Header Skeleton -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div class="space-y-3">
        <div class="h-8 bg-gray-200 rounded w-48"></div>
        <div class="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      <div class="mt-4 md:mt-0">
        <div class="h-10 bg-gray-200 rounded-lg w-32"></div>
      </div>
    </div>

    <!-- Stats Cards Skeleton -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-32">
        <div class="flex justify-between items-start mb-4">
          <div class="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div class="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div class="space-y-2">
          <div class="h-3 bg-gray-200 rounded w-20"></div>
          <div class="h-8 bg-gray-200 rounded w-32"></div>
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
      <!-- Revenue Chart Skeleton -->
      <div class="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-[350px]">
        <div class="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div class="h-56 bg-gray-200 rounded w-full"></div>
      </div>

      <!-- Reviews List Skeleton -->
      <div class="lg:col-span-1 bg-white rounded-xl p-6 border border-gray-100 shadow-sm h-[350px]">
        <div class="flex justify-between items-center mb-6">
          <div class="h-6 bg-gray-200 rounded w-32"></div>
          <div class="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div class="space-y-4">
          <div v-for="j in 4" :key="j" class="flex items-center space-x-3">
            <div class="h-8 w-8 bg-gray-200 rounded"></div>
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
