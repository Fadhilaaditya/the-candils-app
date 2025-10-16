import { ref, onMounted } from 'vue';
import dataFromJson from './data/SalesData.json';

// Definisikan tipe data di sini agar bisa digunakan di mana saja
export interface Sale {
  id: number;
  productName: string;
  quantity: number;
  price: number;
  location: string;
  date: string;
}
export interface Revenue {
  location: string;
  total: number;
}
export interface ProductSold {
  product: string;
  short: string;
  sold: number;
}

// Ini adalah "Composable" function kita
export function useSales() {
  // Semua state (data reaktif)
  const salesData = ref<Sale[]>([]);
  const revenueData = ref<Revenue[]>([]);
  const productsSoldData = ref<ProductSold[]>([]);
  const isModalVisible = ref(false);
  const isEditModalVisible = ref(false);
  const isDeleteModalVisible = ref(false);
  const saleToEdit = ref<Sale | null>(null);
  const saleToDelete = ref<Sale | null>(null);

  // Semua functions/methods
  const loadInitialData = () => {
    salesData.value = dataFromJson.sales;
    revenueData.value = dataFromJson.revenueByLocation;
    productsSoldData.value = dataFromJson.soldByProduct;
  };

  const handleAddReport = () => { isModalVisible.value = true; };
  const handleEditSale = (sale: Sale) => {
    saleToEdit.value = { ...sale };
    isEditModalVisible.value = true;
  };
  const handleDeleteSale = (sale: Sale) => {
    saleToDelete.value = sale;
    isDeleteModalVisible.value = true;
  };

  const handleModalClose = () => { isModalVisible.value = false; };
  const handleModalSubmit = (newSaleData: Omit<Sale, 'id'>) => {
    salesData.value.unshift({ id: Date.now(), ...newSaleData });
    alert('Laporan berhasil ditambahkan!');
  };

  const handleEditModalClose = () => { isEditModalVisible.value = false; };
  const handleEditModalSubmit = (updatedSale: Sale) => {
    const index = salesData.value.findIndex(s => s.id === updatedSale.id);
    if (index !== -1) salesData.value[index] = updatedSale;
    alert('Laporan berhasil diupdate!');
  };

  const handleDeleteModalClose = () => { isDeleteModalVisible.value = false; };
  const handleDeleteConfirm = () => {
    if (saleToDelete.value) {
      salesData.value = salesData.value.filter(s => s.id !== saleToDelete.value!.id);
      handleDeleteModalClose();
      alert('Data berhasil dihapus!');
    }
  };

  onMounted(loadInitialData);

  // Kembalikan semua state dan fungsi yang perlu diakses oleh template
  return {
    salesData,
    revenueData,
    productsSoldData,
    isModalVisible,
    isEditModalVisible,
    isDeleteModalVisible,
    saleToEdit,
    saleToDelete,
    handleAddReport,
    handleEditSale,
    handleDeleteSale,
    handleModalClose,
    handleModalSubmit,
    handleEditModalClose,
    handleEditModalSubmit,
    handleDeleteModalClose,
    handleDeleteConfirm
  };
}
