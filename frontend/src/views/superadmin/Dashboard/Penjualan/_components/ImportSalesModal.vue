<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Import Data Penjualan</h2>
          <p class="text-sm text-gray-500 mt-1">Upload file Excel (.xlsx, .xls) untuk import data massal.</p>
        </div>
        <div class="flex items-center gap-3">
             <button 
                @click="downloadTemplate" 
                class="text-sm text-[#BAB772] hover:text-[#a8a668] font-medium flex items-center gap-2 px-3 py-2 bg-[#BAB772]/10 rounded-lg transition-colors"
             >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download Template
             </button>
             <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
             </button>
        </div>
      </div>
<!-- ... existing code ... -->

      <!-- Content -->
      <div class="flex-1 overflow-hidden flex flex-col p-6">
        
        <!-- Upload Section (if no file parsed) -->
        <div v-if="parsedRows.length === 0" class="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group relative" @dragover.prevent @drop.prevent="handleDrop">
           <input 
              type="file" 
              accept=".xlsx, .xls" 
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @change="handleFileSelect"
           />
           <div class="text-center p-10">
              <div class="w-16 h-16 bg-[#BAB772] text-white rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 class="text-lg font-medium text-gray-900">Klik atau Drag & Drop file Excel di sini</h3>
              <p class="text-sm text-gray-500 mt-2">Format kolom: Lokasi, Nama Produk, QTY, Nama Pelanggan (opsional), Tanggal (opsional)</p>
           </div>
        </div>

        <!-- Preview Section -->
        <div v-else class="flex-1 flex flex-col h-full overflow-hidden">
           <div class="flex items-center justify-between mb-4">
              <div class="flex space-x-4 text-sm">
                 <span class="px-3 py-1 bg-gray-100 rounded-full text-gray-700">Total: <b>{{ parsedRows.length }}</b></span>
                 <span class="px-3 py-1 bg-green-100 rounded-full text-green-700">Valid: <b>{{ validRowsCount }}</b></span>
                 <span class="px-3 py-1 bg-red-100 rounded-full text-red-700">Invalid: <b>{{ invalidRowsCount }}</b></span>
              </div>
              <button @click="resetFile" class="text-sm text-red-600 hover:text-red-800 font-medium">Reset / Upload Ulang</button>
           </div>

           <div class="flex-1 overflow-auto border border-gray-200 rounded-lg">
              <table class="w-full text-sm text-left">
                 <thead class="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
                    <tr>
                       <th class="px-6 py-3">No</th>
                       <th class="px-6 py-3">Lokasi</th>
                       <th class="px-6 py-3">Nama Produk</th>
                       <th class="px-6 py-3">Ukuran</th>
                       <th class="px-6 py-3">QTY</th>
                       <th class="px-6 py-3">Tanggal</th>
                       <th class="px-6 py-3">Estimasi Total</th>
                       <th class="px-6 py-3">Status</th>
                    </tr>
                 </thead>
                  <tbody>
                     <tr v-for="(row, index) in parsedRows" :key="index" class="bg-white border-b hover:bg-gray-50">
                        <td class="px-6 py-4 font-medium text-gray-900">{{ index + 1 }}</td>
                        <td class="px-6 py-4">
                           <span :class="{'text-red-600 font-bold': !row.lokasiId}">{{ row.rawLokasi }}</span>
                           <div v-if="!row.lokasiId" class="text-xs text-red-500 mt-1">Lokasi tidak ditemukan</div>
                        </td>
                        <td class="px-6 py-4">
                           <span :class="{'text-red-600 font-bold': !row.produkId}">{{ row.rawProduk }}</span>
                           <div v-if="!row.produkId" class="text-xs text-red-500 mt-1">Produk tidak ditemukan</div>
                        </td>
                        <td class="px-6 py-4">
                           <span v-if="row.ukuranId" class="text-gray-700 bg-gray-100 px-2 py-1 rounded text-xs">
                              {{ props.ukuranList.find(u => u.ukuranId === row.ukuranId)?.namaUkuran || '-' }}
                           </span>
                           <span v-else class="text-xs text-red-500">Ukuran invalid</span>
                        </td>
                        <td class="px-6 py-4">{{ row.qty }}</td>
                        <td class="px-6 py-4">{{ row.rawDate }}</td>
                        <td class="px-6 py-4">{{ formatCurrency(row.estimatedTotal) }}</td>
                        <td class="px-6 py-4">
                           <span v-if="row.isValid" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>
                           <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Invalid</span>
                        </td>
                     </tr>
                  </tbody>
              </table>
           </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
         <button type="button" @click="handleClose" class="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 shadow-sm transition-all text-sm">
           Batal
         </button>
         <button 
            type="button" 
            @click="processImport" 
            :disabled="isProcessing || validRowsCount === 0"
            class="px-5 py-2.5 bg-[#BAB772] text-white rounded-lg font-medium hover:bg-[#a8a668] shadow-sm transition-all text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
         >
           <svg v-if="isProcessing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           {{ isProcessing ? 'Memproses Import...' : `Import ${validRowsCount} Data Valid` }}
         </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import { useToast } from 'vue-toastification';

