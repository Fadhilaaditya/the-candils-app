// controllers/salesController.js
const pool = require('../config/db')

// Status pesanan yang dianggap sukses/berhasil
const SUCCESS_STATUS = 'Selesai'

// --- FUNGSI 1: Ringkasan Dashboard Utama ---
const getDashboardSummary = async (req, res) => {
  const { startDate, endDate, productId, locationId, orderType } = req.query
  try {
    const results = {}

    // 1. Total Pendapatan per Lokasi
    let revenuePerLocationQuery = `
            SELECT 
                L.lokasiId,
                L.name AS lokasi_name,
                COALESCE(SUM(${productId ? 'DP.subtotal' : 'P.TotalHarga'}), 0) AS total_revenue
            FROM Lokasi L
            LEFT JOIN Pemesanan P ON L.lokasiId = P.lokasiId AND P.statusPesanan = ?
        `

    if (productId) {
      revenuePerLocationQuery += ' LEFT JOIN DetailPemesanan DP ON P.pesananid = DP.pesananid'
    }

    const revenueParams = [SUCCESS_STATUS]
    if (startDate) {
      revenuePerLocationQuery += ' AND DATE(P.tanggalPesanan) >= ?'
      revenueParams.push(startDate)
    }
    if (endDate) {
      revenuePerLocationQuery += ' AND DATE(P.tanggalPesanan) <= ?'
      revenueParams.push(endDate)
    }
    if (productId) {
      revenuePerLocationQuery += ' AND DP.produkId = ?'
      revenueParams.push(productId)
    }
    if (locationId) {
      revenuePerLocationQuery += ' AND P.lokasiId = ?'
      revenueParams.push(locationId)
    }
    if (orderType) {
      revenuePerLocationQuery += ' AND P.tipePesanan = ?'
      revenueParams.push(orderType)
    }
    revenuePerLocationQuery += ' GROUP BY L.lokasiId, L.name ORDER BY L.lokasiId;'

    const [revenuePerLocation] = await pool.query(revenuePerLocationQuery, revenueParams)
    results.revenuePerLocation = revenuePerLocation

    // FIX: Sesuaikan Timezone ke WIB (+7 jam) dan format string agar tidak dirubah JS ke UTC
    let revenuePerDayQuery = `
            SELECT 
                DATE_FORMAT(DATE_ADD(P.tanggalPesanan, INTERVAL 7 HOUR), '%Y-%m-%d') AS pemesanan_date,
                COALESCE(SUM(${productId ? 'DP.subtotal' : 'P.TotalHarga'}), 0) AS total_revenue
            FROM Pemesanan P
        `

    if (productId) {
      revenuePerDayQuery += ' JOIN DetailPemesanan DP ON P.pesananid = DP.pesananid'
    }

    revenuePerDayQuery += ' WHERE P.statusPesanan = ?'
    const dayParams = [SUCCESS_STATUS]

    if (startDate) {
      revenuePerDayQuery += ' AND DATE(P.tanggalPesanan) >= ?'
      dayParams.push(startDate)
    }
    if (endDate) {
      revenuePerDayQuery += ' AND DATE(P.tanggalPesanan) <= ?'
      dayParams.push(endDate)
    }
    if (productId) {
      revenuePerDayQuery += ' AND DP.produkId = ?'
      dayParams.push(productId)
    }
    if (locationId) {
      revenuePerDayQuery += ' AND P.lokasiId = ?'
      dayParams.push(locationId)
    }
    if (orderType) {
      revenuePerDayQuery += ' AND P.tipePesanan = ?'
      dayParams.push(orderType)
    }
    revenuePerDayQuery += ` GROUP BY DATE_FORMAT(DATE_ADD(P.tanggalPesanan, INTERVAL 7 HOUR), '%Y-%m-%d') ORDER BY pemesanan_date ASC;`

    const [revenuePerDay] = await pool.query(revenuePerDayQuery, dayParams)
    results.revenuePerDay = revenuePerDay

    // 3. Total Produk Terjual per Lokasi
    let totalProductsSoldPerLocationQuery = `
            SELECT
                L.lokasiId,
                L.name AS lokasi_name,
                COALESCE(SUM(DP.quantity), 0) AS total_products_sold
            FROM Lokasi L
            LEFT JOIN Pemesanan P ON L.lokasiId = P.lokasiId AND P.statusPesanan = ?
        `

    const productParams = [SUCCESS_STATUS]

    if (startDate) {
      totalProductsSoldPerLocationQuery += ' AND DATE(P.tanggalPesanan) >= ?'
      productParams.push(startDate)
    }
    if (endDate) {
      totalProductsSoldPerLocationQuery += ' AND DATE(P.tanggalPesanan) <= ?'
      productParams.push(endDate)
    }
    if (locationId) {
      totalProductsSoldPerLocationQuery += ' AND P.lokasiId = ?'
      productParams.push(locationId)
    }
    if (orderType) {
      totalProductsSoldPerLocationQuery += ' AND P.tipePesanan = ?'
      productParams.push(orderType)
    }

    totalProductsSoldPerLocationQuery +=
      ' LEFT JOIN DetailPemesanan DP ON P.pesananid = DP.pesananid'

    if (productId) {
      totalProductsSoldPerLocationQuery += ' AND DP.produkId = ?'
      productParams.push(productId)
    }

    totalProductsSoldPerLocationQuery += `
            GROUP BY L.lokasiId, L.name
            ORDER BY L.lokasiId;
        `

    const [productsSoldPerLocation] = await pool.query(
      totalProductsSoldPerLocationQuery,
      productParams
    )
    results.productsSoldPerLocation = productsSoldPerLocation

    res.json({
      success: true,
      message: 'Data dashboard berhasil diambil',
      data: results,
    })
  } catch (error) {
    console.error('💥 Error fetching dashboard summary:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard',
      error: error.message,
    })
  }
}

