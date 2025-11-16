import api from './api';

// ========================================
// TIPE DATA PRODUK & ULASAN
// ========================================

// Tipe data untuk Ukuran
export interface Ukuran {
  ukuranId?: number;
  namaUkuran: string;
  hargaTambahan: number;
}

// Tipe data untuk Produk Detail (digunakan getProductById)
export interface Produk {
  produkId?: number;
  namaProduk: string;
  deskripsi: string;
  stok: number;
  foto?: string; // URL
  hargaUnit: number;
  ukurans: Ukuran[]; // Hanya ada di getProductById
}

// Tipe data untuk Varian (baris tabel dari getProducts)
export interface ProductVariantRow {
  produkId: number;
  namaProduk: string;
  deskripsi: string;
  stok: number;
  foto?: string; // URL Gambar
  hargaUnit: number; // Harga dasar produk
  ukuranId?: number; // Akan null jika produk tidak punya ukuran
  namaUkuran?: string; // Akan null jika produk tidak punya ukuran
  hargaTambahan?: number; // Akan null jika produk tidak punya ukuran
  // Field rating baru dari API
  averageRating?: number;
  reviewCount?: number;
}

// Tipe data untuk Ulasan (sesuai skema sederhana)
export interface Ulasan {
  ulasanId?: number;
  produkId: number;
  namaReviewer: string;
  rating: number;
  komentar?: string;
  tanggalUlasan: string;
}

// Tipe data untuk form 'createReview'
interface CreateReviewData {
  namaReviewer: string;
  rating: number;
  komentar?: string;
}

// ========================================
// TIPE DATA PESANAN
// ========================================

// Tipe data untuk form 'createPesananOffline'
export interface CreatePesananOfflinePayload {
  lokasiId: number | null; // ✅ PERBAIKAN: Mengizinkan null
  namaPelanggan: string;
  kontakPelanggan: string;
  alamatPengiriman: string;
  totalHarga: number;
  items: {
    produkId: number | null; // Izinkan null saat diisi
    ukuranId: number | null; // Izinkan null saat diisi
    quantity: number;
    subtotal: number;
  }[];
  // Tidak ada file bukti pembayaran
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
  // [PERBAIKAN]: Menambahkan field ini untuk memperbaiki error TypeScript
  buktiPembayaranUrl?: string | null;
  tipePesanan?: string; // ✅ BARU: Menambahkan tipePesanan
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

// Interface ini tidak lagi digunakan oleh 'createPesanan' 
// tapi mungkin masih dipakai di tempat lain.
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
// API PRODUK
// ========================================

/**
 * Mengambil semua VARIAN produk + RATING (FLAT LIST) (PUBLIC)
 */
export const getProducts = () => {
  return api.get<ProductVariantRow[]>('/products');
};

/**
 * Mengambil detail satu produk LENGKAP (PUBLIC)
 */
export const getProductById = (id: number) => {
  return api.get<Produk>(`/products/${id}`);
};

/**
 * Mengambil daftar ID produk [3, 4, 5] (PUBLIC)
 */
export const getProductIdList = () => {
  return api.get<number[]>('/products/ids');
};

/**
 * Membuat produk baru (ADMIN) - Mengirim FormData
 */
export const createProduct = (formData: FormData) => {
  return api.post('/products', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Update produk (ADMIN) - Mengirim FormData
 */
export const updateProduct = (id: number, formData: FormData) => {
  return api.put(`/products/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * Hapus produk (ADMIN)
 */
export const deleteProduct = (id: number) => {
  return api.delete(`/products/${id}`);
};

// ========================================
// API ULASAN
// ========================================

/**
 * Mengambil ulasan untuk satu produk (PUBLIC)
 */
export const getReviewsByProductId = (produkId: number) => {
  return api.get<Ulasan[]>(`/products/${produkId}/reviews`);
};

/**
 * Membuat ulasan baru (PUBLIC)
 */
export const createReview = (produkId: number, data: CreateReviewData) => {
  return api.post(`/products/${produkId}/reviews`, data);
};

// ========================================
// API PESANAN - DATA MASTER
// ========================================

/**
 * Mengambil semua data lokasi (PUBLIC)
 */
export const getAllLokasi = () => {
  return api.get<Lokasi[]>('/pesanan/lokasi');
};

/**
 * Mengambil semua data ukuran (PUBLIC)
 */
export const getAllUkuran = () => {
  return api.get<UkuranPesanan[]>('/pesanan/ukuran');
};

/**
 * ✅ FIX: Mengambil semua data produk untuk pesanan (PUBLIC)
 * Diberikan untuk kompatibilitas dengan import yang mencari 'getAllProduk'
 */
export const getAllProduk = () => {
  return api.get<ProdukPesanan[]>('/pesanan/produk');
};


/**
 * Mengambil semua data produk untuk pesanan (PUBLIC)
 */
export const getAllProdukPesanan = () => {
  return api.get<ProdukPesanan[]>('/pesanan/produk');
};

// ========================================
// API PESANAN - CRUD
// ========================================

/**
 * Mengambil semua pesanan (PUBLIC atau ADMIN)
 */
export const getAllPesanan = () => {
  return api.get<Pemesanan[]>('/pesanan');
};

/**
 * Mengambil detail satu pesanan (PUBLIC atau ADMIN)
 */
export const getPesananById = (id: number) => {
  return api.get<Pemesanan>(`/pesanan/${id}`);
};

/**
 * [PERBAIKAN]: Membuat pesanan baru menggunakan FormData
 */
export const createPesanan = (formData: FormData) => {
  return api.post('/pesanan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

/**
 * [BARU]: Membuat pesanan baru untuk laporan offline/manual (TANPA FILE)
 * Menggunakan body JSON, dikirim ke endpoint yang berbeda.
 */
export const createPesananOffline = (payload: CreatePesananOfflinePayload) => {
  // Asumsi backend memiliki endpoint baru: /api/pesanan/offline
  // Endpoint ini akan memproses JSON body tanpa memerlukan multer/file.
  return api.post('/pesanan/offline', payload); 
};


/**
 * Update status pesanan (ADMIN ONLY)
 */
export const updateStatusPesanan = (id: number, statusPesanan: string) => {
  return api.patch(`/pesanan/${id}/status`, { statusPesanan });
};

/**
 * Update lokasi pesanan (ADMIN ONLY)
 */
export const updateLokasiPesanan = (id: number, lokasiId: number) => {
  return api.patch(`/pesanan/${id}/lokasi`, { lokasiId });
};

/**
 * Hapus pesanan (ADMIN ONLY)
 */
// ✅ PERBAIKAN: Mengganti nama fungsi ini menjadi deletePesanan
export const deletePesanan = (id: number) => {
  return api.delete(`/pesanan/${id}`);
};