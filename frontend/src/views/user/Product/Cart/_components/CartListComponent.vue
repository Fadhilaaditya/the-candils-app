<template>
  <div class="space-y-4">
    <div 
      v-for="item in items" 
      :key="item.keranjangItemId"
      class="bg-white rounded-lg shadow-sm p-6 flex gap-6"
    >
      <div class="w-24 h-24 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
        <img 
          v-if="item.foto" 
          :src="`http://localhost:3000${item.foto}`" 
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
        <p class="text-gray-600 text-sm mt-1">{{ item.deskripsi || 'Produk tradisional Indonesia' }}</p>
        <div class="flex items-center gap-4 mt-4">
          <div class="text-lg font-bold text-[#BAB772]">
            Rp {{ formatPrice(item.harga_satuan) }}
          </div>
          <div v-if="item.namaUkuran" class="text-sm text-gray-500">
            Ukuran: {{ item.namaUkuran }}
          </div>
        </div>
      </div>

      <div class="flex flex-col items-end justify-between">
        <button 
          @click="$emit('removeItem', item.keranjangItemId)"
          class="text-red-500 hover:text-red-700 mb-5 transition-colors"
          title="Hapus dari keranjang"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
            class="px-3 py-1 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>

        <div class="text-right mt-2">
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
// Komponen ini hanya menerima 'props' dan mengirim 'emits'
// Tidak ada state atau logika API di sini

// Tipe data harus diimpor atau didefinisikan ulang
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
}

// 1. Definisikan Props yang diterima dari Induk
defineProps<{
  items: CartItem[]
}>()

// 2. Definisikan Emits yang dikirim ke Induk
defineEmits<{
  (e: 'removeItem', id: number): void
  (e: 'decreaseQty', item: CartItem): void
  (e: 'increaseQty', item: CartItem): void
}>()

// 3. Salin Helper Functions yang dibutuhkan oleh template
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

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://placehold.co/100x100/eee/ccc?text=No+Image'
}
</script>