const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
// Anda harus memastikan middleware ini ada di proyek Anda
const authMiddleware = require('../middleware/authMiddleware'); 
const { validateSalesReportQuery } = require('../middleware/validateSalesMiddleware'); 


// Rute untuk Laporan Penjualan Detail
router.get(
    '/report', 
    // Menggunakan array untuk middleware agar berfungsi dengan baik: [authMiddleware, validateSalesReportQuery]
    salesController.getSalesReport 
);

// Rute untuk Ringkasan Bar Chart
router.get(
    '/summary', 
    // Menggunakan array untuk middleware: [authMiddleware, validateSalesReportQuery]
    salesController.getSalesSummary
);

// ✅ Rute CRUD TRANSAKSI PENJUALAN
// Rute PUT (Edit Laporan)
router.put(
    '/transaction/:pesananId/:produkId',
    // Middleware opsional, tambahkan jika Anda ingin membatasi akses: [authMiddleware]
    salesController.updateSalesTransaction
);

// Rute DELETE (Hapus Item Laporan)
router.delete(
    '/transaction/:pesananId/:produkId',
    // Middleware opsional, tambahkan jika Anda ingin membatasi akses: [authMiddleware]
    salesController.deleteSalesTransaction
);

module.exports = router;