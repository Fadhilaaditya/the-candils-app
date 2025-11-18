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
            SUM(DP.quantity) AS QTY,
            SUM(DP.subtotal) AS totalHarga,
            L.name AS lokasi,
            DATE(PM.tanggalPesanan) AS date,
            PM.pesananId // untuk keperluan edit/aksi di frontend
        FROM
            Pemesanan PM
        JOIN
            DetailPemesanan DP ON PM.pesananId = DP.pesananId
        JOIN
            Produk P ON DP.produkId = P.produkId
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        WHERE
            PM.statusPesanan = 'Selesai' // Hanya hitung pesanan yang sudah selesai
    `;

    const params = [];

    // Filter berdasarkan Tanggal
    if (startDate) {
        query += ' AND PM.tanggalPesanan >= ?';
        params.push(startDate);
    }
    if (endDate) {
        // Gunakan DATE_ADD untuk memastikan termasuk hari terakhir
        query += ' AND PM.tanggalPesanan <= DATE_ADD(?, INTERVAL 1 DAY)';
        params.push(endDate);
    }

    // Filter berdasarkan Lokasi
    if (lokasiId && lokasiId !== 'all') {
        query += ' AND PM.lokasiId = ?';
        params.push(lokasiId);
    }

    // Kelompokkan hasil berdasarkan produk, lokasi, dan tanggal (untuk tampilan tabel)
    query += `
        GROUP BY
            P.namaProduk, L.name, DATE(PM.tanggalPesanan), PM.pesananId
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
    // Tambahkan filter tanggal jika diperlukan (gunakan logika yang sama seperti di atas)
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


module.exports = {
    getSalesReport,
    getSalesSummary
};