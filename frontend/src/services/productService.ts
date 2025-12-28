import api from './api';
import { type AxiosResponse } from 'axios';

// ========================================
// TIPE DATA STRUKTUR RESPONSE BACKEND
// ========================================

// Interface untuk objek response JSON yang dikirim backend (yang membungkus data)
export interface BackendResponse<T> {
    success: boolean;
    message?: string;
    data: T; // Tipe array data yang sebenarnya
}

// ========================================
// TIPE DATA PRODUK & ULASAN
// ========================================

export interface Ukuran {
  ukuranId?: number;
  namaUkuran: string;
  hargaTambahan: number;
}
export interface Produk {
  produkId?: number;
  namaProduk: string;
  deskripsi: string;
  stok: number;
  foto?: string; // URL
  hargaUnit: number;
  ukurans: Ukuran[];
}

export interface ProductVariantRow {
  produkId: number;
  namaProduk: string;
  deskripsi: string;
  stok: number;
  foto?: string; // URL Gambar
  hargaUnit: number; // Harga dasar produk
  ukuranId?: number;
  namaUkuran?: string;
  hargaTambahan?: number; 
  averageRating?: number;
  reviewCount?: number;
  is_active?: boolean;
}

export interface Ulasan {
  ulasanId?: number;
  produkId: number;
  namaReviewer: string;
  rating: number;
  komentar?: string;
  foto?: string;
  tanggalUlasan: string;
}

interface CreateReviewData {
  namaReviewer: string;
  rating: number;
  komentar?: string;
}

// ========================================
// TIPE DATA PESANAN
// ========================================

export interface CreatePesananOfflinePayload {
  lokasiId: number | null; 
  namaPelanggan: string;
  kontakPelanggan: string | null | undefined;
  alamatPengiriman: string;
  totalHarga: number;
  items: {
    produkId: number | null; 
    ukuranId: number | null; 
    quantity: number;
    subtotal: number;
  }[];
}

export interface OrderItem {
  productId?: number;
  produkId?: number;
  productName?: string;
  namaProduk?: string;
  quantity: number;
  price?: number;
  harga?: number;
  subtotal: number;
  ukuranId?: number;
  ukuranName?: string;
  namaUkuran?: string;
}

export interface Pemesanan {
  pesananId: number;
  lokasiId: number | null;
  namaPelanggan: string;
  alamatPengiriman: string;
  kontakPelanggan: string;
  tanggalPesanan: string | Date;
  statusPesanan: string;
  totalHarga: number;
  items?: OrderItem[];
  buktiPembayaranUrl?: string | null;
  tipePesanan?: string; 
  ongkirId?: number | null;
  biayaPemesanan?: number;
}

export interface Lokasi {
  id?: number;
  lokasiId?: number;
  name?: string;
  namaLokasi?: string;
}

export interface UkuranPesanan {
  ukuranId: number;
  namaUkuran: string;
}

export interface ProdukPesanan {
  produkId: number;
  namaProduk: string;
  harga: number;
}

export interface CreatePesananData {
  lokasiId: number;
  namaPelanggan: string;
  alamatPengiriman: string;
  kontakPelanggan: string;
  items: {
    produkId: number;
    ukuranId: number;
    quantity: number;
    subtotal: number;
  }[];
}

// ========================================
// TIPE DATA DASHBOARD BARU
// ========================================

export interface RevenuePerLocation {
    lokasiId: number;
    lokasi_name: string;
    total_revenue: string; 
}

export interface RevenuePerDay {
    pemesanan_date: string;
    total_revenue: string;
}

export interface ProductsSoldPerLocation {
    lokasiId: number;
    lokasi_name: string;
    total_products_sold: string;
}

export interface DashboardSummary {
    revenuePerLocation: RevenuePerLocation[];
    revenuePerDay: RevenuePerDay[];
    productsSoldPerLocation: ProductsSoldPerLocation[];
}

export interface ProductContributionSummary {
    produkId: number;
    namaProduk: string;
    total_quantity_sold: string;
}

export interface ProductReviewSalesSummary {
    produkId: number;
    namaProduk: string;
    average_rating: string;
    review_count: number;
    total_quantity_sold: string;
}


// ========================================
// API PENJUALAN (SALES) - REVISI
// ========================================

