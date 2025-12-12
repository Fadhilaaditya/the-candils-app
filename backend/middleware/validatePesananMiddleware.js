/**
 * Middleware untuk validasi data pesanan
 */

const validateCreatePesanan = (req, res, next) => {
  // Catatan: Ini adalah validasi untuk endpoint /pesanan (FormData + File Upload)

  const { lokasiId, namaPelanggan, items: itemsJSON, alamatPengiriman, kontakPelanggan } = req.body;

  // 1. Validasi field utama (string)
  if (!lokasiId || !namaPelanggan || !itemsJSON || !alamatPengiriman || !kontakPelanggan) {
    return res.status(400).json({
      message: 'Data pesanan tidak lengkap. Pastikan semua field terisi.'
    });
  }

  // 1b. Validasi dan konversi lokasiId (dari string FormData ke number)
  const numericLokasiId = Number(lokasiId);

  if (isNaN(numericLokasiId) || numericLokasiId <= 0) {
    return res.status(400).json({ message: 'lokasiId harus berupa angka positif' });
  }

  // Simpan nilai numerik kembali ke req.body untuk digunakan di controller
  req.body.lokasiId = numericLokasiId;

  let items;
  try {
      // 2. Parsing items (karena dikirim sebagai JSON string dalam FormData)
      items = JSON.parse(itemsJSON);
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('Items harus berupa array yang tidak kosong.');
      }
  } catch (e) {
      return res.status(400).json({ message: 'Format data items (JSON string) tidak valid.' });
  }


  // 3. Validasi setiap item
  for (let item of items) {
    if (item.produkId === undefined || item.quantity === undefined || item.subtotal === undefined) {
      return res.status(400).json({
        message: 'Setiap item harus memiliki produkId, quantity, dan subtotal'
      });
    }

    // Validasi tipe data
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      return res.status(400).json({ message: 'Quantity harus berupa angka positif' });
    }

    if (typeof item.subtotal !== 'number' || item.subtotal < 0) {
      return res.status(400).json({ message: 'Subtotal harus berupa angka non-negatif' });
    }
  }

  next();
};


/**
 * Middleware untuk validasi pembuatan pesanan OFFLINE (JSON Body)
 * Endpoint: POST /api/pesanan/offline
 */
const validateCreatePesananOffline = (req, res, next) => {
    // Data diterima sebagai objek JSON (req.body)
    const { lokasiId, namaPelanggan, items, alamatPengiriman, kontakPelanggan } = req.body;

    // 1. Validasi field utama (kontak & alamat opsional untuk offline)
    if (!namaPelanggan || !items || items.length === 0) {
        return res.status(400).json({
            message: 'Data pesanan offline tidak lengkap. Pastikan semua field wajib terisi.'
        });
    }

    // 1b. Validasi LokasiId (opsional/null diperbolehkan, tapi jika ada harus valid)
    if (lokasiId !== null && lokasiId !== undefined) {
        const numericLokasiId = Number(lokasiId);
        if (isNaN(numericLokasiId) || numericLokasiId <= 0) {
             return res.status(400).json({ message: 'lokasiId harus berupa null atau angka positif' });
        }
    }


    // 2. Validasi setiap item
    for (let item of items) {
        // Karena ini JSON, kita hanya perlu memastikan field kunci ada
        if (item.produkId === undefined || item.quantity === undefined || item.subtotal === undefined) {
            return res.status(400).json({
                message: 'Setiap item harus memiliki produkId, quantity, dan subtotal'
            });
        }

        // 3. Validasi tipe data (karena ini JSON, tipe data harusnya sudah benar)
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            return res.status(400).json({ message: 'Quantity harus berupa angka positif' });
        }

        if (typeof item.subtotal !== 'number' || item.subtotal < 0) {
            return res.status(400).json({ message: 'Subtotal harus berupa angka non-negatif' });
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

  // Perlu diperhatikan: lokasiId dikirim sebagai string dari frontend,
  // tetapi harus divalidasi sebagai angka positif.
  if (typeof lokasiId !== 'number' && typeof lokasiId !== 'string') {
      return res.status(400).json({ message: 'lokasiId harus berupa angka' });
  }

  const numericLokasiId = Number(lokasiId);

  if (isNaN(numericLokasiId) || numericLokasiId <= 0) {
    return res.status(400).json({ message: 'lokasiId harus berupa angka positif' });
  }

  // Optional: Anda bisa memasukkan nilai numerik ke req.body untuk controller
  req.body.lokasiId = numericLokasiId;

  next();
};

module.exports = {
  validateCreatePesanan,
  validateCreatePesananOffline,
  validateUpdateStatus,
  validateUpdateLokasi
};
