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

const fetchData = async () => {
  loading.value = true
  error.value = null

  try {
    const productId = Number(route.params.id)
    if (isNaN(productId) || productId <= 0) {
      throw new Error('ID Produk tidak valid')
    }

    const [productResponse, reviewsResponse] = await Promise.all([
      getProductById(productId),
      getReviewsByProductId(productId)
    ])

    if (!productResponse.data) {
      throw new Error('Produk tidak ditemukan.')
    }

    product.value = productResponse.data
    reviews.value = reviewsResponse.data

  } catch (err: any) {
    console.error("❌ Error loading product:", err)
    if (err.response && err.response.status === 404) {
      error.value = 'Produk tidak ditemukan.'
    } else if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = 'Terjadi kesalahan saat memuat data.'
    }
    
    // Jangan set product jadi null jika 404, agar judul tetap tampil
    if (!(err.response && err.response.status === 404)) {
      product.value = null
    }
    reviews.value = []
  } finally {
    loading.value = false
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