export interface SaleReportItem {
    pesananId: number; 
    produkId: number; 
    namaProduk: string;
    QTY: number; 
    totalHarga: number; 
    lokasi: string; 
    date: string; 
}

export interface SaleRevenueSummary {
    lokasiId: number;
    lokasi: string;
    totalPendapatan: number;
}

export interface SaleQuantitySummary {
    namaProduk: string;
    totalProdukTerjual: number;
}

/**
 * Mengambil data laporan penjualan (tabel detail).
 */
export const getSalesReport = (queryString: string): Promise<AxiosResponse<PaginatedBackendResponse<SaleReportItem[]>>> => {
  return api.get<PaginatedBackendResponse<SaleReportItem[]>>(`/sales/report?${queryString}`);
};

/**
 * Mengambil data ringkasan Pendapatan per Lokasi. (Versi Lama)
 */
export const getSalesSummaryRevenue = (startDate?: string, endDate?: string, productId?: number | null, locationId?: number | null, orderType?: string | null): Promise<AxiosResponse<BackendResponse<SaleRevenueSummary[]>>> => {
  let url = '/sales/summary-revenue';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (productId) params.append('productId', productId.toString());
  if (locationId) params.append('locationId', locationId.toString());
  if (orderType) params.append('orderType', orderType);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  return api.get<BackendResponse<SaleRevenueSummary[]>>(url);
};

/**
 * Mengambil data ringkasan Kuantitas Terjual per Produk. (Versi Lama)
 */
export const getSalesSummaryQuantity = (): Promise<AxiosResponse<BackendResponse<SaleQuantitySummary[]>>> => {
  return api.get<BackendResponse<SaleQuantitySummary[]>>('/sales/summary-quantity');
};

// --- FUNGSI DASHBOARD BARU ---

/**
 * Mengambil semua data dashboard dalam satu panggilan.
 * Endpoint: GET /api/sales/dashboard-summary
 */
export const getDashboardSummaryData = (startDate?: string, endDate?: string, productId?: number | null, locationId?: number | null, orderType?: string | null): Promise<AxiosResponse<BackendResponse<DashboardSummary>>> => {
  let url = '/sales/dashboard-summary';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (productId) params.append('productId', productId.toString());
  if (locationId) params.append('locationId', locationId.toString());
  if (orderType) params.append('orderType', orderType);

  if (params.toString()) url += `?${params.toString()}`;

  return api.get<BackendResponse<DashboardSummary>>(url);
};

/**
 * Mengambil ringkasan kuantitas terjual per jenis produk (untuk Pie Chart).
 * Endpoint: GET /api/sales/summary-products-sold
 */
export const getProductsSoldChartData = (startDate?: string, endDate?: string, locationId?: number | null, productId?: number | null, orderType?: string | null): Promise<AxiosResponse<BackendResponse<ProductContributionSummary[]>>> => {
  let url = '/sales/summary-products-sold';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (locationId) params.append('locationId', locationId.toString());
  if (productId) params.append('productId', productId.toString());
  if (orderType) params.append('orderType', orderType);

  if (params.toString()) url += `?${params.toString()}`;

  return api.get<BackendResponse<ProductContributionSummary[]>>(url);
};

/**
 * Mengambil ringkasan ulasan (rating) dan penjualan (quantity) per produk.
 * Endpoint: GET /api/sales/product-review-summary
 */
export const getProductReviewSalesSummary = (startDate?: string, endDate?: string, productId?: number | null, locationId?: number | null, orderType?: string | null): Promise<AxiosResponse<BackendResponse<ProductReviewSalesSummary[]>>> => {
  let url = '/sales/product-review-summary';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (productId) params.append('productId', productId.toString());
  if (locationId) params.append('locationId', locationId.toString());
  if (orderType) params.append('orderType', orderType);

  if (params.toString()) url += `?${params.toString()}`;

  return api.get<BackendResponse<ProductReviewSalesSummary[]>>(url);
};

export interface OrderTypeSummary {
    tipePesanan: string;
    total_orders: number;
    total_revenue: string;
}

/**
 * Mengambil ringkasan penjualan per tipe pesanan (Online vs Offline).
 * Endpoint: GET /api/sales/summary-order-type
 */
