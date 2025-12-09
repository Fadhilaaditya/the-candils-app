const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/pesananController');
const authMiddleware = require('../middleware/authMiddleware'); // Pastikan path benar
const adminMiddleware = require('../middleware/adminMiddleware'); // Pastikan path benar
const {
  validateCreatePesanan,
  validateUpdateStatus,
  validateUpdateLokasi,
  validateCreatePesananOffline
} = require('../middleware/validatePesananMiddleware'); // Pastikan path benar

// --- Impor dan konfigurasikan Multer untuk upload ke memory ---
const multer = require('multer');
// Simpan file di memory buffer, bukan di disk, agar bisa diakses oleh Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// ----------------------------------------------------------------

// ===============================================
// RUTE PUBLIK - Data Master
// ===============================================

// GET /api/pesanan/lokasi - Ambil semua lokasi
router.get('/lokasi', pesananController.getAllLokasi);

// GET /api/pesanan/ukuran - Ambil semua ukuran
router.get('/ukuran', pesananController.getAllUkuran);

// GET /api/pesanan/produk - Ambil semua produk (Master Data)
router.get('/produk', pesananController.getAllProduk);

// GET /api/pesanan/ongkir - Ambil semua ongkir
router.get('/ongkir', pesananController.getAllOngkir);


// ===============================================
// RUTE PESANAN (Umum, bisa diakses user setelah login atau admin)
// ===============================================

// GET /api/pesanan - Ambil daftar semua pesanan (Biasanya Admin/Authenticated User)
router.get('/', pesananController.getAllPesanan);

// GET /api/pesanan/:id - Ambil detail satu pesanan
router.get('/:id', pesananController.getPesananById);

// POST /api/pesanan (Rute untuk pesanan online/upload bukti pembayaran)
// Urutan penting: Multer -> Validation -> Controller
router.post(
  '/',
  upload.single('buktiPembayaran'), // 1. Proses file dan body (req.body akan terisi string)
  validateCreatePesanan,            // 2. Validasi body (termasuk parsing items JSON)
  pesananController.createPesanan   // 3. Eksekusi logic pembuatan pesanan
);

// POST /api/pesanan/offline (Rute untuk input manual/JSON body, tanpa file upload)
router.post(
    '/offline',
    validateCreatePesananOffline, // Menggunakan validator khusus untuk JSON body
    pesananController.createPesananOffline
);


// ===============================================
// RUTE ADMIN (Membutuhkan otentikasi dan peran Admin)
// ===============================================

// PATCH /api/pesanan/:id/status - Update status pesanan
router.patch(
  '/:id/status',
  [authMiddleware, adminMiddleware, validateUpdateStatus],
  pesananController.updateStatusPesanan
);

// PATCH /api/pesanan/:id/lokasi - Update lokasi pesanan
router.patch(
  '/:id/lokasi',
  [authMiddleware, adminMiddleware, validateUpdateLokasi],
  pesananController.updateLokasiPesanan
);

// DELETE /api/pesanan/:id - Hapus pesanan
router.delete(
  '/:id',
  [authMiddleware, adminMiddleware],
  pesananController.deletePesanan
);

module.exports = router;
