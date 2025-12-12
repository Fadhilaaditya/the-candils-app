<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6" @click.stop>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Edit Laporan #{{ saleData?.pesananId }}</h2>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">NAMA PRODUK</label>
            <input
              :value="saleData?.namaProduk"
              type="text"
              disabled
              class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">KUANTITAS</label>
            <input
              v-model.number="formData.QTY"
              type="number"
              min="1"
              required
              placeholder="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">LOKASI</label>
            <select
              v-model="formData.lokasi"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            >
              <option value="">Pilih lokasi</option>
              <option v-for="lok in lokasiList" :key="lok.lokasiId || lok.id" :value="lok.name || lok.namaLokasi">
                {{ lok.name || lok.namaLokasi }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">DATE</label>
            <input
              :value="saleData?.date"
              type="date"
              disabled
              class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">HARGA SATUAN</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                :value="formatCurrency(formData.unitPrice)"
                type="text"
                disabled
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">TOTAL HARGA</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                :value="totalPriceFormatted"
                type="text"
                disabled
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-4 pt-4">
           <button type="button" @click="handleClose" class="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600">BATALKAN</button>
           <button type="submit" :disabled="isSubmitting" class="px-6 py-3 bg-[#BAB772] text-white rounded-lg font-medium hover:bg-[#a8a668] disabled:opacity-50">
             {{ isSubmitting ? 'Menyimpan...' : 'UPDATE' }}
           </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
// ✅ IMPORT LOKASI
import type { Lokasi } from '@/services/productService' 

// Asumsi interfaces ini diimpor dari productService atau ada di parent
interface SaleReport {
  pesananId: number; 
  produkId: number; 
  namaProduk: string;
  QTY: number; // Kuantitas
  totalHarga: number; // Total Harga
  lokasi: string; // Nama lokasi (Ciputat, Pamulang, dll.)
  date: string;
}

// Data Form yang akan dimodifikasi user
interface SaleFormData {
  QTY: number;
  lokasi: string; // Menyimpan nama lokasi (string)
  unitPrice: number; // Harga satuan (calculated)
}

interface Props {
  isVisible: boolean;
  saleData: SaleReport | null; // Menggunakan SaleReport
  // ✅ PROPS BARU DARI PARENT: Master data
  masterProductList: { name: string; price: number }[];
  lokasiList: Lokasi[]; 
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: [];
  submit: [data: SaleReport]; // Event submit sekarang mengirim objek SaleReport lengkap
}>()

const formData = reactive<SaleFormData>({
  QTY: 1,
  lokasi: '',
  unitPrice: 0,
})

const isSubmitting = ref(false)

// Computed Property untuk mencari harga satuan dari data awal
const unitPriceFromData = computed(() => {
    if (props.saleData && props.saleData.QTY > 0) {
        return props.saleData.totalHarga / props.saleData.QTY;
    }
    return 0;
});

// Watcher untuk menginisialisasi form saat modal dibuka
watch(() => props.saleData, (newSaleData) => {
  if (newSaleData) {
    // 1. Inisialisasi data yang bisa diubah
    formData.QTY = newSaleData.QTY;
    formData.lokasi = newSaleData.lokasi; // Menyimpan nama lokasi (string)
    
    // 2. Set unitPrice berdasarkan data awal (agar unitPrice stabil)
    formData.unitPrice = unitPriceFromData.value;
  }
}, { immediate: true });


const totalPrice = computed(() => formData.QTY * formData.unitPrice);

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

const totalPriceFormatted = computed(() => formatCurrency(totalPrice.value));


const handleClose = () => emit('close')
const handleBackdropClick = () => handleClose()

const handleSubmit = async () => {
  // 1. Validasi
  if (!props.saleData || !formData.lokasi || formData.QTY <= 0 || formData.unitPrice <= 0) {
    alert('Mohon lengkapi semua field dan pastikan kuantitas > 0');
    return;
  }
  isSubmitting.value = true;
  try {
    // 2. Cari Lokasi ID dari nama lokasi yang dipilih
    // Kita harus mencari Lokasi ID di sini untuk dikirim ke backend
    const lokasiDetail = props.lokasiList.find(l => (l.name || l.namaLokasi) === formData.lokasi);
    
    // Check for either lokasiId OR id
    if (!lokasiDetail || (!lokasiDetail.lokasiId && !lokasiDetail.id)) {
        alert('Gagal menemukan ID lokasi yang sesuai. Pilih lokasi yang valid.');
        isSubmitting.value = false;
        return;
    }
    
    // 3. Payload yang dikirim harus SaleReport
    const updatedSaleReport: SaleReport = {
        // Data kunci dari data awal
        pesananId: props.saleData.pesananId,
        produkId: props.saleData.produkId,
        namaProduk: props.saleData.namaProduk,
        date: props.saleData.date,
        
        // Data yang diupdate
        QTY: formData.QTY,
        lokasi: formData.lokasi, // Tetap kirim nama lokasi untuk refresh frontend
        totalHarga: totalPrice.value, // Kirim total harga yang baru
    };

    // 4. Emit ke parent (yang akan memanggil API PUT)
    emit('submit', updatedSaleReport);
    
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
    // emit('close'); // Parent bertanggung jawab menutup modal setelah API sukses
  }
}
</script>