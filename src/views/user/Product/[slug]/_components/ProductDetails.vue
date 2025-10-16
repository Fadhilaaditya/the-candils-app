<template>
  <div class="mt-12 bg-gray-50 rounded-lg p-6">
    <!-- Full Description -->
    <div>
      <h3 class="text-xl font-semibold text-gray-900 mb-4">Deskripsi Lengkap</h3>
      <p class="text-gray-600 leading-relaxed">
        {{ product.fullDescription }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProductDetail {
  fullDescription: string
}

interface Props {
  product: ProductDetail
}

defineProps<Props>()
</script>
