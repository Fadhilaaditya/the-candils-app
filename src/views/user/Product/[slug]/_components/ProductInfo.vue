<template>
  <div class="w-full">
    <!-- Product Name -->
    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
      {{ product.name }}
    </h1>

    <!-- Product Description -->
    <p class="text-lg text-gray-600 mb-6 leading-relaxed">
      {{ product.description }}
    </p>

    <!-- Price Display -->
    <div class="mb-6">
      <span class="text-3xl font-bold text-orange-600"> Rp {{ formatPrice(currentPrice) }} </span>
      <span v-if="selectedSize" class="ml-2 text-sm text-gray-500"> ({{ selectedSize }}) </span>
    </div>

    <!-- Size Selector -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Pilih Ukuran</h3>
      <div class="flex space-x-3">
        <button
          v-for="(price, size) in product.pricing"
          :key="size"
          @click="selectSize(size)"
          :class="[
            'px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200',
            selectedSize === size
              ? 'border-[#BAB772] bg-[#BAB772] text-white'
              : 'border-gray-300 text-gray-700 hover:border-gray-400',
          ]"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- Quantity Selector -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Jumlah</h3>
      <div class="flex items-center space-x-3">
        <button
          @click="decreaseQuantity"
          :disabled="quantity <= 1"
          class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>

        <input
          v-model.number="quantity"
          type="number"
          min="1"
          :max="product.stock"
          class="w-16 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
        />

        <button
          @click="increaseQuantity"
          :disabled="quantity >= product.stock"
          class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-2">Tersedia {{ product.stock }} stok</p>
    </div>

    <!-- Checkout Button -->
    <button
      @click="handleCheckout"
      :disabled="!selectedSize || !product.isAvailable"
      class="w-full bg-[#BAB772] hover:bg-[#a8a668] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
    >
      Checkout
    </button>

    <!-- Stock Warning -->
    <div v-if="!product.isAvailable" class="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <p class="text-red-600 text-sm">
        <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        Produk sedang tidak tersedia
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ProductDetail {
  id: string
  name: string
  description: string
  pricing: Record<string, number>
  stock: number
  isAvailable: boolean
}

interface Props {
  product: ProductDetail
}

const props = defineProps<Props>()

const selectedSize = ref<string>('')
const quantity = ref<number>(1)

const currentPrice = computed(() => {
  if (!selectedSize.value || !props.product.pricing[selectedSize.value]) {
    return props.product.pricing[Object.keys(props.product.pricing)[0]] || 0
  }
  return props.product.pricing[selectedSize.value] * quantity.value
})

const selectSize = (size: string) => {
  selectedSize.value = size
}

const increaseQuantity = () => {
  if (quantity.value < props.product.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID').format(price)
}

const handleCheckout = () => {
  if (!selectedSize.value) {
    alert('Pilih ukuran terlebih dahulu')
    return
  }

  const checkoutData = {
    productId: props.product.id,
    size: selectedSize.value,
    quantity: quantity.value,
    price: currentPrice.value,
  }

  console.log('Checkout data:', checkoutData)
  // Emit event or navigate to checkout
}

// Set default size
selectedSize.value = Object.keys(props.product.pricing)[0] || ''
</script>
