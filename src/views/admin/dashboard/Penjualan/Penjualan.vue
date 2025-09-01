<template>
  <div class="p-8">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Laporan Penjualan</h1>
      <p class="text-gray-600 mt-2">Kelola data penjualan dan laporan</p>
    </div>

    <!-- Sales Table Section -->
    <SalesTable
      ref="salesTableRef"
      :initial-data="salesData"
      @add-report="handleAddReport"
      @edit-sale="handleEditSale"
      @delete-sale="handleDeleteSale"
      @export-pdf="handleExportPDF"
    />

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <!-- Revenue Chart -->
      <RevenueChart ref="revenueChartRef" :initial-data="revenueData" />

      <!-- Products Sold Chart -->
      <ProductsSoldChart ref="productsSoldChartRef" :initial-data="productsSoldData" />
    </div>

    <!-- Add Report Modal -->
    <AddReportModal
      :is-visible="isModalVisible"
      :existing-sales-data="salesData"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />

    <!-- Edit Report Modal -->
    <EditReportModal
      :is-visible="isEditModalVisible"
      :sale-data="saleToEdit"
      :existing-sales-data="salesData"
      @close="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmModal
      :is-visible="isDeleteModalVisible"
      :sale-data="saleToDelete"
      @close="handleDeleteModalClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SalesTable from './_components/SalesTable.vue'
import RevenueChart from './_components/RevenueChart.vue'
import ProductsSoldChart from './_components/ProductsSoldChart.vue'
import AddReportModal from './_components/AddReportModal.vue'
import EditReportModal from './_components/EditReportModal.vue'
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue'
import {
  SalesDataService,
  type SalesData,
  type RevenueData,
  type ProductSoldData,
  type SalesFilters,
} from './data/salesData'

// Component name for linter
defineOptions({
  name: 'AdminPenjualan',
})

// Component refs
const salesTableRef = ref<InstanceType<typeof SalesTable> | null>(null)
const revenueChartRef = ref<InstanceType<typeof RevenueChart> | null>(null)
const productsSoldChartRef = ref<InstanceType<typeof ProductsSoldChart> | null>(null)

// Modal states
const isModalVisible = ref(false)
const isEditModalVisible = ref(false)
const isDeleteModalVisible = ref(false)
const saleToDelete = ref<SalesData | null>(null)
const saleToEdit = ref<SalesData | null>(null)

// Reactive data
const salesData = ref<SalesData[]>([])
const revenueData = ref<RevenueData[]>([])
const productsSoldData = ref<ProductSoldData[]>([])

// Load initial data
const loadSalesData = async () => {
  try {
    const [salesResult, revenueResult, productsResult] = await Promise.all([
      SalesDataService.fetchSalesData(),
      SalesDataService.fetchRevenueData(),
      SalesDataService.fetchProductsSoldData(),
    ])

    salesData.value = salesResult
    revenueData.value = revenueResult
    productsSoldData.value = productsResult
  } catch (error) {
    console.error('Error loading sales data:', error)
  }
}

// Event handlers
const handleAddReport = () => {
  isModalVisible.value = true
}

const handleModalClose = () => {
  isModalVisible.value = false
}

const handleModalSubmit = async (formData: {
  productName: string
  quantity: number
  price: number
  location: string
  date: string
}) => {
  try {
    console.log('Submitting form data:', formData)

    // Create new sales record
    const newSale = await SalesDataService.addSalesRecord({
      productName: formData.productName,
      quantity: formData.quantity,
      price: formData.price,
      location: formData.location,
      date: formData.date,
    })

    console.log('New sale created:', newSale)

    // Add to local data
    salesData.value.unshift(newSale)
    console.log('Updated salesData:', salesData.value)

    // Refresh charts data
    await refreshCharts()

    console.log('New sales record added successfully')
    alert('Laporan berhasil ditambahkan!')
  } catch (error) {
    console.error('Error adding sales record:', error)
    alert('Gagal menambahkan laporan. Silakan coba lagi.')
  }
}

const handleEditSale = (sale: SalesData) => {
  console.log('Edit sale:', sale)
  // Show edit modal with sale data
  saleToEdit.value = sale
  isEditModalVisible.value = true
}

const handleEditModalClose = () => {
  isEditModalVisible.value = false
  saleToEdit.value = null
}

