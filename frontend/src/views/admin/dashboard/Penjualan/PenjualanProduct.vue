<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    
    <div v-if="isLoading && reportData.length === 0" class="text-center py-20">
      <p class="text-gray-600">Memuat data laporan...</p>
    </div>

    <div v-else-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p class="text-red-500">{{ loadError }}</p>
      <button @click="loadData" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4">
        Coba Lagi
      </button>
    </div>

    <SalesTable
      v-else
      :report-data="paginatedReportData"
      :is-loading="isLoading"
      :filters="filters"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-reports="totalReports"
      @update-filters="updateFilters"
      @next-page="nextPage"
      @previous-page="previousPage"
      @add-report="handleAddReport"
      
      @edit-sale="handleEditSale as any" 
      @delete-sale="handleDeleteSale as any"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <RevenueChart :revenue-data="revenueData as any" /> 
      
      <ProductsSoldChart :summary-data="productsSoldData as any" /> 
    </div>
    
    <EditReportModal
      :is-visible="isEditModalVisible"
      :sale-data="saleToEdit" 
      :master-product-list="masterProductList" 
      :lokasi-list="lokasiList"                 
      @close="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />
    <DeleteConfirmModal
      :is-visible="isDeleteModalVisible"
      :sale-data="saleToDelete"
      @close="handleDeleteModalClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';

// 1. Import semua komponen tampilan
import SalesTable from './_components/SalesTable.vue';
import RevenueChart from './_components/RevenueChart.vue';
import ProductsSoldChart from './_components/ProductsSoldChart.vue';
import EditReportModal from './_components/EditReportModal.vue';
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue';

// 2. Import service API
import { 
    getSalesReport, 
    getSalesSummary, 
    updateSalesTransaction, 
    deleteSalesTransaction,
    getAllLokasi,
    getAllProduk 
} from '@/services/productService'; 

// 3. Define Interfaces (Harus konsisten dengan data API)
interface SaleReport {
    pesananId: number; 
    produkId: number; // Wajib ada
    namaProduk: string;
    QTY: number; 
    totalHarga: number; 
    lokasi: string; 
    date: string; 
}

interface SaleSummary {
    lokasi: string;
    totalPendapatan: number;
    totalProdukTerjual: number;
}
interface Lokasi {
    lokasiId: number;
    name: string;
    namaLokasi: string;
}

// --- Setup ---
const toast = useToast();

// --- State Utama ---
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const reportData = ref<SaleReport[]>([]);
const summaryData = ref<SaleSummary[]>([]);
const lokasiList = ref<Lokasi[]>([]); 
const masterProductList = ref<{ name: string; price: number }[]>([]); 


// --- State Filter & Pagination ---
const filters = reactive({
    startDate: '',
    endDate: '',
    lokasiId: 'all' as string | number, 
});

const currentPage = ref(1);
const itemsPerPage = 5;

// --- State Modal CRUD ---
const isModalVisible = ref(false); 
const isEditModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const saleToEdit = ref<SaleReport | null>(null); 
const saleToDelete = ref<SaleReport | null>(null); 


// --- Computed & Pagination Logic ---

const totalReports = computed(() => reportData.value.length);
const totalPages = computed(() => Math.ceil(reportData.value.length / itemsPerPage));

const paginatedReportData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return reportData.value.slice(start, end);
});

// Data mapping untuk chart
const productsSoldData = computed(() => summaryData.value);
const revenueData = computed(() => summaryData.value);


// --- Logic Fetching Data ---

const fetchMasterData = async () => {
    try {
        const [lokasiRes, produkRes] = await Promise.all([
            getAllLokasi(),
            getAllProduk()
        ]);
        
        lokasiList.value = lokasiRes.data as Lokasi[];
        
        masterProductList.value = produkRes.data.map((p: any) => ({
            name: p.namaProduk,
            price: p.harga 
        }));

    } catch (error) {
        console.error("Error fetching master data:", error);
    }
}

const fetchSalesData = async () => {
    isLoading.value = true;
    loadError.value = null;
    try {
        const reportParams = new URLSearchParams({
            startDate: filters.startDate,
            endDate: filters.endDate,
            lokasiId: String(filters.lokasiId)
        }).toString();

        const reportResponse = await getSalesReport(reportParams); 
        const summaryResponse = await getSalesSummary();
        
        if (reportResponse.data) {
            reportData.value = reportResponse.data.map((item: any) => ({
                pesananId: Number(item.pesananId),
                produkId: Number(item.produkId || 0), 
                namaProduk: item.namaProduk,
                QTY: Number(item.QTY),
                totalHarga: Number(item.totalHarga),
                lokasi: item.lokasi,
                date: item.date,
            })) as SaleReport[];
        } else {
             reportData.value = [];
        }

        if (summaryResponse.data) {
            summaryData.value = summaryResponse.data as SaleSummary[];
        }
        
    } catch (error: any) {
        console.error("Error fetching sales data:", error);
        loadError.value = error.response?.data?.message || 'Gagal terhubung ke server laporan.';
    } finally {
        isLoading.value = false;
    }
};

// Panggil fetch data setiap kali filter berubah
watch(filters, fetchSalesData, { deep: true });


// --- Handlers & Actions ---

const loadData = () => {
    fetchSalesData();
    fetchMasterData();
};

const updateFilters = (newFilters: Partial<typeof filters>) => {
    Object.assign(filters, newFilters);
    currentPage.value = 1; // Reset pagination
};

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const previousPage = () => { if (currentPage.value > 1) currentPage.value--; };

const handleAddReport = () => { isModalVisible.value = true; };
const handleModalClose = () => { isModalVisible.value = false; };
const handleModalSubmit = () => { isModalVisible.value = false; loadData(); }; 

const handleEditSale = (sale: SaleReport) => {
    saleToEdit.value = { ...sale }; 
    isEditModalVisible.value = true;
};
const handleEditModalClose = () => { isEditModalVisible.value = false; };

const handleEditModalSubmit = async (updatedSale: SaleReport) => {
    try {
        // Cari Lokasi ID untuk dikirim ke backend
        const lokasiDetail = lokasiList.value.find(l => (l.name || l.namaLokasi) === updatedSale.lokasi);
        
        const payload = {
            quantity: updatedSale.QTY,
            hargaSatuan: updatedSale.totalHarga / updatedSale.QTY,
            lokasiId: lokasiDetail?.lokasiId, 
        };

        await updateSalesTransaction(updatedSale.pesananId, updatedSale.produkId, payload);
        toast.success('Laporan penjualan berhasil diperbarui.');
        isEditModalVisible.value = false;
        await loadData();
    } catch (error) {
        console.error('Error updating sale:', error);
        toast.error('Gagal memperbarui laporan.');
    }
};

const handleDeleteSale = (sale: SaleReport) => {
    saleToDelete.value = sale;
    isDeleteModalVisible.value = true;
};
const handleDeleteModalClose = () => { isDeleteModalVisible.value = false; };

const handleDeleteConfirm = async () => {
    if (!saleToDelete.value) return;

    try {
        await deleteSalesTransaction(saleToDelete.value.pesananId, saleToDelete.value.produkId);
        toast.success('Transaksi penjualan berhasil dihapus.');
        isDeleteModalVisible.value = false;
        await loadData();
    } catch (error) {
        console.error('Error deleting sale:', error);
        toast.error('Gagal menghapus transaksi.');
    }
};

// --- Lifecycle ---
onMounted(() => {
    loadData();
});
</script>