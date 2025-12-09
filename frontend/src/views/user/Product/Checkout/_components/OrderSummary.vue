<template>
  <div class="border rounded-lg p-4 bg-yellow-50/60">
    <h3 class="font-semibold text-gray-800 mb-3">Rincian Pembayaran</h3>
    
    <div class="text-sm text-gray-700 space-y-2">
      <div class="flex items-center justify-between">
        <span>Subtotal Produk:</span>
        <span>Rp {{ formatPrice(subtotal) }}</span>
      </div>
      <div v-for="item in items" :key="item.keranjangItemId" class="flex items-center justify-between text-gray-500 pl-2">
        <span class="truncate pr-2">
          {{ item.jumlah }}x {{ item.namaProduk }}
          <span v-if="item.namaUkuran"> ({{ item.namaUkuran }})</span>
        </span>
        <span>Rp {{ formatPrice(item.subtotal) }}</span>
      </div>
      <div class="flex items-center justify-between border-t border-dashed border-gray-300 pt-2 mt-2">
        <span>Ongkos Kirim:</span>
        <span>Rp {{ formatPrice(shippingCost) }}</span>
      </div>
    </div>

    <div class="border-t mt-3 pt-3 flex items-center justify-between font-semibold">
      <span>Total Pembayaran</span>
      <span>Rp {{ formatPrice(total) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CartItem {
  keranjangItemId: number
  produkId: number
  ukuranId: number | null
  jumlah: number
  harga_satuan: number | string
  subtotal: number | string
  namaProduk: string
  namaUkuran: string | null
}

defineProps<{
  items: CartItem[]
  subtotal: number
  shippingCost: number
  total: number
}>()

const formatPrice = (n: number | string): string => {
  const num = Number(n);
  return new Intl.NumberFormat('id-ID').format(isNaN(num) ? 0 : num);
}
</script>