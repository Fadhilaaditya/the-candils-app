<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="overflow-x-auto animate-pulse">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <!-- Header Skeleton -->
            <th v-for="n in 6" :key="n" class="px-4 py-3 text-left">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </th>
          </tr>
        </thead>
        
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- Baris Skeleton (Looping 3x) -->
          <tr v-for="i in 3" :key="i">
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="h-4 w-4 bg-gray-200 rounded"></div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="w-10 h-10 bg-gray-200 rounded"></div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="h-4 bg-gray-200 rounded w-1/2"></div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            </td>
            <td class="px-4 py-4 whitespace-nowrap">
              <div class="h-4 bg-gray-200 rounded w-1/4"></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="pt-4 text-right">
      <div class="h-4 bg-gray-200 rounded w-1/4 ml-auto"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
// Komponen ini murni untuk tampilan, tidak memerlukan script
</script>