// Props dari parent (Master Data)
interface Props {
  isVisible: boolean;
  productList: any[];     // { produkId, namaProduk, harga, ... }
  lokasiList: any[];      // { lokasiId, namaLokasi/name, ... }
  ukuranList: any[];      // { ukuranId, namaUkuran, produkId, ... }
}

const props = defineProps<Props>();
const emit = defineEmits(['close', 'import-success']);
const toast = useToast();

interface ParsedRow {
    rawLokasi: string;
    rawProduk: string;
    qty: number;
    rawDate?: string;
    rawPelanggan?: string;
    
    // Mapped Data
    lokasiId?: number;
    produkId?: number;
    ukuranId?: number | null; // [NEW]
    unitPrice?: number;
    estimatedTotal: number;
    
    isValid: boolean;
}

const parsedRows = ref<ParsedRow[]>([]);
const isProcessing = ref(false);

const downloadTemplate = () => {
    // 1. Define Headers and Sample Data
    const headers = ['Lokasi', 'Nama Produk', 'Ukuran', 'QTY', 'Tanggal'];
    const sampleData = [
        ['Ciputat', 'Hijau Hitam Legenda', '300ml', 2, '2025-01-01'],
        ['Pamulang', 'Sumsum Pandan Lembut', '500ml', 1, '2025-01-02']
    ];
    
    // 2. Create Sheet
    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    
    // 3. Create Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    
    // 4. Write File
    XLSX.writeFile(wb, "Template_Import_Penjualan.xlsx");
};

const validRowsCount = computed(() => parsedRows.value.filter(r => r.isValid).length);
const invalidRowsCount = computed(() => parsedRows.value.filter(r => !r.isValid).length);

const handleClose = () => {
    resetFile();
    emit('close');
};
const handleBackdropClick = () => handleClose();

const resetFile = () => {
    parsedRows.value = [];
};

const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

const handleFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        parseExcel(target.files[0]);
    }
};

const handleDrop = (e: DragEvent) => {
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
        parseExcel(e.dataTransfer.files[0]);
    }
}