// --- FUNGSI 2: Ringkasan Ulasan dan Penjualan Produk (Gabungan 4 Metrik) ---
const getProductReviewSummary = async (req, res) => {
  // Query ini menggabungkan Produk, Ulasan, dan Penjualan (DetailPemesanan + Pemesanan)
  const { startDate, endDate, productId, locationId, orderType } = req.query

  let query = `
        SELECT 
            P.produkId,
            P.namaProduk,
            COALESCE(CAST(AVG(U.rating) AS DECIMAL(10,2)), 0) AS average_rating,
            COUNT(DISTINCT U.ulasanId) AS review_count,
            COALESCE(SUM(DP.quantity), 0) AS total_quantity_sold
        FROM 
            Produk P
        LEFT JOIN
            Ulasan U ON P.produkId = U.produkId
        LEFT JOIN
            DetailPemesanan DP ON P.produkId = DP.produkId
        LEFT JOIN
            Pemesanan PM ON DP.pesananid = PM.pesananid AND PM.statusPesanan = ?
    `

  const params = [SUCCESS_STATUS]
  if (startDate) {
    query += ' AND DATE(PM.tanggalPesanan) >= ?'
    params.push(startDate)
  }
  if (endDate) {
    query += ' AND DATE(PM.tanggalPesanan) <= ?'
    params.push(endDate)
  }
  if (productId) {
    query += ' AND DP.produkId = ?'
    params.push(productId)
  }
  if (locationId) {
    query += ' AND PM.lokasiId = ?'
    params.push(locationId)
  }
  if (orderType) {
    query += ' AND PM.tipePesanan = ?'
    params.push(orderType)
  }

  query += `
        GROUP BY 
            P.produkId, P.namaProduk
        ORDER BY 
            average_rating DESC, total_quantity_sold DESC;
    `

  try {
    const [summary] = await pool.query(query, params)

    res.json({
      success: true,
      message: 'Ringkasan ulasan dan penjualan produk berhasil diambil',
      data: summary,
    })
  } catch (error) {
    console.error('💥 Error fetching product review summary:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat ringkasan ulasan/penjualan produk',
      error: error.message,
    })
  }
}

