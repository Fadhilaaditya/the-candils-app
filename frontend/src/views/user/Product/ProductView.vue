<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Loading State dengan Skeleton -->
    <div v-if="isLoading" class="space-y-16">
      <!-- Skeleton untuk Best Seller Section -->
      <div class="max-w-7xl mx-auto">
        <div class="h-10 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonProductCard v-for="n in 4" :key="n" />
        </div>
      </div>

      <!-- Skeleton untuk All Product Section -->
      <div class="max-w-7xl mx-auto">
        <div class="h-10 bg-gray-200 rounded-lg w-64 mb-8 animate-pulse"></div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonProductCard v-for="n in 8" :key="n" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="errorMessage"
      class="text-center py-20 bg-red-50 rounded-lg max-w-2xl mx-auto p-6"
    >
      <svg
        class="mx-auto h-12 w-12 text-red-400 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 class="text-lg font-medium text-red-800 mb-2">Gagal Memuat Data</h3>
      <p class="text-red-600 mb-4">{{ errorMessage }}</p>
      <button
        @click="fetchProductsData"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Tampilkan Konten jika Sukses -->
    <div v-else class="space-y-16">
      <BestSellerSection :products="uniqueProducts" />
      <AllProductSection :products="uniqueProducts" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BestSellerSection from './_components/BestSellerSection.vue'
import AllProductSection from './_components/AllProductSection.vue'
import SkeletonProductCard from './_components/SkeletonProductCard.vue'
import { getProducts, type ProductVariantRow } from '@/services/productService'

// State
const allProductVariants = ref<ProductVariantRow[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

// Helper function to check if error is an Axios error with response
const isAxiosError = (error: unknown): error is { response: { status: number } } => {
  return (
    error !== null &&
    typeof error === 'object' &&
    'response' in error &&
    error.response !== null &&
    typeof error.response === 'object' &&
    'status' in error.response &&
    typeof error.response.status === 'number'
  )
}

// Fetch data
const fetchProductsData = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    // Fetch products (default limit 10, bisa dinaikkan jika perlu)
    const response = await getProducts(1, 100); // Ambil 100 produk pertama dulu
    allProductVariants.value = response.data.data; // Akses .data.data karena response paginated
  } catch (error: unknown) {
    console.error('Gagal mengambil data produk:', error)
    if (isAxiosError(error) && error.response.status === 404) {
      errorMessage.value = 'Endpoint produk tidak ditemukan (404).'
    } else {
      errorMessage.value = 'Tidak dapat terhubung ke server atau terjadi kesalahan lain.'
    }
    allProductVariants.value = []
  } finally {
    isLoading.value = false
  }
}

// Computed untuk produk unik
const uniqueProducts = computed(() => {
  const uniqueMap = new Map<number, ProductVariantRow>()
  for (const variant of allProductVariants.value) {
    if (!uniqueMap.has(variant.produkId)) {
      uniqueMap.set(variant.produkId, variant)
    }
  }
  return Array.from(uniqueMap.values())
})

// Panggil API saat komponen dimuat
onMounted(() => {
  fetchProductsData()
})
</script>
