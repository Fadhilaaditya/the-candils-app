<template>
  <div class="p-8">
    
    <!-- Skeleton/Product Table Conditional Rendering -->
    <!-- Jika Loading, tampilkan skeleton -->
    <div v-if="isLoading" class="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
        <!-- Header Section (Dikecualikan dari Skeleton) -->
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-800">Kelola Produk & Varian</h2>
            <p class="text-gray-600 mt-1">Setiap baris mewakili satu varian produk</p>
          </div>
          <!-- Button Add Product (Static) -->
          <button
            @click="handleAddProduct"
            class="mt-4 lg:mt-0 bg-[#BAB772] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#a8a668] transition-colors duration-200 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Tambah Produk
          </button>
        </div>
        
        <!-- Panggil Skeleton Komponen -->
        <table class="w-full">
          <thead>
            <tr class="bg-gray-50 border-b border-gray-200">
              <!-- Header Kolom Skeleton -->
              <th v-for="i in 9" :key="i" class="px-4 py-3 text-left text-sm font-medium text-gray-700">
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
              </th>
            </tr>
          </thead>
          <!-- Komponen Skeleton dipanggil di sini -->
          <ProductTableSkeleton />
        </table>
    </div>

    <!-- Jika Tidak Loading, tampilkan tabel data -->
    <ProductTable
      v-else
      ref="productTableRef"
      :product-variants="productVariants"
      :is-loading="isLoading"
      :error-message="errorMessage"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      @add-product="handleAddProduct"
      @edit-product="handleEditProduct"  
      @delete-product="handleDeleteProduct" 
      @refresh-data-from-api="refreshDataFromApi"
      @change-page="changePage"
      @toggle-status="handleToggleStatus"
    />

    <!-- Modal dan Overlay Lainnya -->
    
    <!-- Add Product Modal -->
    <AddProductModal
      :is-visible="isAddModalVisible"
      @close="handleAddModalClose"
      @product-added="handleRefreshAndClose"
    />

    <!-- Edit Product Modal -->
    <EditProductModal
      :is-visible="isEditModalVisible"
      :product-data="productToEdit" 
      @close="handleEditModalClose"
      @product-updated="handleRefreshAndClose"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :is-visible="isDeleteModalVisible"
      :product-data="productToDelete" 
      @close="handleDeleteModalClose"
      @product-deleted="handleRefreshAndClose"
    />

    <!-- Loading overlay (tetap untuk fetch detail) -->
    <div
      v-if="isFetchingDetails"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-transparent" 
    >
      <svg class="h-10 w-10 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
     <!-- Error Message Display -->
    <div v-if="errorMessage" class="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-[70]" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline"> {{ errorMessage }}</span>
      <span class="absolute top-0 bottom-0 right-0 px-4 py-3" @click="errorMessage = null">
        <svg class="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.03a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductTable from './_components/ProductTable.vue'
import ProductTableSkeleton from './_components/ProductTableSkeleton.vue' // 👈 Import komponen skeleton
import AddProductModal from './_components/AddProductModal.vue'
import EditProductModal from './_components/EditProductModal.vue'
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue'
import { getProductById, getProducts, updateProductStatus, type Produk as Product, type ProductVariantRow } from '@/services/productService' 

defineOptions({ name: 'AdminKelolaProduct' })

const productTableRef = ref<InstanceType<typeof ProductTable> | null>(null)

// --- State Data dan Loading Utama ---
const productVariants = ref<ProductVariantRow[]>([]) // State data tabel
const isLoading = ref(true) // State loading utama
const errorMessage = ref<string | null>(null); // State error utama

// --- State Pagination ---
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const totalPages = ref(1);

// --- State Modal ---
const isAddModalVisible = ref(false)
const isEditModalVisible = ref(false)
const isDeleteModalVisible = ref(false)
const productToEdit = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null) 
const isFetchingDetails = ref(false) 

// --- Logic Data Fetching ---

const refreshDataFromApi = async (page = currentPage.value) => {
  isLoading.value = true // Mulai loading
  errorMessage.value = null
  try {
    // Update current page
    currentPage.value = page;
    
    const response = await getProducts(page, itemsPerPage.value, true)
    productVariants.value = [...response.data.data] // Akses .data dari axios, lalu .data dari backend response
    
    // Update metadata pagination
    if (response.data.meta) {
      totalItems.value = response.data.meta.totalItems;
      totalPages.value = response.data.meta.totalPages;
    }
  } catch (error) {
    console.error('Error loading product variants:', error)
    errorMessage.value = 'Gagal memuat data varian produk. Coba lagi nanti.'
  } finally {
    isLoading.value = false // Selesai loading
  }
}

const changePage = (newPage: number) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    refreshDataFromApi(newPage);
  }
}


// --- Handler Modal ---

const handleAddProduct = () => {
  isAddModalVisible.value = true
}

const handleEditProduct = async (produkId: number) => { 
  if (!produkId) {
     console.error("ID Produk tidak valid.");
     errorMessage.value = "Gagal memuat detail: ID tidak valid.";
     return;
  }

  isFetchingDetails.value = true; 
  errorMessage.value = null; 

  try {
    const response = await getProductById(produkId); 
    productToEdit.value = response.data; 
    isEditModalVisible.value = true;
  } catch (error) {
    console.error(`Gagal mengambil detail produk ${produkId}:`, error);
    errorMessage.value = "Gagal memuat detail produk untuk diedit.";
  } finally {
    isFetchingDetails.value = false;
  }
}

const handleDeleteProduct = async (produkId: number) => {
  if (!produkId) {
    console.error("ID Produk tidak valid.");
    errorMessage.value = "Gagal memuat detail: ID tidak valid.";
    return;
  }
  
  isFetchingDetails.value = true; 
  errorMessage.value = null; 
  try {
      const response = await getProductById(produkId);
      productToDelete.value = response.data; // Simpan data lengkap
      isDeleteModalVisible.value = true; // Buka modal
  } catch (error) {
      console.error(`Gagal mengambil detail produk ${produkId} untuk dihapus:`, error);
      errorMessage.value = "Gagal memuat detail produk untuk dihapus.";
  } finally {
      isFetchingDetails.value = false;
  }
}

const handleToggleStatus = async (produkId: number, isActive: boolean) => {
  try {
    isLoading.value = true;
    await updateProductStatus(produkId, isActive);
    await refreshDataFromApi(currentPage.value); // Refresh data untuk update UI
  } catch (error) {
    console.error(`Gagal mengubah status produk ${produkId}:`, error);
    errorMessage.value = "Gagal mengubah status produk.";
    isLoading.value = false;
  }
}


// --- Handler untuk menutup modal ---
const handleAddModalClose = () => isAddModalVisible.value = false
const handleEditModalClose = () => {
  isEditModalVisible.value = false
  productToEdit.value = null 
}
const handleDeleteModalClose = () => {
  isDeleteModalVisible.value = false
  productToDelete.value = null 
}

// --- Handler untuk event SUKSES dari modal ---
const handleRefreshAndClose = () => {
  isAddModalVisible.value = false
  isEditModalVisible.value = false
  isDeleteModalVisible.value = false
  productToEdit.value = null
  productToDelete.value = null

  // Panggil refresh data dari sini
  refreshDataFromApi()
}

onMounted(() => {
    refreshDataFromApi();
})

// Expose refresh method
defineExpose({ refreshAll: refreshDataFromApi })
</script>
