<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 pb-16">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Formulir Pemesanan</h1>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 md:p-8">
            <SkeletonCheckout v-if="isLoading" />

            <div v-else-if="error" class="text-center py-10">
              <p class="text-red-500 mb-4">{{ error }}</p>
              <router-link to="/cart" class="text-indigo-600 hover:text-indigo-800 font-medium"
                >&#8592; Kembali ke Keranjang</router-link
              >
            </div>

            <!-- Komponen Formulir Checkout -->
              <CheckoutFormComponent
                v-else
                v-model:full-name="form.fullName"
                v-model:address="form.address"
                v-model:contact="form.contact"
                v-model:selected-ongkir-id="selectedOngkirId"
                :ongkir-list="processedOngkirList"
                :is-submitting="isSubmitting"
                :file-preview-url="filePreviewUrl"
                @file-selected="handleFileSelected"
                @file-removed="handleFileRemoved"
                @file-error="handleFileError"
                @submit-order-and-upload="submitOrderAndUpload"
              >
              <template #summary>
                <OrderSummaryComponent 
                  :items="summaryItems" 
                  :subtotal="subtotal" 
                  :shipping-cost="shippingCost"
                  :total="total" 
                />
              </template>
            </CheckoutFormComponent>
          </div>

          <div class="hidden lg:block p-8 bg-indigo-50/50">
            <div v-if="isLoading" class="w-full h-[560px] bg-gray-200 rounded-2xl animate-pulse"></div>
            
            <!-- 1. Tampilkan Preview Bukti Bayar (Prioritas Utama) -->
            <img
              v-else-if="filePreviewUrl"
              :src="filePreviewUrl"
              alt="Bukti Pembayaran"
              class="w-full h-[560px] object-cover rounded-2xl shadow-lg border border-indigo-200"
            />

            <!-- 2. Tampilkan Split Images jika lebih dari 1 produk -->
            <div v-else-if="orderItems.length > 1" class="h-[560px] flex flex-col gap-2">
              <div 
                v-for="(item, index) in orderItems" 
                :key="item.keranjangItemId || index"
                class="relative flex-1 overflow-hidden rounded-2xl shadow-lg border border-indigo-200 group"
              >
                <img
                  :src="getImageUrl(item.foto)"
                  :alt="item.namaProduk"
                  class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <!-- Optional: Tampilkan nama produk saat hover -->
                <div class="absolute bottom-0 left-0 right-0 bg-black/50 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                   <p class="text-white text-xs font-medium text-center truncate">{{ item.namaProduk }}</p>
                </div>
              </div>
            </div>

            <!-- 3. Tampilkan Single Image (Default/1 Produk) -->
            <img
              v-else
              :src="displayImageUrl"
              alt="Ringkasan Pesanan"
              class="w-full h-[560px] object-cover rounded-2xl shadow-lg border border-indigo-200"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import CheckoutFormComponent from './_components/CheckoutForm.vue'
import OrderSummaryComponent from './_components/OrderSummary.vue'
import SkeletonCheckout from './_components/SkeletonCheckout.vue'

interface CartItem {
  keranjangItemId: number
  produkId: number
  ukuranId: number | null
  jumlah: number
  harga_satuan: number | string 
  subtotal: number | string 
  namaProduk: string
  namaUkuran: string | null
  foto: string
}

// State
const isSubmitting = ref(false)
const isLoading = ref(true)
const error = ref<string | null>(null)

// State untuk file upload
const selectedFile = ref<File | null>(null)
const filePreviewUrl = ref<string | null>(null)

// API URLs (Menggunakan fetch bawaan browser)
// Gunakan logika yang sama dengan api.ts untuk menentukan BASE_URL
const API_BASE = import.meta.env.PROD
  ? 'https://backend-the-candils.vercel.app/api'
  : 'http://localhost:3000/api';

const API_CART_URL = `${API_BASE}/cart`;
const API_ORDER_URL = `${API_BASE}/pesanan`;

const form = reactive({
  fullName: '',
  address: '',
  contact: '',
})

const orderItems = ref<CartItem[]>([])
const isDirectCheckout = ref(false)
const router = useRouter()
const toast = useToast()

// Ongkir State
const ongkirList = ref<any[]>([])
const selectedOngkirId = ref<number | null>(null)

// Definisi Jadwal Operasional
const SCHEDULES = [
  {
    keywords: ['ciputat'],
    days: [1, 2, 3, 4], // Senin - Kamis (0=Minggu, 1=Senin, dst)
    startHour: 16,
    endHour: 19,
    message: 'Senin - Kamis (16:00 - 19:00)'
  },
  {
    keywords: ['bukit indah'],
    days: [1, 2, 3, 4], // Senin - Kamis
    startHour: 6,
    endHour: 10,
    message: 'Senin - Kamis (06:00 - 10:00)'
  },
  {
    keywords: ['pamulang'],
    days: [6, 0], // Sabtu - Minggu
    startHour: 6,
    endHour: 10,
    message: 'Sabtu - Minggu (06:00 - 10:00)'
  }
]

