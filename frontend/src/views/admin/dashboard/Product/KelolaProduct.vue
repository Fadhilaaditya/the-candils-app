<template>
  <div class="p-8">
    <!-- Product Table Section -->
    <ProductTable
      ref="productTableRef"
      @add-product="handleAddProduct"
      @edit-product="handleEditProduct"  
      @delete-product="handleDeleteProduct" 
    />

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

    <!-- Loading overlay -->
    <div
      v-if="isFetchingDetails"
      class="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50" 
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
import { ref } from 'vue'
import ProductTable from './_components/ProductTable.vue'
import AddProductModal from './_components/AddProductModal.vue'
import EditProductModal from './_components/EditProductModal.vue'
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue'
// Pastikan impor sudah benar
import { getProductById, type Produk as Product } from '@/services/productService' 

defineOptions({ name: 'AdminKelolaProduct' })

const productTableRef = ref<InstanceType<typeof ProductTable> | null>(null)
const isAddModalVisible = ref(false)
const isEditModalVisible = ref(false)
const isDeleteModalVisible = ref(false)
const productToEdit = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null) 
const isFetchingDetails = ref(false) 
const errorMessage = ref<string | null>(null); 

// --- Handler untuk membuka modal ---

const handleAddProduct = () => {
  isAddModalVisible.value = true
}

// --- PERBAIKAN DI PARAMETER FUNGSI ---
// Terima 'produkId' (number) dari event
const handleEditProduct = async (produkId: number) => { 
  if (!produkId) {
     console.error("ID Produk tidak valid.");
     errorMessage.value = "Gagal memuat detail: ID tidak valid.";
     return;
  }

  isFetchingDetails.value = true; 
  errorMessage.value = null; 

  try {
    // Gunakan 'produkId' yang diterima
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

// Terima 'produkId' (number) dari event
const handleDeleteProduct = async (produkId: number) => {
  if (!produkId) {
    console.error("ID Produk tidak valid.");
    errorMessage.value = "Gagal memuat detail: ID tidak valid.";
    return;
  }
  
  // Opsi 1: Tetap fetch detail untuk ditampilkan di modal konfirmasi
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

  // Opsi 2: (Lebih simpel jika modal konfirmasi tidak perlu detail)
  // productToDelete.value = { produkId: produkId }; // Cukup simpan ID
  // isDeleteModalVisible.value = true;
}
// --- AKHIR PERBAIKAN ---


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

  if (productTableRef.value) {
    productTableRef.value.refreshDataFromApi()
  }
}

// Expose refresh method
defineExpose({ refreshAll: () => productTableRef.value?.refreshDataFromApi() })
</script>

