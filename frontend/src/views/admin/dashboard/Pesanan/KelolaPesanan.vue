<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
      <p class="text-sm text-gray-600">
        Perbarui metrik pemenuhan pesanan
        <a href="#" class="text-blue-600 hover:underline ml-1">Lihat selengkapnya</a>
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-20">
      <svg 
        class="h-12 w-12 text-blue-600 animate-spin" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="ml-4 text-gray-600">Memuat data pesanan...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <svg 
        class="mx-auto h-12 w-12 text-red-400 mb-4" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3 class="text-lg font-medium text-red-800 mb-2">Gagal Memuat Data Pesanan</h3>
      <p class="text-red-600 mb-4">{{ loadError }}</p>
      <button
        @click="loadData"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Coba Lagi
      </button>
    </div>

    <!-- Content -->
    <div v-else class="space-y-6">
      <!-- Component 1: Ringkasan Status -->
      <PesananSummaryCards 
        :action-cards="actionCards"
        @filter-status="handleFilterStatus"
        @refresh="loadData"
      />

      <!-- Component 2: Tabel Pesanan -->
      <PesananTable
        :tabs="tabs"
        :active-tab="activeTab"
        :pesanan-list="filteredPesanan"
        :selected-orders="selectedOrders"
        :lokasi-list="lokasiList"
        :active-filters="activeFilters"
        @change-tab="changeTab"
        @toggle-select-all="toggleSelectAll"
        @update-selected="updateSelectedOrders"
        @update-status="handleUpdateStatus"
        @update-lokasi="handleUpdateLokasi"
        @open-detail="handleOpenDetail"
      />
    </div>

    <!-- Modal Detail Pesanan -->
    <PesananDetailModal
      v-if="showDetailModal && selectedPesanan"
      :pesanan="selectedPesanan"
      :lokasi-list="lokasiList"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PesananSummaryCards from './_components/PesananSummaryCards.vue'
import PesananTable from './_components/PesananTable.vue'
import PesananDetailModal from './_components/PesananDetailModal.vue'
import { 
  getAllPesanan, 
  getAllLokasi, 
  getPesananById,
  updateStatusPesanan,
  updateLokasiPesanan,
  type Pemesanan, 
  type Lokasi 
} from '@/services/productService'

// --- State ---
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const pesananList = ref<Pemesanan[]>([])
const lokasiList = ref<Lokasi[]>([])
const activeTab = ref('all')
const selectedOrders = ref<number[]>([])
const activeFilters = ref(0)
const showDetailModal = ref(false)
const selectedPesanan = ref<Pemesanan | null>(null)

// --- Computed Properties ---
const tabs = computed(() => [
  { label: 'Semua', value: 'all', count: pesananList.value.length },
  { 
    label: 'Perlu Validasi', // BARU
    value: 'perlu-validasi', 
    count: pesananList.value.filter(p => p.statusPesanan === 'Perlu Validasi').length 
  },
  { 
    label: 'Perlu Dikirim', 
    value: 'perlu-dikirim', 
    count: pesananList.value.filter(p => p.statusPesanan === 'Perlu Dikirim').length 
  },
  { 
    label: 'Dikirim', // BARU
    value: 'dikirim', 
    count: pesananList.value.filter(p => p.statusPesanan === 'Dikirim').length 
  },
  { 
    label: 'Selesai', 
    value: 'selesai', 
    count: pesananList.value.filter(p => p.statusPesanan === 'Selesai').length 
  },
  { 
    label: 'Dibatalkan', 
    value: 'dibatalkan', 
    count: pesananList.value.filter(p => p.statusPesanan === 'Dibatalkan').length 
  }
])

const actionCards = computed(() => ({
  perluValidasi: pesananList.value.filter(p => p.statusPesanan === 'Perlu Validasi').length, // BARU
  perluDikirim: pesananList.value.filter(p => p.statusPesanan === 'Perlu Dikirim').length,
  dikirim: pesananList.value.filter(p => p.statusPesanan === 'Dikirim').length, // BARU
  selesai: pesananList.value.filter(p => p.statusPesanan === 'Selesai').length,
  dibatalkan: pesananList.value.filter(p => p.statusPesanan === 'Dibatalkan').length
}))

