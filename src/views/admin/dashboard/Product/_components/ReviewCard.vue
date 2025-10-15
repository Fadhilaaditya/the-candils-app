<template>
  <div
    class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200"
  >
    <!-- User Info and Rating -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <!-- User Avatar -->
        <div
          class="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden"
        >
          <img
            v-if="review.userAvatar"
            :src="review.userAvatar"
            :alt="review.userName"
            class="w-full h-full object-cover"
            @error="handleAvatarError"
          />
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm"
          >
            {{ review.userName.charAt(0).toUpperCase() }}
          </div>
        </div>

        <!-- User Name and Verification -->
        <div>
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-800">{{ review.userName }}</span>
            <svg
              v-if="review.verified"
              class="w-4 h-4 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="text-sm text-gray-500">{{ formatRelativeTime(review.createdAt) }}</div>
        </div>
      </div>

      <!-- Star Rating -->
      <div class="flex items-center">
        <svg
          v-for="star in 5"
          :key="star"
          class="w-4 h-4"
          :class="star <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      </div>
    </div>

    <!-- Review Comment -->
    <div class="text-gray-700 leading-relaxed mb-3">
      {{ review.comment }}
    </div>

    <!-- Helpful Actions -->
    <div class="flex items-center justify-between text-sm text-gray-500">
      <div class="flex items-center gap-4">
        <button
          @click="toggleHelpful"
          class="flex items-center gap-1 hover:text-blue-600 transition-colors duration-200"
          :class="{ 'text-blue-600': isHelpful }"
        >
          <svg
            class="w-4 h-4"
            :class="isHelpful ? 'fill-current' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
            />
          </svg>
          <span>{{ helpfulCount }} Membantu</span>
        </button>
      </div>

      <div class="text-xs">
        {{ formatDateTime(review.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ProductReview } from '../data/productDetailData'
import { formatDateTime, formatRelativeTime } from '../data/productDetailData'

interface Props {
  review: ProductReview
}

const props = defineProps<Props>()

// Local state for helpful functionality
const isHelpful = ref(false)
const helpfulCount = computed(() => {
  return props.review.helpful + (isHelpful.value ? 1 : 0)
})

// Toggle helpful status
const toggleHelpful = () => {
  isHelpful.value = !isHelpful.value
  // Here you would typically make an API call to update the helpful count
  // For now, we'll just update the local state
}

// Handle avatar loading errors
const handleAvatarError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.style.display = 'none'
}
</script>