// --- FUNGSI 3: Laporan Penjualan Detail ---
// --- FUNGSI 3: Laporan Penjualan Detail ---
const getSalesReport = async (req, res) => {
  const { startDate, endDate, lokasiId, page = 1, limit = 10 } = req.query
  const offset = (page - 1) * limit

  // Base conditions
  let whereClauses = ['PM.statusPesanan = ?'];
  let params = [SUCCESS_STATUS];

  if (startDate) {
    whereClauses.push('PM.tanggalPesanan >= ?');
    params.push(startDate);
  }
  if (endDate) {
    whereClauses.push('PM.tanggalPesanan <= DATE_ADD(?, INTERVAL 1 DAY)');
    params.push(endDate);
  }
  if (lokasiId && lokasiId !== 'all') {
    whereClauses.push('PM.lokasiId = ?');
    params.push(lokasiId);
  }
  
  // ✅ FIX: Add tipePesanan filter
  if (req.query.tipePesanan && req.query.tipePesanan !== 'all') {
    whereClauses.push('PM.tipePesanan = ?');
    params.push(req.query.tipePesanan); 
  }

  const whereString = whereClauses.join(' AND ');

  // 1. Query Data with Pagination
  let queryData = `
        SELECT
            P.namaProduk AS namaProduk,
            P.produkId,
            U.namaUkuran,
            SUM(DP.quantity) AS QTY,
            SUM(DP.subtotal) AS totalHarga,
            L.name AS lokasi,
            DATE(PM.tanggalPesanan) AS date,
            PM.pesananid,
            PM.tipePesanan
        FROM
            Pemesanan PM
        JOIN
            DetailPemesanan DP ON PM.pesananid = DP.pesananid
        JOIN
            Produk P ON DP.produkId = P.produkId
        LEFT JOIN
            Ukuran U ON DP.ukuranId = U.ukuranId
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        WHERE
            ${whereString}
        GROUP BY
            P.namaProduk, P.produkId, U.namaUkuran, L.name, DATE(PM.tanggalPesanan), PM.pesananid
        ORDER BY
            PM.tanggalPesanan DESC, P.namaProduk ASC
        LIMIT ? OFFSET ?
    `

  // 2. Query Total Count (for Pagination)
  let queryCount = `
        SELECT COUNT(*) as total FROM (
            SELECT 1
            FROM
                Pemesanan PM
            JOIN
                DetailPemesanan DP ON PM.pesananid = DP.pesananid
            JOIN
                Produk P ON DP.produkId = P.produkId
            LEFT JOIN
                Ukuran U ON DP.ukuranId = U.ukuranId
            JOIN
                Lokasi L ON PM.lokasiId = L.lokasiId
            WHERE
                ${whereString}
            GROUP BY
                P.namaProduk, P.produkId, U.namaUkuran, L.name, DATE(PM.tanggalPesanan), PM.pesananid
        ) as subquery
  `

  try {
    const [countResult] = await pool.query(queryCount, params);
    const totalItems = countResult[0].total;

    // Add limit and offset to params for data query
    const dataParams = [...params, Number(limit), Number(offset)];
    const [rows] = await pool.query(queryData, dataParams);

    // Return standardized pagination response
    res.json({
        success: true,
        data: rows,
        meta: {
            currentPage: Number(page),
            itemsPerPage: Number(limit),
            totalItems: Number(totalItems),
            totalPages: Math.ceil(totalItems / limit)
        }
    });

  } catch (err) {
    console.error('Error getting sales report:', err.message);
    res.status(500).json({ message: 'Error getting sales report', error: err.message });
  }
}

// --- FUNGSI 4: Ringkasan Pendapatan (Per Lokasi) ---
const getSummaryRevenue = async (req, res) => {
  const { startDate, endDate, productId, locationId, orderType } = req.query

  let query = `
        SELECT
            L.lokasiId,
            L.name AS lokasi,
            COALESCE(SUM(${productId ? 'DP.subtotal' : 'PM.TotalHarga'}), 0) AS totalPendapatan
        FROM
            Pemesanan PM
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
    `

  if (productId) {
    query += ' JOIN DetailPemesanan DP ON PM.pesananid = DP.pesananid'
  }

  query += ' WHERE PM.statusPesanan = ?'
  const params = [SUCCESS_STATUS]

  if (startDate) {
    query += ' AND DATE(PM.tanggalPesanan) >= ?'
    params.push(startDate)
  }
  if (endDate) {
    query += ' AND DATE(PM.tanggalPesanan) <= ?'
    params.push(endDate)
  }
  if (productId) {
    query += ' AND DP.produkId = ?'
    params.push(productId)
  }
  if (locationId) {
    query += ' AND PM.lokasiId = ?'
    params.push(locationId)
  }
  if (orderType) {
    query += ' AND PM.tipePesanan = ?'
    params.push(orderType)
  }

  query += `
        GROUP BY
            L.lokasiId, L.name
    `

  try {
    const [summaryData] = await pool.query(query, params)
    res.json({
      success: true,
      data: summaryData,
    })
  } catch (err) {
    console.error('Error fetching revenue summary:', err)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat ringkasan pendapatan',
      error: err.message,
    })
  }
}

