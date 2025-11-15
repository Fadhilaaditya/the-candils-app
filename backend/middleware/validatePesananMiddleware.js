/**
 * Middleware untuk validasi data pesanan
 */

const validateCreatePesanan = (req, res, next) => {
  const { lokasiId, namaPelanggan, items, alamatPengiriman, kontakPelanggan } = req.body;

  // Validasi field utama
  if (!lokasiId || !namaPelanggan || !items || items.length === 0 || !alamatPengiriman || !kontakPelanggan) {
    return res.status(400).json({ 
      message: 'Data pesanan tidak lengkap. Pastikan semua field terisi (lokasiId, namaPelanggan, items, alamatPengiriman, kontakPelanggan).' 
    });
  }

  // Validasi setiap item
  for (let item of items) {
    if (!item.ukuranId || !item.produkId || !item.quantity || item.subtotal === undefined) {
      return res.status(400).json({ 
        message: 'Setiap item harus memiliki ukuranId, produkId, quantity, dan subtotal' 
      });
    }

    // Validasi tipe data
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ 
        message: 'Quantity harus berupa angka positif' 
      });
    }

    if (typeof item.subtotal !== 'number' || item.subtotal < 0) {
      return res.status(400).json({ 
        message: 'Subtotal harus berupa angka non-negatif' 
      });
    }
  }

  next();
};

const validateUpdateStatus = (req, res, next) => {
  const { statusPesanan } = req.body;

  if (!statusPesanan) {
    return res.status(400).json({ message: 'Status pesanan diperlukan' });
  }

  // Validasi nilai status (sesuaikan dengan ENUM di database)
  const validStatus = ['Perlu Validasi', 'Perlu Dikirim', 'Dikirim', 'Selesai', 'Dibatalkan'];
  if (!validStatus.includes(statusPesanan)) {
    return res.status(400).json({ 
      message: `Status tidak valid. Status harus salah satu dari: ${validStatus.join(', ')}` 
    });
  }

  next();
};

const validateUpdateLokasi = (req, res, next) => {
  const { lokasiId } = req.body;

  if (!lokasiId) {
    return res.status(400).json({ message: 'lokasiId diperlukan' });
  }

  if (typeof lokasiId !== 'number' || lokasiId <= 0) {
    return res.status(400).json({ message: 'lokasiId harus berupa angka positif' });
  }

  next();
};

module.exports = {
  validateCreatePesanan,
  validateUpdateStatus,
  validateUpdateLokasi
};