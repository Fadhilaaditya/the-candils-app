<template>
    <div class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-100">
      <!-- Average Rating -->
      <div class="flex items-center gap-4 mb-4">
        <!-- Star Icons -->
        <div class="flex gap-1">
          <svg 
            v-for="star in 5" 
            :key="star"
            :class="[
              'w-8 h-8 fill-current',
              reviews.length > 0 ? 'text-yellow-400' : 'text-gray-300'
            ]"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        
        <!-- Rating Number -->
        <div>
          <span class="text-3xl font-bold text-gray-900">{{ averageRating }}</span>
          <span class="text-gray-600 ml-2">dari 5 bintang</span>
        </div>
      </div>

      <!-- Total Reviews -->
      <p class="text-gray-600 mb-6">{{ totalReviews }} ulasan pelanggan</p>

      <!-- Rating Bars -->
      <div class="space-y-2">
        <div 
          v-for="rating in [5, 4, 3, 2, 1]" 
          :key="rating"
          class="flex items-center gap-4 cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors"
          :class="{ 'bg-yellow-50 hover:bg-yellow-100': selectedRating === rating }"
          @click="$emit('filter-rating', rating)"
        >
          <!-- Rating Number -->
          <span class="text-sm w-3 font-medium" :class="selectedRating === rating ? 'text-yellow-700' : 'text-gray-600'">{{ rating }}</span>
          
          <!-- Star Icon -->
          <svg 
            class="w-5 h-5 fill-current flex-shrink-0" 
            :class="selectedRating === rating ? 'text-yellow-500' : 'text-gray-300'"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          <!-- Progress Bar -->
          <div class="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-[#BAB772] rounded-full transition-all duration-300"
              :style="{ width: `${getRatingPercentage(rating)}%` }"
            ></div>
          </div>

          <!-- Count -->
          <span class="text-sm text-gray-600 w-12 text-right">{{ getRatingCount(rating) }}</span>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Ulasan } from '@/services/productService';

const props = defineProps<{
  reviews: Ulasan[];
  selectedRating?: number | null;
}>();

defineEmits<{
  (e: 'filter-rating', rating: number): void;
}>();

const totalReviews = computed(() => props.reviews.length);

const averageRating = computed(() => {
  if (props.reviews.length === 0) return '0.0';
  const sum = props.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / props.reviews.length).toFixed(1);
});

const getRatingCount = (rating: number) => {
  return props.reviews.filter(review => review.rating === rating).length;
};

const getRatingPercentage = (rating: number) => {
  if (totalReviews.value === 0) return 0;
  return (getRatingCount(rating) / totalReviews.value) * 100;
};
</script>