// --- FUNGSI 5: Ringkasan Kuantitas Produk Terjual (Per Lokasi) ---
const getSummaryQuantity = async (req, res) => {
  let query = `
        SELECT
            L.name AS lokasi,
            SUM(DP.quantity) AS totalProdukTerjual
        FROM
            Pemesanan PM
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        JOIN
            DetailPemesanan DP ON PM.pesananid = DP.pesananid
        WHERE
            PM.statusPesanan = ?
        GROUP BY
            L.name
    `

  try {
    const [summaryData] = await pool.query(query, [SUCCESS_STATUS])
    res.json({
      success: true,
      data: summaryData,
    })
  } catch (err) {
    console.error('Error fetching quantity summary:', err)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat ringkasan kuantitas',
      error: err.message,
    })
  }
}

// --- FUNGSI 6: Produk Terjual per Jenis Produk (untuk Pie Chart) ---
const getProductsSoldSummary = async (req, res) => {
  const { startDate, endDate, productId, locationId, orderType } = req.query

  let query = `
        SELECT 
            P.produkId,
            P.namaProduk,
            COALESCE(SUM(DP.quantity), 0) AS total_quantity_sold
        FROM DetailPemesanan DP
        JOIN Pemesanan PM ON DP.pesananid = PM.pesananid
        JOIN Produk P ON DP.produkId = P.produkId
        WHERE PM.statusPesanan = ?
    `

  const params = [SUCCESS_STATUS]
  if (startDate) {
    query += ' AND DATE(PM.tanggalPesanan) >= ?'
    params.push(startDate)
  }
  if (endDate) {
    query += ' AND DATE(PM.tanggalPesanan) <= ?'
    params.push(endDate)
  }
  if (locationId) {
    query += ' AND PM.lokasiId = ?'
    params.push(locationId)
  }
  if (productId) {
    query += ' AND DP.produkId = ?'
    params.push(productId)
  }
  if (orderType) {
    query += ' AND PM.tipePesanan = ?'
    params.push(orderType)
  }

  query += `
        GROUP BY P.produkId, P.namaProduk
        ORDER BY total_quantity_sold DESC;
    `

  try {
    const [productsSummary] = await pool.query(query, params)

    res.json({
      success: true,
      message: 'Ringkasan produk terjual per jenis berhasil diambil',
      data: productsSummary,
    })
  } catch (error) {
    console.error('💥 Error fetching products sold summary:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat ringkasan produk terjual',
      error: error.message,
    })
  }
}

// --- FUNGSI 7: Ringkasan Penjualan per Tipe Pesanan (Online vs Offline) ---
const getSalesByOrderTypeSummary = async (req, res) => {
  const { startDate, endDate, productId, locationId, orderType } = req.query

  let query = `
        SELECT 
            PM.tipePesanan,
            COUNT(PM.pesananId) as total_orders,
            COALESCE(SUM(${productId ? 'DP.subtotal' : 'PM.TotalHarga'}), 0) as total_revenue
        FROM Pemesanan PM
    `

  if (productId) {
    query += ' JOIN DetailPemesanan DP ON PM.pesananid = DP.pesananid'
  }

  query += ' WHERE PM.statusPesanan = ?'
  const params = [SUCCESS_STATUS]

  if (startDate) {
    query += ' AND DATE(PM.tanggalPesanan) >= ?'
    params.push(startDate)
  }
  if (endDate) {
    query += ' AND DATE(PM.tanggalPesanan) <= ?'
    params.push(endDate)
  }
  if (productId) {
    query += ' AND DP.produkId = ?'
    params.push(productId)
  }
  if (locationId) {
    query += ' AND PM.lokasiId = ?'
    params.push(locationId)
  }
  if (orderType) {
    query += ' AND PM.tipePesanan = ?'
    params.push(orderType)
  }

  query += `
        GROUP BY PM.tipePesanan
        ORDER BY total_revenue DESC;
    `

  try {
    const [summary] = await pool.query(query, params)

    res.json({
      success: true,
      message: 'Ringkasan penjualan per tipe pesanan berhasil diambil',
      data: summary,
    })
  } catch (error) {
    console.error('💥 Error fetching sales by order type summary:', error)
    res.status(500).json({
      success: false,
      message: 'Gagal memuat ringkasan tipe pesanan',
      error: error.message,
    })
  }
}

