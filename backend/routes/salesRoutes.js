const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const authMiddleware = require('../middleware/authMiddleware'); 
const { validateSalesReportQuery } = require('../middleware/validateSalesMiddleware'); 


// Rute untuk Laporan Penjualan Detail (Tabel)
router.get(
    '/report', 
    // Anda bisa menambahkan [authMiddleware, validateSalesReportQuery] di sini
    salesController.getSalesReport 
);

// ✅ Rute untuk Ringkasan Pendapatan (Revenue Chart)
router.get(
    '/summary-revenue', 
    salesController.getSummaryRevenue
);

// ✅ Rute untuk Ringkasan Kuantitas Produk Terjual (Products Sold Chart)
router.get(
    '/summary-quantity', 
    salesController.getSummaryQuantity
);


// Rute CRUD TRANSAKSI PENJUALAN HISTORIS
router.put(
    '/transaction/:pesananId/:produkId',
    salesController.updateSalesTransaction
);

router.delete(
    '/transaction/:pesananId/:produkId',
    salesController.deleteSalesTransaction
);

module.exports = router;