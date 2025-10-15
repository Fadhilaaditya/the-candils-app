<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Product Image -->
      <div class="flex-shrink-0">
        <div class="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
          <img
            :src="product.image"
            :alt="product.productType"
            class="w-full h-full object-cover"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Product Info -->
      <div class="flex-1">
        <div class="flex flex-col h-full">
          <!-- Product Name -->
          <h2 class="text-2xl font-bold text-gray-800 mb-2">
            {{ product.productType }}
          </h2>

          <!-- Rating and Sold Info -->
          <div class="flex items-center gap-4 mb-4">
            <div class="flex items-center gap-2">
              <span class="text-2xl font-bold text-gray-800">
                {{ product.overallRating }}
              </span>
              <div class="flex items-center">
                <svg
                  v-for="star in 5"
                  :key="star"
                  class="w-5 h-5"
                  :class="
                    star <= Math.floor(product.overallRating)
                      ? 'text-yellow-400'
                      : star === Math.ceil(product.overallRating) && product.overallRating % 1 !== 0
                        ? 'text-yellow-200'
                        : 'text-gray-300'
                  "
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
              </div>
              <span class="text-gray-600"> ({{ product.totalSold }}+ Terjual) </span>
            </div>

            <!-- Best Seller Badge -->
            <div
              v-if="product.isBestSeller"
              class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
            >
              Best Seller
            </div>
          </div>

          <!-- Rating Distribution -->
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Penilaian Pengguna</h3>
            <div class="space-y-2">
              <div
                v-for="(count, rating) in ratingDistribution"
                :key="rating"
                class="flex items-center gap-3"
              >
                <span class="text-sm text-gray-600 w-8">{{ rating }}★</span>
                <div class="flex-1 bg-gray-200 rounded-full h-2 mx-2">
                  <div
                    class="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${getPercentage(count)}%` }"
                  ></div>
                </div>
                <div class="flex items-center gap-1">
                  <div class="flex">
                    <svg
                      v-for="star in 5"
                      :key="star"
                      class="w-4 h-4"
                      :class="star <= rating ? 'text-yellow-400' : 'text-gray-300'"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                      />
                    </svg>
                  </div>
                  <span class="text-sm text-gray-600 ml-1">{{ count }} Users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProductDetail } from '../data/productDetailData'

interface Props {
  product: ProductDetail
}

const props = defineProps<Props>()

// Convert rating distribution to array for easier iteration
const ratingDistribution = computed(() => {
  const { ratingDistribution } = props.product
  return {
    5: ratingDistribution.fiveStars,
    4: ratingDistribution.fourStars,
    3: ratingDistribution.threeStars,
    2: ratingDistribution.twoStars,
    1: ratingDistribution.oneStar,
  }
})

// Calculate percentage for progress bar
const getPercentage = (count: number): number => {
  const total = Object.values(ratingDistribution.value).reduce((sum, val) => sum + val, 0)
  return total > 0 ? (count / total) * 100 : 0
}

// Handle image loading errors
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjggMTQ0QzE0MS4yNTQgMTQ0IDE1MiAxMzMuMjU0IDE1MiAxMjBDMTUyIDEwNi43NDYgMTQxLjI1NCA5NiAxMjggOTZDMTE0Ljc0NiA5NiAxMDQgMTA2Ljc0NiAxMDQgMTIwQzEwNCAxMzMuMjU0IDExNC43NDYgMTQ0IDEyOCAxNDRaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjggMTY4QzE0MS4yNTQgMTY4IDE1MiAxNTcuMjU0IDE1MiAxNDRDMTUyIDEzMC43NDYgMTQxLjI1NCAxMjAgMTI4IDEyMEMxMTQuNzQ2IDEyMCAxMDQgMTMwLjc0NiAxMDQgMTQ0QzEwNCAxNTcuMjU0IDExNC43NDYgMTY4IDEyOCAxNjhaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjggMTkyQzE0MS4yNTQgMTkyIDE1MiAxODEuMjU0IDE1MiAxNjhDMTUyIDE1NC43NDYgMTQxLjI1NCAxNDQgMTI4IDE0NEMxMTQuNzQ2IDE0NCAxMDQgMTU0Ljc0NiAxMDQgMTY4QzEwNCAxODEuMjU0IDExNC43NDYgMTkyIDEyOCAxOTJaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
}
</script>
