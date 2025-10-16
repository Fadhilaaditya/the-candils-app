<template>
  <section id="all-products" class="py-12 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section Title -->
      <div class="text-center mb-12">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">All Product</h2>
      </div>

      <!-- Products Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
          @checkout="handleCheckout"
        />
      </div>

      <!-- Load More Button -->
      <div v-if="hasMoreProducts" class="text-center mt-12">
        <button
          @click="loadMore"
          class="inline-flex items-center px-6 py-3 border border-[#BAB772] text-base font-medium rounded-md text-green-700 bg-white hover:bg-green-50 transition-colors duration-200"
        >
          Muat Lebih Banyak
          <svg class="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

// Reactive data
const productsPerPage = ref(8)
const currentPage = ref(1)

// All products without filtering
const allProducts = computed(() => {
  return productsData
})

// Paginated products
const filteredProducts = computed(() => {
  const startIndex = 0
  const endIndex = currentPage.value * productsPerPage.value
  return allProducts.value.slice(startIndex, endIndex)
})

// Check if there are more products to load
const hasMoreProducts = computed(() => {
  return filteredProducts.value.length < allProducts.value.length
})

const handleCheckout = (product: Product) => {
  console.log('Checkout product:', product.id)
  // Handle checkout logic here
}

const loadMore = () => {
  currentPage.value += 1
}
</script>
