import { ref, onMounted, computed } from 'vue'; // 1. Tambahkan 'computed'
import dataFromJson from './data/SalesData.json';

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

export function useSales() {
  const salesData = ref<Sale[]>([]);
  const isModalVisible = ref(false);
  const isEditModalVisible = ref(false);
  const isDeleteModalVisible = ref(false);
  const saleToEdit = ref<Sale | null>(null);
  const saleToDelete = ref<Sale | null>(null);

  // --- PERUBAHAN 1: Buat data grafik menjadi computed property ---
  const revenueData = computed<Revenue[]>(() => {
    const revenueMap = new Map<string, number>();
    for (const sale of salesData.value) {
      const currentTotal = revenueMap.get(sale.location) || 0;
      revenueMap.set(sale.location, currentTotal + sale.price);
    }
    return Array.from(revenueMap, ([location, total]) => ({ location, total }));
  });

  const productsSoldData = computed<ProductSold[]>(() => {
    const soldMap = new Map<string, number>();
    for (const sale of salesData.value) {
        const currentQty = soldMap.get(sale.productName) || 0;
        soldMap.set(sale.productName, currentQty + sale.quantity);
    }
    // Note: 'short' name is not in sales data, so we create it or leave it blank
    return Array.from(soldMap, ([product, sold]) => ({
        product,
        sold,
        short: product.substring(0, 3).toUpperCase()
    }));
  });
  // ----------------------------------------------------------------

  const loadInitialData = () => {
    salesData.value = dataFromJson.sales;
    // --- PERUBAHAN 2: Hapus baris di bawah ini karena sudah ditangani oleh computed ---
    // revenueData.value = dataFromJson.revenueByLocation;
    // productsSoldData.value = dataFromJson.soldByProduct;
  };

  onMounted(loadInitialData);

  // --- PERUBAHAN 3: Sederhanakan fungsi submit (cukup tutup modalnya) ---
  const handleModalClose = () => { isModalVisible.value = false; };
  const handleModalSubmit = (newSaleData: Omit<Sale, 'id'>) => {
    salesData.value.unshift({ id: Date.now(), ...newSaleData });
    handleModalClose(); // Panggil fungsi close
    alert('Laporan berhasil ditambahkan!');
  };

  const handleEditModalClose = () => { isEditModalVisible.value = false; };
  const handleEditModalSubmit = (updatedSale: Sale) => {
    const index = salesData.value.findIndex(s => s.id === updatedSale.id);
    if (index !== -1) salesData.value[index] = updatedSale;
    handleEditModalClose(); // Panggil fungsi close
    alert('Laporan berhasil diupdate!');
  };

  // Fungsi hapus sudah benar karena memanggil handleDeleteModalClose
  const handleDeleteModalClose = () => { isDeleteModalVisible.value = false; };
  const handleDeleteConfirm = () => {
    if (saleToDelete.value) {
      salesData.value = salesData.value.filter(s => s.id !== saleToDelete.value!.id);
      handleDeleteModalClose();
      alert('Data berhasil dihapus!');
    }
  };


  // Fungsi lain yang tidak berubah...
  const handleAddReport = () => { isModalVisible.value = true; };
  const handleEditSale = (sale: Sale) => {
    saleToEdit.value = { ...sale };
    isEditModalVisible.value = true;
  };
  const handleDeleteSale = (sale: Sale) => {
    saleToDelete.value = sale;
    isDeleteModalVisible.value = true;
  };

  return {
    salesData,
    revenueData, // Sekarang ini adalah computed property
    productsSoldData, // Sekarang ini adalah computed property
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
