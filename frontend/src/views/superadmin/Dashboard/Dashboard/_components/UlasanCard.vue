<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
    <div class="flex justify-between items-center mb-6">
        <h3 class="text-lg font-bold text-gray-900">Top Produk Populer</h3>
        <a href="#" class="text-sm text-primary hover:text-primary/80 font-medium">Lihat Semua</a>
    </div>
    
    <div v-if="reviews && reviews.length > 0" class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
      <ul class="space-y-3">
        <li v-for="(review, index) in reviews.slice(0, 7)" :key="review.produkId" class="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
          <div class="flex items-center min-w-0">
            <!-- Nomor Urut -->
            <span :class="{'text-primary font-bold': index < 3, 'text-gray-400 font-medium': index >= 3}" class="text-lg w-8 flex-shrink-0">
                #{{ index + 1 }}
            </span>
            
            <div class="ml-2">
              <!-- Nama Produk -->
              <p class="font-semibold text-gray-900 text-sm group-hover:text-primary transition-colors">{{ review.namaProduk }}</p>
              <div class="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                <!-- Rating -->
                <span class="flex items-center bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 mr-1 text-yellow-500">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {{ parseFloat(review.average_rating).toFixed(1) }}
                </span>
                <!-- Total Terjual -->
                <span class="font-medium text-gray-600">{{ review.total_quantity_sold }} Terjual</span>
              </div>
            </div>
          </div>
          
          <button 
            @click="goToReview(review.produkId)"
            class="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-xs bg-white border border-gray-200 hover:border-primary/50 text-gray-600 hover:text-primary font-medium py-1.5 px-3 rounded-md shadow-sm"
          >
            Detail
          </button>
        </li>
      </ul>
    </div>
    <div v-else class="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <span class="text-sm">Belum ada data populer</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { ProductReviewSalesSummary } from '@/services/productService'; 

// Gunakan interface dari productservice untuk mendefinisikan props
defineProps<{
  reviews: ProductReviewSalesSummary[]
}>();

const router = useRouter();

const goToReview = (productId: number) => {
  router.push({
    name: 'admin-review',
    query: { productId: productId.toString() }
  });
};
</script>