const handleEditModalSubmit = async (formData: {
  id: number
  productName: string
  quantity: number
  price: number
  location: string
  date: string
}) => {
  try {
    console.log('Updating sale data:', formData)

    // Update sales record
    const updatedSale = await SalesDataService.updateSalesRecord(formData.id, {
      productName: formData.productName,
      quantity: formData.quantity,
      price: formData.price,
      location: formData.location,
      date: formData.date,
    })

    console.log('Sale updated:', updatedSale)

    // Update local data - use array spread to trigger reactivity
    const index = salesData.value.findIndex((s) => s.id === formData.id)
    if (index !== -1) {
      salesData.value.splice(index, 1, updatedSale)
      console.log('Local sales data updated at index:', index)
    }

    // Update the SalesTable component directly with fresh data
    if (salesTableRef.value) {
      salesTableRef.value.updateSalesData(salesData.value)
      console.log('SalesTable component updated with fresh data')
    }

    // Alternative: Re-fetch fresh data from service to ensure consistency
    try {
      const freshSalesData = await SalesDataService.fetchSalesData()
      salesData.value = freshSalesData
      console.log('Fresh sales data fetched and updated')
    } catch (error) {
      console.error('Error fetching fresh sales data:', error)
    }

    // Refresh charts data
    await refreshCharts()

    console.log('Sales record updated successfully')
    alert('Laporan berhasil diupdate!')
  } catch (error) {
    console.error('Error updating sales record:', error)
    alert('Gagal mengupdate laporan. Silakan coba lagi.')
  }
}

const handleDeleteSale = (sale: SalesData) => {
  // Show delete confirmation modal
  saleToDelete.value = sale
  isDeleteModalVisible.value = true
}

const handleDeleteModalClose = () => {
  isDeleteModalVisible.value = false
  saleToDelete.value = null
}

const handleDeleteConfirm = async (sale: SalesData) => {
  try {
    console.log('Confirming deletion of sale:', sale)

    // Delete from service
    const success = await SalesDataService.deleteSalesRecord(sale.id)

    if (success) {
      // Remove from local data
      const index = salesData.value.findIndex((s) => s.id === sale.id)
      if (index !== -1) {
        salesData.value.splice(index, 1)
        console.log('Sale removed from local data')
      }

      // Update the SalesTable component directly with fresh data
      if (salesTableRef.value) {
        salesTableRef.value.updateSalesData(salesData.value)
        console.log('SalesTable component updated with fresh data')
      }

      // Alternative: Re-fetch fresh data from service to ensure consistency
      try {
        const freshSalesData = await SalesDataService.fetchSalesData()
        salesData.value = freshSalesData
        console.log('Fresh sales data fetched and updated')
      } catch (error) {
        console.error('Error fetching fresh sales data:', error)
      }

      // Refresh charts data
      await refreshCharts()

      console.log('Sale record deleted successfully')
      alert('Data penjualan berhasil dihapus!')
    } else {
      alert('Gagal menghapus data penjualan.')
    }
  } catch (error) {
    console.error('Error deleting sale record:', error)
    alert('Terjadi kesalahan saat menghapus data.')
  } finally {
    // Close modal
    handleDeleteModalClose()
  }
}

const handleExportPDF = async (filters: SalesFilters) => {
  try {
    const filename = await SalesDataService.exportToPDF(filters)
    console.log('PDF exported:', filename)
    // TODO: Implement actual PDF download
  } catch (error) {
    console.error('Error exporting PDF:', error)
  }
}

// Refresh data methods
const refreshSalesData = async () => {
  await loadSalesData()
}

const refreshCharts = async () => {
  try {
    const [revenueResult, productsResult] = await Promise.all([
      SalesDataService.fetchRevenueData(),
      SalesDataService.fetchProductsSoldData(),
    ])

    revenueData.value = revenueResult
    productsSoldData.value = productsResult

    // Update chart components
    if (revenueChartRef.value) {
      revenueChartRef.value.updateChartData(revenueResult)
    }
    if (productsSoldChartRef.value) {
      productsSoldChartRef.value.updateChartData(productsResult)
    }
  } catch (error) {
    console.error('Error refreshing charts:', error)
  }
}

// Initialize component
onMounted(() => {
  loadSalesData()
})

// Expose refresh methods for parent component
defineExpose({
  refreshAll: loadSalesData,
  refreshSales: refreshSalesData,
  refreshCharts: refreshCharts,
})
</script>
