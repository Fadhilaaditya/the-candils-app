<template>
  <div class="p-8 bg-gray-50 min-h-screen">
    <SalesTable
      :sales="salesData"
      @add-report="handleAddReport"
      @edit-sale="handleEditSale"
      @delete-sale="handleDeleteSale"
    />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      <RevenueChart :revenue-data="revenueData" />
      <ProductsSoldChart :products-sold-data="productsSoldData" />
    </div>

    <AddReportModal
      :is-visible="isModalVisible"
      @close="handleModalClose"
      @submit="handleModalSubmit"
    />
    <EditReportModal
      :is-visible="isEditModalVisible"
      :sale-data="saleToEdit"
      @close="handleEditModalClose"
      @submit="handleEditModalSubmit"
    />
    <DeleteConfirmModal
      :is-visible="isDeleteModalVisible"
      :sale-data="saleToDelete"
      @close="handleDeleteModalClose"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>

<script setup lang="ts">
// 1. Import semua komponen tampilan
import SalesTable from './_components/SalesTable.vue';
import RevenueChart from './_components/RevenueChart.vue';
import ProductsSoldChart from './_components/ProductsSoldChart.vue';
import AddReportModal from './_components/AddReportModal.vue';
import EditReportModal from './_components/EditReportModal.vue';
import DeleteConfirmModal from './_components/DeleteConfirmModal.vue';

// 2. Import dan panggil "otak"-nya
import { useSales } from './useSales';

// 3. Dapatkan semua state dan fungsi dari Composable
const {
  salesData, revenueData, productsSoldData,
  isModalVisible, isEditModalVisible, isDeleteModalVisible,
  saleToEdit, saleToDelete,
  handleAddReport, handleEditSale, handleDeleteSale,
  handleModalClose, handleModalSubmit,
  handleEditModalClose, handleEditModalSubmit,
  handleDeleteModalClose, handleDeleteConfirm
} = useSales();

// Selesai! Script Anda sekarang sangat bersih.
</script>
