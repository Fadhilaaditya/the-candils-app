<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <!-- Header Section -->
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Kelola Produk</h2>
        <p class="text-gray-600 mt-1">Data produk dan inventori</p>
      </div>
      <button
        @click="handleAddProduct"
        class="mt-4 lg:mt-0 bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-200 flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          ></path>
        </svg>
        Tambah Produk
      </button>
    </div>

    <!-- Product Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-200">
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ID</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">JENIS PRODUK</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">DESKRIPSI</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">GAMBAR</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">CREATED AT</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">UPDATE AT</th>
            <th class="px-4 py-3 text-left text-sm font-medium text-gray-700">ACTION</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products"
            :key="product.id"
            class="border-b border-gray-100 hover:bg-gray-50"
          >
            <td class="px-4 py-3 text-sm text-gray-900">{{ product.id }}</td>
            <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ product.productType }}</td>
            <td class="px-4 py-3 text-sm text-gray-700 max-w-xs" :title="product.description">
              {{ truncateText(product.description, 50) }}
            </td>
            <td class="px-4 py-3">
              <img
                :src="product.image"
                :alt="product.productType"
                class="w-16 h-16 object-cover rounded-lg border border-gray-200"
              />
            </td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatDateTime(product.createdAt) }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatDateTime(product.updatedAt) }}</td>
            <td class="px-4 py-3">
              <button @click="handleEdit(product)" class="text-blue-600 hover:text-blue-800 mr-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  ></path>
                </svg>
              </button>
              <button @click="handleDelete(product)" class="text-red-600 hover:text-red-800">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-if="!hasProducts" class="text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada produk</h3>
      <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan produk pertama.</p>
    </div>

    <!-- Product Count -->
    <div v-if="hasProducts" class="mt-4 text-sm text-gray-500 text-center">
      Total: {{ totalProducts }} produk
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

interface Product {
  id: number
  productType: string
  description: string
  image: string
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  initialData?: Product[]
}>()

const emit = defineEmits<{
  addProduct: []
  editProduct: [product: Product]
  deleteProduct: [product: Product]
}>()

// Reactive data
const products = ref<Product[]>([])

// Computed properties
const hasProducts = computed(() => products.value.length > 0)
const totalProducts = computed(() => products.value.length)

// Methods
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString)
  return (
    date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) +
    ', ' +
    date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  )
}

const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const handleAddProduct = () => {
  console.log('ProductTable: Add product button clicked')
  emit('addProduct')
}

const handleEdit = (product: Product) => {
  console.log('ProductTable: Edit product clicked:', product)
  emit('editProduct', product)
}

const handleDelete = (product: Product) => {
  console.log('ProductTable: Delete product clicked:', product)
  emit('deleteProduct', product)
}

// Watch for initialData changes from parent
watch(
  () => props.initialData,
  (newData, oldData) => {
    console.log('ProductTable: Watcher triggered')
    console.log('ProductTable: Old data:', oldData)
    console.log('ProductTable: New data:', newData)
    console.log('ProductTable: New data length:', newData?.length || 0)

    if (newData && newData.length > 0) {
      products.value = [...newData]
      console.log('ProductTable: Products array updated:', products.value)
      console.log('ProductTable: Products array length:', products.value.length)
      console.log('ProductTable: First product:', products.value[0])
    } else {
      console.log('ProductTable: No data received or empty array')
      products.value = []
    }
  },
  { immediate: true, deep: true },
)

// Initialize with props or default data
onMounted(() => {
  // The watcher above will handle the initial data
  // No need to duplicate the logic here
  console.log('ProductTable: Component mounted')
})

// Expose methods for parent component
defineExpose({
  updateProducts: (data: Product[]) => {
    console.log('ProductTable: updateProducts called with:', data)
    products.value = [...data]
    console.log('ProductTable: Products array updated via updateProducts:', products.value)
  },
  getProducts: () => products.value,
  getTotalProducts: () => totalProducts.value,
  refreshData: () => {
    console.log('ProductTable: refreshData called')
    if (props.initialData) {
      products.value = [...props.initialData]
      console.log('ProductTable: Data refreshed from props:', products.value)
    } else {
      console.log('ProductTable: No initialData to refresh from')
    }
  },
  forceUpdate: () => {
    console.log('ProductTable: forceUpdate called')
    // Force a reactive update
    products.value = [...products.value]
    console.log('ProductTable: Force update completed')
  },
})
</script>
