<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 class="text-2xl font-bold text-gray-900">Detail Produk</h1>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Product Image -->
        <div class="lg:sticky lg:top-8">
          <ProductImage :product="product" />
        </div>

        <!-- Product Information -->
        <div>
          <ProductInfo :product="product" />
        </div>
      </div>

      <!-- Product Details Section -->
      <ProductDetails :product="product" />

      <!-- Product Reviews and Ratings Section -->
      <ProductReviewsRatings :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProductImage from './_components/ProductImage.vue'
import ProductInfo from './_components/ProductInfo.vue'
import ProductDetails from './_components/ProductDetails.vue'
import ProductReviewsRatings from './_components/ProductReviewsRatings.vue'
import productDetailData from './_components/data/productDetail.json'

// Get route parameters
const route = useRoute()
const product = ref(productDetailData)

// Simulate fetching product data based on slug
const fetchProductData = async (slug: string) => {
  // In a real app, this would be an API call
  // const response = await fetch(`/api/products/${slug}`)
  // const productData = await response.json()

  // For now, we'll use static data and simulate different products
  // You can modify this to match your actual product data structure
  console.log('Fetching product with slug:', slug)

  // Return the static data for now
  // In production, replace this with actual API call
  return productDetailData
}

onMounted(async () => {
  const slug = route.params.slug as string
  if (slug) {
    const productData = await fetchProductData(slug)
    product.value = productData
  }
})
</script>
