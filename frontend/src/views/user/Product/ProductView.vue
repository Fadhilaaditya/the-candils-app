<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <!-- Error State -->
    <div
      v-if="errorMessage"
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
        @click="fetchProductsData(1)"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Tampilkan Konten (Skeleton ditangani di dalam komponen) -->
    <div v-else class="space-y-16">
      <!-- Best Seller Section (Ikut terfilter search) -->
      <BestSellerSection 
        :products="filteredBestSellers" 
        :searchQuery="searchQuery"
        :isLoading="isLoading"
        @update:searchQuery="searchQuery = $event"
      />
      
      <!-- Tampilkan pesan jika hasil pencarian kosong (Hanya jika tidak loading) -->
      <div v-if="!isLoading && searchQuery && filteredProducts.length === 0" class="text-center py-12">
        <p class="text-gray-500 text-lg">Tidak ada produk yang cocok dengan "{{ searchQuery }}"</p>
      </div>

      <!-- Hanya tampilkan AllProductSection jika ada hasil (atau tidak sedang search) ATAU sedang loading -->
      <AllProductSection 
        v-if="isLoading || filteredProducts.length > 0" 
        :products="filteredProducts" 
        :isLoading="isLoading"
        :hasMore="currentPage < totalPages"
        @loadMore="loadMoreProducts"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BestSellerSection from './_components/BestSellerSection.vue'
import AllProductSection from './_components/AllProductSection.vue'
import SkeletonProductCard from './_components/SkeletonProductCard.vue'
import { getProducts, getBestSellerProducts, type ProductVariantRow } from '@/services/productService'

// State
const allProductVariants = ref<ProductVariantRow[]>([])
const bestSellerProducts = ref<ProductVariantRow[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const searchQuery = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

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
const fetchProductsData = async (page = 1) => {
  isLoading.value = true
  errorMessage.value = null
  try {
    // Fetch products (limit 8 per request)
    const response = await getProducts(page, 8); 
    
    if (page === 1) {
      allProductVariants.value = response.data.data;
    } else {
      allProductVariants.value = [...allProductVariants.value, ...response.data.data];
    }
    
    // Update pagination meta
    currentPage.value = response.data.meta.page;
    totalPages.value = response.data.meta.totalPages;
    
  } catch (error: unknown) {
    console.error('Gagal mengambil data produk:', error)
    if (isAxiosError(error) && error.response.status === 404) {
      errorMessage.value = 'Endpoint produk tidak ditemukan (404).'
    } else {
      errorMessage.value = 'Tidak dapat terhubung ke server atau terjadi kesalahan lain.'
    }
    if (page === 1) allProductVariants.value = []
  } finally {
    isLoading.value = false
  }
}

const loadMoreProducts = () => {
  if (currentPage.value < totalPages.value) {
    fetchProductsData(currentPage.value + 1)
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

// Computed untuk memfilter produk berdasarkan pencarian
const filteredProducts = computed(() => {
  let products = uniqueProducts.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter((product) =>
      product.namaProduk.toLowerCase().includes(query)
    )
  }
  
  return products.slice().sort((a, b) => a.namaProduk.localeCompare(b.namaProduk))
})

const filteredBestSellers = computed(() => {
  let products = bestSellerProducts.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    products = products.filter((product) =>
      product.namaProduk.toLowerCase().includes(query)
    )
  }
  
  return products.slice().sort((a, b) => a.namaProduk.localeCompare(b.namaProduk))
})

// Panggil API saat komponen dimuat
onMounted(async () => {
  // Initial fetch
  await Promise.all([
    fetchProductsData(1),
    getBestSellerProducts().then(res => {
      bestSellerProducts.value = res.data
    }).catch(err => console.error("Failed to load best sellers", err))
  ])
  
  // Recursively fetch more pages until we have at least 8 unique products
  // or we run out of pages, with a safety limit of 5 retries
  let retries = 0;
  const maxRetries = 5;
  
  while (
    uniqueProducts.value.length < 8 && 
    currentPage.value < totalPages.value && 
    retries < maxRetries
  ) {
    await fetchProductsData(currentPage.value + 1)
    retries++;
  }
})
</script>
