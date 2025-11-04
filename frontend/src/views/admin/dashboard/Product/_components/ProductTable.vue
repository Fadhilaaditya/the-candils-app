<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <!-- Header Section (Tidak Berubah) -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Kelola Produk & Varian</h2>
        <p class="text-gray-600 mt-1">Setiap baris mewakili satu varian produk</p>
      </div>
      <button
        @click="handleAddProduct"
        class="mt-4 lg:mt-0 bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-200 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Tambah Produk
      </button>
    </div>

    <!-- Loading State (Tidak Berubah) -->
    <div v-if="isLoading" class="text-center py-12">
       <svg class="mx-auto h-12 w-12 text-[#BAB772] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
       <p class="mt-2 text-sm font-medium text-gray-600">Memuat data...</p>
    </div>

    <!-- Error State (Tidak Berubah) -->
     <div v-if="errorMessage" class="text-center py-12 bg-red-50 rounded-lg">
       <svg class="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
       <h3 class="mt-2 text-sm font-medium text-red-800">Terjadi Kesalahan</h3>
       <p class="mt-1 text-sm text-red-700">{{ errorMessage }}</p>
       <button @click="refreshDataFromApi" class="mt-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-md text-sm font-medium hover:bg-blue-200"> Coba Lagi </button>
    </div>

    <!-- Product Table -->
    <div v-if="!isLoading && !errorMessage" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <!-- --- PERUBAHAN HEADER --- -->
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">No.</th>
            <!-- ----------------------- -->
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">GAMBAR</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">NAMA PRODUK</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">VARIAN</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">HARGA DASAR</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">HRG. TAMBAHAN</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">HARGA FINAL</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">STOK</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <!-- --- PERUBAHAN v-for dan SEL --- -->
          <tr
            v-for="(variant, index) in productVariants" 
            :key="`${variant.produkId}-${variant.ukuranId || 'base'}`"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3 text-sm text-gray-900">{{ index + 1 }}</td> <!-- Tampilkan index + 1 -->
            <!-- -------------------------------- -->
            <td class="px-4 py-3">
              <img
                :src="variant.foto || 'https://placehold.co/64x64/eee/ccc?text=No+Image'"
                :alt="variant.namaProduk"
                class="w-16 h-16 object-cover rounded-lg border border-gray-200"
                @error="($event.target as HTMLImageElement).src = 'https://placehold.co/64x64/eee/ccc?text=No+Image'"
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
            <td class="px-4 py-3">
              <!-- Emit tetap pakai produkId asli -->
              <button @click="handleEdit(variant.produkId)" class="text-blue-600 hover:text-blue-800 mr-2" title="Edit Produk">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button @click="handleDelete(variant.produkId)" class="text-red-600 hover:text-red-800" title="Hapus Produk">
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State (Tidak Berubah) -->
    <div v-if="!isLoading && !errorMessage && !hasProducts" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
      <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama.</p>
    </div>

    <!-- Product Count (Tidak Berubah) -->
    <div v-if="!isLoading && hasProducts" class="mt-4 text-sm text-gray-500 text-center">
      Total: {{ totalVariants }} varian produk
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { getProducts, type ProductVariantRow } from '@/services/productService'

const emit = defineEmits<{
  addProduct: []
  editProduct: [produkId: number]
  deleteProduct: [produkId: number]
}>()

// State Lokal
const productVariants = ref<ProductVariantRow[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

// Computed properties
const hasProducts = computed(() => productVariants.value.length > 0)
const totalVariants = computed(() => productVariants.value.length)

// --- Methods ---

const refreshDataFromApi = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await getProducts()
    productVariants.value = [...response.data]
  } catch (error) {
    console.error('Error loading product variants:', error)
    errorMessage.value = 'Gagal memuat data varian produk. Coba lagi nanti.'
  } finally {
    isLoading.value = false
  }
}

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

const truncateText = (text: string | null | undefined, maxLength: number = 50): string => {
  if (!text) return '-'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// --- Event Handlers ---

const handleAddProduct = () => emit('addProduct')
const handleEdit = (produkId: number) => emit('editProduct', produkId)
const handleDelete = (produkId: number) => emit('deleteProduct', produkId)

onMounted(() => {
  refreshDataFromApi()
})

defineExpose({
  refreshDataFromApi,
})
</script>

