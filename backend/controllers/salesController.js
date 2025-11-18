const db = require('../config/db');

/**
 * @desc    Mengambil data penjualan per produk, difilter berdasarkan tanggal dan lokasi.
 * @route   GET /api/sales/report
 * @query   startDate, endDate, lokasiId
 */
const getSalesReport = async (req, res) => {
    // Ambil parameter filter dari query string
    const { startDate, endDate, lokasiId } = req.query;

    let query = `
        SELECT
            P.namaProduk AS namaProduk,
            P.produkId AS produkId,           -- Tambah Produk ID
            SUM(DP.quantity) AS QTY,
            SUM(DP.subtotal) AS totalHarga,
            L.name AS lokasi,
            DATE(PM.tanggalPesanan) AS date,
            PM.pesananId
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

    // Kelompokkan hasil berdasarkan produk, lokasi, dan tanggal (PENTING untuk EDIT)
    query += `
        GROUP BY
            P.namaProduk, P.produkId, L.name, DATE(PM.tanggalPesanan), PM.pesananId
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
 * @desc    Mengambil data ringkasan (Pendapatan dan Produk Terjual per Lokasi)
 * @route   GET /api/sales/summary
 */
const getSalesSummary = async (req, res) => {
    let query = `
        SELECT
            L.name AS lokasi,
            SUM(PM.totalHarga) AS totalPendapatan,
            SUM(DP.quantity) AS totalProdukTerjual
        FROM
            Pemesanan PM
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        JOIN
            DetailPemesanan DP ON PM.pesananId = DP.pesananId
        WHERE
            PM.statusPesanan = 'Selesai'
        GROUP BY
            L.name
    `;

    try {
        const [summaryData] = await db.query(query);
        res.json({
            success: true,
            data: summaryData
        });
    } catch (err) {
        console.error('Error fetching sales summary:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan penjualan',
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

        // 1. UPDATE DetailPemesanan (Kuantitas & Subtotal)
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
 * @desc    Hapus item dari Transaksi Penjualan. Jika item terakhir, hapus Pemesanan.
 * @route   DELETE /api/sales/transaction/:pesananId/:produkId
 */
const deleteSalesTransaction = async (req, res) => {
    const { pesananId, produkId } = req.params;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // 1. Hapus DetailPemesanan
        const [deleteDetailResult] = await connection.query(
            'DELETE FROM DetailPemesanan WHERE pesananId = ? AND produkId = ?',
            [pesananId, produkId]
        );

        if (deleteDetailResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ success: false, message: 'Detail transaksi tidak ditemukan.' });
        }

        // 2. Cek sisa item
        const [remainingItems] = await connection.query(
            'SELECT COUNT(*) as count FROM DetailPemesanan WHERE pesananId = ?',
            [pesananId]
        );
        
        // 3. Logika Hapus/Update Total
        if (remainingItems[0].count === 0) {
            await connection.query('DELETE FROM Pemesanan WHERE pesananId = ?', [pesananId]);
            await connection.commit();
            return res.json({ success: true, message: 'Transaksi dan Pemesanan induk berhasil dihapus.' });
        }

        // 4. Hitung Ulang dan Update Total Harga Pemesanan
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
    getSalesSummary,
    updateSalesTransaction,
    deleteSalesTransaction,
};