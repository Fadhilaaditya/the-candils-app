const db = require('../config/db');

// [BARU] Impor dan konfigurasikan Cloudinary
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});


/**
 * @desc    Mengambil semua data lokasi
 */
const getAllLokasi = async (req, res) => {
  try {
    const [lokasi] = await db.query(
      'SELECT lokasiId as id, name FROM Lokasi'
    );
    res.json(lokasi);
  } catch (err) {
    console.error('Error mengambil lokasi:', err.message);
    res.status(500).json({ message: 'Error mengambil lokasi', error: err.message });
  }
};

/**
 * @desc    Mengambil semua data ukuran
 */
const getAllUkuran = async (req, res) => {
  try {
    const [ukuran] = await db.query(
      'SELECT ukuranId, namaUkuran, hargaTambahan, produkId FROM Ukuran ORDER BY ukuranId'
    );
    res.json(ukuran);
  } catch (err) {
    console.error('Error mengambil ukuran:', err.message);
    res.status(500).json({ message: 'Error mengambil ukuran', error: err.message });
  }
};

/**
 * @desc    Mengambil semua data produk
 */
const getAllProduk = async (req, res) => {
  try {
    // ✅ FIX: Pilih hargaUnit tanpa alias SQL
    const [produkResult] = await db.query(
      'SELECT produkId, namaProduk, hargaUnit FROM Produk ORDER BY namaProduk'
    );

    // ✅ MAPPING JAVASCRIPT: Ubah nama kolom hargaUnit menjadi harga agar sesuai frontend
    const produk = produkResult.map(p => ({
        produkId: p.produkId,
        namaProduk: p.namaProduk,
        harga: p.hargaUnit // Mapping dilakukan di sini
    }));

    res.json(produk);
  } catch (err) {
    // 🛑 LOGGING KRITIS
    console.log('----------------------------------------------------');
    console.error('SERVER ERROR: Gagal memuat Produk Master.');
    console.error('Detail Error:', err);
    console.error('Pesan Error:', err.message);
    console.log('----------------------------------------------------');

    res.status(500).json({ message: 'Error mengambil produk', error: err.message });
  }
};

/**
 * @desc    Mengambil daftar semua pesanan (ringkasan)
 */
const getAllPesanan = async (req, res) => {
  try {
    const [pesanan] = await db.query(
      `SELECT
         pesananId, lokasiId, namaPelanggan, tanggalPesanan,
         statusPesanan, totalHarga, alamatPengiriman, kontakPelanggan,
         buktiPembayaranUrl, tipePesanan
       FROM Pemesanan
       ORDER BY tanggalPesanan DESC`
    );
    res.json(pesanan);
  } catch (err) {
    console.error('Error mengambil pesanan:', err.message);
    res.status(500).json({ message: 'Error mengambil pesanan', error: err.message });
  }
};

/**
 * @desc    Mengambil detail satu pesanan spesifik (beserta item-itemnya)
 */
