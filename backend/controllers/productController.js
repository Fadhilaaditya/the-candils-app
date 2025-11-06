const db = require('../config/db')
const fs = require('fs')

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
    const query = `
      SELECT
        P.produkId, P.namaProduk, P.deskripsi, P.stok,
        CONCAT('http://localhost:3000', P.foto) as foto,
        P.hargaUnit,
        U.ukuranId,
        U.namaUkuran,
        U.hargaTambahan,
        COALESCE(AVG(R.rating), 0) as averageRating,
        COUNT(DISTINCT R.ulasanId) as reviewCount
      FROM
        Produk P
      LEFT JOIN
        Ukuran U ON P.produkId = U.produkId
      LEFT JOIN
        Ulasan R ON P.produkId = R.produkId
      GROUP BY
        P.produkId, U.ukuranId
      ORDER BY
        P.produkId ASC, U.ukuranId ASC;
    `
    const [productsWithVariantsAndRating] = await db.query(query)

    const result = productsWithVariantsAndRating.map((item) => ({
      ...item,
      averageRating: parseFloat(item.averageRating || 0),
      reviewCount: parseInt(item.reviewCount || 0, 10),
    }))

    res.json(result)
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
      "SELECT produkId, namaProduk, deskripsi, stok, CONCAT('http://localhost:3000', foto) as foto, hargaUnit FROM Produk WHERE produkId = ?",
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

// @route   POST /api/products
// @desc    Membuat produk baru dengan upload gambar
exports.createProduct = async (req, res) => {
  const { namaProduk, deskripsi, stok, hargaUnit, ukuran: ukuranJSON } = req.body
  const foto = req.file

  console.log('Create Product Request:')
  console.log('Body:', req.body)
  console.log('File:', foto)

  if (!foto) {
    return res.status(400).json({ message: 'File gambar (foto) wajib diisi' })
  }
  if (!namaProduk || !hargaUnit || !ukuranJSON) {
    if (fs.existsSync(foto.path)) fs.unlinkSync(foto.path)
    return res.status(400).json({ message: 'Nama, harga, dan minimal 1 ukuran wajib diisi' })
  }

  let ukurans
  try {
    ukurans = JSON.parse(ukuranJSON)
    console.log('Parsed ukurans:', ukurans)
  } catch (e) {
    console.error('JSON Parse Error:', e.message)
    if (fs.existsSync(foto.path)) fs.unlinkSync(foto.path)
    return res.status(400).json({ message: 'Format data ukuran tidak valid (bukan JSON string)' })
  }

  if (!Array.isArray(ukurans) || ukurans.length === 0) {
    if (fs.existsSync(foto.path)) fs.unlinkSync(foto.path)
    return res.status(400).json({ message: 'Minimal harus ada 1 ukuran' })
  }

  const fotoPath = '/' + req.file.path.replace(/\\/g, '/')
  let connection

  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    const [productResult] = await connection.query(
      'INSERT INTO Produk (namaProduk, deskripsi, stok, foto, hargaUnit) VALUES (?, ?, ?, ?, ?)',
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
      path: fotoPath,
    })
  } catch (err) {
    if (connection) await connection.rollback()
    if (foto && fs.existsSync(foto.path)) {
      fs.unlinkSync(foto.path)
    }
    console.error('Create Product Error:', err)
    res.status(500).json({
      message: 'Server Error',
      error: err.message,
    })
  } finally {
    if (connection) connection.release()
  }
}

