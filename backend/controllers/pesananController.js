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
 * (Fungsi tidak berubah)
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
 * (Fungsi tidak berubah)
 */
const getAllUkuran = async (req, res) => {
  try {
    const [ukuran] = await db.query(
      'SELECT ukuranId, namaUkuran FROM Ukuran ORDER BY ukuranId'
    );
    res.json(ukuran);
  } catch (err) {
    console.error('Error mengambil ukuran:', err.message);
    res.status(500).json({ message: 'Error mengambil ukuran', error: err.message });
  }
};

/**
 * @desc    Mengambil semua data produk
 * (Fungsi tidak berubah)
 */
const getAllProduk = async (req, res) => {
  try {
    const [produk] = await db.query(
      'SELECT produkId, namaProduk, harga FROM Produk ORDER BY namaProduk'
    );
    res.json(produk);
  } catch (err) {
    console.error('Error mengambil produk:', err.message);
    res.status(500).json({ message: 'Error mengambil produk', error: err.message });
  }
};

/**
 * @desc    Mengambil daftar semua pesanan (ringkasan)
 * [PERBAIKAN]: Menggunakan 'buktiPembayaranUrl'
 */
const getAllPesanan = async (req, res) => {
  try {
    const [pesanan] = await db.query(
      `SELECT 
         pesananId, lokasiId, namaPelanggan, tanggalPesanan, 
         statusPesanan, totalHarga, alamatPengiriman, kontakPelanggan, 
         buktiPembayaranUrl 
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
 * (Fungsi tidak berubah)
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
 * [PERBAIKAN]: Menggunakan 'buktiPembayaranUrl'
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

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // [PERBAIKAN]: Menggunakan 'buktiPembayaranUrl'
    const queryPemesanan = `
      INSERT INTO Pemesanan (
        lokasiId, namaPelanggan, tanggalPesanan, statusPesanan, 
        totalHarga, alamatPengiriman, kontakPelanggan, buktiPembayaranUrl
      ) 
      VALUES (?, ?, NOW(), ?, ?, ?, ?, NULL) -- Insert NULL untuk buktiPembayaranUrl
    `;
    
    const statusAwal = 'Perlu Validasi'; 

    const [orderResult] = await connection.execute(queryPemesanan, [
      lokasiId,
      namaPelanggan,
      statusAwal,
      totalHarga,
      alamatPengiriman,
      kontakPelanggan
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
 * @desc    Update status pesanan
 * (Fungsi tidak berubah)
 */
const updateStatusPesanan = async (req, res) => {
  const { id } = req.params;
  const { statusPesanan } = req.body;

  try {
    const [updateResult] = await db.query(
      'UPDATE Pemesanan SET statusPesanan = ? WHERE pesananId = ?',
      [statusPesanan, id]
    );

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

/**
 * @desc    Update lokasi pesanan
 * (Fungsi tidak berubah)
 */
const updateLokasiPesanan = async (req, res) => {
  const { id } = req.params;
  const { lokasiId } = req.body;

  try {
    const [updateResult] = await db.query(
      'UPDATE Pemesanan SET lokasiId = ? WHERE pesananId = ?',
      [lokasiId, id]
    );

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
 * (Fungsi tidak berubah)
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
  deletePesanan
};

