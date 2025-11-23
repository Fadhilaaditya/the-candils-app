<template>
  <div>
    <div class="mb-4 bg-white rounded-t-lg border-b border-gray-200">
      <div class="flex space-x-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          @click="$emit('change-tab', tab.value)"
          :class="[
            'px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
            activeTab === tab.value
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          ]"
        >
          {{ tab.label }}
          <span v-if="tab.count > 0" class="ml-1 text-xs text-gray-500">{{ tab.count }}</span>
        </button>
      </div>
    </div>

    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-end">
      <div class="flex items-center space-x-2">
        <button class="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Urutkan
        </button>
        <button class="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900 border border-gray-300 rounded hover:bg-gray-50">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Ekspor
        </button>
        <button 
          @click="$emit('open-add-modal')"
          class="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pesanan
        </button>
      </div>
    </div>

    <div class="bg-white rounded-b-lg shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Pesanan
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status Pesanan
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Pelanggan
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontak
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lokasi
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipe 
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- SKELETON LOADING -->
            <tr v-if="loading" v-for="i in itemsPerPage" :key="'skeleton-' + i" class="animate-pulse border-b border-gray-200">
              <td class="px-4 py-4">
                <div class="h-4 bg-gray-200 rounded w-16 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-24"></div>
              </td>
              <td class="px-4 py-4">
                <div class="h-6 bg-gray-200 rounded-full w-24"></div>
              </td>
              <td class="px-4 py-4">
                <div class="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td class="px-4 py-4">
                <div class="h-4 bg-gray-200 rounded w-28"></div>
              </td>
              <td class="px-4 py-4">
                <div class="h-8 bg-gray-200 rounded w-32"></div>
              </td>
              <td class="px-4 py-4">
                <div class="h-5 bg-gray-200 rounded w-16"></div>
              </td>
              <td class="px-4 py-4">
                <div class="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td class="px-4 py-4">
                 <div class="h-4 bg-gray-200 rounded w-20"></div>
              </td>
            </tr>

            <!-- DATA ROWS -->
            <tr
              v-else
              v-for="pesanan in paginatedPesananList"
              :key="pesanan.pesananId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">#{{ pesanan.pesananId }}</div>
                <div class="text-xs text-gray-500">{{ formatDate(pesanan.tanggalPesanan) }}</div>
              </td>
              <td class="px-4 py-4">
                <select
                  :value="pesanan.statusPesanan"
                  @change="handleStatusChange(pesanan, ($event.target as HTMLSelectElement).value)"
                  :class="[
                    'text-xs font-medium px-3 py-1 rounded-full border-0 focus:ring-2 focus:ring-offset-2 cursor-pointer',
                    getStatusClass(pesanan.statusPesanan),
                    {'disabled:opacity-60 disabled:cursor-not-allowed': isStatusDisabled(pesanan.statusPesanan)} // Styling disabled
                  ]"
                  :disabled="isStatusDisabled(pesanan.statusPesanan)" >
                  <option value="Perlu Validasi">Perlu Validasi</option>
                  <option value="Perlu Dikirim">Perlu Dikirim</option>
                  <option value="Dikirim">Dikirim</option>
                  <option value="Selesai">Selesai</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-900">{{ pesanan.namaPelanggan }}</div>
              </td>
              <td class="px-4 py-4">
                <div class="text-sm text-gray-600">{{ pesanan.kontakPelanggan }}</div>
              </td>
              <td class="px-4 py-4">
                <select
                  :value="pesanan.lokasiId"
                  @change="handleLokasiChange(pesanan, Number(($event.target as HTMLSelectElement).value))"
                  class="text-xs font-medium px-3 py-1 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  :class="{ 
                    'text-gray-500': !pesanan.lokasiId,
                    'disabled:opacity-60 disabled:cursor-not-allowed': isStatusDisabled(pesanan.statusPesanan) // Styling disabled
                  }"
                  :disabled="isStatusDisabled(pesanan.statusPesanan)" >
                  <option :value="null" disabled>-- Pilih Lokasi --</option>
                  <option v-for="lokasi in lokasiList" :key="lokasi.id || lokasi.lokasiId" :value="lokasi.id || lokasi.lokasiId">
                    {{ lokasi.name || lokasi.namaLokasi }}
                  </option>
                </select>
              </td>
              
              <td class="px-4 py-4">
                <span :class="getTipeClass(pesanan.tipePesanan)" class="text-xs font-medium px-2 py-1 rounded">
                  {{ pesanan.tipePesanan || 'Online' }}
                </span>
              </td>
              
              <td class="px-4 py-4">
                <div class="text-sm font-medium text-gray-900">
                  Rp {{ formatCurrency(pesanan.totalHarga) }}
                </div>
              </td>
              <td class="px-4 py-4">
                <button
                  @click="$emit('open-detail', pesanan)"
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Lihat Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      <div v-if="!loading && pesananList.length > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Menampilkan
              <span class="font-medium">{{ startIndex }}</span>
              sampai
              <span class="font-medium">{{ endIndex }}</span>
              dari
              <span class="font-medium">{{ pesananList.length }}</span>
              hasil
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="prevPage"
                :disabled="currentPage === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Previous</span>
                <!-- Heroicon name: solid/chevron-left -->
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              <!-- Current Page Indicator -->
               <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                 {{ currentPage }} / {{ totalPages }}
               </span>
              <button
                @click="nextPage"
                :disabled="currentPage === totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span class="sr-only">Next</span>
                <!-- Heroicon name: solid/chevron-right -->
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div v-if="!loading && pesananList.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada pesanan</h3>
        <p class="mt-1 text-sm text-gray-500">Tidak ada pesanan yang sesuai dengan filter yang dipilih.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Pemesanan, Lokasi } from '@/services/productService' 