// Fungsi Validasi Jadwal
const validateSchedule = (ongkirName: string): { isOpen: boolean; message?: string } => {
  const nameLower = ongkirName.toLowerCase()
  
  // Cari jadwal yang cocok berdasarkan nama
  const schedule = SCHEDULES.find(s => s.keywords.some(k => nameLower.includes(k)))
  
  // Jika tidak ada jadwal khusus (misal JNE, GoSend, atau lokasi lain), anggap BUKA
  if (!schedule) return { isOpen: true }

  const now = new Date()
  const currentDay = now.getDay() // 0 = Minggu, 1 = Senin, ...
  const currentHour = now.getHours()

  // Cek Hari
  if (!schedule.days.includes(currentDay)) {
    return { isOpen: false, message: schedule.message }
  }

  // Cek Jam
  if (currentHour < schedule.startHour || currentHour >= schedule.endHour) {
    return { isOpen: false, message: schedule.message }
  }

  return { isOpen: true }
}

// Computed Ongkir List dengan Status Validasi
const processedOngkirList = computed(() => {
  return ongkirList.value.map(ongkir => {
    const check = validateSchedule(ongkir.nama)
    return {
      ...ongkir,
      isDisabled: !check.isOpen,
      // Jika tutup, tambahkan info jam operasional di label
      displayLabel: check.isOpen 
        ? `${ongkir.nama} - Rp ${toNumber(ongkir.biaya).toLocaleString('id-ID')}`
        : `${ongkir.nama} (TUTUP - ${check.message})`
    }
  })
})

import { watch } from 'vue'

// Watcher untuk validasi saat user memilih ongkir (Safety check)
watch(selectedOngkirId, (newId) => {
  if (!newId) return

  const selectedOption = processedOngkirList.value.find(o => o.ongkirId === newId)
  if (selectedOption && selectedOption.isDisabled) {
    toast.error(`Maaf, toko ${selectedOption.nama} sedang tutup.`)
    // Reset pilihan jika user memaksa memilih (walaupun disabled di UI)
    selectedOngkirId.value = null
  }
})

// Helper function untuk konversi nilai string/number ke number
const toNumber = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

// Helper function untuk menghitung subtotal item
const getItemSubtotal = (item: CartItem): number => {
  return toNumber(item.harga_satuan) * item.jumlah
}


// Helper untuk mendapatkan URL gambar
const getImageUrl = (fotoUrl: string | null) => {
    const imageBase = import.meta.env.PROD ? 'https://backend-the-candils.vercel.app' : 'http://localhost:3000';
    if (fotoUrl && fotoUrl.startsWith('http')) {
      return fotoUrl
    }
    return `${imageBase}${fotoUrl || '/placeholder.svg'}`
}

// Computed property 'displayImageUrl' (Hanya untuk single product / fallback)
const displayImageUrl = computed(() => {
  if (filePreviewUrl.value) return filePreviewUrl.value; // Tampilkan preview file yang diupload
  
  if (orderItems.value.length > 0) {
    return getImageUrl(orderItems.value[0].foto)
  }
  return '/placeholder.svg'
})

// --- Data Fetching ---
onMounted(() => {
  loadCheckoutData()
  fetchOngkirList()
})

const fetchOngkirList = async () => {
  try {
    const response = await fetch(`${API_BASE}/pesanan/ongkir`)
    const data = await response.json()
    if (Array.isArray(data)) {
      ongkirList.value = data
    }
  } catch (err) {
    console.error('Gagal memuat data ongkir:', err)
    toast.error('Gagal memuat opsi pengiriman.')
  }
}

const getCartSessionId = (): string | null => {
  return localStorage.getItem('cartSessionId')
}

