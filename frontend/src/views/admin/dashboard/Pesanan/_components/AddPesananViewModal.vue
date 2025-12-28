<template>
  <div class="fixed inset-0 z-40 overflow-y-auto h-full w-full transition-all duration-300" 
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click.self="$emit('close')">

    <div class="relative top-10 mx-auto p-6 w-full max-w-4xl shadow-2xl rounded-2xl bg-white mb-10 transform transition-all duration-300">

      <div class="flex justify-between items-center pb-4 border-b-2 border-blue-100">
        <div>
          <h3 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
            </svg>
            Input Pesanan Offline
          </h3>
          <p class="text-sm text-gray-500 mt-1">Laporkan pesanan manual dari penjualan langsung</p>
        </div>
        <button class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-all duration-200" @click="$emit('close')">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <form @submit.prevent="submitPesanan" class="mt-6 space-y-6">

        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
          <h4 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Informasi Pelanggan
          </h4>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="namaPelanggan" class="block text-sm font-semibold text-gray-700 mb-2">Nama Pelanggan *</label>
              <input type="text" v-model="form.namaPelanggan" id="namaPelanggan" required
                placeholder="Masukkan nama pelanggan"
                class="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 sm:text-sm" />
            </div>

            <div>
              <label for="kontakPelanggan" class="block text-sm font-semibold text-gray-700 mb-2">Kontak Pelanggan (Optional)</label>
              <input type="text" v-model="form.kontakPelanggan" id="kontakPelanggan"
                placeholder="Nomor telepon/WhatsApp"
                class="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 sm:text-sm" />
            </div>
          </div>

          <div class="mt-4">
            <label for="lokasiId" class="block text-sm font-semibold text-gray-700 mb-2">Lokasi Penjualan *</label>
            <select v-model="form.lokasiId" id="lokasiId" required
              class="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 sm:text-sm bg-white">
              <option disabled value="">Pilih Lokasi</option>
              <option v-for="lokasi in props.lokasiList" :key="lokasi.id || lokasi.lokasiId" :value="lokasi.id || lokasi.lokasiId">
                {{ lokasi.name || lokasi.namaLokasi }}
              </option>
            </select>
          </div>
        </div>

        <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-100 p-5 rounded-xl">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              Detail Item Pesanan
            </h4>
            <span class="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">{{ totalItems }} Item</span>
          </div>

          <div class="space-y-3">
            <div v-for="(item, index) in form.items" :key="index"
              class="p-4 border-2 border-white rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <span class="bg-gradient-to-r from-purple-500 to-pink-500 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">{{ index + 1 }}</span>
                  <span class="text-sm font-semibold text-gray-700">Item #{{ index + 1 }}</span>
                </div>
                <button type="button" @click="removeItem(index)"
                  class="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-all duration-200"
                  :disabled="form.items.length === 1">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>

              <div class="grid grid-cols-12 gap-3">
                <div class="col-span-5">
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Produk *</label>
                  <select v-model="item.produkId" @change="updateItemPrice(item)" required
                    class="block w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-sm bg-white">
                    <option disabled value="">Pilih Produk</option>
                    <option v-for="produk in produkList" :key="produk.produkId" :value="produk.produkId">
                      {{ produk.namaProduk }}
                    </option>
                  </select>
                </div>

                <div class="col-span-4">
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Ukuran *</label>
                  <select v-model="item.ukuranId" @change="updateItemPrice(item)" required
                    class="block w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-sm bg-white"
                    :disabled="!availableUkuran(item.produkId).length">
                    <option disabled value="">Pilih Ukuran</option>
                    <option v-for="ukuran in availableUkuran(item.produkId)" :key="ukuran.ukuranId" :value="ukuran.ukuranId">
                      {{ ukuran.namaUkuran }}
                    </option>
                  </select>
                </div>

                <div class="col-span-3">
                  <label class="block text-xs font-semibold text-gray-600 mb-1">Jumlah *</label>
                  <input type="number" v-model.number="item.quantity" @input="updateItemPrice(item)" required min="1"
                    class="block w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-sm text-center font-semibold" />
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-gray-100">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-medium text-gray-500">Subtotal Item</span>
                  <span class="text-base font-bold text-purple-600">Rp {{ formatCurrency(item.subtotal) }}</span>
                </div>
              </div>
            </div>
          </div>

          <button type="button" @click="addItem"
            class="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-purple-600 bg-white border-2 border-dashed border-purple-300 rounded-xl hover:bg-purple-50 hover:border-purple-500 transition-all duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
            Tambah Item Baru
          </button>
        </div>

        <div class="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
          <div class="flex justify-between items-center">
            <div>
              <p class="text-sm text-gray-600 font-medium mb-1">Total Keseluruhan</p>
              <p class="text-xs text-gray-500">Dihitung otomatis dari semua item</p>
            </div>
            <div class="text-right">
              <p class="text-3xl font-bold text-green-600">Rp {{ formatCurrency(grandTotal) }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t-2 border-gray-100">
          <button type="button" @click="$emit('close')"
            class="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200">
            Batal
          </button>
          <button type="submit" :disabled="isSubmitting"
            class="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed flex items-center gap-2">
            <svg v-if="isSubmitting" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {{ isSubmitting ? 'Menyimpan...' : 'Laporkan Pesanan' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { createPesananOffline, getAllUkuran, getAllProduk } from '@/services/productService'
// ✅ FIX ESLINT: Menghapus Pemesanan karena tidak digunakan
import type { Lokasi } from '@/services/productService'

// Types
interface ItemInput {
  produkId: number | null
  ukuranId: number | null
  quantity: number
  subtotal: number
}
// Tipe Produk yang dicocokkan dengan hasil mapping di backend (hargaUnit -> harga)
interface Produk {
  produkId: number
  namaProduk: string
  harga: number
}
interface Ukuran {
  ukuranId: number
  produkId: number
  namaUkuran: string
  hargaTambahan: number
}

// Props and Emits
const props = defineProps<{
  lokasiList: Lokasi[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-reported'): void
}>()

// State
const isSubmitting = ref(false)
const produkList = ref<Produk[]>([])
const ukuranList = ref<Ukuran[]>([])

const form = ref({
  lokasiId: null as number | null,
  namaPelanggan: '',
  kontakPelanggan: '',
  alamatPengiriman: 'Pesanan Offline',
  items: [
    { produkId: null, ukuranId: null, quantity: 1, subtotal: 0 }
  ] as ItemInput[],
});

// Computed Properties
const totalItems = computed(() => form.value.items.length);

const grandTotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + item.subtotal, 0);
});

// Methods
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID').format(amount);
};

