<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Hapus Produk</h2>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Warning Icon and Message -->
      <div class="text-center mb-6">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            ></path>
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Konfirmasi Hapus</h3>
        <p class="text-sm text-gray-500">
          Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>

      <!-- Product Details -->
      <div v-if="hasProductData" class="bg-gray-50 rounded-lg p-4 mb-6">
        <div class="flex items-center space-x-4">
          <img
            :src="productData?.foto"
            :alt="productData?.namaProduk"
            class="w-16 h-16 object-cover rounded-lg border border-gray-200"
            @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/64x64/eee/ccc?text=Foto'"
          />
          <div class="flex-1">
            <h4 class="font-medium text-gray-900">{{ productData?.namaProduk }}</h4>
            <p class="text-sm text-gray-600 mt-1">
              {{ truncatedDescription }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Error Message -->
      <div v-if="errorMessage" class="text-center mb-4 text-sm text-red-600">
        {{ errorMessage }}
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="handleClose"
          :disabled="isDeleting"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          BATALKAN
        </button>
        <button
          type="button"
          @click="handleConfirm"
          :disabled="isDeleting"
          class="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {{ isDeleting ? 'Menghapus...' : 'HAPUS' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// 1. Impor service API dan tipe data yang BARU
import { deleteProduct } from '@/services/productService'
import type { Produk as Product } from '@/services/productService'

interface Props {
  isVisible: boolean
  // 2. Gunakan tipe data 'Product' yang baru
  productData: Product | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  // 3. Emit event BARU yang didengarkan oleh KelolaProduct.vue
  productDeleted: [] 
}>()

// Component state
const isDeleting = ref(false)
const errorMessage = ref<string | null>(null) // State untuk error

// Computed properties
const hasProductData = computed(() => props.productData !== null)

const truncatedDescription = computed(() => {
  if (!props.productData) return ''
  // 4. Sesuaikan nama properti (description -> deskripsi)
  const desc = props.productData.deskripsi
  return desc.length > 100 ? desc.substring(0, 100) + '...' : desc
})

// Methods
const handleClose = () => {
  if (!isDeleting.value) {
    errorMessage.value = null // Bersihkan error saat ditutup
    emit('close')
  }
}

const handleBackdropClick = () => {
  if (!isDeleting.value) {
    handleClose()
  }
}

// 5. Perbarui logika HandleConfirm
const handleConfirm = async () => {
  if (!props.productData || isDeleting.value) return

  isDeleting.value = true
  errorMessage.value = null

  try {
    // 6. Panggil API deleteProduct (gunakan produkId, bukan id)
    await deleteProduct(props.productData.produkId!)

    // 7. Jika sukses, emit event 'productDeleted'
    emit('productDeleted')
    // (KelolaProduct.vue akan menangkap ini dan menutup modal)

  } catch (error) {
    console.error('Error deleting product:', error)
    errorMessage.value = 'Gagal menghapus produk. Coba lagi.'
  } finally {
    isDeleting.value = false
  }
}

// Fungsi utility (misalnya formatFileSize) tidak lagi digunakan
</script>