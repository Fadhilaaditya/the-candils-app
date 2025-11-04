<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6" @click.stop>
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Edit Laporan</h2>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">NAMA PRODUK</label>
            <select
              v-model="formData.productName"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            >
              <option value="">Pilih produk</option>
              <option v-for="product in masterProductList" :key="product.name" :value="product.name">
                {{ product.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">KUANTITAS</label>
            <input
              v-model="formData.quantity"
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
              v-model="formData.location"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            >
              <option value="">Pilih lokasi</option>
              <option value="Ciputat">Ciputat</option>
              <option value="Pamulang">Pamulang</option>
              <option value="Bukit Indah">Bukit Indah</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">DATE</label>
            <input
              v-model="formData.date"
              type="date"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">HARGA SATUAN</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
              <input
                v-model="formData.unitPrice"
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
import localData from '../data/SalesData.json'

interface Sale {
  id: number;
  productName: string;
  quantity: number;
  price: number; // Ini adalah total harga
  location: string;
  date: string;
}

interface FormData {
  productName: string;
  quantity: number;
  location: string;
  date: string;
  unitPrice: number; // Kita akan simpan harga satuan di sini
}

// PERUBAHAN: Prop 'existingSalesData' tidak lagi dibutuhkan
interface Props {
  isVisible: boolean;
  saleData: Sale | null;
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: [];
  submit: [data: Sale]; // Event submit sekarang mengirim objek Sale lengkap
}>()

const formData = reactive<FormData>({
  productName: '',
  quantity: 1,
  location: '',
  date: '',
  unitPrice: 0,
})

const isSubmitting = ref(false)

// PERUBAHAN: Master product list dibuat dari data JSON lokal
const masterProductList = computed(() => {
  const productMap = new Map<string, number>()
  for (const sale of localData.sales) {
    if (!productMap.has(sale.productName)) {
      const unitPrice = sale.price / sale.quantity;
      productMap.set(sale.productName, unitPrice);
    }
  }
  return Array.from(productMap, ([name, price]) => ({ name, price })).sort((a,b) => a.name.localeCompare(b.name));
});

// Otomatis isi harga satuan saat produk dipilih
watch(() => formData.productName, (newProductName) => {
  if (newProductName) {
    const selectedProduct = masterProductList.value.find(p => p.name === newProductName);
    formData.unitPrice = selectedProduct ? selectedProduct.price : 0;
  } else {
    formData.unitPrice = 0;
  }
});

const totalPrice = computed(() => formData.quantity * formData.unitPrice);
const totalPriceFormatted = computed(() => totalPrice.value.toLocaleString('id-ID'));

// Isi form saat modal dibuka dengan data yang akan diedit
watch(() => props.saleData, (newSaleData) => {
  if (newSaleData) {
    formData.productName = newSaleData.productName;
    formData.quantity = newSaleData.quantity;
    formData.location = newSaleData.location;
    formData.date = newSaleData.date;
    // Hitung dan simpan harga satuan
    formData.unitPrice = newSaleData.price / newSaleData.quantity;
  }
}, { immediate: true });


const handleClose = () => emit('close')
const handleBackdropClick = () => handleClose()

const handleSubmit = async () => {
  if (!props.saleData || !formData.productName || !formData.location || !formData.date || formData.unitPrice <= 0) {
    alert('Mohon lengkapi semua field');
    return;
  }
  isSubmitting.value = true;
  try {
    // Kirim data yang sudah diupdate ke parent, dengan total harga yang sudah dihitung ulang
    emit('submit', {
      id: props.saleData.id,
      productName: formData.productName,
      quantity: formData.quantity,
      location: formData.location,
      date: formData.date,
      price: totalPrice.value, // Kirim total harga yang baru
    });
    emit('close');
  } catch (error) {
    console.error('Error submitting form:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
