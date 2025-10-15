<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Detail Produk</h1>
      <p class="text-gray-600 mt-2">Lihat detail produk dan ulasan pelanggan</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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
      <p class="text-red-600 mb-4">{{ error }}</p>
      <button
        @click="fetchProductDetail"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Product Content -->
    <div v-else-if="product" class="space-y-8">
      <!-- Product Detail Card -->
      <DetailCard :product="product" />

      <!-- Reviews Section -->
      <div class="bg-white rounded-xl shadow-lg p-6">
        <!-- Reviews Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-3">
            <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            <h2 class="text-xl font-bold text-gray-800">
              {{ product.overallRating }} Penilaian Produk ({{ product.totalReviews }})
            </h2>
          </div>

          <!-- Sort Dropdown -->
          <div class="relative">
            <select
              v-model="selectedSort"
              @change="handleSortChange"
              class="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="highest">Rating Tertinggi</option>
              <option value="lowest">Rating Terendah</option>
              <option value="most_helpful">Paling Membantu</option>
            </select>
            <div class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                class="w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Reviews Grid -->
        <div
          v-if="filteredReviews.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <ReviewCard v-for="review in filteredReviews" :key="review.id" :review="review" />
        </div>

        <!-- No Reviews State -->
        <div v-else class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Belum Ada Ulasan</h3>
          <p class="text-gray-500">Jadilah yang pertama memberikan ulasan untuk produk ini.</p>
        </div>

        <!-- Load More Button -->
        <div v-if="hasMoreReviews" class="text-center mt-8">
          <button
            @click="loadMoreReviews"
            :disabled="loadingMore"
            class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <span v-if="loadingMore">Memuat...</span>
            <span v-else>Muat Lebih Banyak</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import DetailCard from './_components/DetailCard.vue'
import ReviewCard from './_components/ReviewCard.vue'
import {
  ProductDetailService,
  type ProductDetail,
  type ProductReview,
  type ReviewFilters,
} from './data/productDetailData'

// Reactive state
const product = ref<ProductDetail | null>(null)
const reviews = ref<ProductReview[]>([])
const loading = ref(true)
const loadingMore = ref(false)
const error = ref<string | null>(null)
const selectedSort = ref<ReviewFilters['sortBy']>('newest')
const currentPage = ref(1)
const reviewsPerPage = 9

// Get route params
const route = useRoute()

// Computed properties
const filteredReviews = computed(() => {
  return reviews.value.slice(0, currentPage.value * reviewsPerPage)
})

const hasMoreReviews = computed(() => {
  return reviews.value.length > currentPage.value * reviewsPerPage
})

// Methods
const fetchProductDetail = async () => {
  try {
    loading.value = true
    error.value = null

    // Get product ID from route params or use default
    const productId = Number(route.params.id) || 1

    const productData = await ProductDetailService.fetchProductDetail(productId)
    if (!productData) {
      throw new Error('Produk tidak ditemukan')
    }

    product.value = productData

    // Fetch initial reviews
    await fetchReviews()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data'
  } finally {
    loading.value = false
  }
}

const fetchReviews = async () => {
  if (!product.value) return

  try {
    const filters: ReviewFilters = {
      sortBy: selectedSort.value,
    }

    const reviewsData = await ProductDetailService.fetchProductReviews(product.value.id, filters)
    reviews.value = reviewsData
    currentPage.value = 1
  } catch (err) {
    console.error('Error fetching reviews:', err)
  }
}

const handleSortChange = async () => {
  await fetchReviews()
}

const loadMoreReviews = async () => {
  if (loadingMore.value) return

  try {
    loadingMore.value = true
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    currentPage.value++
  } catch (err) {
    console.error('Error loading more reviews:', err)
  } finally {
    loadingMore.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchProductDetail()
})
</script>
