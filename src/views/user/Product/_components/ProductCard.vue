<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col"
    @click="handleProductClick"
  >
    <div class="relative">
      <img
        :src="product.imageUrl"
        :alt="product.name"
        class="w-full h-48 object-cover"
      />
      <div v-if="product.isBestSeller" class="absolute top-2 left-2">
        <span class="bg-[#BAB772] text-white text-xs px-2 py-1 rounded-full font-medium">
          Best Seller
        </span>
      </div>
    </div>

    <div class="p-4 flex flex-col flex-1">
      <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
        {{ product.name }}
      </h3>

      <p class="text-orange-600 font-semibold text-lg mb-2">Rp {{ formatPrice(product.price) }}</p>

      <p class="text-gray-600 text-sm mb-3 line-clamp-2">
        {{ product.description }}
      </p>

      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <div class="flex">
            <svg
              v-for="i in 5" :key="i"
              class="w-4 h-4"
              :class="i <= product.rating ? 'text-yellow-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="ml-1 text-sm text-gray-600">{{ product.rating }}</span>
        </div>
        <span class="text-sm text-gray-500">{{ product.sold }} terjual</span>
      </div>

      <div class="mt-auto">
        <button
          @click.stop="handleCheckout"
          class="bg-[#BAB772] hover:bg-[#a8a668] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 w-full"
        >
          Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

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

const props = defineProps<{
  product: Product
}>()

const router = useRouter()

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const handleProductClick = () => {
  router.push(`/products/${props.product.id}`)
}

const handleCheckout = () => {
  console.log('Checkout product:', props.product.id)
  // emit('checkout', props.product);
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
