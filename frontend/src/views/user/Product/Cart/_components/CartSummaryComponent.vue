<template>
  <div class="lg:col-span-1">
    <div class="bg-white rounded-lg shadow-sm p-6 sticky top-24">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Ringkasan Belanja</h2>
      
      <div class="space-y-3 mb-4 pb-4 border-b border-gray-200">
        <div class="flex justify-between text-gray-600">
          <span>Total Item</span>
          <span class="font-medium">{{ totalItems }} produk</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>Total Harga</span>
          <span class="font-medium">Rp {{ formatPrice(totalPrice) }}</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>Ongkos Kirim</span>
          <span class="font-medium text-green-600">GRATIS</span>
        </div>
      </div>

      <div class="flex justify-between text-lg font-bold text-gray-800 mb-6">
        <span>Total Bayar</span>
        <span class="text-[#BAB772]">Rp {{ formatPrice(totalPrice) }}</span>
      </div>

      <button 
        @click="$emit('checkout')"
        class="w-full bg-[#BAB772] text-white py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-300 mb-3"
      >
        Checkout
      </button>

      <router-link 
        to="/products"
        class="block w-full text-center border-2 border-[#BAB772] text-[#BAB772] py-3 rounded-lg font-medium hover:bg-[#BAB772] hover:text-white transition-colors duration-300 no-underline"
      >
        Lanjut Belanja
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Definisikan Props yang diterima dari Induk
defineProps<{
  totalItems: number
  totalPrice: number
}>()

// Definisikan Emits yang dikirim ke Induk
defineEmits<{
  (e: 'checkout'): void
}>()

// Helper Functions
const toNumber = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

const formatPrice = (price: number | string): string => {
  const numericPrice = toNumber(price)
  return new Intl.NumberFormat('id-ID').format(numericPrice)
}
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
</style>