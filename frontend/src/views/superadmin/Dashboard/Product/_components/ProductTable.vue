<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Kelola Produk & Varian</h2>
        <p class="text-gray-600 mt-1">Setiap baris mewakili satu varian produk</p>
      </div>
      <button
        @click="$emit('addProduct')"
        class="mt-4 lg:mt-0 bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-200 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Tambah Produk
      </button>
    </div>

    <!-- 1. Error State (Masih dipertahankan di sini untuk penanganan error lokal) -->
     <div v-if="errorMessage" class="text-center py-12 bg-red-50 rounded-lg">
       <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
       <h3 class="mt-2 text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
       <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
       <button @click="refreshDataFromApi" class="mt-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200"> Coba Lagi </button>
    </div>

    <!-- 2. Data Real (Tabel dan Footer) -->
    <div v-else>
      <!-- Product Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">No.</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">GAMBAR</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">NAMA PRODUK</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">VARIAN</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">HARGA DASAR</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">HRG. TAMBAHAN</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">HARGA FINAL</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">STOK</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-gray-700">STATUS</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ACTION</th>
            </tr>
          </thead>
          
          <!-- Gunakan prop productVariants -->
          <tbody v-if="hasProducts">
            <tr
              v-for="(variant, index) in productVariants" 
              :key="`${variant.produkId}-${variant.ukuranId || 'base'}`"
              class="border-b border-gray-100 hover:bg-gray-50"
            >
              <td class="px-4 py-3 text-sm text-gray-900">{{ index + 1 }}</td>
              
              <td class="px-4 py-3">
                <img
                  :src="getImageUrl(variant.foto)"
                  :alt="variant.namaProduk"
                  class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                  @error="handleImageError"
                />
              </td>
              
              <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ variant.namaProduk }}</td>
              <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ variant.namaUkuran || '-' }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ formatCurrency(variant.hargaUnit) }}</td>
              <td class="px-4 py-3 text-sm text-gray-700">(+{{ formatCurrency(variant.hargaTambahan) }})</td>
              <td class="px-4 py-3 text-sm font-bold text-gray-900">
                {{ formatCurrency(calculateFinalPrice(variant.hargaUnit, variant.hargaTambahan)) }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-700">{{ variant.stok }}</td>
              <td class="px-4 py-3 text-center">
                <button 
                  @click="$emit('toggleStatus', variant.produkId, !variant.is_active)"
                  :class="variant.is_active ? 'bg-green-500' : 'bg-gray-300'"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span
                    :class="variant.is_active ? 'translate-x-6' : 'translate-x-1'"
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                  />
                </button>
              </td>
              <td class="px-4 py-3">
                <button @click="$emit('editProduct', variant.produkId)" class="text-blue-600 hover:text-blue-800 mr-2" title="Edit Produk">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                </button>
                <button @click="$emit('deleteProduct', variant.produkId)" class="text-red-600 hover:text-red-800" title="Hapus Produk">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="!hasProducts" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
        <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama.</p>
      </div>

      <!-- Pagination Controls (Moved here) -->
      <div v-if="hasProducts" class="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-gray-100">
        <div class="text-sm text-gray-600 mb-4 sm:mb-0">
          Menampilkan halaman <span class="font-medium text-gray-900">{{ currentPage }}</span> dari <span class="font-medium text-gray-900">{{ totalPages }}</span>
          <span class="text-gray-400 mx-2">|</span>
          Total <span class="font-medium text-gray-900">{{ totalItems }}</span> varian
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="$emit('changePage', currentPage - 1)" 
            :disabled="currentPage === 1"
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button 
            @click="$emit('changePage', currentPage + 1)" 
            :disabled="currentPage === totalPages"
            class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getProducts, type ProductVariantRow } from '@/services/productService'
// Menghapus impor ProductTableSkeleton dan logika loading

const props = defineProps<{
  productVariants: ProductVariantRow[] // Terima data sebagai prop
  isLoading: boolean // Terima loading state dari induk
  errorMessage: string | null // Terima error state dari induk
  currentPage: number
  totalPages: number
  totalItems: number
}>()

const emit = defineEmits<{
  addProduct: []
  editProduct: [produkId: number]
  deleteProduct: [produkId: number]
  refreshDataFromApi: [] // Emit refresh event
  changePage: [page: number]
  toggleStatus: [produkId: number, isActive: boolean]
}>()

// Computed properties (berdasarkan props)
const hasProducts = computed(() => props.productVariants.length > 0)
const totalVariants = computed(() => props.productVariants.length)

// --- Methods dan Helpers (disederhanakan) ---

const refreshDataFromApi = () => emit('refreshDataFromApi')


// Helpers
const formatCurrency = (value: number | undefined | null) => {
  if (value === undefined || value === null || isNaN(value)) return 'Rp -';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value)
}

const calculateFinalPrice = (basePrice: any, additionalPrice: any): number | null => {
  const base = parseFloat(basePrice);
  const additional = parseFloat(additionalPrice);
  const isBaseValid = !isNaN(base);
  const isAdditionalValidOrZero = !isNaN(additional) || additionalPrice === null || additionalPrice === undefined;
  if (isBaseValid) {
      const addValue = isAdditionalValidOrZero ? (isNaN(additional) ? 0 : additional) : 0;
      return base + addValue;
  }
  return null;
}

const getImageUrl = (fotoUrl: string | null | undefined): string => {
  if (!fotoUrl) {
    return 'https://placehold.co/64x64/eee/ccc?text=No+Image'
  }
  
  if (fotoUrl.startsWith('http://') || fotoUrl.startsWith('https://')) {
    return fotoUrl
  }
  
  return 'https://placehold.co/64x64/eee/ccc?text=No+Image'
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = 'https://placehold.co/64x64/eee/ccc?text=Error'
}

// Menghapus defineExpose, karena logic refresh sekarang ada di induk
</script>
