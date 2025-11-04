<template>
  <div class="bg-white rounded-lg p-8">
    <!-- Section Title -->
    <h2 class="text-2xl font-bold text-gray-900 mb-6">
      Deskripsi Lengkap
    </h2>
    
    <!-- Full Description -->
    <p class="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
      {{ product.deskripsi || 'Tidak ada deskripsi untuk produk ini.' }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Produk } from '@/services/productService'

defineProps<{
  product: Produk
}>()
</script>

<style scoped>
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
</style>