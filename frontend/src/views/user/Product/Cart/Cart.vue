<template>
  <ConfirmModal
    ref="confirmModalRef"
    title="Hapus Produk?"
    message="Anda yakin ingin menghapus produk ini dari keranjang?"
    confirm-button-text="Ya, Hapus"
    cancel-button-text="Batal"
  />

  <div class="min-h-screen bg-gray-50">
    <div class="bg-white border-b">
      <div class="max-w-7xl mx-auto px-8 py-6">
        <h1 class="text-3xl font-bold text-gray-800">Keranjang Belanja</h1>
        <p class="text-gray-600 mt-2">Kelola produk yang ingin Anda beli</p>
      </div>
    </div>

    <div v-if="loading" class="max-w-7xl mx-auto px-8 py-8">
      <div class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="text-4xl mb-4">⏳</div>
        <p class="text-gray-600">Memuat keranjang...</p>
      </div>
    </div>

    <div v-else class="max-w-7xl mx-auto px-8 py-8">
      <div v-if="cartItems.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">Keranjang Kosong</h2>
        <p class="text-gray-600 mb-6">Belum ada produk di keranjang Anda</p>
        <router-link
          to="/products"
          class="inline-block bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-300 no-underline"
        >
          Mulai Belanja
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <CartListComponent
          class="lg:col-span-2"
          :items="cartItems"
          @remove-item="removeItem"
          @decrease-qty="decreaseQuantity"
          @increase-qty="increaseQuantity"
        />

        <CartSummaryComponent
          class="lg:col-span-1"
          :total-items="totalItems"
          :total-price="totalPrice"
          @checkout="handleCheckout"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CartListComponent from './_components/CartListComponent.vue'
import CartSummaryComponent from './_components/CartSummaryComponent.vue'

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import ConfirmModal from '@/components/ConfirmModal.vue'

interface CartItem {
  keranjangItemId: number
  cartSessionId: string
  produkId: number
  namaProduk: string
  deskripsi: string
  foto: string
  ukuranId?: number
  namaUkuran?: string
  jumlah: number
  harga_satuan: number | string
  subtotal: number | string
  stok: number // Tambahkan properti stok
}

const router = useRouter()
const toast = useToast()

const confirmModalRef = ref<InstanceType<typeof ConfirmModal> | null>(null)
const cartItems = ref<CartItem[]>([])
const loading = ref(true)

const API_BASE_URL = import.meta.env.PROD
  ? 'https://backend-the-candils.vercel.app/api'
  : 'http://localhost:3000/api'

// Get cart session ID
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

// Load cart
const loadCart = async (showLoading = true) => {
  try {
    if (showLoading) {
      loading.value = true
    }
    const cartSessionId = getCartSessionId()
    const response = await fetch(`${API_BASE_URL}/cart/${cartSessionId}`)
    const result = await response.json()
    if (result.success) {
      cartItems.value = result.data || []
    }
  } catch (error) {
    console.error('Error loading cart:', error)
    if (showLoading) toast.error('Gagal memuat keranjang')
  } finally {
    if (showLoading) {
      loading.value = false
    }
  }
}

// Increase quantity
const increaseQuantity = async (item: CartItem) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/update/${item.keranjangItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah: item.jumlah + 1 }),
    })
    const result = await response.json()
    if (result.success) {
      await loadCart(false)
      window.dispatchEvent(new Event('cartUpdated'))
    } else {
      toast.error(result.message || 'Gagal mengupdate jumlah')
    }
  } catch (error) {
    console.error('Error increasing quantity:', error)
    toast.error('Gagal mengupdate jumlah')
  }
}

// Decrease quantity
const decreaseQuantity = async (item: CartItem) => {
  if (item.jumlah <= 1) return
  try {
    const response = await fetch(`${API_BASE_URL}/cart/update/${item.keranjangItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jumlah: item.jumlah - 1 }),
    })
    const result = await response.json()
    if (result.success) {
      await loadCart(false)
      window.dispatchEvent(new Event('cartUpdated'))
    } else {
      toast.error(result.message || 'Gagal mengupdate jumlah')
    }
  } catch (error) {
    console.error('Error decreasing quantity:', error)
    toast.error('Gagal mengupdate jumlah')
  }
}

// Remove item
const removeItem = async (keranjangItemId: number) => {
  const confirmed = await confirmModalRef.value?.open()
  if (!confirmed) return

  try {
    const response = await fetch(`${API_BASE_URL}/cart/remove/${keranjangItemId}`, {
      method: 'DELETE',
    })
    const result = await response.json()
    if (result.success) {
      await loadCart(true)
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success('Produk berhasil dihapus')
    } else {
      toast.error(result.message || 'Gagal menghapus produk')
    }
  } catch (error) {
    console.error('Error removing item:', error)
    toast.error('Gagal menghapus produk')
  }
}

// Helper functions
const toNumber = (value: number | string): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return isNaN(num) ? 0 : num
}

const getItemSubtotal = (item: CartItem): number => {
  return toNumber(item.harga_satuan) * item.jumlah
}

// Computed properties
const totalItems = computed(() => {
  return cartItems.value.length
})

const totalPrice = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    return sum + getItemSubtotal(item)
  }, 0)
})

// ⭐️ CHECKOUT - REDIRECT KE HALAMAN CHECKOUT FORM
const handleCheckout = () => {
  // Validasi keranjang tidak kosong
  if (cartItems.value.length === 0) {
    toast.warning('Keranjang masih kosong!')
    return
  }

  // Redirect ke halaman checkout form
  // Data keranjang akan diload otomatis dari API di halaman checkout
  router.push('/checkout')
}

// Lifecycle hooks
onMounted(() => {
  console.log('=== CART DEBUG START ===')
  console.log('Cart Session ID:', getCartSessionId())
  loadCart()
  window.addEventListener('cartUpdated', loadCartOnEvent)
})

const loadCartOnEvent = () => loadCart(false)

onUnmounted(() => {
  window.removeEventListener('cartUpdated', loadCartOnEvent)
})
</script>

<style scoped>
.no-underline {
  text-decoration: none;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>