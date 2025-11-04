<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Ulasan Produk</h3>
    <ul class="space-y-4">
      <li v-for="(review, index) in reviews" :key="review.id" class="flex items-center justify-between">
        <div class="flex items-center">
          <span class="text-gray-500 font-medium mr-4">{{ index + 1 }}</span>
          <div>
            <p class="font-semibold text-gray-700">{{ review.name }}</p>
            <div class="flex items-center text-sm text-gray-500">
              <span>⭐ {{ review.rating }}</span>
              <span class="mx-2">•</span>
              <span>({{ review.reviews }}+ Terjual)</span>
            </div>
          </div>
        </div>
        <button class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-md">
          Details
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

// 1. Definisikan interface untuk struktur objek ulasan
interface ProductReview {
  id: number;
  name: string;
  rating: number;
  reviews: number;
}

// 2. Gunakan interface tersebut untuk mendefinisikan props
// Ini akan memberitahu TypeScript bahwa 'reviews' adalah sebuah array dari objek 'ProductReview'
defineProps<{
  reviews: ProductReview[]
}>();

</script>
