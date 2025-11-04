const express = require('express');
const router = express.Router();
const pesananController = require('../controllers/pesananController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const { 
  validateCreatePesanan, // Ini mungkin tidak lagi digunakan di POST /
  validateUpdateStatus, 
  validateUpdateLokasi 
} = require('../middleware/validatePesananMiddleware');

// --- [BARU] Impor dan konfigurasikan Multer untuk upload ke memory ---
const multer = require('multer');
// Simpan file di memory buffer, bukan di disk
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

// POST /api/pesanan
// [PERUBAHAN]: Menggunakan 'upload.single' untuk menerima FormData (teks + file)
// 'validateCreatePesanan' (validator JSON) dihapus karena tidak kompatibel
router.post(
  '/',
  upload.single('buktiPembayaran'), // Menerima file & data teks
  pesananController.createPesanan
);

// --- [DIHAPUS] ---
// Rute PATCH /:id/upload-bukti dihapus
// karena logikanya sudah digabung ke 'createPesanan'
// -----------------

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