const addItem = () => {
  form.value.items.push({ produkId: null, ukuranId: null, quantity: 1, subtotal: 0 });
};

const removeItem = (index: number) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1);
  }
};

const availableUkuran = computed(() => (produkId: number | null): Ukuran[] => {
  if (!produkId) return [];
  return ukuranList.value.filter(u => u.produkId === produkId);
});

const getProdukDetails = (produkId: number | null): Produk | undefined => {
  return produkList.value.find(p => p.produkId === produkId);
};

const getUkuranDetails = (ukuranId: number | null): Ukuran | undefined => {
  return ukuranList.value.find(u => u.ukuranId === ukuranId);
};

const updateItemPrice = (item: ItemInput) => {
  const produk = getProdukDetails(item.produkId);
  const ukuran = getUkuranDetails(item.ukuranId);

  if (produk) {
    // Menggunakan produk.harga yang sudah di-map
    const hargaDasar = produk.harga;
    const hargaTambahan = ukuran ? ukuran.hargaTambahan : 0;

    const hargaSatuan = Number(hargaDasar) + Number(hargaTambahan);
    item.subtotal = hargaSatuan * item.quantity;
  } else {
    item.subtotal = 0;
  }
};

const submitPesanan = async () => {
  // Final validation
  if (grandTotal.value <= 0) {
    alert("Total pesanan harus lebih dari Rp 0.");
    return;
  }

  // Format items for backend: only send required fields
  const formattedItems = form.value.items.map(item => ({
    produkId: item.produkId,
    ukuranId: item.ukuranId,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const payload = {
    lokasiId: form.value.lokasiId,
    namaPelanggan: form.value.namaPelanggan,
    kontakPelanggan: form.value.kontakPelanggan || null,
    alamatPengiriman: form.value.alamatPengiriman,
    totalHarga: grandTotal.value,
    items: formattedItems
  };

  isSubmitting.value = true;
  try {
    await createPesananOffline(payload);

    alert('Pesanan offline berhasil dilaporkan!');
    emit('order-reported'); // Memicu refresh data di komponen induk
    emit('close');

  } catch (error: unknown) { // ✅ FIX ESLINT: Menggunakan unknown
    console.error("Error submitting offline order:", error);

    let errorMessage = 'Terjadi kesalahan tidak dikenal saat melaporkan pesanan.';

    // ✅ FIX TS2638: Menggunakan assertion 'as any' untuk mengakses properti pada object unknown
    if (error && typeof error === 'object' && (error as any).response && (error as any).response.data && (error as any).response.data.message) {
        errorMessage = (error as any).response.data.message as string;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }

    alert(`Gagal melaporkan pesanan: ${errorMessage}`);
  } finally {
    isSubmitting.value = false;
  }
};

// Data Loading
const loadMasterData = async () => {
  try {
    // 1. Ambil data produk dan ukuran secara paralel
    const [produkRes, ukuranRes] = await Promise.all([
      getAllProduk(),
      getAllUkuran()
    ]);

    // 2. MAPPING PRODUK
    produkList.value = produkRes.data.map((p: { produkId: number | string, namaProduk: string, harga: number }) => ({
      produkId: Number(p.produkId),
      namaProduk: p.namaProduk,
      harga: Number(p.harga || 0)
    })).filter((p: Produk) => p.produkId > 0);

    // 3. MAPPING UKURAN
    // ✅ FIX TS2345: Menggunakan array of any untuk response data agar linter tidak complain dengan type UkuranPesanan
    const rawUkuranData: any[] = ukuranRes.data;

    ukuranList.value = rawUkuranData.map((u) => ({
      ukuranId: Number(u.ukuranId),
      produkId: Number(u.produkId),
      namaUkuran: u.namaUkuran,
      hargaTambahan: Number(u.hargaTambahan || 0)
    })).filter((u: Ukuran) => u.ukuranId > 0);

    // DEBUGGING
    console.log(`DEBUG: Produk dimuat: ${produkList.value.length}`);
    console.log(`DEBUG: Ukuran dimuat: ${ukuranList.value.length}`);

    // Jika produk gagal dimuat
    if (produkList.value.length === 0) {
      alert("Peringatan: Data Produk kosong. Pastikan tabel Produk terisi di database lokal.");
    }


  } catch (error: unknown) { // ✅ FIX ESLINT: Menggunakan unknown
    console.error("Gagal memuat master data (API Crash):", error);

    let errorMessage = 'Terjadi kesalahan tidak dikenal.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }

    alert(`Gagal memuat data master: ${errorMessage}. Cek konsol backend.`);
  }
};

onMounted(() => {
  loadMasterData();
});
</script>
