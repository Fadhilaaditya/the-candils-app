<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    
    <ConfirmModal
      ref="confirmModalRef"
      title="Konfirmasi Aksi"
      message="Apakah Anda yakin?"
      confirm-button-text="Ya"
      cancel-button-text="Tidak"
      variant="warning"
    />

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
      <p class="text-sm text-gray-600">
        Perbarui metrik pemenuhan pesanan
        <a href="#" class="text-blue-600 hover:underline ml-1">Lihat selengkapnya</a>
      </p>
    </div>

    <!-- ERROR STATE -->
    <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
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

    <!-- MAIN CONTENT (Always visible, pass loading to table) -->
    <div v-else class="space-y-6">
      <PesananSummaryCards
        :action-cards="actionCards"
        @filter-status="handleFilterStatus"
        @refresh="loadData"
        @open-add-modal="showAddModal = true" 
      />

      <PesananTable
        :loading="isLoading"
        :tabs="tabs"
        :active-tab="activeTab"
        :pesanan-list="filteredPesanan"
        :selected-orders="selectedOrders"
        :lokasi-list="lokasiList"
        :active-filters="activeFilters"
        v-model:startDate="startDate"
        v-model:endDate="endDate"
        v-model:tipePesananFilter="tipePesananFilter"
        @change-tab="changeTab"
        @toggle-select-all="toggleSelectAll"
        @update-selected="updateSelectedOrders"
        @update-status="handleUpdateStatus"
        @update-lokasi="handleUpdateLokasi"
        @open-detail="handleOpenDetail"
        @open-add-modal="showAddModal = true"
      />
    </div>

    <PesananDetailModal
      v-if="showDetailModal && selectedPesanan"
      :pesanan="selectedPesanan"
      :lokasi-list="lokasiList"
      @close="closeDetailModal"
      @validate-order="handleValidateOrder"  @cancel-order="handleCancelOrder"      />
    
    <PesananAddReportModal
      v-if="showAddModal"
      :lokasi-list="lokasiList"
      @close="showAddModal = false"
      @order-reported="handleOrderReported"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useToast } from 'vue-toastification'
import PesananSummaryCards from './_components/PesananSummaryCards.vue'
import PesananTable from './_components/PesananTable.vue'
import PesananDetailModal from './_components/PesananDetailModal.vue'
import PesananAddReportModal from './_components/AddPesananViewModal.vue' 
import ConfirmModal from '@/components/ConfirmModal.vue' // ✅ Import ConfirmModal
import {
  getAllPesanan,
  getAllLokasi,
  getPesananById,
  updateStatusPesanan,
  updateLokasiPesanan,
  type Pemesanan,
  type Lokasi
} from '@/services/productService'

const toast = useToast()

// --- Explicit Type Definitions for Modal ---

interface ConfirmModalPayload {
    title?: string;
    message?: string;
    confirmButtonText?: string;
    cancelButtonText?: string;
    variant?: 'danger' | 'warning';
    showInput?: boolean;
    inputRequired?: boolean; // [NEW]
    inputPlaceholder?: string;
}

// Define the instance type based on the expected exposed method
type ConfirmModalInstance = {
    open(payload: ConfirmModalPayload): Promise<{ confirmed: boolean; value?: string }>;
};

// --- State ---
// ✅ Gunakan tipe eksplisit yang baru didefinisikan
const confirmModalRef = ref<ConfirmModalInstance | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const pesananList = ref<Pemesanan[]>([])
const lokasiList = ref<Lokasi[]>([])
const activeTab = ref('all')
const selectedOrders = ref<number[]>([])
const activeFilters = ref(0)
const showDetailModal = ref(false)
const selectedPesanan = ref<Pemesanan | null>(null)
const showAddModal = ref(false) 
const startDate = ref('')
const endDate = ref('') 
const tipePesananFilter = ref('all') 

// --- Computed Properties ---
const tabs = computed(() => [
  { label: 'Semua', value: 'all', count: pesananList.value.length },
  {
    label: 'Perlu Validasi',
    value: 'perlu-validasi',
    count: pesananList.value.filter(p => p.statusPesanan === 'Perlu Validasi').length
  },
  {
    label: 'Perlu Dikirim',
    value: 'perlu-dikirim',
    count: pesananList.value.filter(p => p.statusPesanan === 'Perlu Dikirim').length
  },
  {
    label: 'Dikirim',
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
  perluValidasi: pesananList.value.filter(p => p.statusPesanan === 'Perlu Validasi').length,
  perluDikirim: pesananList.value.filter(p => p.statusPesanan === 'Perlu Dikirim').length,
  dikirim: pesananList.value.filter(p => p.statusPesanan === 'Dikirim').length,
  selesai: pesananList.value.filter(p => p.statusPesanan === 'Selesai').length,
  dibatalkan: pesananList.value.filter(p => p.statusPesanan === 'Dibatalkan').length
}))

