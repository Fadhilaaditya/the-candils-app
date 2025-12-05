<template>
  <section class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Product Best Seller</h2>
        
        <!-- Search Bar -->
        <div class="relative w-full max-w-xs">
          <!-- Skeleton Search Bar -->
          <div v-if="isLoading" class="w-full h-10 bg-gray-200 rounded-full animate-pulse"></div>
          
          <!-- Actual Search Bar -->
          <div v-else class="relative w-full">
            <input
              :value="searchQuery"
              @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
              type="text"
              placeholder="Cari produk..."
              class="w-full px-4 py-2 pl-10 rounded-full border border-gray-300 focus:ring-1 focus:ring-[#BAB772] focus:border-[#BAB772] transition-all duration-200 text-sm shadow-sm"
            />
            <svg
              class="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SkeletonProductCard v-for="n in 4" :key="n" />
      </div>

      <!-- Tampilkan pesan jika tidak ada produk best seller -->
      <div v-else-if="!products || products.length === 0" class="text-center text-gray-500 py-10">
        Belum ada produk best seller saat ini.
      </div>

      <!-- Best Seller Products Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Loop melalui 'products' dari props -->
        <ProductCard
          v-for="product in products"
          :key="`${product.produkId}-${product.ukuranId || 'base'}`"
          :product="product"
        />
        <!-- Event checkout dihapus karena ProductCard menanganinya -->
        <!-- @checkout="handleCheckout" -->
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
// Hapus computed karena filtering dilakukan di parent
// import { computed } from 'vue' 
import ProductCard from './ProductCard.vue'
import SkeletonProductCard from './SkeletonProductCard.vue'
// Hapus impor data palsu
// import productsData from './data/products.json' 

// Impor tipe data dari service
import type { ProductVariantRow } from '@/services/productService'

// Definisikan props untuk menerima data dari ProductView.vue
const props = defineProps<{
  products: ProductVariantRow[],
  searchQuery: string,
  isLoading: boolean
}>()

defineEmits<{
  (e: 'update:searchQuery', value: string): void
}>()

// Hapus filter lokal, karena sudah dilakukan di parent
// const bestSellerProducts = computed(() => { ... })

// Fungsi handleCheckout tidak lagi diperlukan di sini
// const handleCheckout = (product: ProductVariantRow) => { ... }
</script>
