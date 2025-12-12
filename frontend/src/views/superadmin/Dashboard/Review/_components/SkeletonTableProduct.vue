<template>
  <!-- SKELETON LOADING STATE -->
  <tbody>
    <tr
      v-for="i in 5" 
      :key="i" 
      class="border-b border-gray-100 animate-pulse"
    >
      <!-- Kolom 1: No. -->
      <td class="px-4 py-4 text-sm text-gray-900">
        <div class="h-3 bg-gray-300 rounded w-4"></div>
      </td>
      <!-- Kolom 2: Gambar -->
      <td class="px-4 py-4">
        <div class="w-10 h-10 bg-gray-300 rounded"></div>
      </td>
      <!-- Kolom 3: Nama Produk -->
      <td class="px-4 py-4 text-sm font-medium text-gray-900">
          <div :class="['h-4 bg-gray-300 rounded', i % 2 === 0 ? 'w-2/3' : 'w-4/5']"></div>
      </td>
      <!-- Kolom 4: Varian -->
      <td class="px-4 py-4 text-sm font-medium text-blue-600">
        <div class="h-4 bg-gray-300 rounded w-1/2"></div>
      </td>
      <!-- Kolom 5: Harga -->
      <td class="px-4 py-4 text-sm text-gray-700">
        <div class="h-4 bg-gray-300 rounded w-3/4"></div>
      </td>
      <!-- Kolom 6: Stok -->
      <td class="px-4 py-4 text-sm text-gray-700">
        <div class="h-4 bg-gray-300 rounded w-1/3"></div>
      </td>
    </tr>
  </tbody>
</template>

<script setup lang="ts">
// Komponen ini hanya untuk tampilan, tidak memerlukan logika script tambahan
</script>
