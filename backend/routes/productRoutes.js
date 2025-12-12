const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Pastikan multer diimpor

// --- RUTE PUBLIK ---

// GET /api/products
// (Mendapatkan semua produk - varian per baris)
router.get('/', productController.getAllProducts);

// GET /api/products/ids
// (Mendapatkan daftar ID. HARUS DI ATAS /:id)
router.get('/ids', productController.getProductIdList);

// GET /api/products/best-seller
// (Mendapatkan 3 produk top sales)
router.get('/best-seller', productController.getBestSellerProducts);

// GET /api/products/:id
// (Mendapatkan detail satu produk)
router.get('/:id', productController.getProductById);


// --- RUTE ADMIN (Perlu Token + Role Admin) ---

// POST /api/products
// (Membuat produk baru, perlu upload file)
router.post(
  '/',
  [authMiddleware, adminMiddleware, upload.single('foto')],
  productController.createProduct
);

// PUT /api/products/:id
// (Update produk, perlu upload file)
router.put(
  '/:id',
  [authMiddleware, adminMiddleware, upload.single('foto')],
  productController.updateProduct
);

// PATCH /api/products/:id/status
// (Update status aktif/nonaktif)
router.patch(
  '/:id/status',
  [authMiddleware, adminMiddleware],
  productController.updateProductStatus
);

// DELETE /api/products/:id
// (Hapus produk)
router.delete(
  '/:id',
  [authMiddleware, adminMiddleware],
  productController.deleteProduct
);

module.exports = router;