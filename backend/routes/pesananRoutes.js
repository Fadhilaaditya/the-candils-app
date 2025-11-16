const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/pesananController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { 
  validateCreatePesanan, 
  validateUpdateStatus, 
  validateUpdateLokasi,
  validateCreatePesananOffline 
} = require('../middleware/validatePesananMiddleware'); 

// --- Impor dan konfigurasikan Multer untuk upload ke memory ---
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
// ----------------------------------------------------------------

// ===============================================
// RUTE PUBLIK - Data Master
// ===============================================

// GET /api/pesanan/lokasi
router.get('/lokasi', pesananController.getAllLokasi);

// GET /api/pesanan/ukuran
router.get('/ukuran', pesananController.getAllUkuran);

// GET /api/pesanan/produk
router.get('/produk', pesananController.getAllProduk);


// ===============================================
// RUTE PESANAN
// ===============================================

// GET /api/pesanan
router.get('/', pesananController.getAllPesanan);

// GET /api/pesanan/:id
router.get('/:id', pesananController.getPesananById);

// POST /api/pesanan (Untuk pesanan online/upload bukti pembayaran)
// ✅ PERBAIKAN: validateCreatePesanan harus dipanggil setelah Multer memproses body.
router.post(
  '/',
  upload.single('buktiPembayaran'), 
  validateCreatePesanan,            // <--- Tambahkan validasi di sini
  pesananController.createPesanan
);

// POST /api/pesanan/offline (Rute baru untuk input manual/JSON body)
router.post(
    '/offline',
    validateCreatePesananOffline, 
    pesananController.createPesananOffline
);

// ===============================================
// RUTE ADMIN (Perlu Token + Role Admin)
// ===============================================

// PATCH /api/pesanan/:id/status
router.patch(
  '/:id/status',
  [authMiddleware, adminMiddleware, validateUpdateStatus],
  pesananController.updateStatusPesanan
);

// PATCH /api/pesanan/:id/lokasi
router.patch(
  '/:id/lokasi',
  [authMiddleware, adminMiddleware, validateUpdateLokasi],
  pesananController.updateLokasiPesanan
);

// DELETE /api/pesanan/:id
router.delete(
  '/:id',
  [authMiddleware, adminMiddleware],
  pesananController.deletePesanan
);

module.exports = router;