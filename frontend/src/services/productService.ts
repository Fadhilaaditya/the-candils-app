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
}

export interface Ulasan {
  ulasanId?: number;
  produkId: number;
  namaReviewer: string;
  rating: number;
  komentar?: string;
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
  kontakPelanggan: string;
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
export const getSalesReport = (queryString: string): Promise<AxiosResponse<BackendResponse<SaleReportItem[]>>> => {
  return api.get<BackendResponse<SaleReportItem[]>>(`/sales/report?${queryString}`);
};

/**
 * Mengambil data ringkasan Pendapatan per Lokasi.
 */
export const getSalesSummaryRevenue = (): Promise<AxiosResponse<BackendResponse<SaleRevenueSummary[]>>> => {
  return api.get<BackendResponse<SaleRevenueSummary[]>>('/sales/summary-revenue');
};

/**
 * Mengambil data ringkasan Kuantitas Terjual per Produk.
 */
export const getSalesSummaryQuantity = (): Promise<AxiosResponse<BackendResponse<SaleQuantitySummary[]>>> => {
  return api.get<BackendResponse<SaleQuantitySummary[]>>('/sales/summary-quantity');
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

export const getProducts = () => {
  return api.get<ProductVariantRow[]>('/products');
};

export const getProductById = (id: number) => {
  return api.get<Produk>(`/products/${id}`);
};

export const getProductIdList = () => {
  return api.get<number[]>('/products/ids');
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

export const deleteProduct = (id: number) => {
  return api.delete(`/products/${id}`);
};

// ========================================
// API ULASAN
// ========================================

export const getReviewsByProductId = (produkId: number) => {
  return api.get<Ulasan[]>(`/products/${produkId}/reviews`);
};

export const createReview = (produkId: number, data: CreateReviewData) => {
  return api.post(`/products/${produkId}/reviews`, data);
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

export const getAllPesanan = () => {
  return api.get<Pemesanan[]>('/pesanan');
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

export const updateStatusPesanan = (id: number, statusPesanan: string) => {
  return api.patch(`/pesanan/${id}/status`, { statusPesanan });
};

export const updateLokasiPesanan = (id: number, lokasiId: number) => {
  return api.patch(`/pesanan/${id}/lokasi`, { lokasiId });
};

export const deletePesanan = (id: number) => {
  return api.delete(`/pesanan/${id}`);
};