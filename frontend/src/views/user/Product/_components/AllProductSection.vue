<template>
  <section id="all-products" class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Semua Produk</h2>
      </div>

      <!-- Tampilkan pesan jika tidak ada produk -->
      <div v-if="!products || products.length === 0" class="text-center text-gray-500 py-10">
        Belum ada produk yang tersedia saat ini.
      </div>

      <!-- Products Grid -->
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

      <!-- Tombol Load More dihapus -->
      <!-- <div v-if="hasMoreProducts" class="text-center mt-12"> ... </div> -->
    </div>
  </section>
</template>

<script setup lang="ts">
// Hapus ref dan computed karena pagination dihapus
// import { ref, computed } from 'vue'
import ProductCard from './ProductCard.vue'
// Hapus impor data palsu
// import productsData from './data/products.json'

// Impor tipe data dari service
import type { ProductVariantRow } from '@/services/productService'

// Definisikan props untuk menerima data dari ProductView.vue
const props = defineProps<{
  products: ProductVariantRow[] // Terima array SEMUA varian produk
}>()

// Hapus semua state dan computed properties untuk pagination
// const productsPerPage = ref(8)
// const currentPage = ref(1)
// const allProducts = computed(...)
// const filteredProducts = computed(...)
// const hasMoreProducts = computed(...)

// Fungsi handleCheckout tidak lagi diperlukan di sini
// const handleCheckout = (product: ProductVariantRow) => { ... }

// Fungsi loadMore dihapus
// const loadMore = () => { ... }
</script>