const filteredPesanan = computed(() => {
  switch (activeTab.value) {
    case 'all':
      return pesananList.value
    case 'perlu-validasi':
      return pesananList.value.filter(p => p.statusPesanan === 'Perlu Validasi')
    case 'perlu-dikirim':
      return pesananList.value.filter(p => p.statusPesanan === 'Perlu Dikirim')
    case 'dikirim':
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
      getAllPesanan(startDate.value, endDate.value, tipePesananFilter.value),
      getAllLokasi()
    ])
    pesananList.value = pesananResponse.data
    lokasiList.value = lokasiResponse.data
    if (pesananList.value.length === 0) {
      console.log('Tidak ada pesanan yang tersedia.')
    }
  } catch (err: any) {
    console.error('Error loading data:', err)
    loadError.value = (err as any).response?.data?.message || 'Gagal memuat data. Coba segarkan halaman.'
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
  // 1. SKENARIO KHUSUS: PEMBATALAN (Butuh Input Alasan)
  if (pesanan.statusPesanan === 'Dibatalkan') {
      const result = await confirmModalRef.value?.open({
          title: 'Batalkan Pesanan',
          message: 'Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan.',
          confirmButtonText: 'Ya, Batalkan',
          cancelButtonText: 'Tutup',
          variant: 'danger',
          showInput: true,
          inputPlaceholder: 'Masukkan alasan pembatalan...'
      });

      if (!result?.confirmed) {
          await loadData(); // Revert UI dropdown change if cancelled
          return;
      }
      
      const cancellationReason = result.value || '-';
      
      try {
          await updateStatusPesanan(pesanan.pesananId, 'Dibatalkan', cancellationReason);
          toast.success(`Pesanan #${pesanan.pesananId} berhasil dibatalkan.`);
          
           const index = pesananList.value.findIndex(p => p.pesananId === pesanan.pesananId)
            if (index !== -1) {
              pesananList.value[index].statusPesanan = 'Dibatalkan'
            }
          await loadData(); 
      } catch (error: any) {
          console.error('Error membatalkan pesanan:', error);
          toast.error((error as any).response?.data?.message || 'Gagal membatalkan pesanan.');
          await loadData(); 
      }
      return; 
  }

  // 1.5. SKENARIO KHUSUS: DIKIRIM (Boleh Input Link Tracking/Resi)
  if (pesanan.statusPesanan === 'Dikirim') {
      const result = await confirmModalRef.value?.open({
          title: 'Konfirmasi Pengiriman',
          message: 'Apakah pesanan ini sudah diserahkan ke kurir? Anda dapat memasukkan Link Tracking atau Resi (Opsional).',
          confirmButtonText: 'Ya, Ubah Status',
          cancelButtonText: 'Batal',
          variant: 'warning',
          showInput: true,
          inputRequired: false, // [NEW] Optional Input
          inputPlaceholder: 'Masukkan Link Tracking / Nomor Resi (Opsional)...'
      });

      if (!result?.confirmed) {
          await loadData(); 
          return;
      }
      
      const trackingInfo = result.value || ''; // Optional

      try {
          await updateStatusPesanan(pesanan.pesananId, 'Dikirim', undefined, trackingInfo);
          toast.success(`Status pesanan #${pesanan.pesananId} diperbarui ke Dikirim.`);
          
           const index = pesananList.value.findIndex(p => p.pesananId === pesanan.pesananId)
            if (index !== -1) {
              pesananList.value[index].statusPesanan = 'Dikirim'
            }
          await loadData(); 
      } catch (error: any) {
          console.error('Error update status:', error);
          toast.error((error as any).response?.data?.message || 'Gagal mengubah status pesanan.');
          await loadData(); 
      }
      return; 
  }

  // 2. SKENARIO UMUM: STATUS LAIN (Konfirmasi Biasa)
  const result = await confirmModalRef.value?.open({
      title: 'Konfirmasi Perubahan Status',
      message: `Anda yakin ingin mengubah status pesanan #${pesanan.pesananId} menjadi "${pesanan.statusPesanan}"?`,
      confirmButtonText: 'Ya, Ubah Status',
      cancelButtonText: 'Batal',
      variant: 'warning',
      showInput: false 
  });

  if (!result?.confirmed) {
      await loadData(); // Revert UI dropdown change if cancelled
      return;
  }

  // Lanjut update jika dikonfirmasi
  try {
    await updateStatusPesanan(pesanan.pesananId, pesanan.statusPesanan)
    // Update local state
    const index = pesananList.value.findIndex(p => p.pesananId === pesanan.pesananId)
    if (index !== -1) {
      pesananList.value[index].statusPesanan = pesanan.statusPesanan
    }
    toast.success(`Status pesanan #${pesanan.pesananId} berhasil diubah menjadi: ${pesanan.statusPesanan}`);
  } catch (err: any) {
    console.error('Error updating status:', err)
    toast.error((err as any).response?.data?.message || 'Gagal mengubah status pesanan')
    await loadData()
  }
}

