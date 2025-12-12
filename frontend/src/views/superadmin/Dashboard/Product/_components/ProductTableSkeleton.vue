<template>
  <!-- SKELETON LOADING STATE -->
  <tbody>
    <tr
      v-for="i in 5" 
      :key="i" 
      class="border-b border-gray-100 animate-pulse"
    >
      <td class="px-4 py-3 text-sm text-gray-900">
        <div class="h-3 bg-gray-300 rounded w-4"></div>
      </td>
      <td class="px-4 py-3">
        <div class="w-16 h-16 bg-gray-300 rounded-lg"></div>
      </td>
      <td class="px-4 py-3 text-sm font-medium text-gray-900">
          <div :class="['h-4 bg-gray-300 rounded', i % 2 === 0 ? 'w-2/3' : 'w-4/5']"></div>
      </td>
      <td class="px-4 py-3 text-sm font-medium text-blue-600">
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </td>
      <td class="px-4 py-3 text-sm font-bold text-gray-900">
          <div class="h-5 bg-gray-300 rounded w-2/3"></div>
      </td>
      <td class="px-4 py-3 text-sm text-gray-700">
        <div class="h-4 bg-gray-300 rounded w-1/3"></div>
      </td>
      <td class="px-4 py-3">
        <div class="flex gap-2">
          <div class="w-4 h-4 bg-gray-300 rounded"></div>
          <div class="w-4 h-4 bg-gray-300 rounded"></div>
        </div>
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
// Komponen ini hanya untuk tampilan, tidak memerlukan logika script tambahan
</script>
