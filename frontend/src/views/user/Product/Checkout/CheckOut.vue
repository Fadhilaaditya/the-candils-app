<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 pb-16">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Formulir Pemesanan</h1>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 md:p-8">
            <div v-if="isLoading" class="text-center py-10">
              <p>Memuat keranjang...</p>
            </div>

            <div v-else-if="error" class="text-center py-10">
              <p class="text-red-500">{{ error }}</p>
              <router-link to="/cart" class="text-[#BAB772] hover:underline mt-4"
                >Kembali ke Keranjang</router-link
              >
            </div>

            <CheckoutFormComponent
              v-else
              v-model:full-name="form.fullName"
              v-model:address="form.address"
              v-model:contact="form.contact"
              :is-submitting="isSubmitting"
              :file-preview-url="filePreviewUrl"
              @file-selected="handleFileSelected"
              @file-removed="handleFileRemoved"
              @file-error="handleFileError"
              @submit-order-and-upload="submitOrderAndUpload"
            >
              <template #summary>
                <OrderSummaryComponent :items="summaryItems" :subtotal="subtotal" :total="total" />
              </template>
            </CheckoutFormComponent>
          </div>

          <div class="hidden lg:block p-8">
            <img
              :src="displayImageUrl"
              alt="Ringkasan Pesanan"
              class="w-full h-[560px] object-cover rounded-2xl shadow-lg"
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

interface CartItem {
  keranjangItemId: number
  produkId: number
  ukuranId: number | null
  jumlah: number
  // Kita asumsikan harga_satuan membawa harga yang benar
  harga_satuan: number | string 
  subtotal: number | string // Nilai ini mungkin 0 dari API, sehingga perlu dihitung ulang
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

const API_CART_URL = 'https://backend-the-candils.vercel.app/api/cart'
const API_ORDER_URL = 'https://backend-the-candils.vercel.app/api/pesanan'

const form = reactive({
  fullName: '',
  address: '',
  contact: '',
})

const orderItems = ref<CartItem[]>([])
const isDirectCheckout = ref(false)
const router = useRouter()
const toast = useToast()

// Helper function untuk konversi nilai string/number ke number
const toNumber = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

// Helper function untuk menghitung subtotal item (fungsi yang benar)
const getItemSubtotal = (item: CartItem): number => {
  return toNumber(item.harga_satuan) * item.jumlah
}


// Computed property 'displayImageUrl' (tidak berubah)
const displayImageUrl = computed(() => {
  if (orderItems.value.length > 0) {
    const fotoUrl = orderItems.value[0].foto
    if (fotoUrl && fotoUrl.startsWith('http')) {
      return fotoUrl
    }
    return `https://backend-the-candils.vercel.app${fotoUrl || '/placeholder.svg'}`
  }
  return '/placeholder.svg'
})

// 'loadCheckoutData' (tidak berubah)
onMounted(() => {
  loadCheckoutData()
})
const getCartSessionId = (): string | null => {
  return localStorage.getItem('cartSessionId')
}
const loadCheckoutData = async () => {
  isLoading.value = true
  error.value = null
  const directDataRaw = sessionStorage.getItem('directCheckoutData')

  if (directDataRaw) {
    console.log('Memuat data dari Direct Checkout (sessionStorage)...')
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
    console.log('Memuat data dari Keranjang Utama (API)...')
    const cartSessionId = getCartSessionId()
    if (!cartSessionId) {
      error.value = 'Keranjang Anda kosong atau sesi tidak ditemukan.'
      isLoading.value = false
      router.push('/cart')
      return
    }
    try {
      const response = await fetch(`${API_CART_URL}/${cartSessionId}`)
      const result = await response.json()
      if (result.success && result.data && result.data.length > 0) {
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

// ✅ FIX KRITIS: Computed properties 'subtotal' dan 'total'
// Menggunakan item.jumlah * item.harga_satuan untuk perhitungan yang akurat
const subtotal = computed(() => orderItems.value.reduce((acc, item) => {
    return acc + getItemSubtotal(item)
}, 0))

const total = computed(() => subtotal.value)

// ✅ FIX KRITIS: Computed property untuk summary component
// Mengganti item.subtotal yang 0 dengan perhitungan yang benar
const summaryItems = computed(() => {
  return orderItems.value.map(item => ({
    ...item,
    // Timpa nilai item.subtotal yang 0 dengan perhitungan yang benar
    subtotal: getItemSubtotal(item) 
  }));
});


// --- Handler untuk file selected (diubah untuk menerima Event DOM) ---
const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;

  if (file) {
    selectedFile.value = file;
    filePreviewUrl.value = URL.createObjectURL(file);
    toast.success('File berhasil dipilih!');
  } else {
    selectedFile.value = null;
    filePreviewUrl.value = null;
    if (filePreviewUrl.value) {
        URL.revokeObjectURL(filePreviewUrl.value);
    }
    toast.info('Pilihan file dibatalkan.');
  }
};


// Handler untuk menghapus file
const handleFileRemoved = () => {
  // Dihandle oleh komponen CheckoutForm.vue sekarang, 
  // tetapi logika pembersihan state lokal tetap di sini.
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value)
  }
  selectedFile.value = null
  filePreviewUrl.value = null
  toast.info('Gambar telah dihapus')
}

// Handler untuk error file
const handleFileError = (message: string) => {
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

  // Tambahkan data 'items' sebagai JSON string
  // ✅ PENTING: Gunakan summaryItems untuk memastikan subtotal yang benar dikirim ke backend
  const itemsPayload = summaryItems.value.map((item) => ({
    produkId: item.produkId,
    ukuranId: item.ukuranId || null,
    quantity: item.jumlah, 
    subtotal: item.subtotal, // Menggunakan subtotal yang sudah dihitung ulang
  }))
  formData.append('items', JSON.stringify(itemsPayload))

  // Tambahkan file
  formData.append('buktiPembayaran', selectedFile.value)

  console.log('Mengirim Pesanan (FormData)...')

  // 3. Kirim FormData ke API 'createPesanan'
  try {
    const response = await fetch(API_ORDER_URL, {
      method: 'POST',
      body: formData,
      // JANGAN set 'Content-Type: application/json'
    })

    const result = await response.json()

    if (response.ok && result.pesananId) {
      toast.success('Pesanan Anda berhasil dibuat!')

      // Kosongkan keranjang (jika bukan direct checkout)
      if (!isDirectCheckout.value) {
        const cartSessionId = getCartSessionId()
        if (cartSessionId) {
          await fetch(`${API_CART_URL}/clear/${cartSessionId}`, { method: 'DELETE' })
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