const loadCheckoutData = async () => {
  // ... (existing loadCheckoutData logic) ...
  isLoading.value = true
  error.value = null
  const directDataRaw = sessionStorage.getItem('directCheckoutData')

  // Logika Direct Checkout
  if (directDataRaw) {
    try {
      const directData = JSON.parse(directDataRaw)
      if (directData && directData.items && directData.items.length > 0) {
        orderItems.value = directData.items
        isDirectCheckout.value = true
        sessionStorage.removeItem('directCheckoutData')
      } else {
        throw new Error('Data direct checkout tidak valid.')
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data checkout'
      error.value = errorMessage
      toast.error(errorMessage)
    } finally {
      isLoading.value = false
    }
  } else {
    // Logika Checkout dari Keranjang Utama (Menggunakan fetch)
    const cartSessionId = getCartSessionId()
    if (!cartSessionId) {
      error.value = 'Keranjang Anda kosong atau sesi tidak ditemukan.'
      isLoading.value = false
      router.push('/cart')
      return
    }
    try {
      // NOTE: Menggunakan fetch, bukan Axios, jadi tidak perlu interceptor di sini
      const response = await fetch(`${API_CART_URL}/${cartSessionId}`) 
      const result = await response.json()
      if (response.ok && result.success && result.data && result.data.length > 0) {
        orderItems.value = result.data
      } else {
        error.value = 'Keranjang Anda kosong.'
        toast.error('Tidak ada item di keranjang untuk di-checkout.')
        router.push('/cart')
      }
    } catch (err) {
      console.error('Gagal memuat data checkout:', err)
      error.value = 'Gagal memuat data keranjang.'
      toast.error('Gagal memuat data keranjang.')
    } finally {
      isLoading.value = false
    }
  }
}

// Computed properties
const subtotal = computed(() => orderItems.value.reduce((acc, item) => {
    return acc + getItemSubtotal(item)
}, 0))

const shippingCost = computed(() => {
  if (!selectedOngkirId.value) return 0
  const selected = ongkirList.value.find(o => o.ongkirId === selectedOngkirId.value)
  return selected ? Number(selected.biaya) : 0
})

const total = computed(() => subtotal.value + shippingCost.value)

const summaryItems = computed(() => {
  return orderItems.value.map(item => ({
    ...item,
    subtotal: getItemSubtotal(item) 
  }));
});


// --- HANDLERS (Dikonsolidasi dan Dihapus Duplikat) ---

const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    selectedFile.value = file
    // Buat URL sementara untuk preview gambar
    filePreviewUrl.value = URL.createObjectURL(file)
  } else {
    // Jika file dibatalkan, bersihkan state
    if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value);
    }
    selectedFile.value = null;
    filePreviewUrl.value = null;
    toast.info('Pilihan file dibatalkan.');
  }
};

const handleFileRemoved = () => {
  // Hapus URL object jika ada
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
  selectedFile.value = null
  filePreviewUrl.value = null
  toast.info('Gambar bukti pembayaran dihapus')
}

const handleFileError = (message: string) => {
  // Split pesan menjadi array dan tampilkan sebagai toast
  const lines = message.split('\n').filter((line) => line.trim() !== '')
  const mainMessage = lines[0] || 'Terjadi kesalahan pada file'
  const details = lines.slice(1).join(' | ')

  toast.error(mainMessage + (details ? `\n${details}` : ''), {
    timeout: 5000, 
  })
}


// --- Fungsi 'submitOrderAndUpload' ---
const submitOrderAndUpload = async () => {
  // 1. Validasi
  if (!form.fullName || !form.address || !form.contact) {
    toast.error('Lengkapi data pemesan terlebih dahulu')
    return
  }
  if (!selectedOngkirId.value) {
    toast.error('Silakan pilih opsi pengiriman.')
    return
  }
  if (orderItems.value.length === 0) {
    toast.error('Tidak ada item untuk di-checkout.')
    return
  }
  if (!selectedFile.value) {
    toast.error('Silakan upload bukti pembayaran terlebih dahulu.')
    return
  }

  isSubmitting.value = true

  // 2. Siapkan FormData
  const formData = new FormData()

  // Tambahkan data teks
  formData.append('lokasiId', '1') // Asumsi '1' untuk "Online/Pengiriman"
  formData.append('namaPelanggan', form.fullName)
  formData.append('alamatPengiriman', form.address)
  formData.append('kontakPelanggan', form.contact)
  
  // Tambahkan data Ongkir
  formData.append('ongkirId', String(selectedOngkirId.value))
  formData.append('biayaOngkir', String(shippingCost.value))

  // Tambahkan data 'items' sebagai JSON string
  const itemsPayload = summaryItems.value.map((item) => ({
    produkId: item.produkId,
    ukuranId: item.ukuranId || null,
    quantity: item.jumlah, 
    subtotal: item.subtotal, // Menggunakan subtotal yang sudah dihitung ulang
  }))
  formData.append('items', JSON.stringify(itemsPayload))

  // Tambahkan total harga (Grand Total)
  formData.append('totalHarga', String(total.value));
  
  // Tambahkan file
  formData.append('buktiPembayaran', selectedFile.value)

  // 3. Kirim FormData ke API 'createPesanan'
  try {
    const response = await fetch(API_ORDER_URL, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (response.ok && result.pesananId) {
      toast.success('Pesanan Anda berhasil dibuat!')

      // Kosongkan keranjang (jika bukan direct checkout)
      if (!isDirectCheckout.value) {
        const cartSessionId = getCartSessionId()
        if (cartSessionId) {
          // Menggunakan fetch untuk menghindari masalah Axios interceptor
          await fetch(`${API_CART_URL}/clear/${cartSessionId}`, { method: 'DELETE' })
          // Trigger event untuk update UI keranjang di komponen lain
          window.dispatchEvent(new Event('cartUpdated'))
        }
      }

      router.push('/products')
    } else {
      toast.error(`Gagal membuat pesanan: ${result.message || 'Error tidak diketahui'}`)
    }
  } catch (err) {
    console.error('Error submitting order:', err)
    toast.error('Gagal terhubung ke server.')
  } finally {
    isSubmitting.value = false
    // Hapus preview URL
    if (filePreviewUrl.value) {
      URL.revokeObjectURL(filePreviewUrl.value)
    }
  }
}
</script>