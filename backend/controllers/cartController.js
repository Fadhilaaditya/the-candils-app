// ===============================================
// FILE: controllers/cartController.js
// ===============================================
const db = require('../config/db');

/**
 * Add item to cart
 * POST /api/cart/add
 * (Menggunakan Stored Procedure - TIDAK DIUBAH)
 */
/**
 * Add item to cart
 * POST /api/cart/add
 * (Diganti dengan SQL Manual karena Stored Procedure bermasalah)
 */
exports.addToCart = async (req, res) => {
  try {
    const { cartSessionId, produkId, ukuranId, jumlah } = req.body;
    const qty = parseInt(jumlah) || 1;

    // 1. Hitung Harga Satuan (Base Price + Additional Price)
    let hargaDasar = 0;
    let hargaTambahan = 0;

    // 1a. Ambil harga dasar produk DAN STOK
    const [produk] = await db.query(
      'SELECT IFNULL(hargaUnit, 0) AS harga, stok FROM Produk WHERE produkId = ?',
      [produkId]
    );
    
    if (produk.length === 0) {
      return res.status(404).json({ success: false, message: 'Produk tidak ditemukan' });
    }
    hargaDasar = parseFloat(produk[0].harga);
    const stokTersedia = produk[0].stok;

    // 1b. Ambil harga tambahan ukuran (jika ada)
    if (ukuranId) {
      const [ukuran] = await db.query(
        'SELECT IFNULL(hargaTambahan, 0) AS harga FROM Ukuran WHERE ukuranId = ?',
        [ukuranId]
      );
      if (ukuran.length > 0) {
        hargaTambahan = parseFloat(ukuran[0].harga);
      }
    }

    const hargaSatuan = hargaDasar + hargaTambahan;

    // 2. Pastikan tabel induk 'Keranjang' ada SEBELUM insert ke child table
    // Ini penting untuk menghindari error Foreign Key Constraint
    await db.query(
      'INSERT IGNORE INTO Keranjang (cartSessionId, createdAt) VALUES (?, NOW())',
      [cartSessionId]
    );

    // 3. Cek apakah item sudah ada di keranjang (untuk session ini, produk ini, dan ukuran ini)
    // Perhatikan: ukuranId bisa NULL, jadi kita perlu query yang aman untuk NULL
    let checkQuery = 'SELECT keranjangItemId, jumlah FROM `Keranjang Item` WHERE cartSessionId = ? AND produkId = ?';
    let checkParams = [cartSessionId, produkId];

    if (ukuranId) {
      checkQuery += ' AND ukuranId = ?';
      checkParams.push(ukuranId);
    } else {
      checkQuery += ' AND ukuranId IS NULL';
    }

    const [existingItem] = await db.query(checkQuery, checkParams);

    if (existingItem.length > 0) {
      // 4a. UPDATE: Jika sudah ada, tambahkan jumlahnya
      const item = existingItem[0];
      const newQuantity = item.jumlah + qty;

      // 🛑 CEK STOK (Update)
      if (newQuantity > stokTersedia) {
        return res.status(400).json({ 
          success: false, 
          message: `Stok tidak mencukupi. Stok tersedia: ${stokTersedia}, di keranjang: ${item.jumlah}, ditambah: ${qty}` 
        });
      }

      const newSubtotal = newQuantity * hargaSatuan;

      await db.query(
        'UPDATE `Keranjang Item` SET jumlah = ?, subtotal = ? WHERE keranjangItemId = ?',
        [newQuantity, newSubtotal, item.keranjangItemId]
      );
    } else {
      // 4b. INSERT: Jika belum ada, buat baris baru

      // 🛑 CEK STOK (New Item)
      if (qty > stokTersedia) {
        return res.status(400).json({ 
          success: false, 
          message: `Stok tidak mencukupi. Stok tersedia: ${stokTersedia}` 
        });
      }

      const subtotal = qty * hargaSatuan;
      
      await db.query(
        'INSERT INTO `Keranjang Item` (cartSessionId, produkId, ukuranId, jumlah, subtotal) VALUES (?, ?, ?, ?, ?)',
        [cartSessionId, produkId, ukuranId || null, qty, subtotal]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Produk berhasil ditambahkan ke keranjang'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan produk ke keranjang',
      error: error.message
    });
  }
};

/**
 * Get cart items
 * GET /api/cart/:cartSessionId
 * (Telah diperbaiki untuk menggunakan JOIN, bukan VIEW)
 */
exports.getCartItems = async (req, res) => {
  try {
    const { cartSessionId } = req.params;

    // --- [PERBAIKAN] ---
    // Query lama (SELECT * FROM v_keranjang_item_detail) diganti 
    // dengan query JOIN langsung ke tabel.
    const query = `
      SELECT 
        ki.keranjangItemId, 
        ki.cartSessionId, 
        ki.produkId, 
        ki.ukuranId, 
        ki.jumlah, 
        (ki.subtotal / ki.jumlah) AS harga_satuan, -- <-- INI PERBAIKANNYA
        p.namaProduk, 
        p.deskripsi, 
        p.foto,
        p.stok, -- <-- Tambahkan stok
        u.namaUkuran
      FROM 
        \`Keranjang Item\` ki
      JOIN 
        Produk p ON ki.produkId = p.produkId
      LEFT JOIN 
        Ukuran u ON ki.ukuranId = u.ukuranId
      WHERE 
        ki.cartSessionId = ?
    `;
    // --- [AKHIR PERBAIKAN] ---
    
    const [items] = await db.query(query, [cartSessionId]);

    res.status(200).json({
      success: true,
      data: items || [] // Kirim array kosong jika tidak ada
    });
  } catch (error) {
    console.error('Error getting cart items:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data keranjang',
      error: error.message
    });
  }
};

