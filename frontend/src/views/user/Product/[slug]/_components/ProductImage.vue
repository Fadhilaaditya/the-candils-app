<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden">
    <!-- Main Image Display -->
    <div class="relative aspect-square bg-gray-100">


      <!-- Main Image -->
      <img 
        v-if="product.foto" 
        :src="currentImage" 
        :alt="product.namaProduk"
        class="w-full h-full object-cover"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <span class="text-gray-400">No Image Available</span>
      </div>

      <!-- Navigation Arrows -->
      <button 
        v-if="images.length > 1"
        @click="previousImage"
        class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button 
        v-if="images.length > 1"
        @click="nextImage"
        class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all"
      >
        <svg class="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Thumbnail Images -->
    <div v-if="images.length > 1" class="p-4 flex gap-2 overflow-x-auto">
      <button
        v-for="(image, index) in images"
        :key="index"
        @click="currentImageIndex = index"
        :class="[
          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all',
          currentImageIndex === index 
            ? 'border-[#BAB772] ring-2 ring-[#BAB772] ring-opacity-50' 
            : 'border-gray-200 hover:border-gray-300'
        ]"
      >
        <img 
          :src="image" 
          :alt="`${product.namaProduk} ${index + 1}`"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Produk } from '@/services/productService'

const props = defineProps<{
  product: Produk
}>()

// Simulasi multiple images (sesuaikan dengan API Anda)
const images = computed(() => {
  if (props.product.foto) {
    // Jika API Anda mengembalikan array gambar, gunakan itu
    // Untuk sementara, kita duplikasi gambar yang sama
    return [
      props.product.foto,
      props.product.foto,
      props.product.foto,
      props.product.foto
    ]
  }
  return []
})

const currentImageIndex = ref(0)

const currentImage = computed(() => {
  return images.value[currentImageIndex.value] || props.product.foto
})

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  } else {
    currentImageIndex.value = images.value.length - 1
  }
}

const nextImage = () => {
  if (currentImageIndex.value < images.value.length - 1) {
    currentImageIndex.value++
  } else {
    currentImageIndex.value = 0
  }
}

console.log('✅ ProductImage component mounted!')
</script>