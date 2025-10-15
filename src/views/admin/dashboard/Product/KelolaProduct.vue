<template>
  <div class="p-8">


    <!-- Product Table Section -->
    <ProductTable
      ref="productTableRef"
      :initial-data="products"
      @add-product="handleAddProduct"
      @edit-product="handleEditProduct"
      @delete-product="handleDeleteProduct"
    />

    <!-- Add Product Modal -->
    <AddProductModal
      :is-visible="isAddModalVisible"
      @close="handleAddModalClose"
      @submit="handleAddModalSubmit"
    />

    <!-- Edit Product Modal -->
    <EditProductModal
      :is-visible="isEditModalVisible"
      :product-data="productToEdit"
      @close="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :is-visible="isDeleteModalVisible"
      :product-data="productToDelete"
      @close="handleDeleteModalClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ProductTable from './_components/ProductTable.vue'
import AddProductModal from './_components/AddProductModal.vue'
import EditProductModal from './_components/EditProductModal.vue'
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue'
import { ProductDataService, type Product, type ProductFormData } from './data/productData'

// Component name for linter
defineOptions({
  name: 'AdminKelolaProduct',
})

// Component refs
const productTableRef = ref<InstanceType<typeof ProductTable> | null>(null)

// Modal states
const isAddModalVisible = ref(false)
const isEditModalVisible = ref(false)
const isDeleteModalVisible = ref(false)
const productToEdit = ref<Product | null>(null)
const productToDelete = ref<Product | null>(null)

// Reactive data
const products = ref<Product[]>([])

// Load initial data
const loadProducts = async () => {
  try {
    console.log('Loading products from service...')
    const productsResult = await ProductDataService.fetchProducts()
    console.log('Products loaded from service:', productsResult)

    // Force a new array reference to ensure reactivity
    products.value = [...productsResult]
    console.log('Local products array updated:', products.value)
    console.log('Products array length:', products.value.length)
  } catch (error) {
    console.error('Error loading products:', error)
  }
}

// Debug method to check data state
const debugDataState = () => {
  console.log('=== DEBUG DATA STATE ===')
  console.log('Local products array:', products.value)
  console.log('Local products length:', products.value.length)
  console.log('ProductTable ref exists:', !!productTableRef.value)
  if (productTableRef.value) {
    console.log('Table products:', productTableRef.value.getProducts())
    console.log('Table total products:', productTableRef.value.getTotalProducts())
  }
  console.log('========================')
}

// Event handlers
const handleAddProduct = () => {
  isAddModalVisible.value = true
}

const handleAddModalClose = () => {
  isAddModalVisible.value = false
}

const handleAddModalSubmit = async (formData: ProductFormData) => {
  try {
    console.log('Adding new product:', formData)

    // Create new product
    const newProduct = await ProductDataService.addProduct(formData)

    console.log('New product created:', newProduct)

    // Reload all products from service to get the updated list
    await loadProducts()

    console.log('Products reloaded from service:', products.value)
    console.log('Products array length:', products.value.length)

    // Force table refresh to ensure it updates
    if (productTableRef.value) {
      console.log('Forcing ProductTable refresh')
      productTableRef.value.refreshData()
    }

    // Close modal and show success message
    isAddModalVisible.value = false
    console.log('New product added successfully')
    alert('Produk berhasil ditambahkan!')
  } catch (error) {
    console.error('Error adding product:', error)
    alert('Gagal menambahkan produk. Silakan coba lagi.')
  }
}

const handleEditProduct = (product: Product) => {
  console.log('Edit product:', product)
  // Show edit modal with product data
  productToEdit.value = product
  isEditModalVisible.value = true
}

const handleEditModalClose = () => {
  isEditModalVisible.value = false
  productToEdit.value = null
}

const handleEditModalSubmit = async (formData: ProductFormData & { id: number }) => {
  try {
    console.log('Updating product data:', formData)

    // Update product
    const updatedProduct = await ProductDataService.updateProduct(formData.id, {
      productType: formData.productType,
      description: formData.description,
      image: formData.image,
    })

    console.log('Product updated:', updatedProduct)

    // Update local data - the ProductTable will automatically update via the watcher
    const index = products.value.findIndex((p) => p.id === formData.id)
    if (index !== -1) {
      products.value.splice(index, 1, updatedProduct)
      console.log('Local product updated at index:', index)
      console.log('Updated products array:', products.value)

      // Force a reactive update by creating a new array reference
      products.value = [...products.value]
      console.log('Products array reference updated for reactivity')

      // Also refresh the table component directly
      if (productTableRef.value) {
        console.log('Refreshing ProductTable component')
        productTableRef.value.refreshData()
        productTableRef.value.forceUpdate()
      }
    } else {
      console.warn('Product not found in local array for update')
    }

    // Close modal and show success message
    isEditModalVisible.value = false
    productToEdit.value = null
    console.log('Edit modal closed and productToEdit reset')
    console.log('Product updated successfully')

    // Debug the data state after update
    debugDataState()

    alert('Produk berhasil diupdate!')
  } catch (error) {
    console.error('Error updating product:', error)
    alert('Gagal mengupdate produk. Silakan coba lagi.')
  }
}

const handleDeleteProduct = (product: Product) => {
  // Show delete confirmation modal
  productToDelete.value = product
  isDeleteModalVisible.value = true
}

const handleDeleteModalClose = () => {
  isDeleteModalVisible.value = false
  productToDelete.value = null
}

const handleDeleteConfirm = async (product: Product) => {
  try {
    console.log('Confirming deletion of product:', product)

    // Delete from service
    const success = await ProductDataService.deleteProduct(product.id)

    if (success) {
      // Remove from local data - the ProductTable will automatically update via the watcher
      const index = products.value.findIndex((p) => p.id === product.id)
      if (index !== -1) {
        products.value.splice(index, 1)
        console.log('Product removed from local array at index:', index)
        console.log('Updated products array:', products.value)
        console.log('Products array length:', products.value.length)
      } else {
        console.warn('Product not found in local array for deletion')
      }

      // Close modal and show success message
      handleDeleteModalClose()
      console.log('Product deleted successfully')
      alert('Produk berhasil dihapus!')
    } else {
      alert('Gagal menghapus produk.')
    }
  } catch (error) {
    console.error('Error deleting product:', error)
    alert('Terjadi kesalahan saat menghapus produk.')
  }
}

// Initialize component
onMounted(() => {
  loadProducts()
})

// Expose refresh methods for parent component
defineExpose({
  refreshAll: loadProducts,
  refreshProducts: loadProducts,
  debugDataState: debugDataState,
})
</script>
