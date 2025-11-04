<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-gray-900">Detail Pesanan #{{ pesanan.pesananId }}</h2>
            <p class="text-sm text-gray-500 mt-1">{{ formatDate(pesanan.tanggalPesanan) }}</p>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-6">
          <!-- Informasi Pelanggan -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Informasi Pelanggan</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Nama Lengkap</p>
                <p class="text-sm font-medium text-gray-900">{{ pesanan.namaPelanggan }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Kontak</p>
                <p class="text-sm font-medium text-gray-900">{{ pesanan.kontakPelanggan }}</p>
              </div>
              <div class="md:col-span-2">
                <p class="text-xs text-gray-500 mb-1">Alamat Pengiriman</p>
                <p class="text-sm font-medium text-gray-900">{{ pesanan.alamatPengiriman }}</p>
              </div>
            </div>
          </div>

          <!-- Produk yang Dipesan -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-3">Produk yang Dipesan</h3>
            <div class="border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produk</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ukuran</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                    <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, index) in pesanan.items || []" :key="index">
                    <td class="px-4 py-3 text-sm text-gray-900">
                      {{ item.productName || item.namaProduk || '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">
                      {{ item.ukuranName || item.namaUkuran || '-' }}
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ item.quantity }}x</td>
                    <td class="px-4 py-3 text-sm text-gray-900 text-right">
                      Rp {{ formatCurrency(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
                <tfoot class="bg-gray-50">
                  <tr>
                    <td colspan="3" class="px-4 py-3 text-sm font-semibold text-gray-900">Total</td>
                    <td class="px-4 py-3 text-sm font-bold text-blue-600 text-right">
                      Rp {{ formatCurrency(pesanan.totalHarga) }}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Informasi Status -->
          <div class="bg-blue-50 rounded-lg p-4">
            <h3 class="font-semibold text-gray-900 mb-3">Status Pesanan</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-gray-500 mb-1">Status</p>
                <span :class="['inline-block px-3 py-1 rounded-full text-xs font-medium', getStatusClass(pesanan.statusPesanan)]">
                  {{ pesanan.statusPesanan }}
                </span>
              </div>
              <div>
                <p class="text-xs text-gray-500 mb-1">Lokasi</p>
                <p class="text-sm font-medium text-gray-900">
                  {{ getLokasiName(pesanan.lokasiId) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Bukti Pembayaran -->
          <div>
            <h3 class="font-semibold text-gray-900 mb-3">Bukti Pembayaran</h3>
            <!-- Tampilkan gambar jika URL ada -->
            <div v-if="pesanan.buktiPembayaranUrl" class="bg-gray-50 rounded-lg p-4">
              <a 
                :href="pesanan.buktiPembayaranUrl" 
                target="_blank" 
                rel="noopener noreferrer" 
                title="Klik untuk melihat gambar penuh"
                class="block w-full max-w-sm mx-auto"
              >
                <img 
                  :src="pesanan.buktiPembayaranUrl" 
                  alt="Bukti Pembayaran" 
                  class="w-full h-auto rounded-md shadow-md object-cover cursor-pointer hover:opacity-80 transition-opacity"
                >
              </a>
            </div>
            <!-- Tampilkan pesan jika URL tidak ada -->
            <div v-else class="bg-gray-50 rounded-lg p-4">
              <p class="text-sm text-gray-500 text-center">
                Pelanggan belum meng-upload bukti pembayaran.
              </p>
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            @click="$emit('close')"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
// [PERBAIKAN]: Impor tipe data yang sudah benar dari service
import type { Pemesanan, Lokasi } from '@/services/productService'

// [PERBAIKAN]: Tipe 'pesanan' sekarang langsung menggunakan 'Pemesanan'
// karena 'productService.ts' sudah di-update
interface Props {
  pesanan: Pemesanan 
  lokasiList: Lokasi[]
}

const props = defineProps<Props>()

defineEmits<{
  close: []
}>()

// Helper Functions
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount)
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'Selesai':
      return 'bg-green-100 text-green-800'
    case 'Perlu Dikirim':
      return 'bg-blue-100 text-blue-800'
    case 'Dibatalkan':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-yellow-100 text-yellow-800'
  }
}

function getLokasiName(lokasiId: number | null): string {
  if (!lokasiId) return '-- Belum ditentukan --'
  const lokasi = props.lokasiList.find(l => (l.id || l.lokasiId) === lokasiId)
  return lokasi ? (lokasi.name || lokasi.namaLokasi || '-- Tidak ditemukan --') : '-- Tidak ditemukan --'
}
</script>

