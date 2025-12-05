<template>
  <div class="space-y-4">
    <div
      v-for="item in items"
      :key="item.keranjangItemId"
      class="bg-white rounded-lg shadow-sm p-4 md:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6"
    >
      <!-- ✅ Image dengan Cloudinary Logic -->
      <div class="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        <img
          v-if="item.foto"
          :src="getImageUrl(item.foto)"
          :alt="item.namaProduk"
          class="w-full h-full object-cover"
          @error="handleImageError"
        />
        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
          📦
        </div>
      </div>

      <div class="flex-grow">
        <h3 class="text-lg font-semibold text-gray-800">{{ item.namaProduk }}</h3>
        <p class="text-gray-600 text-sm mt-1">
          {{ item.deskripsi || 'Produk tradisional Indonesia' }}
        </p>
        <div class="flex items-center gap-4 mt-4">
          <div class="text-lg font-bold text-[#BAB772]">
            Rp {{ formatPrice(item.harga_satuan) }}
          </div>
          <div v-if="item.namaUkuran" class="text-sm text-gray-500">
            Ukuran: {{ item.namaUkuran }}
          </div>
        </div>
      </div>

      <div class="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:mt-0 mt-2 relative">
        <button
          @click="$emit('removeItem', item.keranjangItemId)"
          class="text-red-500 hover:text-red-700 sm:mb-5 transition-colors"
          title="Hapus dari keranjang"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        <div class="flex items-center gap-2 border border-gray-300 rounded-lg">
          <button
            @click="$emit('decreaseQty', item)"
            class="px-3 py-1 hover:bg-gray-100 transition-colors"
            :disabled="item.jumlah <= 1"
          >
            -
          </button>
          <span class="px-3 py-1 font-medium">{{ item.jumlah }}</span>
          <button
            @click="$emit('increaseQty', item)"
            class="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="item.jumlah >= item.stok"
          >
            +
          </button>
        </div>
        <div v-if="item.jumlah >= item.stok" class="text-xs text-red-500 mt-1 sm:absolute sm:bottom-[-20px] sm:right-0 w-full text-right">
          Max stok: {{ item.stok }}
        </div>

        <div class="text-right sm:mt-2 ml-auto sm:ml-0">
          <div class="text-xs text-gray-500">Subtotal</div>
          <div class="text-lg font-bold text-gray-800">
            Rp {{ formatPrice(getItemSubtotal(item)) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CartItem {
  keranjangItemId: number
  cartSessionId: string
  produkId: number
  namaProduk: string
  deskripsi: string
  foto: string
  ukuranId?: number
  namaUkuran?: string
  jumlah: number
  harga_satuan: number | string
  subtotal: number | string
  stok: number // Tambahkan properti stok
}

// Props
defineProps<{
  items: CartItem[]
}>()

// Emits
defineEmits<{
  (e: 'removeItem', id: number): void
  (e: 'decreaseQty', item: CartItem): void
  (e: 'increaseQty', item: CartItem): void
}>()

// ✅ Image URL Handler - Support Cloudinary & Legacy
const getImageUrl = (fotoUrl: string | null | undefined): string => {
  if (!fotoUrl) {
    return 'https://placehold.co/100x100/eee/ccc?text=No+Image'
  }
  
  // Cloudinary URL (starts with http/https) - return as is
  if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) {
    return fotoUrl
  }
  
  // Legacy local path - construct full URL
  if (fotoUrl.startsWith('/')) {
    const BASE_URL = import.meta.env.PROD
      ? 'https://backend-the-candils.vercel.app'
      : 'http://localhost:3000';
    return `${BASE_URL}${fotoUrl}`
  }
  
  // Fallback
  return 'https://placehold.co/100x100/eee/ccc?text=No+Image'
}

// ✅ Image Error Handler
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://placehold.co/100x100/eee/ccc?text=Error'
  console.warn('Failed to load image:', target.dataset.originalSrc || 'unknown')
}

// Helper Functions
const toNumber = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

const getItemSubtotal = (item: CartItem): number => {
  return toNumber(item.harga_satuan) * item.jumlah
}

const formatPrice = (price: number | string): string => {
  const numericPrice = toNumber(price)
  return new Intl.NumberFormat('id-ID').format(numericPrice)
}
</script>