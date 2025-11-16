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

    <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <button class="flex items-center text-sm text-gray-700 hover:text-gray-900 font-medium">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter ({{ activeFilters }})
        </button>
        <div v-if="selectedOrders.length > 0" class="flex items-center text-sm text-gray-600">
          <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
            {{ selectedOrders.length }} dipilih
          </span>
        </div>
      </div>
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
              <th class="w-12 px-4 py-3">
                <input
                  type="checkbox"
                  @change="$emit('toggle-select-all', $event)"
                  :checked="isAllSelected"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
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
            <tr
              v-for="pesanan in pesananList"
              :key="pesanan.pesananId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-4">
                <input
                  type="checkbox"
                  :value="pesanan.pesananId"
                  :checked="selectedOrders.includes(pesanan.pesananId)"
                  @change="toggleSelect(pesanan.pesananId, ($event.target as HTMLInputElement).checked)"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
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
                    getStatusClass(pesanan.statusPesanan)
                  ]"
                >
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
                  :class="{ 'text-gray-500': !pesanan.lokasiId }"
                >
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

      <div v-if="pesananList.length === 0" class="text-center py-12">
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
import { computed } from 'vue'
// Perlu mengimport tipe Pemesanan yang sudah diperbarui dengan tipePesanan
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
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'change-tab': [value: string]
  'toggle-select-all': [event: Event]
  'update-selected': [ids: number[]]
  'update-status': [pesanan: Pemesanan]
  'update-lokasi': [pesanan: Pemesanan]
  'open-detail': [pesanan: Pemesanan]
  'open-add-modal': [] // EMIT BARU
}>()

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
  const updatedPesanan = { ...pesanan, statusPesanan: newStatus }
  emit('update-status', updatedPesanan)
}

function handleLokasiChange(pesanan: Pemesanan, newLokasiId: number) {
  const updatedPesanan = { ...pesanan, lokasiId: newLokasiId }
  emit('update-lokasi', updatedPesanan)
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

// ✅ BARU: Fungsi untuk menentukan warna badge berdasarkan tipe pesanan
function getTipeClass(tipe: string | undefined): string {
  const normalizedTipe = (tipe || 'Online').toLowerCase()
  
  if (normalizedTipe.includes('offline')) {
    return 'bg-pink-100 text-pink-800 border border-pink-300' // Tipe Offline (Laporan Manual)
  }
  return 'bg-indigo-100 text-indigo-800 border border-indigo-300' // Tipe Online (Default)
}
</script>