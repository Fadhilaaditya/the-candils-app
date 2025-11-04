<template>
  <div class="bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-10 pb-16">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Formulir Pemesanan</h1>

      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <!-- Kolom Kiri: Form dan Ringkasan -->
          <div class="p-6 md:p-8">
            
            <div v-if="isLoading" class="text-center py-10">
              <p>Memuat keranjang...</p>
            </div>
            
            <div v-else-if="error" class="text-center py-10">
              <p class="text-red-500">{{ error }}</p>
              <router-link to="/cart" class="text-[#BAB772] hover:underline mt-4">Kembali ke Keranjang</router-link>
            </div>

            <!-- 
              [PERUBAHAN]: 
              - Menghapus v-model:payment-method (tidak lagi dipakai)
              - Menambahkan prop file-preview-url
              - Mengubah emit @submit-order menjadi @submit-order-and-upload
            -->
            <CheckoutFormComponent
              v-else
              v-model:full-name="form.fullName"
              v-model:address="form.address"
              v-model:contact="form.contact"
              :is-submitting="isSubmitting" 
              :file-preview-url="filePreviewUrl"
              @file-selected="handleFileSelected"
              @submit-order-and-upload="submitOrderAndUpload"
            >
              <template #summary>
                <OrderSummaryComponent
                  :items="orderItems"
                  :subtotal="subtotal"
                  :total="total"
                />
              </template>
            </CheckoutFormComponent>
            
          </div>

          <!-- Kolom Kanan: Gambar Produk (tidak berubah) -->
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

// [BARU] State untuk file upload
const selectedFile = ref<File | null>(null)
const filePreviewUrl = ref<string | null>(null)

const API_CART_URL = 'http://localhost:3000/api/cart'
const API_ORDER_URL = 'http://localhost:3000/api/pesanan' 

const form = reactive({
  fullName: '',
  address: '',
  contact: '',
})

const orderItems = ref<CartItem[]>([])
const isDirectCheckout = ref(false)
const router = useRouter()
const toast = useToast()

// computed property 'displayImageUrl' (tidak berubah)
const displayImageUrl = computed(() => {
  if (orderItems.value.length > 0) {
    const fotoUrl = orderItems.value[0].foto
    if (fotoUrl && fotoUrl.startsWith('http')) {
      return fotoUrl;
    }
    return `http://localhost:3000${fotoUrl || '/placeholder.svg'}`
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
  const directDataRaw = sessionStorage.getItem('directCheckoutData');
  
  if (directDataRaw) {
    console.log('Memuat data dari Direct Checkout (sessionStorage)...')
    try {
      const directData = JSON.parse(directDataRaw);
      if (directData && directData.items && directData.items.length > 0) {
        orderItems.value = directData.items;
        isDirectCheckout.value = true;
        sessionStorage.removeItem('directCheckoutData');
      } else { throw new Error("Data direct checkout tidak valid."); }
    } catch (err: any) {
      error.value = err.message;
      toast.error(err.message);
    } finally {
      isLoading.value = false
    }
  } else {
    console.log('Memuat data dari Keranjang Utama (API)...')
    const cartSessionId = getCartSessionId()
    if (!cartSessionId) {
      error.value = "Keranjang Anda kosong atau sesi tidak ditemukan."
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
        error.value = "Keranjang Anda kosong."
        toast.error("Tidak ada item di keranjang untuk di-checkout.")
        router.push('/cart')
      }
    } catch (err) {
      console.error("Gagal memuat data checkout:", err)
      error.value = "Gagal memuat data keranjang."
      toast.error("Gagal memuat data keranjang.")
    } finally {
      isLoading.value = false
    }
  }
}

// Computed properties 'subtotal' dan 'total' (Tidak Berubah)
const subtotal = computed(() => orderItems.value.reduce((acc, it) => acc + Number(it.subtotal), 0))
const total = computed(() => subtotal.value) 

// --- [BARU] Fungsi untuk menangani file dan membuat preview ---
const handleFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    selectedFile.value = file;
    // Buat URL sementara untuk preview gambar
    filePreviewUrl.value = URL.createObjectURL(file);
  } else {
    selectedFile.value = null;
    filePreviewUrl.value = null;
  }
}

// --- [PERUBAHAN BESAR]: Fungsi 'submitOrderAndUpload' ---
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

  isSubmitting.value = true;

  // 2. Siapkan FormData
  const formData = new FormData();
  
  // Tambahkan data teks
  formData.append('lokasiId', '1'); // Asumsi '1' untuk "Online/Pengiriman"
  formData.append('namaPelanggan', form.fullName);
  formData.append('alamatPengiriman', form.address);
  formData.append('kontakPelanggan', form.contact);
  
  // Tambahkan data 'items' sebagai JSON string
  const itemsPayload = orderItems.value.map(item => ({
    produkId: item.produkId,
    ukuranId: item.ukuranId || null,
    quantity: item.jumlah,
    subtotal: Number(item.subtotal)
  }));
  formData.append('items', JSON.stringify(itemsPayload));

  // Tambahkan file
  formData.append('buktiPembayaran', selectedFile.value);

  console.log('Mengirim Pesanan (FormData)...');

  // 3. Kirim FormData ke API 'createPesanan'
  try {
    const response = await fetch(API_ORDER_URL, {
      method: 'POST',
      body: formData,
      // JANGAN set 'Content-Type: application/json', 
      // biarkan browser mengaturnya sebagai 'multipart/form-data'
    });

    const result = await response.json();

    if (response.ok && result.pesananId) {
      toast.success('Pesanan Anda berhasil dibuat!');
      
      // Kosongkan keranjang (jika bukan direct checkout)
      if (!isDirectCheckout.value) {
        const cartSessionId = getCartSessionId();
        if (cartSessionId) {
          await fetch(`${API_CART_URL}/clear/${cartSessionId}`, { method: 'DELETE' });
          window.dispatchEvent(new Event('cartUpdated')); 
        }
      }
      
      router.push('/products'); 

    } else {
      toast.error(`Gagal membuat pesanan: ${result.message || 'Error tidak diketahui'}`);
    }
  } catch (err) {
    console.error('Error submitting order:', err);
    toast.error('Gagal terhubung ke server.');
  } finally {
    isSubmitting.value = false;
    // Hapus preview URL
    if (filePreviewUrl.value) {
      URL.revokeObjectURL(filePreviewUrl.value);
    }
  }
}
</script>