const parseExcel = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    
    // Convert to JSON
    // Asumsi header: Lokasi, Nama Produk, QTY, ...
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { cellDates: true } as any) as any[];
    
    if (!jsonData || jsonData.length === 0) {
        toast.error("File Excel kosong atau format salah.");
        return;
    }

    const formatDateInput = (val: any) => {
        if (!val) return new Date().toISOString().split('T')[0]; // Default to today
        if (val instanceof Date) {
            // Adjust for timezone offset if needed, or simply take YYYY-MM-DD
            // Using local time string to avoid UTC shifting issues for pure dates
            const year = val.getFullYear();
            const month = String(val.getMonth() + 1).padStart(2, '0');
            const day = String(val.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return String(val); // Fallback for strings
    };

    // Process rows
    parsedRows.value = jsonData.map(row => {
        // Normalisasi key (case insensitive cleanup keys if needed, but lets assume user follows template)
        // Kita coba detect column names fleksibel
        
        const rawLokasi = row['Lokasi'] || row['lokasi'] || row['Location'] || '';
        const rawProduk = row['Nama Produk'] || row['nama produk'] || row['Product'] || row['Produk'] || '';
        const rawUkuran = row['Ukuran'] || row['ukuran'] || row['Size'] || '';
        const qty = Number(row['QTY'] || row['qty'] || row['Quantity'] || 1);
        const rawPelanggan = row['Nama Pelanggan'] || row['Pelanggan'] || '-';
        
        // Handle Date
        let rawDate = formatDateInput(row['Tanggal'] || row['Date']);
        
        // --- Mapping Logic ---
        
        // 1. Find Lokasi
        // Match by name insensitive
        const matchedLokasi = props.lokasiList.find(l => {
            const lName = (l.name || l.namaLokasi || '').toLowerCase();
            return lName === String(rawLokasi).toLowerCase();
        });
        
        // 2. Find Produk
        const matchedProduk = props.productList.find(p => {
             const pName = (p.namaProduk || p.name || '').toLowerCase();
             return pName === String(rawProduk).toLowerCase();
        });

        // 3. Find Ukuran
        let matchedUkuranId = null;
        let hargaTambahan = 0;

        if (matchedProduk) {
            const productSizes = props.ukuranList.filter(u => u.produkId === matchedProduk.produkId || u.produkId === matchedProduk.id);
            
            if (rawUkuran) {
                // If Ukuran is specified in Excel, try to find it
                const exactMatch = productSizes.find(u => u.namaUkuran?.toLowerCase() === String(rawUkuran).toLowerCase());
                if (exactMatch) {
                    matchedUkuranId = exactMatch.ukuranId;
                    hargaTambahan = exactMatch.hargaTambahan || 0;
                }
            }
            
            // Fallback if no size specified OR specific size not found: try '300ml', 'Regular', 'Standar' or first available
            if (!matchedUkuranId && productSizes.length > 0) {
                // Prioritize '300ml', 'Regular', 'Standar' or just pick the first one
                const defaultSize = productSizes.find(u => {
                    const name = u.namaUkuran?.toLowerCase();
                    return name === '300ml' || name === 'regular' || name === 'standar';
                });
                
                if (defaultSize) {
                    matchedUkuranId = defaultSize.ukuranId;
                    hargaTambahan = defaultSize.hargaTambahan || 0;
                } else {
                    matchedUkuranId = productSizes[0].ukuranId;
                    hargaTambahan = productSizes[0].hargaTambahan || 0;
                }
            }
        }
        
        const isValid = !!(matchedLokasi && matchedProduk && qty > 0 && matchedUkuranId);
        
        // Ensure strictly numbers
        const basePrice = matchedProduk ? Number(matchedProduk.harga || matchedProduk.price || 0) : 0;
        const extraPrice = Number(hargaTambahan || 0);
        const unitPrice = basePrice + extraPrice;
        
        // Final sanity check
        const estimatedTotal = (isNaN(unitPrice) ? 0 : unitPrice) * (isNaN(qty) ? 0 : qty);

        return {
            rawLokasi,
            rawProduk,
            qty,
            rawPelanggan,
            rawDate,
            lokasiId: matchedLokasi?.lokasiId || matchedLokasi?.id,
            produkId: matchedProduk?.produkId || matchedProduk?.id,
            ukuranId: matchedUkuranId,
            unitPrice: unitPrice,
            estimatedTotal: estimatedTotal,
            isValid
        };
    });
};

const processImport = () => {
    isProcessing.value = true;
    
    // Filter valid rows
    const validRows = parsedRows.value.filter(r => r.isValid);
    
    // Emit ke parent untuk processing API call (supaya logic API terpusat di parent / service)
    // Atau kita bisa import service disini. 
    // Lebih bersih jika parent yang handle looping API call dan progress bar jika perlu, 
    // atau modal ini handle API call sendiri.
    // Mari kita handle di component modal ini agar parent tidak bloated, 
    // TAPI kita butuh import createPesananOffline dari service.
    
    emit('import-success', validRows);
    // Note: Parent akan handle logic save. Kita set isProcessing false setelah parent selesai?
    // Lebih baik kita tunggu promise dari parent atau biarkan parent tutup modal.
    // Untuk simplisitas, kita emit data dan biarkan parent handle UI feedback (toast etc) dan tutup modal.
};
</script>