const getPesananById = async (req, res) => {
  const { id } = req.params;

  try {
    const [pesananResult] = await db.query(
      'SELECT * FROM Pemesanan WHERE pesananId = ?',
      [id]
    );

    if (pesananResult.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    const pesanan = pesananResult[0];

    const [itemsResult] = await db.query(
      `SELECT
         dp.quantity,
         dp.subtotal,
         dp.ukuranId,
         dp.produkId,
         p.namaProduk as productName,
         p.hargaUnit as price,
         u.namaUkuran as ukuranName
       FROM DetailPemesanan dp
       LEFT JOIN Produk p ON dp.produkId = p.produkId
       LEFT JOIN Ukuran u ON dp.ukuranId = u.ukuranId
       WHERE dp.pesananId = ?`,
      [id]
    );

    pesanan.items = itemsResult;
    res.json(pesanan);
  } catch (err) {
    console.error('Error mengambil detail pesanan:', err.message);
    res.status(500).json({
      message: 'Error mengambil detail pesanan',
      error: err.message
    });
  }
};


/**
 * @desc    Membuat pesanan baru DAN upload bukti pembayaran (1 langkah)
 */
const createPesanan = async (req, res) => {
  const { lokasiId, namaPelanggan, items: itemsJSON, alamatPengiriman, kontakPelanggan } = req.body;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ success: false, message: 'Bukti pembayaran wajib di-upload.' });
  }
  if (!lokasiId || !namaPelanggan || !alamatPengiriman || !kontakPelanggan || !itemsJSON) {
    return res.status(400).json({ success: false, message: 'Data formulir tidak lengkap.' });
  }

  let items;
  try {
    items = JSON.parse(itemsJSON);
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Items harus berupa array yang tidak kosong.');
    }
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Format data items (JSON string) tidak valid.' });
  }

  const totalHarga = items.reduce((total, item) => total + item.subtotal, 0);

  const parsedLokasiId = Number(lokasiId);

  const statusAwal = 'Perlu Validasi';
  const tipePesanan = 'Online'; // ✅ NILAI BARU UNTUK PESANAN ONLINE

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const queryPemesanan = `
      INSERT INTO Pemesanan (
        lokasiId, namaPelanggan, tanggalPesanan, statusPesanan,
        totalHarga, alamatPengiriman, kontakPelanggan, buktiPembayaranUrl, tipePesanan
      )
      VALUES (?, ?, NOW(), ?, ?, ?, ?, NULL, ?)
    `;

    const [orderResult] = await connection.execute(queryPemesanan, [
      parsedLokasiId,
      namaPelanggan,
      statusAwal,
      totalHarga,
      alamatPengiriman,
      kontakPelanggan,
      tipePesanan // ✅ MASUKKAN NILAI
    ]);

    const newPesananId = orderResult.insertId;

    // Masukkan detail item (tidak berubah)
    const queryDetail = `
      INSERT INTO DetailPemesanan (pesananId, ukuranId, produkId, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const itemPromises = items.map(item => {
      return connection.execute(queryDetail, [
        newPesananId,
        item.ukuranId,
        item.produkId,
        item.quantity,
        item.subtotal
      ]);
    });
    await Promise.all(itemPromises);

    // Upload file ke Cloudinary (tidak berubah)
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "bukti_pembayaran",
          public_id: `pesanan_${newPesananId}_${Date.now()}`
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    const cdnUrl = uploadResult.secure_url;
    if (!cdnUrl) {
      throw new Error('Gagal mendapatkan URL dari Cloudinary');
    }

    // [PERBAIKAN]: Update kolom 'buktiPembayaranUrl'
    await connection.query(
      'UPDATE Pemesanan SET buktiPembayaranUrl = ? WHERE pesananId = ?',
      [cdnUrl, newPesananId]
    );

    await connection.commit();

    res.status(201).json({
      message: 'Pesanan berhasil dibuat!',
      pesananId: newPesananId,
      buktiUrl: cdnUrl
    });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error membuat pesanan (1-step):', err.message);
    res.status(500).json({ success: false, message: 'Error server saat membuat pesanan', error: err.message });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * @desc    Membuat pesanan baru untuk laporan offline (JSON Body)
 */
const createPesananOffline = async (req, res) => {
  const { lokasiId, namaPelanggan, kontakPelanggan, totalHarga, items } = req.body;

  const statusAwal = 'Selesai';
  const tipePesanan = 'Offline'; // ✅ NILAI BARU UNTUK PESANAN OFFLINE

  const parsedLokasiId = lokasiId === null ? null : Number(lokasiId);

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. INSERT ke tabel Pemesanan
    const queryPemesanan = `
      INSERT INTO Pemesanan (
        lokasiId, namaPelanggan, tanggalPesanan, statusPesanan,
        totalHarga, kontakPelanggan, tipePesanan
      )
      VALUES (?, ?, NOW(), ?, ?, ?, ?, ?)
    `;

    const [orderResult] = await connection.execute(queryPemesanan, [
      parsedLokasiId,
      namaPelanggan,
      statusAwal,
      totalHarga,
      kontakPelanggan,
      tipePesanan
    ]);

    const newPesananId = orderResult.insertId;

    // 2. INSERT ke tabel DetailPemesanan
    const queryDetail = `
      INSERT INTO DetailPemesanan (pesananId, ukuranId, produkId, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;

    const itemPromises = items.map(item => {
      return connection.execute(queryDetail, [
        newPesananId,
        item.ukuranId,
        item.produkId,
        item.quantity,
        item.subtotal
      ]);
    });

    await Promise.all(itemPromises);

    await connection.commit();

    res.status(201).json({
      message: 'Pesanan offline berhasil dibuat!',
      pesananId: newPesananId
    });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error membuat pesanan offline (DB Transaction):', err);
    res.status(500).json({ success: false, message: 'Error server saat membuat pesanan offline', error: err.message });

  } finally {
    if (connection) {
      connection.release();
    }
  }
};


