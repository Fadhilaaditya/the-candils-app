<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
        <p class="text-gray-600 mt-1">Data penjualan produk per lokasi</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
        <input 
          :value="filters.startDate" 
          @change="updateFilter('startDate', ($event.target as HTMLInputElement).value)"
          type="date" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
        <input 
          :value="filters.endDate" 
          @change="updateFilter('endDate', ($event.target as HTMLInputElement).value)"
          type="date" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
        <select 
          :value="filters.lokasiName" 
          @change="updateFilter('lokasiName', ($event.target as HTMLSelectElement).value)" 
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent">
          <option value="all">Semua Lokasi</option>
          <option v-for="lok in lokasiList" :key="lok.lokasiId" :value="lok.name || lok.namaLokasi">
            {{ lok.name || lok.namaLokasi }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">NO</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">NAMA PRODUK</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">QTY</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">TOTAL HARGA</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">LOKASI</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">DATE</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">AKSI</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <!-- SKELETON LOADING -->
          <tr v-if="isLoading" v-for="i in itemsPerPage" :key="'skeleton-' + i" class="animate-pulse">
            <td class="px-4 py-4"><div class="h-4 bg-gray-200 rounded w-8"></div></td>
            <td class="px-4 py-4"><div class="h-4 bg-gray-200 rounded w-32"></div></td>
            <td class="px-4 py-4"><div class="h-4 bg-gray-200 rounded w-12"></div></td>
            <td class="px-4 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
            <td class="px-4 py-4"><div class="h-6 bg-gray-200 rounded-full w-20"></div></td>
            <td class="px-4 py-4"><div class="h-4 bg-gray-200 rounded w-24"></div></td>
            <td class="px-4 py-4">
              <div class="flex gap-2">
                <div class="h-4 bg-gray-200 rounded w-4"></div>
                <div class="h-4 bg-gray-200 rounded w-4"></div>
              </div>
            </td>
          </tr>

          <!-- DATA ROWS -->
          <tr v-else v-for="(sale, index) in reportData" :key="index" class="hover:bg-gray-50 transition-colors">
            <td class="px-4 py-3 text-sm text-gray-900">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td> 
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ sale.namaProduk }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ sale.QTY }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatCurrency(sale.totalHarga) }}</td>
            <td class="px-4 py-3 text-sm text-gray-700"><span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{{ sale.lokasi }}</span></td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(sale.date) }}</td>
            <td class="px-4 py-3 flex items-center gap-2">
              <button @click="handleEdit(sale)" class="text-blue-600 hover:text-blue-800" title="Edit Laporan"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
              <button @click="handleDelete(sale)" class="text-red-600 hover:text-red-800" title="Hapus Laporan"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="!isLoading && reportData.length === 0" class="text-center py-10 text-gray-500">
        Tidak ada data penjualan yang ditemukan untuk filter ini.
    </div>

    <div v-if="!isLoading && reportData.length > 0" class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-700">
        Menampilkan {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, totalReports) }} dari {{ totalReports }} data
      </div>
      <div class="flex gap-2">
        <button @click="$emit('previous-page')" :disabled="currentPage === 1" class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
          Previous
        </button>
        <button @click="$emit('next-page')" :disabled="currentPage * itemsPerPage >= totalReports" class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SaleReport {
    pesananId: number; 
    produkId: number; 
    namaProduk: string;
    QTY: number; 
    totalHarga: number; 
    lokasi: string; 
    date: string; 
}
interface Lokasi {
    lokasiId: number;
    name: string;
    namaLokasi: string;
}

const props = defineProps<{
  reportData: SaleReport[] 
  isLoading: boolean; 
  filters: { 
    startDate: string; 
    endDate: string;
    lokasiName: string; 
  };
  lokasiList: Lokasi[]; 
  currentPage: number;
  totalPages: number;
  totalReports: number;
  itemsPerPage: number; // ✅ Pertahankan prop ini di sini
}>()

const emit = defineEmits<{
  updateFilters: [filters: {startDate?: string, endDate?: string, lokasiName?: string}]
  'next-page': []
  'previous-page': []
  addReport: []
  editSale: [sale: SaleReport] 
  deleteSale: [sale: SaleReport]
}>()


// Methods
const updateFilter = (key: 'startDate' | 'endDate' | 'lokasiName', value: string | number) => {
    emit('updateFilters', { [key]: value });
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const handleEdit = (sale: SaleReport) => emit('editSale', sale)
const handleDelete = (sale: SaleReport) => emit('deleteSale', sale)
</script>