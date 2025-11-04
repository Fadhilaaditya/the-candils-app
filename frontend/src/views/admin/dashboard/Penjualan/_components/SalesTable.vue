<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Laporan Penjualan</h2>
        <p class="text-gray-600 mt-1">Data penjualan produk per lokasi</p>
      </div>
      <button
        @click="handleAddReport"
        class="mt-4 lg:mt-0 bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-200 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
        Tambah Laporan
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Dari Tanggal</label>
        <input v-model="filters.dateFrom" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Sampai Tanggal</label>
        <input v-model="filters.dateTo" type="date" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"/>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Lokasi</label>
        <select v-model="filters.location" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent">
          <option value="">Semua Lokasi</option>
          <option value="Ciputat">Ciputat</option>
          <option value="Pamulang">Pamulang</option>
          <option value="Bukit Indah">Bukit Indah</option>
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
        <tbody>
          <tr v-for="(sale, index) in paginatedSalesData" :key="sale.id" class="border-b border-gray-100 hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ sale.productName }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ sale.quantity }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatCurrency(sale.price) }}</td>
            <td class="px-4 py-3 text-sm text-gray-700"><span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{{ sale.location }}</span></td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatDate(sale.date) }}</td>
            <td class="px-4 py-3 flex items-center gap-2">
              <button @click="handleEdit(sale)" class="text-blue-600 hover:text-blue-800"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg></button>
              <button @click="handleDelete(sale)" class="text-red-600 hover:text-red-800"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between mt-6">
      <div class="text-sm text-gray-700">
        Menampilkan {{ paginationInfo.start }} - {{ paginationInfo.end }} dari {{ paginationInfo.total }} data
      </div>
      <div class="flex gap-2">
        <button @click="previousPage" :disabled="currentPage === 1" class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
          Previous
        </button>
        <button @click="nextPage" :disabled="currentPage >= totalPages" class="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Sale {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  location: string;
  date: string;
}

const props = defineProps<{
  sales: Sale[]
}>()

const emit = defineEmits<{
  addReport: []
  editSale: [sale: Sale]
  deleteSale: [sale: Sale]
}>()

// 'filters' sekarang terhubung ke template dengan v-model
const filters = ref({ dateFrom: '', dateTo: '', location: '' })
const currentPage = ref(1)
const itemsPerPage = 5

// 'filteredSalesData' sekarang memiliki logika filter yang lengkap, dan 'let' sudah benar
const filteredSalesData = computed(() => {
  let filtered = props.sales

  if (filters.value.location) {
    filtered = filtered.filter(sale => sale.location === filters.value.location)
  }
  if (filters.value.dateFrom) {
    filtered = filtered.filter(sale => new Date(sale.date) >= new Date(filters.value.dateFrom))
  }
  if (filters.value.dateTo) {
    filtered = filtered.filter(sale => new Date(sale.date) <= new Date(filters.value.dateTo))
  }

  return filtered
})

const paginatedSalesData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredSalesData.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredSalesData.value.length / itemsPerPage))

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage + 1
  const end = Math.min(currentPage.value * itemsPerPage, filteredSalesData.value.length)
  return {
    start: filteredSalesData.value.length === 0 ? 0 : start,
    end,
    total: filteredSalesData.value.length,
  }
})

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const handleAddReport = () => emit('addReport')
const handleEdit = (sale: Sale) => emit('editSale', sale)
const handleDelete = (sale: Sale) => emit('deleteSale', sale)

const previousPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
</script>