// pesananController.js

/**
 * @desc    Update status pesanan
 */
const updateStatusPesanan = async (req, res) => {
  const { id } = req.params;
  const { statusPesanan } = req.body;

  try {
    // 1. Cek status saat ini
    const [currentStatusResult] = await db.query(
      'SELECT statusPesanan FROM Pemesanan WHERE pesananId = ?',
      [id]
    );

    if (currentStatusResult.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    const currentStatus = currentStatusResult[0].statusPesanan;

    // ✅ CHECK: Jika sudah Selesai atau Dibatalkan, tolak update status
    if (currentStatus === 'Selesai' || currentStatus === 'Dibatalkan') {
      return res.status(400).json({ 
        message: `Status pesanan #${id} tidak dapat diubah karena status saat ini adalah ${currentStatus}.` 
      });
    }
    
    // 2. Lakukan Update Status
    const [updateResult] = await db.query(
      'UPDATE Pemesanan SET statusPesanan = ? WHERE pesananId = ?',
      [statusPesanan, id]
    );

    // ... (rest of the code)
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    res.json({
      message: `Status pesanan #${id} diperbarui ke ${statusPesanan}`,
      pesananId: id,
      newStatus: statusPesanan
    });
  } catch (err) {
    console.error('Error update status:', err.message);
    res.status(500).json({ message: 'Error update status', error: err.message });
  }
};

// pesananController.js

/**
 * @desc    Update lokasi pesanan
 */
const updateLokasiPesanan = async (req, res) => {
  const { id } = req.params;
  const { lokasiId } = req.body;

  try {
    // 1. Cek status saat ini
    const [currentStatusResult] = await db.query(
      'SELECT statusPesanan FROM Pemesanan WHERE pesananId = ?',
      [id]
    );

    if (currentStatusResult.length === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    
    const currentStatus = currentStatusResult[0].statusPesanan;
    
    // ✅ CHECK: Jika sudah Selesai atau Dibatalkan, tolak update lokasi
    if (currentStatus === 'Selesai' || currentStatus === 'Dibatalkan') {
      return res.status(400).json({ 
        message: `Lokasi pesanan #${id} tidak dapat diubah karena status saat ini adalah ${currentStatus}.` 
      });
    }

    // 2. Lakukan Update Lokasi
    const [updateResult] = await db.query(
      'UPDATE Pemesanan SET lokasiId = ? WHERE pesananId = ?',
      [lokasiId, id]
    );

    // ... (rest of the code)
    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }
    res.json({
      message: `Lokasi pesanan #${id} diperbarui`,
      pesananId: id,
      newLokasiId: lokasiId
    });
  } catch (err) {
    console.error('Error update lokasi:', err.message);
    res.status(500).json({ message: 'Error update lokasi', error: err.message });
  }
};

/**
 * @desc    Hapus pesanan (Opsional - jika diperlukan)
 */
const deletePesanan = async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    await connection.query('DELETE FROM DetailPemesanan WHERE pesananId = ?', [id]);
    const [deleteResult] = await connection.query('DELETE FROM Pemesanan WHERE pesananId = ?', [id]);

    if (deleteResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    await connection.commit();
    res.json({ message: `Pesanan #${id} berhasil dihapus` });

  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error menghapus pesanan:', err.message);
    res.status(500).json({ message: 'Error menghapus pesanan', error: err.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  getAllLokasi,
  getAllUkuran,
  getAllProduk,
  getAllPesanan,
  getPesananById,
  createPesanan,
  updateStatusPesanan,
  updateLokasiPesanan,
  deletePesanan,
  createPesananOffline
};