export const getSalesByOrderTypeSummary = (startDate?: string, endDate?: string, productId?: number | null, locationId?: number | null, orderType?: string | null): Promise<AxiosResponse<BackendResponse<OrderTypeSummary[]>>> => {
  let url = '/sales/summary-order-type';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (productId) params.append('productId', productId.toString());
  if (locationId) params.append('locationId', locationId.toString());
  if (orderType) params.append('orderType', orderType);

  if (params.toString()) url += `?${params.toString()}`;

  return api.get<BackendResponse<OrderTypeSummary[]>>(url);
};


/**
 * Update transaksi penjualan.
 */
export const updateSalesTransaction = (pesananId: number, produkId: number, data: any) => {
  return api.put(`/sales/transaction/${pesananId}/${produkId}`, data);
};

/**
 * Hapus item transaksi penjualan.
 */
export const deleteSalesTransaction = (pesananId: number, produkId: number) => {
  return api.delete(`/sales/transaction/${pesananId}/${produkId}`);
};


// ========================================
// API PRODUK
// ========================================

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedBackendResponse<T> extends BackendResponse<T> {
  meta: PaginationMeta;
}

export const getProducts = (page = 1, limit = 10, showAll = false) => {
  return api.get<PaginatedBackendResponse<ProductVariantRow[]>>(`/products?page=${page}&limit=${limit}&show_all=${showAll}`);
};

export const getProductById = (id: number) => {
  return api.get<Produk>(`/products/${id}`);
};

export const getProductIdList = () => {
  return api.get<number[]>('/products/ids');
};

export const getBestSellerProducts = () => {
  return api.get<ProductVariantRow[]>('/products/best-seller');
};

export const createProduct = (formData: FormData) => {
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateProduct = (id: number, formData: FormData) => {
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateProductStatus = (id: number, is_active: boolean) => {
  return api.patch(`/products/${id}/status`, { is_active });
};

export const deleteProduct = (id: number) => {
  return api.delete(`/products/${id}`);
};

// ========================================
// API ULASAN
// ========================================

export const getReviewsByProductId = (produkId: number, page?: number, limit?: number) => {
  let url = `/products/${produkId}/reviews`;
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  if (params.toString()) url += `?${params.toString()}`;
  
  return api.get<Ulasan[]>(url);
};

export const createReview = (produkId: number, formData: FormData) => {
  return api.post(`/products/${produkId}/reviews`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteReview = (produkId: number, ulasanId: number) => {
  return api.delete(`/products/${produkId}/reviews/${ulasanId}`);
};

// ========================================
// API PESANAN - DATA MASTER
// ========================================

export const getAllLokasi = () => {
  return api.get<Lokasi[]>('/pesanan/lokasi');
};

export const getAllUkuran = () => {
  return api.get<UkuranPesanan[]>('/pesanan/ukuran');
};

export const getAllProduk = () => {
  return api.get<ProdukPesanan[]>('/pesanan/produk');
};

export const getAllProdukPesanan = () => {
  return api.get<ProdukPesanan[]>('/pesanan/produk');
};

// ========================================
// API PESANAN - CRUD
// ========================================

export const getAllPesanan = (startDate?: string, endDate?: string, tipePesanan?: string) => {
  let url = '/pesanan';
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  if (tipePesanan && tipePesanan !== 'all') params.append('tipePesanan', tipePesanan);
  
  if (params.toString()) url += `?${params.toString()}`;
  
  return api.get<Pemesanan[]>(url);
};

export const getPesananById = (id: number) => {
  return api.get<Pemesanan>(`/pesanan/${id}`);
};

export const createPesanan = (formData: FormData) => {
  return api.post('/pesanan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const createPesananOffline = (payload: CreatePesananOfflinePayload) => {
  return api.post('/pesanan/offline', payload); 
};

export const updateStatusPesanan = (id: number, statusPesanan: string, alasanPembatalan?: string, trackingInfo?: string) => {
  return api.patch(`/pesanan/${id}/status`, { statusPesanan, alasanPembatalan, trackingInfo });
};

export const updateLokasiPesanan = (id: number, lokasiId: number) => {
  return api.patch(`/pesanan/${id}/lokasi`, { lokasiId });
};

export const deletePesanan = (id: number) => {
  return api.delete(`/pesanan/${id}`);
};