/**
 * Get cart summary
 * GET /api/cart/summary/:cartSessionId
 * (Telah diperbaiki untuk menggunakan GROUP BY, bukan VIEW)
 */
exports.getCartSummary = async (req, res) => {
  try {
    const { cartSessionId } = req.params;

    // --- [PERBAIKAN] ---
    // Query lama (SELECT * FROM v_keranjang_summary) diganti
    // dengan query agregat (SUM, COUNT) langsung.
    const query = `
      SELECT
        cartSessionId,
        COUNT(keranjangItemId) as total_items,
        SUM(jumlah) as total_quantity,
        SUM(subtotal) as total_amount
      FROM
        \`Keranjang Item\`
      WHERE
        cartSessionId = ?
      GROUP BY
        cartSessionId
    `;
    // --- [AKHIR PERBAIKAN] ---
    
    const [summary] = await db.query(query, [cartSessionId]);

    res.status(200).json({
      success: true,
      data: summary.length > 0 ? summary[0] : {
        cartSessionId,
        total_items: 0,
        total_quantity: 0,
        total_amount: 0
      }
    });
  } catch (error) {
    console.error('Error getting cart summary:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil ringkasan keranjang',
      error: error.message
    });
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/update/:keranjangItemId
 * (Telah diperbaiki untuk menghitung ulang harga satuan & subtotal dengan benar)
 */
exports.updateCartItem = async (req, res) => {
  try {
    const { keranjangItemId } = req.params;
    const { jumlah } = req.body; // Ini adalah jumlah BARU (misal: 1)

    // 1. Validasi jumlah baru
    if (jumlah < 1) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah tidak boleh kurang dari 1'
      });
    }

    // 2. Ambil item dari keranjang untuk mendapatkan produkId & ukuranId
    const [items] = await db.query(
      'SELECT * FROM `Keranjang Item` WHERE keranjangItemId = ?',
      [keranjangItemId]
    );

    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Item tidak ditemukan'
      });
    }
    const item = items[0];

    // 3. [LOGIKA BARU] Hitung ulang harga satuan (sama seperti di Stored Procedure)
    let hargaDasar = 0;
    let hargaTambahan = 0;
    let hargaSatuan = 0;

    // 3a. Ambil harga dasar (hargaUnit) DAN STOK
    const [produk] = await db.query(
      'SELECT IFNULL(hargaUnit, 0) AS harga, stok FROM Produk WHERE produkId = ?',
      [item.produkId]
    );
    
    let stokTersedia = 0;
    if (produk.length > 0) {
      hargaDasar = parseFloat(produk[0].harga); // Gunakan parseFloat untuk keamanan
      stokTersedia = produk[0].stok;
    }

    // 🛑 CEK STOK SEBELUM UPDATE
    if (jumlah > stokTersedia) {
      return res.status(400).json({ 
        success: false, 
        message: `Stok tidak mencukupi. Stok tersedia: ${stokTersedia}` 
      });
    }

    // 3b. Ambil harga tambahan (jika ada ukuran)
    if (item.ukuranId) {
      const [ukuran] = await db.query(
        'SELECT IFNULL(hargaTambahan, 0) AS harga FROM Ukuran WHERE ukuranId = ?',
        [item.ukuranId]
      );
      if (ukuran.length > 0) {
        hargaTambahan = parseFloat(ukuran[0].harga);
      }
    }
    
    // 3c. Hitung harga satuan final
    hargaSatuan = hargaDasar + hargaTambahan;
    
    // 4. Hitung subtotal baru berdasarkan jumlah baru
    const subtotalBaru = hargaSatuan * jumlah;

    // 5. Update item di database
    await db.query(
      'UPDATE `Keranjang Item` SET jumlah = ?, subtotal = ? WHERE keranjangItemId = ?',
      [jumlah, subtotalBaru, keranjangItemId]
    );

    res.status(200).json({
      success: true,
      message: 'Jumlah produk berhasil diupdate'
    });
    
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate keranjang',
      error: error.message
    });
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/remove/:keranjangItemId
 * (Diganti dengan SQL Manual karena Stored Procedure bermasalah)
 */
exports.removeCartItem = async (req, res) => {
  try {
    const { keranjangItemId } = req.params;

    // Ganti CALL hapusItem(?) dengan DELETE langsung
    await db.query('DELETE FROM `Keranjang Item` WHERE keranjangItemId = ?', [keranjangItemId]);

    res.status(200).json({
      success: true,
      message: 'Produk berhasil dihapus dari keranjang'
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus produk dari keranjang',
      error: error.message
    });
  }
};

/**
 * Clear all items in cart
 * DELETE /api/cart/clear/:cartSessionId
 * (Logika sudah benar - TIDAK DIUBAH)
 */
exports.clearCart = async (req, res) => {
  try {
    const { cartSessionId } = req.params;

    // Delete all items
    await db.query(
      'DELETE FROM `Keranjang Item` WHERE cartSessionId = ?',
      [cartSessionId]
    );

    // Delete cart (Opsional, tergantung struktur Anda)
    await db.query(
      'DELETE FROM Keranjang WHERE cartSessionId = ?',
      [cartSessionId]
    );

    res.status(200).json({
      success: true,
      message: 'Keranjang berhasil dikosongkan'
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengosongkan keranjang',
      error: error.message
    });
  }
};