exports.updateProduct = async (req, res) => {
  const { id } = req.params
  const { namaProduk, deskripsi, stok, hargaUnit, ukuran: ukuranJSON } = req.body
  const newFoto = req.file

  if (!namaProduk || !hargaUnit || !ukuranJSON) {
    if (newFoto && fs.existsSync(newFoto.path)) fs.unlinkSync(newFoto.path)
    return res.status(400).json({ message: 'Nama, harga, dan minimal 1 ukuran wajib diisi' })
  }

  let ukurans
  try {
    ukurans = JSON.parse(ukuranJSON)
  } catch (e) {
    if (newFoto && fs.existsSync(newFoto.path)) fs.unlinkSync(newFoto.path)
    return res.status(400).json({ message: 'Format data ukuran tidak valid' })
  }

  if (!Array.isArray(ukurans) || ukurans.length === 0) {
    if (newFoto && fs.existsSync(newFoto.path)) fs.unlinkSync(newFoto.path)
    return res.status(400).json({ message: 'Minimal harus ada 1 ukuran' })
  }

  let connection
  try {
    connection = await db.getConnection()
    await connection.beginTransaction()

    // Check product exists
    const [oldProducts] = await connection.query('SELECT foto FROM Produk WHERE produkId = ?', [id])
    if (oldProducts.length === 0) {
      if (newFoto && fs.existsSync(newFoto.path)) fs.unlinkSync(newFoto.path)
      await connection.rollback()
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }

    const oldFotoPath = oldProducts[0].foto
    let fotoPathUpdate = oldFotoPath

    if (newFoto) {
      fotoPathUpdate = '/' + newFoto.path.replace(/\\/g, '/')
    }

    // Update Produk table
    await connection.query(
      'UPDATE Produk SET namaProduk = ?, deskripsi = ?, stok = ?, foto = ?, hargaUnit = ? WHERE produkId = ?',
      [namaProduk, deskripsi || null, stok || 0, fotoPathUpdate, hargaUnit, id]
    )

    // Get existing ukurans
    const [existingUkurans] = await connection.query(
      'SELECT ukuranId, namaUkuran, hargaTambahan FROM Ukuran WHERE produkId = ?',
      [id]
    )
    // Track which existing ukurans to keep
    const existingIds = existingUkurans.map((u) => u.ukuranId)
    const updatedIds = []

    // Update or Insert ukurans
    for (let i = 0; i < ukurans.length; i++) {
      const newUkuran = ukurans[i]

      if (i < existingUkurans.length) {
        // UPDATE existing ukuran
        const existingUkuran = existingUkurans[i]

        await connection.query(
          'UPDATE Ukuran SET namaUkuran = ?, hargaTambahan = ? WHERE ukuranId = ?',
          [newUkuran.namaUkuran, newUkuran.hargaTambahan || 0, existingUkuran.ukuranId]
        )

        updatedIds.push(existingUkuran.ukuranId)
      } else {
        // INSERT new ukuran
        console.log(`  [${i + 1}] Inserting new ukuran...`)

        const [insertResult] = await connection.query(
          'INSERT INTO Ukuran (produkId, namaUkuran, hargaTambahan) VALUES (?, ?, ?)',
          [id, newUkuran.namaUkuran, newUkuran.hargaTambahan || 0]
        )

        updatedIds.push(insertResult.insertId)
      }
    }

    // DELETE ukurans that are no longer needed (only if not referenced)
    const idsToDelete = existingIds.filter((id) => !updatedIds.includes(id))

    if (idsToDelete.length > 0) {
      for (const ukuranId of idsToDelete) {
        try {
          // Check if ukuran is referenced in detailpemesanan
          const [references] = await connection.query(
            'SELECT COUNT(*) as count FROM detailpemesanan WHERE ukuranId = ?',
            [ukuranId]
          )

          if (references[0].count > 0) {
            // Mark as inactive instead of deleting (optional solution)
            // await connection.query('UPDATE Ukuran SET active = 0 WHERE ukuranId = ?', [ukuranId]);
          } else {
            await connection.query('DELETE FROM Ukuran WHERE ukuranId = ?', [ukuranId])
          }
        } catch (deleteErr) {
          // Continue without failing the whole transaction
        }
      }
    }

    await connection.commit()

    // Delete old photo if new one uploaded
    if (newFoto && oldFotoPath) {
      const localOldPath = '.' + oldFotoPath
      if (fs.existsSync(localOldPath)) {
        fs.unlink(localOldPath, (err) => {
          if (err) console.error(`Failed to delete old photo: ${err.message}`)
          else console.log(`Old photo deleted`)
        })
      }
    }

    res.json({
      message: 'Produk berhasil diperbarui',
      path: fotoPathUpdate,
    })
  } catch (err) {
    if (connection) await connection.rollback()
    if (newFoto && fs.existsSync(newFoto.path)) fs.unlinkSync(newFoto.path)

    res.status(500).json({
      message: 'Server Error',
      error: err.message,
    })
  } finally {
    if (connection) connection.release()
  }
}

// @route   DELETE /api/products/:id
// @desc    Hapus produk beserta gambarnya
exports.deleteProduct = async (req, res) => {
  const { id } = req.params
  let connection

  try {
    connection = await db.getConnection()
    const [products] = await db.query('SELECT foto FROM Produk WHERE produkId = ?', [id])

    if (products.length === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }

    const fotoPath = products[0].foto
    const [result] = await db.query('DELETE FROM Produk WHERE produkId = ?', [id])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' })
    }

    // Hapus file gambar
    if (fotoPath) {
      const localPath = '.' + fotoPath
      if (fs.existsSync(localPath)) {
        fs.unlink(localPath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file: ${localPath}`, err)
          } else {
            console.log(`File berhasil dihapus: ${localPath}`)
          }
        })
      }
    }

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
