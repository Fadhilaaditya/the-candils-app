<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    
    <!-- <div v-if="isLoading && reportData.length === 0" class="text-center py-20">
      <p class="text-gray-600">Memuat data laporan...</p>
    </div> -->

    <div v-if="loadError" class="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <p class="text-red-500">{{ loadError }}</p>
      <button @click="loadData" class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 mt-4">
        Coba Lagi
      </button>
    </div>

    <SalesTable
      v-else
      :report-data="reportData"
      :is-loading="isLoading"
      :filters="filters"
      :lokasi-list="lokasiList" 
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-reports="totalReports"
      :items-per-page="itemsPerPage" 
      @update-filters="updateFilters"
      @next-page="nextPage"
      @previous-page="previousPage"
      @add-report="handleAddReport"
      @open-import="isImportModalVisible = true"
      @export-data="handleExportData"
      
      @edit-sale="handleEditSale as any" 
      @delete-sale="handleDeleteSale as any"
    />

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

    <ImportSalesModal
      :is-visible="isImportModalVisible"
      :product-list="masterProductList"
      :lokasi-list="lokasiList"
      :ukuran-list="ukuranList"
      @close="isImportModalVisible = false"
      @import-success="handleImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useToast } from 'vue-toastification';
import * as XLSX from 'xlsx';

// 1. Import semua komponen tampilan
import SalesTable from './_components/SalesTable.vue';
import EditReportModal from './_components/EditReportModal.vue';
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue';
import ImportSalesModal from './_components/ImportSalesModal.vue';

// 2. Import service API
import { 
    getSalesReport, 
    getSalesSummaryRevenue,
    getSalesSummaryQuantity,
    updateSalesTransaction, 
    deleteSalesTransaction,
    getAllLokasi,
    getAllProduk,
    createPesananOffline,
    getAllUkuran
} from '@/services/productService'; 

// 3. Define Interfaces
interface SaleReport {
    pesananId: number; 
    produkId: number; 
    namaProduk: string;
    ukuran?: string;
    QTY: number; 
    totalHarga: number; 
    lokasi: string; 
    date: string; 
    tipePesanan?: string;
}

interface Lokasi {
    lokasiId: number;
    id?: number; // Tambahkan id sebagai fallback untuk backward compatibility
    name: string;
    namaLokasi: string;
}

// --- Setup ---
const toast = useToast();

// --- State Utama ---
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const reportData = ref<SaleReport[]>([]);
const revenueData = ref<any[]>([]); 
const productsSoldData = ref<any[]>([]); 
const lokasiList = ref<Lokasi[]>([]); 
const masterProductList = ref<any[]>([]); // Changed to any[]
const ukuranList = ref<any[]>([]);

// --- State Filter & Pagination ---
const filters = reactive({
    startDate: '',
    endDate: '',
    lokasiName: 'all' as string, 
    tipePesanan: 'all' as string, // ✅ Add Order Type Filter
});

const currentPage = ref(1);
const itemsPerPage = 10;


// --- State Modal CRUD ---
const isEditModalVisible = ref(false);
const isDeleteModalVisible = ref(false);
const isImportModalVisible = ref(false);
const saleToEdit = ref<SaleReport | null>(null); 
const saleToDelete = ref<SaleReport | null>(null); 


// --- Computed & Pagination Logic ---

const totalReports = ref(0);
const totalPages = ref(1);

// const paginatedReportData = computed(() => {
//     const start = (currentPage.value - 1) * itemsPerPage;
//     const end = start + itemsPerPage;
//     return reportData.value.slice(start, end);
// });


// --- Logic Fetching Data ---

