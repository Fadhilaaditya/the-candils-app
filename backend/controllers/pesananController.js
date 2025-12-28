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
 * @desc    Mengambil semua data ongkir
 */
const getAllOngkir = async (req, res) => {
  try {
    const [ongkir] = await db.query(
      'SELECT * FROM Ongkir ORDER BY ongkirId'
    );
    res.json(ongkir);
  } catch (err) {
    console.error('Error mengambil ongkir:', err.message);
    res.status(500).json({ message: 'Error mengambil ongkir', error: err.message });
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
    const { startDate, endDate, tipePesanan } = req.query;
    let query = `SELECT
         pesananId, lokasiId, namaPelanggan, tanggalPesanan,
         statusPesanan, totalHarga, alamatPengiriman, kontakPelanggan,
         buktiPembayaranUrl, tipePesanan, ongkirId, biayaOngkir as biayaPemesanan
       FROM Pemesanan`;
    
    const conditions = [];
    const params = [];

    if (startDate && endDate) {
      conditions.push(`DATE(tanggalPesanan) BETWEEN ? AND ?`);
      params.push(startDate, endDate);
    }

    if (tipePesanan && tipePesanan !== 'all') {
      conditions.push(`tipePesanan = ?`);
      params.push(tipePesanan);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY tanggalPesanan DESC`;

    const [pesanan] = await db.query(query, params);
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
      `SELECT 
        p.*, 
        p.biayaOngkir as biayaPemesanan,
        o.nama as namaOngkir 
       FROM Pemesanan p
       LEFT JOIN Ongkir o ON p.ongkirId = o.ongkirId
       WHERE p.pesananId = ?`,
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
  const { lokasiId, namaPelanggan, items: itemsJSON, alamatPengiriman, kontakPelanggan, ongkirId, biayaOngkir } = req.body;
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
  const parsedOngkirId = ongkirId ? Number(ongkirId) : null;
  const parsedBiayaOngkir = biayaOngkir ? Number(biayaOngkir) : 0;

  // Total harga di database harusnya Grand Total (Item + Ongkir) atau Subtotal?
  // Biasanya TotalHarga = Subtotal + Ongkir. 
  // Asumsi: Frontend mengirim totalHarga yang sudah termasuk ongkir, atau kita hitung ulang di sini?
  // Untuk aman, kita gunakan total dari item + biaya ongkir.
  const grandTotal = totalHarga + parsedBiayaOngkir;

  const statusAwal = 'Perlu Validasi';
  const tipePesanan = 'Online'; // ✅ NILAI BARU UNTUK PESANAN ONLINE

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const queryPemesanan = `
      INSERT INTO Pemesanan (
        lokasiId, namaPelanggan, tanggalPesanan, statusPesanan,
        totalHarga, alamatPengiriman, kontakPelanggan, buktiPembayaranUrl, tipePesanan,
        ongkirId, biayaOngkir
      )
      VALUES (?, ?, NOW(), ?, ?, ?, ?, NULL, ?, ?, ?)
    `;

    const [orderResult] = await connection.execute(queryPemesanan, [
      parsedLokasiId,
      namaPelanggan,
      statusAwal,
      grandTotal, // Gunakan Grand Total
      alamatPengiriman,
      kontakPelanggan,
      tipePesanan,
      parsedOngkirId,
      parsedBiayaOngkir
    ]);

    const newPesananId = orderResult.insertId;

    // Masukkan detail item (tidak berubah)
    const queryDetail = `
      INSERT INTO DetailPemesanan (pesananId, ukuranId, produkId, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // Gunakan for...of loop agar bisa await dan throw error dengan bersih
    for (const item of items) {
      // 1. Insert Detail Pesanan
      await connection.execute(queryDetail, [
        newPesananId,
        item.ukuranId,
        item.produkId,
        item.quantity,
        item.subtotal
      ]);

      // 2. 🛑 KURANGI STOK PRODUK
      const [stockResult] = await connection.query(
        'UPDATE Produk SET stok = stok - ? WHERE produkId = ? AND stok >= ?',
        [item.quantity, item.produkId, item.quantity]
      );

      if (stockResult.affectedRows === 0) {
        throw new Error(`Stok tidak mencukupi untuk produk ID ${item.produkId}`);
      }
    }
    // Hapus Promise.all lama karena sudah diganti loop
    // await Promise.all(itemPromises);

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
  const { lokasiId, namaPelanggan, kontakPelanggan, totalHarga, items, tanggalPesanan } = req.body;

  // Pastikan kontakPelanggan '-' jika tidak ada/kosong (karena DB NOT NULL)
  const finalKontak = kontakPelanggan || '-';

  const statusAwal = 'Selesai';
  const tipePesanan = 'Offline'; // ✅ NILAI BARU UNTUK PESANAN OFFLINE

  const parsedLokasiId = lokasiId === null ? null : Number(lokasiId);

  // Use provided date or default to NOW()
  // Ensure we handle the date string safely if passing directly to SQL, 
  // but parameterized query (?) handles escaping.
  // We can use IFNULL logic in SQL or ternary here.
  const finalTanggal = tanggalPesanan ? new Date(tanggalPesanan) : new Date();

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. INSERT ke tabel Pemesanan
    const queryPemesanan = `
      INSERT INTO Pemesanan (
        lokasiId, namaPelanggan, tanggalPesanan, statusPesanan,
        totalHarga, kontakPelanggan, tipePesanan, alamatPengiriman
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [orderResult] = await connection.execute(queryPemesanan, [
      parsedLokasiId,
      namaPelanggan,
      finalTanggal,
      statusAwal,
      totalHarga,
      finalKontak,
      tipePesanan,
      '-' // Default alamatPengiriman untuk pesanan offline
    ]);

    const newPesananId = orderResult.insertId;

    // 2. INSERT ke tabel DetailPemesanan
    const queryDetail = `
      INSERT INTO DetailPemesanan (pesananId, ukuranId, produkId, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `;

    // Gunakan for...of loop
    for (const item of items) {
      // 1. Insert Detail
      await connection.execute(queryDetail, [
        newPesananId,
        item.ukuranId,
        item.produkId,
        item.quantity,
        item.subtotal
      ]);

      // 2. 🛑 KURANGI STOK
      const [stockResult] = await connection.query(
        'UPDATE Produk SET stok = stok - ? WHERE produkId = ? AND stok >= ?',
        [item.quantity, item.produkId, item.quantity]
      );

      if (stockResult.affectedRows === 0) {
        throw new Error(`Stok tidak mencukupi untuk produk ID ${item.produkId}`);
      }
    }
    
    // Hapus Promise.all lama
    // await Promise.all(itemPromises);

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

const whatsappService = require('../services/whatsappService'); // Import Service

/**
 * @desc    Update status pesanan
 */
// pesananController.js
const updateStatusPesanan = async (req, res) => {
  const { id } = req.params;
  const { statusPesanan, alasanPembatalan } = req.body; // [UPDATED] Extract alasanPembatalan

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

    if (updateResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Pesanan tidak ditemukan' });
    }

    // 🚀 [BARU] Kirim Notifikasi WhatsApp jika status berubah jadi "Perlu Dikirim"
    if (statusPesanan === 'Perlu Dikirim') {
      try {
        // Ambil detail lengkap pesanan untuk pesan WA
        const [orderDetails] = await db.query(
          `SELECT 
            p.pesananId, p.namaPelanggan, p.kontakPelanggan, p.totalHarga, p.alamatPengiriman
           FROM Pemesanan p 
           WHERE p.pesananId = ?`,
          [id]
        );

        if (orderDetails.length > 0) {
          const order = orderDetails[0];
          
          // Ambil items
          const [items] = await db.query(
            `SELECT 
               pr.namaProduk, u.namaUkuran, dp.quantity, dp.subtotal
             FROM DetailPemesanan dp
             JOIN Produk pr ON dp.produkId = pr.produkId
             LEFT JOIN Ukuran u ON dp.ukuranId = u.ukuranId
             WHERE dp.pesananId = ?`,
            [id]
          );
          
          order.items = items;

          // Kirim WA (Await agar tidak ter-kill oleh Vercel serverless)
          await whatsappService.sendOrderConfirmation(order.kontakPelanggan, order);
        }
      } catch (waError) {
        console.error('⚠️ Gagal memproses notifikasi WA:', waError.message);
        // Lanjut saja, jangan gagalkan response API
      }
    }

    // 🚚 [BARU] Kirim Notifikasi WhatsApp jika status berubah jadi "Dikirim"
    if (statusPesanan === 'Dikirim') {
      try {
        const [orderDetails] = await db.query(
          `SELECT pesananId, namaPelanggan, kontakPelanggan, alamatPengiriman FROM Pemesanan WHERE pesananId = ?`,
          [id]
        );

        if (orderDetails.length > 0) {
          const order = orderDetails[0];
          order.trackingInfo = req.body.trackingInfo; // [NEW] Attach tracking info
          await whatsappService.sendOrderShipped(order.kontakPelanggan, order);
        }
      } catch (waError) {
        console.error('⚠️ Gagal memproses notifikasi WA (Dikirim):', waError.message);
      }
    }

    // ✅ [BARU] Kirim Notifikasi WhatsApp jika status berubah jadi "Selesai"
    if (statusPesanan === 'Selesai') {
      try {
        const [orderDetails] = await db.query(
          `SELECT pesananId, namaPelanggan, kontakPelanggan FROM Pemesanan WHERE pesananId = ?`,
          [id]
        );

        if (orderDetails.length > 0) {
          const order = orderDetails[0];

          // Fetch items for review links
          const [items] = await db.query(
             `SELECT dp.produkId, pr.namaProduk FROM DetailPemesanan dp JOIN Produk pr ON dp.produkId = pr.produkId WHERE dp.pesananId = ?`,
             [id]
          );
          order.items = items;

          await whatsappService.sendOrderCompleted(order.kontakPelanggan, order);
        }
      } catch (waError) {
        console.error('⚠️ Gagal memproses notifikasi WA (Selesai):', waError.message);
      }
    }

    // ❌ [BARU] Kirim Notifikasi WhatsApp jika status berubah jadi "Dibatalkan"
    if (statusPesanan === 'Dibatalkan') {
      try {
        const [orderDetails] = await db.query(
          `SELECT pesananId, namaPelanggan, kontakPelanggan FROM Pemesanan WHERE pesananId = ?`,
          [id]
        );

        if (orderDetails.length > 0) {
          const order = orderDetails[0];
          order.alasan = alasanPembatalan; // [UPDATED] Inject alasan to order object
          await whatsappService.sendOrderCancelled(order.kontakPelanggan, order);
        }
      } catch (waError) {
        console.error('⚠️ Gagal memproses notifikasi WA (Dibatalkan):', waError.message);
      }
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
  createPesananOffline,
  getAllOngkir
};