const handleUpdateLokasi = async (pesanan: Pemesanan) => {
  try {
    if (!pesanan.lokasiId) {
      toast.error('Silakan pilih lokasi terlebih dahulu')
      return
    }
    await updateLokasiPesanan(pesanan.pesananId, pesanan.lokasiId)
    // Update local state
    const index = pesananList.value.findIndex(p => p.pesananId === pesanan.pesananId)
    if (index !== -1) {
      pesananList.value[index].lokasiId = pesanan.lokasiId
    }
    toast.success(`Lokasi pesanan #${pesanan.pesananId} berhasil diubah`);
  } catch (err: any) {
    console.error('Error updating lokasi:', err)
    toast.error((err as any).response?.data?.message || 'Gagal mengubah lokasi pesanan')
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
    toast.error((err as any).response?.data?.message || 'Gagal memuat detail pesanan')
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedPesanan.value = null
}

const handleOrderReported = () => { 
  showAddModal.value = false
  loadData() 
}

// ✅ HANDLER VALIDASI (Menggunakan ConfirmModal)
const handleValidateOrder = async (pesananId: number) => {
    // 1. Panggil modal konfirmasi
    const result = await confirmModalRef.value?.open({
        title: 'Validasi Pesanan',
        message: 'Anda yakin ingin memvalidasi pesanan ini dan mengubah status menjadi "Perlu Dikirim"?',
        confirmButtonText: 'Ya, Validasi',
        cancelButtonText: 'Batal',
        variant: 'warning'
    });

    if (!result?.confirmed) {
        return;
    }
    
    try {
        await updateStatusPesanan(pesananId, 'Perlu Dikirim');
        toast.success(`Pesanan #${pesananId} berhasil divalidasi dan siap dikirim.`);
        await loadData(); 
        closeDetailModal(); 
    } catch (error) {
        console.error('Error validasi pesanan:', error);
        toast.error('Gagal memvalidasi pesanan.');
    }
};

// ✅ HANDLER PEMBATALAN (Menggunakan ConfirmModal)
const handleCancelOrder = async (pesananId: number) => {
    // 1. Panggil modal konfirmasi
    const result = await confirmModalRef.value?.open({
        title: 'Batalkan Pesanan',
        message: 'Anda yakin ingin membatalkan pesanan ini? Aksi ini tidak dapat dikembalikan.',
        confirmButtonText: 'Ya, Batalkan',
        cancelButtonText: 'Tutup',
        variant: 'danger',
        showInput: true, // [NEW] Enable input
        inputPlaceholder: 'Masukkan alasan pembatalan...'
    });

    if (!result?.confirmed) {
        return;
    }

    const cancellationReason = result.value || '-';

    try {
        // Pass reason to updateStatusPesanan (3rd arg is optional reason)
        await updateStatusPesanan(pesananId, 'Dibatalkan', cancellationReason);
        toast.success(`Pesanan #${pesananId} berhasil dibatalkan.`);
        await loadData(); 
        closeDetailModal(); 
    } catch (error) {
        console.error('Error membatalkan pesanan:', error);
        toast.error('Gagal membatalkan pesanan.');
    }
};

// --- Lifecycle Hooks ---
onMounted(() => {
  loadData()
})

watch([startDate, endDate, tipePesananFilter], () => {
  loadData()
})
</script>