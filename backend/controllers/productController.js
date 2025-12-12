const db = require('../config/db')
const cloudinary = require('cloudinary').v2 // 1. Impor Cloudinary

// Pastikan Anda telah mengkonfigurasi Cloudinary di file konfigurasi utama
// Contoh konfigurasi (biasanya di server.js atau config file):
// cloudinary.config({
//   cloud_name: 'YOUR_CLOUD_NAME',
//   api_key: 'YOUR_API_KEY',
//   api_secret: 'YOUR_API_SECRET'
// });


// --- FUNGSI BARU (getProductIdList - tetap sama) ---
exports.getProductIdList = async (req, res) => {
  try {
    const [idList] = await db.query('SELECT produkId FROM Produk ORDER BY produkId ASC')
    const ids = idList.map((item) => item.produkId)
    res.json(ids)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

// @route   GET /api/products
// @desc    Mendapatkan semua produk/varian DENGAN RATING RATA-RATA (Publik)
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 1. Query Data dengan Pagination
    const query = `
      SELECT
        P.produkId, P.namaProduk, P.deskripsi, P.stok,
        P.foto,
        P.hargaUnit,
        U.ukuranId,
        U.namaUkuran,
        U.hargaTambahan,
        COALESCE(AVG(R.rating), 0) as averageRating,
        COUNT(DISTINCT R.ulasanId) as reviewCount,
        P.is_active
      FROM
        Produk P
      LEFT JOIN
        Ukuran U ON P.produkId = U.produkId
      LEFT JOIN
        Ulasan R ON P.produkId = R.produkId
      WHERE
        (P.is_active = 1 OR ? = 'true')
      GROUP BY
        P.produkId, U.ukuranId
      ORDER BY
        P.produkId ASC, U.ukuranId ASC
      LIMIT ? OFFSET ?;
    `
    const showAll = req.query.show_all || 'false';
    const [productsWithVariantsAndRating] = await db.query(query, [showAll, limit, offset])

    const result = productsWithVariantsAndRating.map((item) => ({
      ...item,
      averageRating: parseFloat(item.averageRating || 0),
      reviewCount: parseInt(item.reviewCount || 0, 10),
      is_active: item.is_active === 1
    }))

    // 2. Query Total Data (untuk Metadata Pagination)
    // Note: Karena kita group by variant (produkId, ukuranId), count harus sesuai.
    // Query ini menghitung total baris yang akan dihasilkan jika tanpa LIMIT.
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT P.produkId 
        FROM Produk P 
        LEFT JOIN Ukuran U ON P.produkId = U.produkId 
        GROUP BY P.produkId, U.ukuranId
      ) as subquery
    `;
    const [countResult] = await db.query(countQuery, [showAll]);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: result,
      meta: {
        page,
        limit,
        totalItems,
        totalPages
      }
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

// @route   GET /api/products/:id
// @desc    Mendapatkan detail satu produk dengan semua varian
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params
    const [products] = await db.query(
      'SELECT produkId, namaProduk, deskripsi, stok, foto, hargaUnit FROM Produk WHERE produkId = ?',
      [id]
    )
    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }
    const product = products[0]
    const [ukurans] = await db.query('SELECT * FROM Ukuran WHERE produkId = ?', [id])
    const response = { ...product, ukurans: ukurans }
    res.json(response)
  } catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
}

// @route   GET /api/products/best-seller
// @desc    Mendapatkan 3 produk TERLARIS (berdasarkan quantity terjual dari pesanan 'Selesai')
exports.getBestSellerProducts = async (req, res) => {
  try {
    // Query untuk mengambil top 3 produk terlaris
    // Kita perlu join Produk -> DetailPemesanan -> Pemesanan
    // Hanya hitung pesanan dengan status 'Selesai'
    // Dan produk harus 'is_active' = 1
    const query = `
      SELECT 
        P.produkId, P.namaProduk, P.deskripsi, P.stok, P.foto, P.hargaUnit,
        COALESCE(SUM(DP.quantity), 0) as totalSold,
        COALESCE(AVG(R.rating), 0) as averageRating,
        COUNT(DISTINCT R.ulasanId) as reviewCount
      FROM Produk P
      LEFT JOIN DetailPemesanan DP ON P.produkId = DP.produkId
      LEFT JOIN Pemesanan PM ON DP.pesananId = PM.pesananId AND PM.statusPesanan = 'Selesai'
      LEFT JOIN Ulasan R ON P.produkId = R.produkId
      WHERE P.is_active = 1
      GROUP BY P.produkId
      ORDER BY totalSold DESC, P.namaProduk ASC
      LIMIT 3;
    `;

    const [bestSellers] = await db.query(query);

    // Kita juga perlu detail ukuran untuk setiap produk ini agar kompatibel dengan frontend
    // Namun untuk tampilan card sederhana, mungkin tidak wajib semua ukuran, 
    // tapi frontend ProductCard mengharapkan array variants/ukuran jika ada.
    // Untuk simplifikasi, kita ambil ukuran dasar atau kosongkan dulu, 
    // karena ProductCard user biasanya menampilkan harga range atau harga unit.
    
    // Mari kita enrich data dengan ukuran agar tidak error di frontend
    const enrichedResults = await Promise.all(bestSellers.map(async (product) => {
       const [ukurans] = await db.query('SELECT * FROM Ukuran WHERE produkId = ?', [product.produkId]);
       return {
         ...product,
         ukurans: ukurans,
         averageRating: parseFloat(product.averageRating || 0),
         reviewCount: parseInt(product.reviewCount || 0, 10),
         totalSold: parseInt(product.totalSold || 0, 10)
       };
    }));

    res.json(enrichedResults);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


// @route   POST /api/products
// @desc    Membuat produk baru dengan upload gambar
exports.createProduct = async (req, res) => {
  const { namaProduk, deskripsi, stok, hargaUnit, ukuran: ukuranJSON } = req.body
  const foto = req.file // Berisi .buffer dari Multer memoryStorage

  console.log('Create Product Request:')
  console.log('Body:', req.body)
  // console.log('File:', foto) // Akan menampilkan buffer data, bukan path

  if (!foto) {
    return res.status(400).json({ message: 'File gambar (foto) wajib diisi' })
  }
  if (!namaProduk || !hargaUnit || !ukuranJSON) {
    return res.status(400).json({ message: 'Nama, harga, dan minimal 1 ukuran wajib diisi' })
  }

  let ukurans
  try {
    ukurans = JSON.parse(ukuranJSON)
    // console.log('Parsed ukurans:', ukurans)
  } catch (e) {
    console.error('JSON Parse Error:', e.message)
    return res.status(400).json({ message: 'Format data ukuran tidak valid (bukan JSON string)' })
  }

  if (!Array.isArray(ukurans) || ukurans.length === 0) {
    return res.status(400).json({ message: 'Minimal harus ada 1 ukuran' })
  }

  let fotoPath // Variabel baru untuk menyimpan URL Cloudinary
  let connection

  try {
    // ⭐️ LANGKAH BARU: Upload buffer file ke Cloudinary
    // 1. Konversi buffer menjadi Data URI
    const b64 = Buffer.from(foto.buffer).toString('base64');
    const dataUri = 'data:' + foto.mimetype + ';base64,' + b64;
    
    // 2. Upload ke Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'nama_folder_produk', // Ganti dengan nama folder Anda
      // public_id: `product-${Date.now()}` // Opsional
    });

    // 3. Ambil URL
    fotoPath = result.secure_url;
    // console.log('Cloudinary URL:', fotoPath)

    connection = await db.getConnection()
    await connection.beginTransaction()

    const [productResult] = await connection.query(
      'INSERT INTO Produk (namaProduk, deskripsi, stok, foto, hargaUnit) VALUES (?, ?, ?, ?, ?)',
      // Gunakan fotoPath dari Cloudinary
      [namaProduk, deskripsi || null, stok || 0, fotoPath, hargaUnit] 
    )
    const newProdukId = productResult.insertId

    for (const u of ukurans) {
      await connection.query(
        'INSERT INTO Ukuran (produkId, namaUkuran, hargaTambahan) VALUES (?, ?, ?)',
        [newProdukId, u.namaUkuran, u.hargaTambahan || 0]
      )
    }

    await connection.commit()
    res.status(201).json({
      message: 'Produk berhasil dibuat',
      produkId: newProdukId,
      fotoUrl: fotoPath,
    })
  } catch (err) {
    if (connection) await connection.rollback()
    console.error('Create Product Error:', err)
    // Optional: Tambahkan logic untuk menghapus gambar dari Cloudinary jika terjadi error DB
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
    })
  } finally {
    if (connection) connection.release()
  }
}

// @route   PUT /api/products/:id
// @desc    Update produk
exports.updateProduct = async (req, res) => {
  const { id } = req.params
  const { namaProduk, deskripsi, stok, hargaUnit, ukuran: ukuranJSON } = req.body
  const newFoto = req.file // Berisi .buffer jika ada file baru di-upload

  if (!namaProduk || !hargaUnit || !ukuranJSON) {
    return res.status(400).json({ message: 'Nama, harga, dan minimal 1 ukuran wajib diisi' })
  }

  let ukurans
  try {
    ukurans = JSON.parse(ukuranJSON)
  } catch (e) {
    return res.status(400).json({ message: 'Format data ukuran tidak valid' })
  }

  if (!Array.isArray(ukurans) || ukurans.length === 0) {
    return res.status(400).json({ message: 'Minimal harus ada 1 ukuran' })
  }

  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // 1. Check product exists and get old photo path
    const [oldProducts] = await connection.query('SELECT foto FROM Produk WHERE produkId = ?', [id])
    if (oldProducts.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }

    const oldFotoPath = oldProducts[0].foto
    let fotoPathUpdate = oldFotoPath

    // ⭐️ LANGKAH BARU: Jika foto baru di-upload, upload ke Cloudinary dan dapatkan URL
    if (newFoto) {
      // a. Upload file baru
      const b64 = Buffer.from(newFoto.buffer).toString('base64');
      const dataUri = 'data:' + newFoto.mimetype + ';base64,' + b64;
      
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: 'nama_folder_produk'
      });

      fotoPathUpdate = result.secure_url // Gunakan URL baru
      
      // b. (Opsional/TODO): Hapus gambar lama dari Cloudinary menggunakan `cloudinary.uploader.destroy()`
      // Anda perlu mengekstrak Public ID dari oldFotoPath untuk ini
    }

    // Update Produk table
    await connection.query(
      'UPDATE Produk SET namaProduk = ?, deskripsi = ?, stok = ?, foto = ?, hargaUnit = ? WHERE produkId = ?',
      // Gunakan fotoPathUpdate
      [namaProduk, deskripsi || null, stok || 0, fotoPathUpdate, hargaUnit, id]
    )

    // Get existing ukurans... (Lanjutan kode update ukuran tetap sama)
    const [existingUkurans] = await connection.query(
      'SELECT ukuranId, namaUkuran, hargaTambahan FROM Ukuran WHERE produkId = ?',
      [id]
    )
    const existingIds = existingUkurans.map((u) => u.ukuranId)
    const updatedIds = []

    // Update or Insert ukurans
    for (let i = 0; i < ukurans.length; i++) {
      const newUkuran = ukurans[i]

      if (i < existingUkurans.length) {
        const existingUkuran = existingUkurans[i]
        await connection.query(
          'UPDATE Ukuran SET namaUkuran = ?, hargaTambahan = ? WHERE ukuranId = ?',
          [newUkuran.namaUkuran, newUkuran.hargaTambahan || 0, existingUkuran.ukuranId]
        )
        updatedIds.push(existingUkuran.ukuranId)
      } else {
        const [insertResult] = await connection.query(
          'INSERT INTO Ukuran (produkId, namaUkuran, hargaTambahan) VALUES (?, ?, ?)',
          [id, newUkuran.namaUkuran, newUkuran.hargaTambahan || 0]
        )
        updatedIds.push(insertResult.insertId)
      }
    }

    // DELETE ukurans that are no longer needed
    const idsToDelete = existingIds.filter((id) => !updatedIds.includes(id))
    if (idsToDelete.length > 0) {
      for (const ukuranId of idsToDelete) {
        try {
          const [references] = await connection.query(
            'SELECT COUNT(*) as count FROM detailpemesanan WHERE ukuranId = ?',
            [ukuranId]
          )
          if (references[0].count === 0) {
            await connection.query('DELETE FROM Ukuran WHERE ukuranId = ?', [ukuranId])
          }
        } catch (deleteErr) {
          console.error('Error deleting ukuran:', deleteErr)
        }
      }
    }

    await connection.commit()

    res.json({
      message: 'Produk berhasil diperbarui',
      fotoUrl: fotoPathUpdate,
    })
  } catch (err) {
    if (connection) await connection.rollback()
    console.error('Update Product Error:', err)
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
    })
  } finally {
    if (connection) connection.release()
  }
}

// @route   DELETE /api/products/:id
// @desc    Hapus produk (tetap sama)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params
  let connection

  try {
    connection = await db.getConnection()
    const [products] = await db.query('SELECT foto FROM Produk WHERE produkId = ?', [id])

    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }

    const fotoUrl = products[0].foto
    const [result] = await db.query('DELETE FROM Produk WHERE produkId = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }

    // Note: To delete from Cloudinary, use cloudinary.uploader.destroy()
    // For now, we just remove from database
    console.log('Product deleted, Cloudinary URL was:', fotoUrl)

    res.json({ message: 'Produk berhasil dihapus' })
  } catch (err) {
    console.error('Delete Product Error:', err)
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
    })
  } finally {
    if (connection) connection.release()
  }
}

// @route   PATCH /api/products/:id/status
// @desc    Update status aktif/nonaktif produk
exports.updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE Produk SET is_active = ? WHERE produkId = ?',
      [is_active ? 1 : 0, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({
      message: `Status produk berhasil diubah menjadi ${is_active ? 'Aktif' : 'Nonaktif'}`,
      is_active: !!is_active
    });
  } catch (err) {
    console.error('Update Status Error:', err.message);
    res.status(500).send('Server Error');
  }
};