const fetchMasterData = async () => {
    try {
        const [lokasiRes, produkRes, ukuranRes] = await Promise.all([
            getAllLokasi(),
            getAllProduk(),
            getAllUkuran()
        ]);
        
        lokasiList.value = lokasiRes.data as Lokasi[];
        ukuranList.value = ukuranRes.data;
        
        masterProductList.value = produkRes.data.map((p: any) => ({
            ...p,
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
        // 1. Logika Konversi Lokasi Name ke ID untuk API (FIX DI SINI)
        let currentLokasiId: string | number = 'all';
        if (filters.lokasiName && filters.lokasiName !== 'all') {
            
            const filterNameLower = filters.lokasiName.toLowerCase();

            const selectedLokasi = lokasiList.value.find(l => {
                const locationName = (l.name || l.namaLokasi || '').toLowerCase();
                return locationName === filterNameLower;
            });
            
            // ✅ FIX KRITIS: Tambah selectedLokasi?.id sebagai fallback
            currentLokasiId = selectedLokasi?.lokasiId || selectedLokasi?.id || 'all'; 
        }
        
        const reportParams = new URLSearchParams({
            startDate: filters.startDate,
            endDate: filters.endDate,
            lokasiId: String(currentLokasiId),
            tipePesanan: filters.tipePesanan, // ✅ Pass Order Type to API
            page: String(currentPage.value),
            limit: String(itemsPerPage)
        }).toString();

        const [reportRes, revenueRes, quantityRes] = await Promise.all([
            getSalesReport(reportParams), 
            getSalesSummaryRevenue(),
            getSalesSummaryQuantity()
        ]);

        const apiReportData = reportRes.data;
        const apiSummaryRevenueData = revenueRes.data;
        // const apiSummaryQuantityData = quantityRes.data;
        
        // Pemrosesan Data Report
        if (apiReportData.success && Array.isArray(apiReportData.data)) {
            reportData.value = apiReportData.data.map((item: any) => ({
                pesananId: Number(item.pesananId || item.pesananid),
                produkId: Number(item.produkId || 0), 
                namaProduk: item.namaProduk,
                ukuran: item.namaUkuran || '-',
                QTY: Number(item.QTY),
                totalHarga: Number(item.totalHarga),
                lokasi: item.lokasi,
                date: item.date,
                tipePesanan: item.tipePesanan,
            })) as SaleReport[];

            // Update Pagination Meta from API
            if ('meta' in apiReportData && apiReportData.meta) {
               totalReports.value = apiReportData.meta.totalItems;
               totalPages.value = apiReportData.meta.totalPages;
            }

        } else {
             reportData.value = [];
             totalReports.value = 0;
             totalPages.value = 1;
             loadError.value = apiReportData.message || 'Data laporan tidak valid atau kosong.';
        }

        // SET DATA CHART
        if (apiSummaryRevenueData.success) {
            revenueData.value = apiSummaryRevenueData.data; 
        }
        // if (apiSummaryQuantityData.success) {
            productsSoldData.value = quantityRes.data.data;
        // }
        
    } catch (error: any) {
        console.error("Error fetching sales data:", error);
        loadError.value = error.response?.data?.message || 'Gagal terhubung ke server laporan.';
    } finally {
        isLoading.value = false;
    }
};

// Panggil fetch data setiap kali filter berubah
watch(filters, () => {
    currentPage.value = 1; // Reset ke halaman 1 saat filter berubah
    fetchSalesData();
}, { deep: true });

// Panggil fetch data saat page berubah
watch(currentPage, fetchSalesData);


// --- Handlers & Actions ---

const loadData = () => {
    fetchSalesData();
    fetchMasterData();
};

const updateFilters = (newFilters: Partial<typeof filters>) => {
    Object.assign(filters, newFilters);
    // currentPage.value = 1; // Reset pagination handled by watcher
};

const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const previousPage = () => { if (currentPage.value > 1) currentPage.value--; };

const handleAddReport = () => { /* Placeholder for Add Report Modal */ };

const handleEditSale = (sale: SaleReport) => {
    saleToEdit.value = { ...sale }; 
    isEditModalVisible.value = true;
};
const handleEditModalClose = () => { isEditModalVisible.value = false; };

const handleEditModalSubmit = async (updatedSale: SaleReport) => {
    try {
        // Cari Lokasi ID (menggunakan fallback yang sama)
        const selectedLokasi = lokasiList.value.find(l => 
            (l.name?.toLowerCase() || l.namaLokasi?.toLowerCase()) === updatedSale.lokasi.toLowerCase()
        );
        const lokasiIdToSend = selectedLokasi?.lokasiId || selectedLokasi?.id;
        
        if (!lokasiIdToSend) {
             throw new Error("ID Lokasi tidak ditemukan.");
        }
        
        const payload = {
            quantity: updatedSale.QTY,
            hargaSatuan: updatedSale.totalHarga / updatedSale.QTY,
            lokasiId: lokasiIdToSend, 
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

const handleExportData = async () => {
    try {
        toast.info("Sedang menyiapkan data export...");
        
        let currentLokasiId: string | number = 'all';
        if (filters.lokasiName && filters.lokasiName !== 'all') {
            const filterNameLower = filters.lokasiName.toLowerCase();
            const selectedLokasi = lokasiList.value.find(l => {
                const locationName = (l.name || l.namaLokasi || '').toLowerCase();
                return locationName === filterNameLower;
            });
            currentLokasiId = selectedLokasi?.lokasiId || selectedLokasi?.id || 'all'; 
        }

        const reportParams = new URLSearchParams({
            startDate: filters.startDate,
            endDate: filters.endDate,
            lokasiId: String(currentLokasiId),
            tipePesanan: filters.tipePesanan,
            page: '1',
            limit: '999999' 
        }).toString();

        const response = await getSalesReport(reportParams);
        
        if (!response.data || !response.data.success || !Array.isArray(response.data.data)) {
            throw new Error("Gagal mengambil data untuk export.");
        }

        const allData = response.data.data;

        if (allData.length === 0) {
            toast.warning("Tidak ada data untuk diexport.");
            return;
        }

        const rows = allData.map((item: any, index: number) => ({
            'No': index + 1,
            'Lokasi': item.lokasi,
            'Nama Produk': item.namaProduk,
            'Ukuran': item.namaUkuran || '-',
            'QTY': Number(item.QTY),
            'Total Harga': Number(item.totalHarga),
            'Tipe Pesanan': item.tipePesanan || 'Online',
            'Tanggal': item.date
        }));

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");

        XLSX.writeFile(wb, `Laporan_Penjualan_${new Date().toISOString().slice(0,10)}.xlsx`);
        
        toast.success("Berhasil download file Excel.");

    } catch (error) {
        console.error("Export failed:", error);
        toast.error("Gagal melakukan export data.");
    }
};

const handleImportSuccess = async (validRows: any[]) => {
    let successCount = 0;
    let failCount = 0;
    
    for (const row of validRows) {
        try {
            const payload = {
                lokasiId: row.lokasiId,
                namaPelanggan: row.rawPelanggan || '-',
                kontakPelanggan: '-',
                alamatPengiriman: '-',
                tanggalPesanan: row.rawDate,
                totalHarga: row.estimatedTotal,
                items: [{
                    produkId: row.produkId,
                    ukuranId: row.ukuranId,
                    quantity: row.qty,
                    subtotal: row.estimatedTotal
                }]
            };
            
            await createPesananOffline(payload);
            successCount++;
        } catch (err) {
            console.error("Failed to import row", row, err);
            failCount++;
        }
    }
    
    if (successCount > 0) {
        toast.success(`Berhasil mengimpor ${successCount} data transaksi.`);
        isImportModalVisible.value = false;
        loadData();
    }
    
    if (failCount > 0) {
        toast.warning(`${failCount} data gagal diimpor. Cek console.`);
    }
};

// --- Lifecycle ---
onMounted(() => {
    loadData();
});
</script>