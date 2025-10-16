<template>
  <div class="w-full">
    <!-- Main Product Image -->
    <div class="relative mb-4">
      <img
        :src="selectedImage || product.imageUrl"
        :alt="product.name"
        class="w-full h-96 md:h-[500px] object-cover rounded-lg shadow-lg"
      />

      <!-- Best Seller Badge -->
      <div v-if="product.isBestSeller" class="absolute top-4 left-4">
        <span class="bg-[#BAB772] text-white text-sm px-3 py-1 rounded-full font-medium">
          Best Seller
        </span>
      </div>

      <!-- Image Navigation Arrows -->
      <button
        v-if="product.galleryImages && product.galleryImages.length > 1"
        @click="previousImage"
        class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200"
      >
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        v-if="product.galleryImages && product.galleryImages.length > 1"
        @click="nextImage"
        class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 shadow-md transition-all duration-200"
      >
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Thumbnail Gallery -->
    <div
      v-if="product.galleryImages && product.galleryImages.length > 1"
      class="flex space-x-2 overflow-x-auto"
    >
      <button
        @click="selectImage(product.imageUrl)"
        :class="[
          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200',
          selectedImage === product.imageUrl || !selectedImage
            ? 'border-[#BAB772]'
            : 'border-gray-200 hover:border-gray-300',
        ]"
      >
        <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover" />
      </button>

      <button
        v-for="(image, index) in product.galleryImages"
        :key="index"
        @click="selectImage(image)"
        :class="[
          'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200',
          selectedImage === image ? 'border-[#BAB772]' : 'border-gray-200 hover:border-gray-300',
        ]"
      >
        <img
          :src="image"
          :alt="`${product.name} ${index + 1}`"
          class="w-full h-full object-cover"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface ProductDetail {
  id: string
  name: string
  imageUrl: string
  galleryImages?: string[]
  isBestSeller: boolean
}

interface Props {
  product: ProductDetail
}

const props = defineProps<Props>()

const selectedImage = ref<string>('')

const selectImage = (imageUrl: string) => {
  selectedImage.value = imageUrl
}

const previousImage = () => {
  const allImages = [props.product.imageUrl, ...(props.product.galleryImages || [])]
  const currentIndex = allImages.findIndex((img) => img === selectedImage.value)
  const prevIndex = currentIndex <= 0 ? allImages.length - 1 : currentIndex - 1
  selectedImage.value = allImages[prevIndex]
}

const nextImage = () => {
  const allImages = [props.product.imageUrl, ...(props.product.galleryImages || [])]
  const currentIndex = allImages.findIndex((img) => img === selectedImage.value)
  const nextIndex = currentIndex >= allImages.length - 1 ? 0 : currentIndex + 1
  selectedImage.value = allImages[nextIndex]
}
</script>
