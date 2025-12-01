<template>
  <div class="w-full">
    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
      {{ product.namaProduk }}
    </h1>

    <p class="text-lg text-gray-600 mb-6 leading-relaxed">
      {{ product.deskripsi || 'Tidak ada deskripsi.' }}
    </p>

    <div class="mb-6">
      <span class="text-3xl font-bold text-orange-600">
        {{ formatCurrency(currentFinalPrice) }}
      </span>
      <span v-if="selectedUkuran" class="ml-2 text-sm text-gray-500">
        ({{ selectedUkuran.namaUkuran }})
      </span>
    </div>

    <div class="mb-6" v-if="product.ukurans && product.ukurans.length > 0">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Pilih Ukuran</h3>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="ukuran in product.ukurans"
          :key="ukuran.ukuranId"
          @click="selectUkuran(ukuran)"
          :class="[
            'px-6 py-3 border-2 rounded-lg font-medium transition-all duration-200',
            selectedUkuran?.ukuranId === ukuran.ukuranId
              ? 'border-[#BAB772] bg-[#FAFAD2] text-[#8f8c4b]'
              : 'border-gray-300 text-gray-700 hover:border-gray-400',
          ]"
        >
          {{ ukuran.namaUkuran }}
          <span v-if="ukuran.hargaTambahan > 0" class="text-xs ml-1">
            (+{{ formatCurrency(ukuran.hargaTambahan) }})
          </span>
        </button>
      </div>
    </div>
    <div v-else class="mb-6 text-sm text-gray-500">Produk ini tidak memiliki varian ukuran.</div>

    <div class="mb-8">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Jumlah</h3>
      <div class="flex items-center space-x-3">
        <button
          @click="decreaseQuantity"
          :disabled="quantity <= 1"
          class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>

        <input
          v-model.number="quantity"
          type="number"
          min="1"
          :max="product.stok"
          @input="validateQuantity"
          class="w-16 h-10 text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent"
        />

        <button
          @click="increaseQuantity"
          :disabled="quantity >= product.stok"
          class="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
      </div>
      <p class="text-sm text-gray-500 mt-2">Tersedia {{ product.stok }} stok</p>
    </div>

    <div class="flex flex-col sm:flex-row gap-3">
      <button
        @click="handleAddToCart"
        :disabled="!isCheckoutEnabled"
        class="flex-1 bg-white border-2 border-[#BAB772] text-[#BAB772] hover:bg-[#FAFAD2] disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
      >
        {{
          isCheckoutEnabled
            ? '🛒 Tambah ke Keranjang'
            : product.stok <= 0
              ? 'Stok Habis'
              : 'Pilih Ukuran'
        }}
      </button>

      <button
        @click="handleDirectCheckout"
        :disabled="!isCheckoutEnabled"
        class="flex-1 bg-[#BAB772] hover:bg-[#a8a668] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
      >
        {{
          isCheckoutEnabled
            ? '⚡ Checkout Sekarang'
            : product.stok <= 0
              ? 'Stok Habis'
              : 'Pilih Ukuran'
        }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import type { Produk, Ukuran } from '@/services/productService'

interface Props {
  product: Produk
}
const props = defineProps<Props>()
const router = useRouter()
const toast = useToast()

const selectedUkuran = ref<Ukuran | null>(null)
const quantity = ref<number>(1)

// API Base URL
// API Base URL
const API_BASE_URL = import.meta.env.PROD
  ? 'https://backend-the-candils.vercel.app/api/cart'
  : 'http://localhost:3000/api/cart'

// Computed: Harga final (Tidak Berubah)
const currentFinalPrice = computed(() => {
  const basePrice = parseFloat(props.product.hargaUnit as any) || 0
  const additionalPrice = parseFloat(selectedUkuran.value?.hargaTambahan as any) || 0
  const pricePerItem = basePrice + additionalPrice
  return pricePerItem * quantity.value
})

// Computed: Cek tombol enabled (Tidak Berubah)
const isCheckoutEnabled = computed(() => {
  return (
    props.product.stok > 0 &&
    (!props.product.ukurans || props.product.ukurans.length === 0 || selectedUkuran.value !== null)
  )
})

// Get Cart Session ID (Tidak Berubah)
const getCartSessionId = (): string => {
  let cartSessionId = localStorage.getItem('cartSessionId')

  if (!cartSessionId) {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    cartSessionId = `session_${timestamp}_${random}`
    localStorage.setItem('cartSessionId', cartSessionId)
  }

  return cartSessionId
}

// Select Ukuran (Tidak Berubah)
const selectUkuran = (ukuran: Ukuran) => {
  selectedUkuran.value = ukuran
}

// Increase Quantity (Tidak Berubah)
const increaseQuantity = () => {
  if (quantity.value < props.product.stok) {
    quantity.value++
  }
}

// Decrease Quantity (Tidak Berubah)
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Validate Quantity (Tidak Berubah)
const validateQuantity = () => {
  if (quantity.value > props.product.stok) {
    quantity.value = props.product.stok
  }
  if (quantity.value < 1) {
    quantity.value = 1
  }
}

// Format Currency (Tidak Berubah)
const formatCurrency = (value: number | undefined | null): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return 'Rp -'
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

// Add to Cart (Tidak Berubah)
const handleAddToCart = async () => {
  if (!isCheckoutEnabled.value) {
    if (props.product.stok <= 0) {
      toast.error('Maaf, stok produk ini habis.')
    } else if (props.product.ukurans && props.product.ukurans.length > 0 && !selectedUkuran.value) {
      toast.warning('Silakan pilih varian ukuran terlebih dahulu.')
    }
    return
  }

  const cartSessionId = getCartSessionId()
  const apiData = {
    cartSessionId: cartSessionId,
    produkId: props.product.produkId,
    ukuranId: selectedUkuran.value?.ukuranId || null,
    jumlah: quantity.value,
  }

  console.log('🛒 Add to Cart (Sending to API):', apiData)

  try {
    const response = await fetch(`${API_BASE_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(apiData),
    })

    const result = await response.json()

    if (result.success) {
      toast.success(
        `Berhasil menambahkan ${apiData.jumlah}x ${props.product.namaProduk} ke keranjang!`,
      )
      window.dispatchEvent(new Event('cartUpdated'))

      // Reset setelah add to cart
      quantity.value = 1
      if (props.product.ukurans && props.product.ukurans.length > 1) {
        selectedUkuran.value = null
      }
    } else {
      toast.error(`Gagal menambahkan: ${result.message || 'Error tidak diketahui'}`)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    toast.error('Terjadi kesalahan. Tidak dapat terhubung ke server.')
  }
}

// --- [INI YANG DIUBAH] ---
// Direct Checkout (Simpan ke sessionStorage + redirect)
const handleDirectCheckout = () => {
  // 1. Cek apakah tombol enabled
  if (!isCheckoutEnabled.value) {
    if (props.product.stok <= 0) {
      toast.error('Maaf, stok produk ini habis.')
    } else if (props.product.ukurans && props.product.ukurans.length > 0 && !selectedUkuran.value) {
      toast.warning('Silakan pilih varian ukuran terlebih dahulu.')
    }
    return
  }

  // 2. Siapkan data item yang dipilih
  const basePrice = parseFloat(props.product.hargaUnit as any) || 0
  const additionalPrice = parseFloat(selectedUkuran.value?.hargaTambahan as any) || 0
  const pricePerItem = basePrice + additionalPrice
  const subtotal = currentFinalPrice.value // (pricePerItem * quantity)

  const checkoutData = {
    // Data ini akan dibaca oleh Checkout.vue
    // Ini adalah array yang HANYA berisi item ini
    items: [
      {
        keranjangItemId: 0, // ID dummy
        produkId: props.product.produkId,
        ukuranId: selectedUkuran.value?.ukuranId || null,
        jumlah: quantity.value,
        harga_satuan: pricePerItem,
        subtotal: subtotal,
        namaProduk: props.product.namaProduk,
        namaUkuran: selectedUkuran.value?.namaUkuran || null,
        foto: props.product.foto,
        deskripsi: props.product.deskripsi,
        cartSessionId: '', // Dummy
      },
    ],
    // Tandai sebagai 'direct checkout'
    isDirectCheckout: true,
  }

  // 3. Simpan ke sessionStorage
  sessionStorage.setItem('directCheckoutData', JSON.stringify(checkoutData))

  // 4. Langsung pindah ke halaman checkout
  console.log('⚡ Menyimpan data direct checkout dan navigasi...', checkoutData)
  router.push('/checkout')
}
// --- [AKHIR PERUBAHAN] ---

// Watch product changes (Tidak Berubah)
watch(
  () => props.product,
  (newProduct) => {
    if (newProduct && newProduct.ukurans && newProduct.ukurans.length > 0) {
      if (newProduct.ukurans.length === 1) {
        selectedUkuran.value = newProduct.ukurans[0]
      } else {
        selectedUkuran.value = null
      }
    } else {
      selectedUkuran.value = null
    }
    quantity.value = 1
  },
  { immediate: true },
)
</script>
