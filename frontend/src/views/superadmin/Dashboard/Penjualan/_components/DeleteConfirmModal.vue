<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6" @click.stop>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-800">Konfirmasi Hapus</h2>
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

      <div class="mb-6">
        <div class="flex items-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              ></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Hapus Data Penjualan</h3>
            <p class="text-sm text-gray-600">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>

        <div v-if="saleData" class="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 space-y-2">
          <h4 class="font-medium text-gray-800 mb-2">Detail yang akan dihapus:</h4>
          <div class="flex justify-between">
            <span>Produk:</span>
            <span class="font-medium">{{ saleData.namaProduk }}</span>
          </div>
          <div class="flex justify-between">
            <span>Total Harga:</span>
            <span class="font-medium">{{ formatCurrency(saleData.totalHarga) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Lokasi:</span>
            <span class="font-medium">{{ saleData.lokasi }}</span>
          </div>
          <div class="flex justify-between">
            <span>Tanggal:</span>
            <span class="font-medium">{{ formatDate(saleData.date) }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-4">
        <button
          type="button"
          @click="handleClose"
          class="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors duration-200"
        >
          BATALKAN
        </button>
        <button
          type="button"
          @click="handleConfirmDelete"
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
import { ref } from 'vue'

// ✅ FIX: Ganti interface lama (SalesData) dengan interface baru (SaleReport)
interface SaleReport {
    pesananId: number; 
    produkId: number; 
    namaProduk: string;
    QTY: number; 
    totalHarga: number; 
    lokasi: string; 
    date: string; 
}

interface Props {
  isVisible: boolean
  saleData: SaleReport | null // Menggunakan SaleReport
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  // ✅ Emit sekarang mengirim SaleReport, yang dibutuhkan oleh parent
  confirm: [sale: SaleReport] 
}>()

const isDeleting = ref(false)

const handleClose = () => {
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

const handleConfirmDelete = async () => {
  if (!props.saleData) return

  isDeleting.value = true
  try {
    // ✅ Mengirim objek SaleReport yang lengkap ke parent
    emit('confirm', props.saleData) 
  } catch (error) {
    console.error('Error in delete confirmation:', error)
  } finally {
    isDeleting.value = false
    // Modal ditutup oleh parent setelah aksi API selesai
  }
}

// Utility functions
const formatCurrency = (amount: number): string => {
  if (typeof amount !== 'number' || isNaN(amount)) return 'Rp -'
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>