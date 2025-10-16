<template>
  <section class="py-12 bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Product Best Seller</h2>
      </div>

      <!-- Best Seller Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in bestSellerProducts"
          :key="product.id"
          :product="product"
          @checkout="handleCheckout"
        />
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ProductCard from './ProductCard.vue'
import productsData from './data/products.json'

interface Product {
  id: string
  name: string
  price: number
  description: string
  imageUrl: string
  isBestSeller: boolean
  category: string
  rating: number
  sold: number
}

// Filter best seller products
const bestSellerProducts = computed(() => {
  return productsData.filter((product: Product) => product.isBestSeller)
})

const handleCheckout = (product: Product) => {
  console.log('Checkout best seller product:', product.id)
  // Handle checkout logic here
}
</script>
