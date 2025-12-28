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
          :total-reviews-count="reviewMeta?.total || 0"
          :server-average-rating="reviewMeta?.average"
          :has-more="hasMoreReviews"
          :loading-more="loadingMoreReviews"
          @load-more="handleLoadMoreReviews" 
          @review-added="fetchData" 
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
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { 
  getProductById, 
  getReviewsByProductId, 
  type Produk, 
  type Ulasan,
  type ReviewResponse 
} from '@/services/productService'

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
const hasMoreReviews = ref(false)
const loadingMoreReviews = ref(false)
// Simpan meta untuk total count dan average
const reviewMeta = ref<ReviewResponse['meta'] | null>(null)

const fetchData = async () => {
  loading.value = true
  error.value = null
  currentPage.value = 1 // Reset page

  try {
    const productId = Number(route.params.id)
    if (isNaN(productId) || productId <= 0) {
      throw new Error('ID Produk tidak valid')
    }

    // Fetch Page 1 reviews
    const [productResponse, reviewsResponse] = await Promise.all([
      getProductById(productId),
      getReviewsByProductId(productId, 1, 10) // Limit 10
    ])

    if (!productResponse.data) {
      throw new Error('Produk tidak ditemukan.')
    }

    product.value = productResponse.data
    
    // Handle Review Response
    const rData = reviewsResponse.data
    reviews.value = rData.data
    reviewMeta.value = rData.meta
    
    // Determine if has more
    hasMoreReviews.value = rData.meta.page < rData.meta.totalPages

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

const handleLoadMoreReviews = async () => {
  if (loadingMoreReviews.value || !hasMoreReviews.value || !product.value?.produkId) return
  
  loadingMoreReviews.value = true
  try {
    const nextPage = currentPage.value + 1
    const response = await getReviewsByProductId(product.value.produkId, nextPage, 10)
    
    // Append new reviews
    reviews.value = [...reviews.value, ...response.data.data]
    
    // Update meta
    reviewMeta.value = response.data.meta
    currentPage.value = nextPage
    hasMoreReviews.value = response.data.meta.page < response.data.meta.totalPages
    
  } catch (error) {
    console.error("Failed to load more reviews:", error)
  } finally {
    loadingMoreReviews.value = false
  }
}

// Refresh fetches initial data again
const refreshReviews = () => {
    fetchData()
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

