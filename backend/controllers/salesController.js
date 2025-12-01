// controllers/salesController.js
const pool = require('../config/db'); 

// Status pesanan yang dianggap sukses/berhasil
const SUCCESS_STATUS = 'Selesai'; 

// --- FUNGSI 1: Ringkasan Dashboard Utama ---
const getDashboardSummary = async (req, res) => {
    try {
        const results = {};

        // 1. Total Pendapatan per Lokasi
        const revenuePerLocationQuery = `
            SELECT 
                L.lokasiId,
                L.name AS lokasi_name,
                COALESCE(SUM(P.TotalHarga), 0) AS total_revenue
            FROM Lokasi L
            LEFT JOIN Pemesanan P ON L.lokasiId = P.lokasiId AND P.statusPesanan = ?
            GROUP BY L.lokasiId, L.name
            ORDER BY L.lokasiId;
        `;
        const [revenuePerLocation] = await pool.query(revenuePerLocationQuery, [SUCCESS_STATUS]);
        results.revenuePerLocation = revenuePerLocation;


        // 2. Total Pendapatan per Hari (untuk Grafik)
        const revenuePerDayQuery = `
            SELECT 
                DATE(tanggalPesanan) AS pemesanan_date,
                COALESCE(SUM(TotalHarga), 0) AS total_revenue
            FROM Pemesanan
            WHERE statusPesanan = ?
            GROUP BY DATE(tanggalPesanan)
            ORDER BY pemesanan_date ASC;
        `;
        const [revenuePerDay] = await pool.query(revenuePerDayQuery, [SUCCESS_STATUS]);
        results.revenuePerDay = revenuePerDay;

        // 3. Total Produk Terjual per Lokasi
        const totalProductsSoldPerLocationQuery = `
            SELECT
                L.lokasiId,
                L.name AS lokasi_name,
                COALESCE(SUM(DP.quantity), 0) AS total_products_sold
            FROM Lokasi L
            LEFT JOIN Pemesanan P ON L.lokasiId = P.lokasiId AND P.statusPesanan = ?
            LEFT JOIN DetailPemesanan DP ON P.pesananid = DP.pesananid
            GROUP BY L.lokasiId, L.name
            ORDER BY L.lokasiId;
        `;
        const [productsSoldPerLocation] = await pool.query(totalProductsSoldPerLocationQuery, [SUCCESS_STATUS]);
        results.productsSoldPerLocation = productsSoldPerLocation;


        res.json({
            success: true,
            message: 'Data dashboard berhasil diambil',
            data: results
        });

    } catch (error) {
        console.error('💥 Error fetching dashboard summary:', error);
        res.status(500).json({ 
            success: false,
            message: 'Gagal mengambil data dashboard', 
            error: error.message 
        });
    }
};

// --- FUNGSI 2: Ringkasan Ulasan dan Penjualan Produk (Gabungan 4 Metrik) ---
const getProductReviewSummary = async (req, res) => {
    // Query ini menggabungkan Produk, Ulasan, dan Penjualan (DetailPemesanan + Pemesanan)
    const query = `
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
        GROUP BY 
            P.produkId, P.namaProduk
        ORDER BY 
            average_rating DESC, total_quantity_sold DESC;
    `;

    try {
        const [summary] = await pool.query(query, [SUCCESS_STATUS]);

        res.json({
            success: true,
            message: 'Ringkasan ulasan dan penjualan produk berhasil diambil',
            data: summary
        });
    } catch (error) {
        console.error('💥 Error fetching product review summary:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan ulasan/penjualan produk',
            error: error.message
        });
    }
};

// --- FUNGSI 3: Laporan Penjualan Detail ---
const getSalesReport = async (req, res) => {
    const { startDate, endDate, lokasiId } = req.query;

    let query = `
        SELECT
            P.namaProduk AS namaProduk,
            SUM(DP.quantity) AS QTY,
            SUM(DP.subtotal) AS totalHarga,
            L.name AS lokasi,
            DATE(PM.tanggalPesanan) AS date,
            PM.pesananid
        FROM
            Pemesanan PM
        JOIN
            DetailPemesanan DP ON PM.pesananid = DP.pesananid
        JOIN
            Produk P ON DP.produkId = P.produkId
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        WHERE
            PM.statusPesanan = ?
    `;

    const params = [SUCCESS_STATUS];

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
            P.namaProduk, L.name, DATE(PM.tanggalPesanan), PM.pesananid
        ORDER BY
            PM.tanggalPesanan DESC, P.namaProduk ASC
    `;

    try {
        const [reportData] = await pool.query(query, params);
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

// --- FUNGSI 4: Ringkasan Pendapatan (Per Lokasi) ---
const getSummaryRevenue = async (req, res) => {
    let query = `
        SELECT
            L.name AS lokasi,
            SUM(PM.TotalHarga) AS totalPendapatan
        FROM
            Pemesanan PM
        JOIN
            Lokasi L ON PM.lokasiId = L.lokasiId
        WHERE
            PM.statusPesanan = ?
        GROUP BY
            L.name
    `;

    try {
        const [summaryData] = await pool.query(query, [SUCCESS_STATUS]);
        res.json({
            success: true,
            data: summaryData
        });
    } catch (err) {
        console.error('Error fetching revenue summary:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan pendapatan',
            error: err.message
        });
    }
};

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
    `;

    try {
        const [summaryData] = await pool.query(query, [SUCCESS_STATUS]);
        res.json({
            success: true,
            data: summaryData
        });
    } catch (err) {
        console.error('Error fetching quantity summary:', err);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan kuantitas',
            error: err.message
        });
    }
};

// --- FUNGSI 6: Produk Terjual per Jenis Produk (untuk Pie Chart) ---
const getProductsSoldSummary = async (req, res) => {
    const query = `
        SELECT 
            P.namaProduk,
            COALESCE(SUM(DP.quantity), 0) AS total_quantity_sold
        FROM DetailPemesanan DP
        JOIN Pemesanan PM ON DP.pesananid = PM.pesananid
        JOIN Produk P ON DP.produkId = P.produkId
        WHERE PM.statusPesanan = ?
        GROUP BY P.namaProduk
        ORDER BY total_quantity_sold DESC;
    `;

    try {
        const [productsSummary] = await pool.query(query, [SUCCESS_STATUS]);

        res.json({
            success: true,
            message: 'Ringkasan produk terjual per jenis berhasil diambil',
            data: productsSummary
        });
    } catch (error) {
        console.error('💥 Error fetching products sold summary:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan produk terjual',
            error: error.message
        });
    }
};


// --- FUNGSI 7: Ringkasan Penjualan per Tipe Pesanan (Online vs Offline) ---
const getSalesByOrderTypeSummary = async (req, res) => {
    const query = `
        SELECT 
            tipePesanan,
            COUNT(pesananId) as total_orders,
            COALESCE(SUM(TotalHarga), 0) as total_revenue
        FROM Pemesanan
        WHERE statusPesanan = ?
        GROUP BY tipePesanan
        ORDER BY total_revenue DESC;
    `;

    try {
        const [summary] = await pool.query(query, [SUCCESS_STATUS]);

        res.json({
            success: true,
            message: 'Ringkasan penjualan per tipe pesanan berhasil diambil',
            data: summary
        });
    } catch (error) {
        console.error('💥 Error fetching sales by order type summary:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memuat ringkasan tipe pesanan',
            error: error.message
        });
    }
};


// --- FUNGSI LAINNYA ---
const updateSalesTransaction = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
};

const deleteSalesTransaction = async (req, res) => {
    res.status(501).json({ message: 'Not implemented yet' });
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
    deleteSalesTransaction
};