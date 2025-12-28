<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header (Opsional) -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-900">
          Detail Produk
        </h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading">
        <SkeletonDetailProduct />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg class="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 class="text-lg font-medium text-red-800 mb-2">Gagal Memuat Data</h3>
        <p class="text-red-600 mb-4">{{ error }}</p>
        <button @click="fetchData" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          Coba Lagi
        </button>
      </div>

      <!-- Product Content -->
      <div v-else-if="product" class="space-y-8">
        <!-- Grid Layout: Image (Left) + Info (Right) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Product Image Component -->
          <div class="lg:sticky lg:top-8 self-start">
            <ProductImage :product="product" />
          </div>

          <!-- Product Info Component -->
          <div>
            <ProductInfo :product="product" />
          </div>
        </div>

        <!-- Product Details Component (Full Width Bottom) -->
        <ProductDetails :product="product" />

        <!-- --- PERBAIKAN DI SINI --- -->
        <!-- Hapus 'v-if="reviews.length > 0"' -->
        <!-- Komponen ini sekarang AKAN SELALU TAMPIL -->
        <ProductReviewsRatings 
          :product="product" 
          :reviews="reviews"
          :has-more="hasMore"
          :loading-more="isFetchingMore"
          @load-more="loadMoreReviews" 
          @review-added="refreshReviews" 
        />
        <!-- ------------------------- -->
      </div>

      <!-- Not Found State -->
      <div v-else class="text-center py-20 text-gray-500">
        Produk tidak ditemukan.
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
// Script tetap sama seperti sebelumnya
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getProductById, getReviewsByProductId, type Produk, type Ulasan } from '@/services/productService'

import ProductImage from './_components/ProductImage.vue'
import ProductInfo from './_components/ProductInfo.vue'
import ProductDetails from './_components/ProductDetails.vue'
import ProductReviewsRatings from './_components/ProductReviewsRatings.vue'
import SkeletonDetailProduct from './_components/SkeletonDetailProduct.vue'

const route = useRoute()
const product = ref<Produk | null>(null)
const reviews = ref<Ulasan[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Pagination State
const currentPage = ref(1)
const hasMore = ref(false)
const isFetchingMore = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null
  currentPage.value = 1 // Reset page

  try {
    const productId = Number(route.params.id)
    if (isNaN(productId) || productId <= 0) {
      throw new Error('ID Produk tidak valid')
    }

    const [productResponse, reviewsResponse] = await Promise.all([
      getProductById(productId),
      getReviewsByProductId(productId, 1, 10) // Initial Page 1
    ])

    if (!productResponse.data) {
      throw new Error('Produk tidak ditemukan.')
    }

    product.value = productResponse.data
    
    // Handle Paginated Response (checks for both new object format and old array format)
    if (reviewsResponse.data && Array.isArray(reviewsResponse.data.data)) {
        // New Backend Format: { data: [...], meta: ... }
        reviews.value = reviewsResponse.data.data
        const meta = reviewsResponse.data.meta
        hasMore.value = meta ? (meta.page < meta.totalPages) : false
    } else if (Array.isArray(reviewsResponse.data)) {
        // Old Backend Format Fallback: [...]
        // If backend hasn't updated yet, it returns a direct array of all reviews
        reviews.value = reviewsResponse.data as any
        hasMore.value = false // Old API returns all data, so no more pages
    } else {
        // Fallback incase backend format is weird or empty
        reviews.value = []
        hasMore.value = false
    }

  } catch (err: any) {
    console.error("❌ Error loading product:", err)
    if (err.response && err.response.status === 404) {
      error.value = 'Produk tidak ditemukan.'
    } else if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Terjadi kesalahan saat memuat data.'
    }
    
    if (!(err.response && err.response.status === 404)) {
      product.value = null
    }
    reviews.value = []
  } finally {
    loading.value = false
  }
}

const loadMoreReviews = async () => {
    if (isFetchingMore.value || !hasMore.value || !product.value) return;
    
    isFetchingMore.value = true;
    try {
        const nextPage = currentPage.value + 1;
        const response = await getReviewsByProductId(product.value.produkId!, nextPage, 10);
        
        if (response.data && Array.isArray(response.data.data)) {
            reviews.value.push(...response.data.data); // Append
            currentPage.value = nextPage;
            
            const meta = response.data.meta;
            hasMore.value = meta.page < meta.totalPages;
        }
    } catch (err) {
        console.error("Failed to load more reviews", err);
    } finally {
        isFetchingMore.value = false;
    }
}

// Reload just reviews (for example after posting new review)
const refreshReviews = async () => {
    if (!product.value) return;
    currentPage.value = 1;
    try {
        const response = await getReviewsByProductId(product.value.produkId!, 1, 10);
         if (response.data && Array.isArray(response.data.data)) {
            reviews.value = response.data.data;
            const meta = response.data.meta;
            hasMore.value = meta.page < meta.totalPages;
        }
    } catch (err) {
        console.error("Failed to refresh reviews", err);
    }
}

onMounted(() => {
  fetchData()
})

watch(() => route.params.id, (newId, oldId) => {
  const newProductId = Number(newId)
  if (newId && newId !== oldId && !isNaN(newProductId) && newProductId > 0) {
    fetchData()
  }
})
</script>

