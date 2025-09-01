<template>
  <div
    v-if="isVisible"
    class="fixed inset-0 z-50 flex items-center justify-center"
    style="background-color: rgba(0, 0, 0, 0.7)"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 p-6" @click.stop>
      <!-- Modal Header -->
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Edit Laporan</h2>
        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Row 1: Product Name and Quantity -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="productName" class="block text-sm font-medium text-gray-700 mb-2">
              NAMA PRODUK
            </label>
            <select
              id="productName"
              v-model="formData.productName"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
            >
              <option value="">Pilih produk</option>
              <option v-for="product in uniqueProductNames" :key="product" :value="product">
                {{ product }}
              </option>
            </select>
          </div>
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
              KUANTITAS
            </label>
            <input
              id="quantity"
              v-model="formData.quantity"
              type="number"
              min="1"
              required
              placeholder="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <!-- Row 2: Location and Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
              LOKASI
            </label>
            <select
              id="location"
              v-model="formData.location"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
            >
              <option value="">Pilih lokasi</option>
              <option value="Ciputat">Ciputat</option>
              <option value="Pamulang">Pamulang</option>
              <option value="Bukit Indah">Bukit Indah</option>
            </select>
          </div>
          <div>
            <label for="date" class="block text-sm font-medium text-gray-700 mb-2"> DATE </label>
            <input
              id="date"
              v-model="formData.date"
              type="date"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        <!-- Row 3: Price and Total Price -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-2"> HARGA </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >Rp</span
              >
              <input
                id="price"
                v-model="formData.price"
                type="number"
                min="0"
                step="1000"
                required
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#BAB772] focus:border-transparent transition-colors"
              />
            </div>
            <p v-if="selectedProductPrice" class="text-sm text-gray-500 mt-1">
              Harga dari data: {{ formatCurrency(selectedProductPrice) }}
            </p>
          </div>
          <div>
            <label for="totalPrice" class="block text-sm font-medium text-gray-700 mb-2">
              TOTAL HARGA
            </label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >Rp</span
              >
              <input
                id="totalPrice"
                :value="totalPrice"
                type="text"
                disabled
                placeholder="0"
                class="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4 pt-4">
          <button
            type="button"
            @click="handleClose"
            class="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200"
          >
            BATALKAN
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-[#BAB772] text-white rounded-lg font-medium hover:bg-[#a8a668] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {{ isSubmitting ? 'Menyimpan...' : 'UPDATE' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

interface SalesData {
  id: number
  productName: string
  quantity: number
  price: number
  location: string
  date: string
}

interface FormData {
  productName: string
  quantity: number
  location: string
  date: string
  price: number
}

interface Props {
  isVisible: boolean
  saleData: SalesData | null
  existingSalesData?: SalesData[]
}

const props = withDefaults(defineProps<Props>(), {
  existingSalesData: () => [],
})

const emit = defineEmits<{
  close: []
  submit: [data: FormData & { id: number }]
}>()

// Form data
const formData = reactive<FormData>({
  productName: '',
  quantity: 1,
  location: '',
  date: '',
  price: 0,
})

// Form state
const isSubmitting = ref(false)

// Get unique product names from existing sales data
const uniqueProductNames = computed(() => {
  if (!props.existingSalesData || props.existingSalesData.length === 0) {
    return []
  }

  const productNames = props.existingSalesData.map((sale) => sale.productName)
  return [...new Set(productNames)].sort()
})

// Get the price of the selected product
const selectedProductPrice = computed(() => {
  if (!formData.productName || !props.existingSalesData || props.existingSalesData.length === 0) {
    return null
  }

  // Find the most recent price for the selected product
  const productSales = props.existingSalesData
    .filter((sale) => sale.productName === formData.productName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return productSales.length > 0 ? productSales[0].price : null
})

// Calculate total price
const totalPrice = computed(() => {
  return formData.quantity * formData.price
})

// Auto-fill price when product is selected
watch(
  () => formData.productName,
  (newProductName) => {
    if (newProductName && selectedProductPrice.value) {
      formData.price = selectedProductPrice.value
    }
  },
)

// Populate form when saleData changes
watch(
  () => props.saleData,
  (newSaleData) => {
    if (newSaleData) {
      formData.productName = newSaleData.productName
      formData.quantity = newSaleData.quantity
      formData.location = newSaleData.location
      formData.date = newSaleData.date
      formData.price = newSaleData.price
    }
  },
  { immediate: true },
)

// Methods
const handleClose = () => {
  resetForm()
  emit('close')
}

const handleBackdropClick = () => {
  handleClose()
}

const handleSubmit = async () => {
  if (
    !props.saleData ||
    !formData.productName ||
    !formData.location ||
    !formData.date ||
    formData.price <= 0
  ) {
    alert('Mohon lengkapi semua field yang diperlukan')
    return
  }

  isSubmitting.value = true

  try {
    // Emit the form data with ID to parent component
    emit('submit', {
      id: props.saleData.id,
      ...formData,
    })

    // Reset form and close modal
    resetForm()
    emit('close')
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('Terjadi kesalahan. Silakan coba lagi.')
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.productName = ''
  formData.quantity = 1
  formData.location = ''
  formData.date = ''
  formData.price = 0
}

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Expose methods for parent component
defineExpose({
  resetForm,
  setFormData: (data: Partial<FormData>) => {
    Object.assign(formData, data)
  },
})
</script>