const filteredPesanan = computed(() => {
  switch (activeTab.value) {
    case 'all':
      return pesananList.value
    case 'perlu-validasi': // BARU
      return pesananList.value.filter(p => p.statusPesanan === 'Perlu Validasi')
    case 'perlu-dikirim':
      return pesananList.value.filter(p => p.statusPesanan === 'Perlu Dikirim')
    case 'dikirim': // BARU
      return pesananList.value.filter(p => p.statusPesanan === 'Dikirim')
    case 'selesai':
      return pesananList.value.filter(p => p.statusPesanan === 'Selesai')
    case 'dibatalkan':
      return pesananList.value.filter(p => p.statusPesanan === 'Dibatalkan')
    default:
      return pesananList.value
  }
})

// --- Methods ---
const loadData = async () => {
  isLoading.value = true
  loadError.value = null
  
  try {
    const [pesananResponse, lokasiResponse] = await Promise.all([
      getAllPesanan(),
      getAllLokasi()
    ])
    
    pesananList.value = pesananResponse.data
    lokasiList.value = lokasiResponse.data
    
    if (pesananList.value.length === 0) {
      console.log('Tidak ada pesanan yang tersedia.')
    }
  } catch (err: any) {
    console.error('Error loading data:', err)
    loadError.value = err.response?.data?.message || 'Gagal memuat data. Coba segarkan halaman.'
  } finally {
    isLoading.value = false
  }
}

const changeTab = (tabValue: string) => {
  activeTab.value = tabValue
  selectedOrders.value = []
}

const handleFilterStatus = (status: string) => {
  changeTab(status)
  
  // Scroll ke tabel
  const tableElement = document.querySelector('.bg-white.rounded-t-lg')
  if (tableElement) {
    tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const toggleSelectAll = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.checked) {
    selectedOrders.value = filteredPesanan.value.map(p => p.pesananId)
  } else {
    selectedOrders.value = []
  }
}

const updateSelectedOrders = (ids: number[]) => {
  selectedOrders.value = ids
}

const handleUpdateStatus = async (pesanan: Pemesanan) => {
  try {
    await updateStatusPesanan(pesanan.pesananId, pesanan.statusPesanan)
    
    // Update local state
    const index = pesananList.value.findIndex(p => p.pesananId === pesanan.pesananId)
    if (index !== -1) {
      pesananList.value[index].statusPesanan = pesanan.statusPesanan
    }
    
    console.log(`✅ Status pesanan #${pesanan.pesananId} berhasil diubah menjadi: ${pesanan.statusPesanan}`)
  } catch (err: any) {
    console.error('Error updating status:', err)
    alert(err.response?.data?.message || 'Gagal mengubah status pesanan')
    await loadData()
  }
}

const handleUpdateLokasi = async (pesanan: Pemesanan) => {
  try {
    if (!pesanan.lokasiId) {
      alert('Silakan pilih lokasi terlebih dahulu')
      return
    }
    
    await updateLokasiPesanan(pesanan.pesananId, pesanan.lokasiId)
    
    // Update local state
    const index = pesananList.value.findIndex(p => p.pesananId === pesanan.pesananId)
    if (index !== -1) {
      pesananList.value[index].lokasiId = pesanan.lokasiId
    }
    
    console.log(`✅ Lokasi pesanan #${pesanan.pesananId} berhasil diubah`)
  } catch (err: any) {
    console.error('Error updating lokasi:', err)
    alert(err.response?.data?.message || 'Gagal mengubah lokasi pesanan')
    await loadData()
  }
}

const handleOpenDetail = async (pesanan: Pemesanan) => {
  try {
    const response = await getPesananById(pesanan.pesananId)
    selectedPesanan.value = response.data
    showDetailModal.value = true
  } catch (err: any) {
    console.error('Error fetching detail:', err)
    alert(err.response?.data?.message || 'Gagal memuat detail pesanan')
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedPesanan.value = null
}

// --- Lifecycle Hooks ---
onMounted(() => {
  loadData()
})
</script>