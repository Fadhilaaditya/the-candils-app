// ===============================================
// FILE: middleware/validateCartMiddleware.js
// ===============================================

/**
 * Validate add to cart request
 */
exports.validateAddToCart = (req, res, next) => {
  const { cartSessionId, produkId, jumlah } = req.body;

  // Validasi cartSessionId
  if (!cartSessionId || typeof cartSessionId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'cartSessionId harus diisi dan berupa string'
    });
  }

  // Validasi produkId
  if (!produkId || typeof produkId !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'produkId harus diisi dan berupa angka'
    });
  }

  // Validasi jumlah (optional, default 1)
  if (jumlah !== undefined) {
    if (typeof jumlah !== 'number' || jumlah < 1) {
      return res.status(400).json({
        success: false,
        message: 'jumlah harus berupa angka dan minimal 1'
      });
    }
  }

  next();
};

/**
 * Validate update quantity request
 */
exports.validateUpdateQuantity = (req, res, next) => {
  const { jumlah } = req.body;
  const { keranjangItemId } = req.params;

  // Validasi keranjangItemId
  if (!keranjangItemId || isNaN(keranjangItemId)) {
    return res.status(400).json({
      success: false,
      message: 'keranjangItemId harus berupa angka'
    });
  }

  // Validasi jumlah
  if (!jumlah || typeof jumlah !== 'number' || jumlah < 1) {
    return res.status(400).json({
      success: false,
      message: 'jumlah harus diisi, berupa angka, dan minimal 1'
    });
  }

  next();
};