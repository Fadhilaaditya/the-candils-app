<template>
  <section id="all-products" class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Semua Produk</h2>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonProductCard v-for="n in 8" :key="n" />
      </div>

      <!-- Tampilkan pesan jika tidak ada produk -->
      <div v-else-if="!products || products.length === 0" class="text-center text-gray-500 py-10">
        Belum ada produk yang tersedia saat ini.
      </div>

      <!-- Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Loop melalui 'products' directly (pagination handled by parent) -->
        <ProductCard
          v-for="product in products"
          :key="`${product.produkId}-${product.ukuranId || 'base'}`"
          :product="product"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="!isLoading && hasMore" class="text-center mt-12">
        <button
          @click="handleLoadMore"
          class="bg-white border border-[#BAB772] text-[#BAB772] hover:bg-[#BAB772] hover:text-white font-medium py-2 px-8 rounded-full transition-colors duration-300"
        >
          Load More
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import ProductCard from './ProductCard.vue'
import SkeletonProductCard from './SkeletonProductCard.vue'

// Impor tipe data dari service
import type { ProductVariantRow } from '@/services/productService'

// Definisikan props untuk menerima data dari ProductView.vue
const props = defineProps<{
  products: ProductVariantRow[], // Terima array SEMUA varian produk
  isLoading: boolean,
  hasMore?: boolean
}>()

const emit = defineEmits<{
  (e: 'loadMore'): void
}>()

// Methods
const handleLoadMore = () => {
  emit('loadMore')
}
</script>
