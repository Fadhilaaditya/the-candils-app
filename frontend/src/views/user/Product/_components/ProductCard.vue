<template>
  <div
    class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col"
    @click="handleProductClick"
  >
    <div class="relative">
      <img
        :src="product.foto || 'https://placehold.co/400x400/eee/ccc?text=No+Image'"
        :alt="product.namaProduk"
        class="w-full h-48 object-cover"
        @error="($event.target as HTMLImageElement).src = 'https://placehold.co/400x400/eee/ccc?text=No+Image'"
      />
    </div>

    <div class="p-4 flex flex-col flex-1">
      
      <h3 class="text-lg font-bold text-gray-800 line-clamp-2 h-10"> 
        {{ product.namaProduk }}
      </h3>

      <p v-if="product.namaUkuran" class="text-sm font-normal text-gray-500 mb-2 h-5">
        ({{ product.namaUkuran }})
      </p>
      <p v-else class="text-sm font-normal text-gray-500 mb-2 h-5"></p>


      <p class="text-orange-600 font-semibold text-lg mb-2">
        {{ formatCurrency(finalPrice) }}
      </p>

      <p class="text-gray-600 text-sm mb-3 line-clamp-2 h-10"> 
        {{ product.deskripsi || 'Tidak ada deskripsi.' }}
      </p>

      <div class="flex items-center justify-between mb-4 text-sm h-5"> 
        <div class="flex items-center">
          <div class="flex">
            <svg
              v-for="i in 5" :key="i"
              class="w-4 h-4"
              :class="i <= Math.round(product.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <span class="ml-1 text-gray-600 font-medium">
            {{ (product.averageRating || 0).toFixed(1) }}
          </span>
        </div>
        <span class="text-gray-500">{{ product.reviewCount || 0 }} Ulasan</span>
      </div>

      <div class="mt-auto"> 
        <button
          @click.stop="handleCheckout"
          class="bg-[#BAB772] hover:bg-[#a8a668] text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 w-full"
        >
          Lihat Detail / Pesan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { ProductVariantRow } from '@/services/productService'

const props = defineProps<{
  product: ProductVariantRow
}>()

const router = useRouter()

// Fungsi format harga
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return 'Rp -';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Computed 'finalPrice'
const finalPrice = computed(() => {
  const base = parseFloat(props.product.hargaUnit as any);
  const additional = parseFloat(props.product.hargaTambahan as any);

  const basePrice = !isNaN(base) ? base : 0;
  const additionalPrice = !isNaN(additional) ? additional : 0;
  
  return basePrice + additionalPrice;
})

// Navigasi ke halaman detail
const handleProductClick = () => {
  router.push({ name: 'product-detail-user', params: { id: props.product.produkId } })
}

// Tombol Checkout (sementara ke detail)
const handleCheckout = () => {
  handleProductClick();
}
</script>

<style scoped>
/* Pastikan line-clamp berlaku */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>