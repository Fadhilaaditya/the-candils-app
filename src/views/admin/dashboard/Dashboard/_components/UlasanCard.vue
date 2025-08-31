<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-800 mb-6">Ulasan Produk</h2>

    <div class="space-y-4">
      <div
        v-for="(review, index) in productReviews"
        :key="review.id"
        class="p-4 bg-gray-50 rounded-lg"
      >
        <div class="flex justify-between items-start mb-2">
          <h4 class="font-semibold text-gray-800 text-sm">{{ review.productName }}</h4>
          <span class="text-xs text-gray-500">{{ index + 1 }}</span>
        </div>

        <div class="flex items-center gap-2 mb-2">
          <div class="flex items-center">
            <span v-for="star in 5" :key="star" class="text-yellow-400">
              <svg
                v-if="star <= Math.floor(review.rating)"
                class="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
              >
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <svg
                v-else-if="star === Math.ceil(review.rating) && review.rating % 1 !== 0"
                class="w-4 h-4 fill-current"
                viewBox="0 0 20 20"
              >
                <defs>
                  <linearGradient id="halfStar">
                    <stop offset="50%" stop-color="#fbbf24" />
                    <stop offset="50%" stop-color="#e5e7eb" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#halfStar)"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
              <svg v-else class="w-4 h-4 fill-current text-gray-300" viewBox="0 0 20 20">
                <path
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              </svg>
            </span>
          </div>
          <span class="text-sm text-gray-600">{{ review.rating }}</span>
        </div>

        <p class="text-xs text-gray-500 mb-3">{{ review.soldCount }}+ Terjual</p>

        <button
          @click="handleDetailsClick(review)"
          class="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300 transition-colors"
        >
          Details
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface ProductReview {
  id: number
  productName: string
  rating: number
  soldCount: string
}

interface Props {
  initialData?: ProductReview[]
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => [],
})

// Emit events for parent component
const emit = defineEmits<{
  detailsClick: [review: ProductReview]
}>()

// Product reviews data - ready for API integration
const productReviews = ref<ProductReview[]>([
  {
    id: 1,
    productName: 'Bubur Manis Komplit',
    rating: 4.7,
    soldCount: '100+',
  },
  {
    id: 2,
    productName: 'Singkong Thailand',
    rating: 4.7,
    soldCount: '100+',
  },
  {
    id: 3,
    productName: 'Ubi Duo Twin',
    rating: 4.7,
    soldCount: '100+',
  },
  {
    id: 4,
    productName: 'Hijau Hitam Legenda',
    rating: 4.7,
    soldCount: '100+',
  },
])

// Handle details button click
const handleDetailsClick = (review: ProductReview) => {
  emit('detailsClick', review)
}

// Watch for prop changes to update reviews data
watch(
  () => props.initialData,
  (newData) => {
    if (newData && newData.length > 0) {
      productReviews.value = newData
    }
  },
  { immediate: true },
)

// Expose methods for parent component
defineExpose({
  updateReviews: (data: ProductReview[]) => {
    productReviews.value = data
  },
  getReviews: () => [...productReviews.value],
})
</script>
