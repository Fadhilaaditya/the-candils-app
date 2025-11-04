// ===============================================
// FILE: routes/cart.js
// ===============================================
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { 
  validateAddToCart, 
  validateUpdateQuantity 
} = require('../middleware/validateCartMiddleware');

// ===============================================
// RUTE CART (Public - Tidak perlu login)
// ===============================================

// POST /api/cart/add
// (Menambahkan item ke keranjang)
router.post(
  '/add',
  validateAddToCart,
  cartController.addToCart
);

// GET /api/cart/:cartSessionId
// (Mendapatkan semua item di keranjang)
router.get(
  '/:cartSessionId',
  cartController.getCartItems
);

// GET /api/cart/summary/:cartSessionId
// (Mendapatkan ringkasan keranjang)
router.get(
  '/summary/:cartSessionId',
  cartController.getCartSummary
);

// PUT /api/cart/update/:keranjangItemId
// (Update jumlah item di keranjang)
router.put(
  '/update/:keranjangItemId',
  validateUpdateQuantity,
  cartController.updateCartItem
);

// DELETE /api/cart/remove/:keranjangItemId
// (Hapus item dari keranjang)
router.delete(
  '/remove/:keranjangItemId',
  cartController.removeCartItem
);

// DELETE /api/cart/clear/:cartSessionId
// (Hapus semua item di keranjang)
router.delete(
  '/clear/:cartSessionId',
  cartController.clearCart
);

module.exports = router;