const db = require('../config/db');

/**
 * @desc    Mengambil data penjualan per produk, difilter berdasarkan tanggal dan lokasi.
 * @route   GET /api/sales/report
 */
const getSalesReport = async (req, res) => {
    const { startDate, endDate, lokasiId } = req.query;

    let query = `
        SELECT
            P.namaProduk AS namaProduk,
            P.produkId AS produkId,
            SUM(DP.quantity) AS QTY,
            SUM(DP.subtotal) AS totalHarga,
            L.name AS lokasi,
            DATE(PM.tanggalPesanan) AS date,
            PM.pesananId,
            PM.tipePesanan
        FROM
            Pemesanan PM
        JOIN
            DetailPemesanan DP ON PM.pesananId = DP.pesananId
        JOIN
            Produk P ON DP.produkId = P.produkId
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        WHERE
            PM.statusPesanan = 'Selesai'
    `;

    const params = [];

    if (startDate) {
        query += ' AND PM.tanggalPesanan >= ?';
        params.push(startDate);
    }
    if (endDate) {
        query += ' AND PM.tanggalPesanan <= DATE_ADD(?, INTERVAL 1 DAY)';
        params.push(endDate);
    }

    if (lokasiId && lokasiId !== 'all') {
        query += ' AND PM.lokasiId = ?';
        params.push(lokasiId);
    }

    query += `
        GROUP BY
            P.namaProduk, P.produkId, L.name, DATE(PM.tanggalPesanan), PM.pesananId, PM.tipePesanan
        ORDER BY
            PM.tanggalPesanan DESC, P.namaProduk ASC
    `;

    try {
        const [reportData] = await db.query(query, params);
        res.json({
            success: true,
            data: reportData
        });
    } catch (err) {
        console.error('Error fetching sales report:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat laporan penjualan',
            error: err.message
        });
    }
};

/**
 * @desc    Mengambil data ringkasan Pendapatan per Lokasi (untuk RevenueChart).
 * @route   GET /api/sales/summary-revenue
 */
const getSummaryRevenue = async (req, res) => {
    let query = `
        SELECT
            L.name AS lokasi,
            SUM(PM.totalHarga) AS totalPendapatan
        FROM
            Pemesanan PM
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        WHERE
            PM.statusPesanan = 'Selesai'
        GROUP BY
            L.name
        ORDER BY
            totalPendapatan DESC
    `;

    try {
        const [summaryData] = await db.query(query);
        res.json({
            success: true,
            data: summaryData
        });
    } catch (err) {
        console.error('Error fetching summary revenue:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan pendapatan',
            error: err.message
        });
    }
};

/**
 * @desc    Mengambil data total Kuantitas Produk Terjual per Produk (untuk ProductsSoldChart).
 * @route   GET /api/sales/summary-quantity
 */
const getSummaryQuantity = async (req, res) => {
    let query = `
        SELECT
            P.namaProduk,
            SUM(DP.quantity) AS totalProdukTerjual
        FROM
            Pemesanan PM
        JOIN
            DetailPemesanan DP ON PM.pesananId = DP.pesananId
        JOIN
            Produk P ON DP.produkId = P.produkId
        WHERE
            PM.statusPesanan = 'Selesai'
        GROUP BY
            P.namaProduk
        ORDER BY
            totalProdukTerjual DESC
    `;

    try {
        const [summaryData] = await db.query(query);
        res.json({
            success: true,
            data: summaryData
        });
    } catch (err) {
        console.error('Error fetching summary quantity:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan kuantitas produk',
            error: err.message
        });
    }
};

/**
 * @desc    Update Kuantitas, Harga Satuan, dan Lokasi pada Transaksi Penjualan yang Sudah Selesai.
 * @route   PUT /api/sales/transaction/:pesananId/:produkId
 */
const updateSalesTransaction = async (req, res) => {
    const { pesananId, produkId } = req.params;
    const { quantity, hargaSatuan, lokasiId } = req.body;

    if (!quantity || !hargaSatuan || !lokasiId) {
        return res.status(400).json({ success: false, message: 'Data kuantitas, harga satuan, dan lokasi wajib diisi.' });
    }

    const newQuantity = Number(quantity);
    const newHargaSatuan = Number(hargaSatuan);
    const newLokasiId = Number(lokasiId);
    
    const newSubtotal = newQuantity * newHargaSatuan;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. UPDATE DetailPemesanan
        await connection.query(
            `UPDATE DetailPemesanan SET 
                quantity = ?, 
                subtotal = ? 
             WHERE pesananId = ? AND produkId = ?`,
            [newQuantity, newSubtotal, pesananId, produkId]
        );
        
        // 2. UPDATE Pemesanan (Lokasi)
        await connection.query(
            `UPDATE Pemesanan SET lokasiId = ? WHERE pesananId = ?`,
            [newLokasiId, pesananId]
        );

        // 3. Hitung Ulang Total Harga Pesanan
        const [recalculateResult] = await connection.query(
            `SELECT SUM(subtotal) AS newTotal FROM DetailPemesanan WHERE pesananId = ?`,
            [pesananId]
        );
        const newTotalHarga = recalculateResult[0].newTotal || 0;

        // 4. UPDATE Total Harga di Pemesanan
        await connection.query(
            `UPDATE Pemesanan SET totalHarga = ? WHERE pesananId = ?`,
            [newTotalHarga, pesananId]
        );

        await connection.commit();
        res.json({ success: true, message: 'Transaksi penjualan berhasil diperbarui.', newTotal: newTotalHarga });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Error updating sales transaction:', err);
        res.status(500).json({ success: false, message: 'Gagal memperbarui transaksi penjualan.', error: err.message });
    } finally {
        if (connection) connection.release();
    }
};

/**
 * @desc    Hapus item dari Transaksi Penjualan.
 * @route   DELETE /api/sales/transaction/:pesananId/:produkId
 */
const deleteSalesTransaction = async (req, res) => {
    const { pesananId, produkId } = req.params;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Hapus DetailPemesanan
        await connection.query(
            'DELETE FROM DetailPemesanan WHERE pesananId = ? AND produkId = ?',
            [pesananId, produkId]
        );

        // 2. Cek sisa item dan hitung ulang Total
        const [remainingItems] = await connection.query(
            'SELECT COUNT(*) as count FROM DetailPemesanan WHERE pesananId = ?',
            [pesananId]
        );
        
        if (remainingItems[0].count === 0) {
            await connection.query('DELETE FROM Pemesanan WHERE pesananId = ?', [pesananId]);
            await connection.commit();
            return res.json({ success: true, message: 'Transaksi dan Pemesanan induk berhasil dihapus.' });
        }

        const [recalculateResult] = await connection.query(
            'SELECT SUM(subtotal) AS newTotal FROM DetailPemesanan WHERE pesananId = ?',
            [pesananId]
        );
        const newTotalHarga = recalculateResult[0].newTotal || 0;

        await connection.query('UPDATE Pemesanan SET totalHarga = ? WHERE pesananId = ?', [newTotalHarga, pesananId]);

        await connection.commit();
        res.json({ success: true, message: 'Item transaksi berhasil dihapus.', newTotal: newTotalHarga });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Error deleting sales transaction item:', err);
        res.status(500).json({ success: false, message: 'Gagal menghapus item transaksi.', error: err.message });
    } finally {
        if (connection) connection.release();
    }
};


module.exports = {
    getSalesReport,
    getSummaryRevenue,     // ✅ Export Pendapatan
    getSummaryQuantity,    // ✅ Export Kuantitas Terjual
    updateSalesTransaction,
    deleteSalesTransaction,
};