<template>
  <section class="py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Product Best Seller</h2>
        <!-- Optional: Add subtitle if needed -->
        <!-- <p class="text-gray-600">Produk paling favorit pilihan pelanggan.</p> -->
      </div>

      <!-- Tampilkan pesan jika tidak ada produk best seller -->
      <div v-if="!products || products.length === 0" class="text-center text-gray-500 py-10">
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
// Hapus impor data palsu
// import productsData from './data/products.json' 

// Impor tipe data dari service
import type { ProductVariantRow } from '@/services/productService'

// Definisikan props untuk menerima data dari ProductView.vue
const props = defineProps<{
  products: ProductVariantRow[] // Terima array produk best seller
}>()

// Hapus filter lokal, karena sudah dilakukan di parent
// const bestSellerProducts = computed(() => { ... })

// Fungsi handleCheckout tidak lagi diperlukan di sini
// const handleCheckout = (product: ProductVariantRow) => { ... }
</script>