interface Tab {
  label: string
  value: string
  count: number
}

interface Props {
  tabs: Tab[]
  activeTab: string
  pesananList: Pemesanan[]
  selectedOrders: number[]
  lokasiList: Lokasi[]
  activeFilters: number
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  'change-tab': [value: string]
  'toggle-select-all': [event: Event]
  'update-selected': [ids: number[]]
  'update-status': [pesanan: Pemesanan]
  'update-lokasi': [pesanan: Pemesanan]
  'open-detail': [pesanan: Pemesanan]
  'open-add-modal': [] 
}>()

// Pagination
const currentPage = ref(1)
const itemsPerPage = 5

// Reset page when data changes
watch(() => props.pesananList, () => {
  currentPage.value = 1
})

const totalPages = computed(() => {
  return Math.ceil(props.pesananList.length / itemsPerPage)
})

const paginatedPesananList = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return props.pesananList.slice(start, end)
})

const startIndex = computed(() => ((currentPage.value - 1) * itemsPerPage) + 1)
const endIndex = computed(() => Math.min(currentPage.value * itemsPerPage, props.pesananList.length))

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Computed
const isAllSelected = computed(() => {
  return props.selectedOrders.length === props.pesananList.length && props.pesananList.length > 0
})

// Methods
function toggleSelect(pesananId: number, isChecked: boolean) {
  const newSelected = isChecked
    ? [...props.selectedOrders, pesananId]
    : props.selectedOrders.filter(id => id !== pesananId)
  emit('update-selected', newSelected)
}

function handleStatusChange(pesanan: Pemesanan, newStatus: string) {
  // Pengecekan frontend sebelum emit (optional, backend tetap yang utama)
  if (isStatusDisabled(pesanan.statusPesanan)) {
    return;
  }
  const updatedPesanan = { ...pesanan, statusPesanan: newStatus }
  emit('update-status', updatedPesanan)
}

function handleLokasiChange(pesanan: Pemesanan, newLokasiId: number) {
  // Pengecekan frontend sebelum emit (optional, backend tetap yang utama)
  if (isStatusDisabled(pesanan.statusPesanan)) {
    return;
  }
  const updatedPesanan = { ...pesanan, lokasiId: newLokasiId }
  emit('update-lokasi', updatedPesanan)
}

// ✅ FUNGSI BARU: Menentukan apakah field harus dinonaktifkan
function isStatusDisabled(status: string): boolean {
    return status === 'Selesai' || status === 'Dibatalkan';
}

// Helper Functions
function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
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
      return 'bg-green-100 text-green-800 focus:ring-green-500'
    case 'Perlu Dikirim':
      return 'bg-blue-100 text-blue-800 focus:ring-blue-500'
    case 'Dikirim': 
      return 'bg-purple-100 text-purple-800 focus:ring-purple-500'
    case 'Perlu Validasi': 
      return 'bg-yellow-100 text-yellow-800 focus:ring-yellow-500'
    case 'Dibatalkan':
      return 'bg-red-100 text-red-800 focus:ring-red-500'
    default:
      return 'bg-gray-100 text-gray-800 focus:ring-gray-500'
  }
}

// Fungsi untuk menentukan warna badge berdasarkan tipe pesanan
function getTipeClass(tipe: string | undefined): string {
  const normalizedTipe = (tipe || 'Online').toLowerCase()
  
  if (normalizedTipe.includes('offline')) {
    return 'bg-pink-100 text-pink-800 border border-pink-300' // Tipe Offline (Laporan Manual)
  }
  return 'bg-indigo-100 text-indigo-800 border border-indigo-300' // Tipe Online (Default)
}
</script>