// --- FUNGSI LAINNYA ---
const updateSalesTransaction = async (req, res) => {
  const { pesananId, produkId } = req.params;
  const { quantity, hargaSatuan, lokasiId } = req.body;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Ambil data lama untuk hitung selisih stok
    const [existingItem] = await connection.query(
      'SELECT quantity FROM DetailPemesanan WHERE pesananId = ? AND produkId = ?',
      [pesananId, produkId]
    );

    if (existingItem.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item transaksi tidak ditemukan' });
    }

    const oldQuantity = existingItem[0].quantity;
    const newQuantity = Number(quantity);
    const quantityDiff = newQuantity - oldQuantity;

    // 2. Update Stok (Jika quantity bertambah, stok berkurang, dan sebaliknya)
    // quantityDiff > 0 artinya user menambah beli -> stok harus dikurangi
    // quantityDiff < 0 artinya user mengurangi beli -> stok harus dikembalikan
    if (quantityDiff !== 0) {
      const [productCheck] = await connection.query(
        'SELECT stok FROM Produk WHERE produkId = ?',
        [produkId]
      );
      
      const currentStock = productCheck[0].stok;
      if (quantityDiff > 0 && currentStock < quantityDiff) {
        await connection.rollback();
        return res.status(400).json({ message: `Stok tidak mencukupi. Sisa stok: ${currentStock}` });
      }

      await connection.query(
        'UPDATE Produk SET stok = stok - ? WHERE produkId = ?',
        [quantityDiff, produkId]
      );
    }

    // 3. Update Detail Pesanan
    const subtotal = newQuantity * Number(hargaSatuan);
    await connection.query(
      'UPDATE DetailPemesanan SET quantity = ?, subtotal = ? WHERE pesananId = ? AND produkId = ?',
      [newQuantity, subtotal, pesananId, produkId]
    );

    // 4. Update Lokasi pada Pesanan Induk
    await connection.query(
      'UPDATE Pemesanan SET lokasiId = ? WHERE pesananId = ?',
      [lokasiId, pesananId]
    );

    // 5. Hitung Ulang Grand Total Pesanan
    const [totalResult] = await connection.query(
      'SELECT SUM(subtotal) as grandTotal FROM DetailPemesanan WHERE pesananId = ?',
      [pesananId]
    );
    const newGrandTotal = totalResult[0].grandTotal || 0;

    await connection.query(
      'UPDATE Pemesanan SET totalHarga = ? WHERE pesananId = ?',
      [newGrandTotal, pesananId]
    );

    await connection.commit();
    res.json({ 
      success: true, 
      message: 'Transaksi berhasil diperbarui',
      data: { pesananId, produkId, newQuantity, newGrandTotal }
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating sale:', error);
    res.status(500).json({ message: 'Gagal memperbarui transaksi', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const deleteSalesTransaction = async (req, res) => {
  const { pesananId, produkId } = req.params;

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Ambil data item yang akan dihapus untuk kembalikan stok
    const [itemData] = await connection.query(
      'SELECT quantity FROM DetailPemesanan WHERE pesananId = ? AND produkId = ?',
      [pesananId, produkId]
    );

    if (itemData.length === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Item tidak ditemukan' });
    }

    const quantityToRestore = itemData[0].quantity;

    // 2. Kembalikan Stok
    await connection.query(
      'UPDATE Produk SET stok = stok + ? WHERE produkId = ?',
      [quantityToRestore, produkId]
    );

    // 3. Hapus Item dari Detail
    await connection.query(
      'DELETE FROM DetailPemesanan WHERE pesananId = ? AND produkId = ?',
      [pesananId, produkId]
    );

    // 4. Cek apakah masih ada item lain di pesanan ini?
    const [remainingItems] = await connection.query(
      'SELECT COUNT(*) as count FROM DetailPemesanan WHERE pesananId = ?',
      [pesananId]
    );

    if (remainingItems[0].count === 0) {
      // Jika tidak ada item lagi, hapus Pesanan induk
      await connection.query('DELETE FROM Pemesanan WHERE pesananId = ?', [pesananId]);
    } else {
      // Jika masih ada, hitung ulang total harga
      const [totalResult] = await connection.query(
        'SELECT SUM(subtotal) as grandTotal FROM DetailPemesanan WHERE pesananId = ?',
        [pesananId]
      );
      const newGrandTotal = totalResult[0].grandTotal || 0;
      
      await connection.query(
        'UPDATE Pemesanan SET totalHarga = ? WHERE pesananId = ?',
        [newGrandTotal, pesananId]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'Transaksi berhasil dihapus' });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error deleting sale:', error);
    res.status(500).json({ message: 'Gagal menghapus transaksi', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

module.exports = {
  getDashboardSummary,
  getProductReviewSummary,
  getSalesReport,
  getSummaryRevenue,
  getSummaryQuantity,
  getProductsSoldSummary,
  getSalesByOrderTypeSummary,
  updateSalesTransaction,
  deleteSalesTransaction,
}
