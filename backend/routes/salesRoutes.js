// routes/salesRoutes.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');


// 🚀 Rute 1: Dashboard Utama (Mengambil semua data ringkasan)
router.get(
    '/dashboard-summary', 
    salesController.getDashboardSummary
);

// ✨ Rute 2: Ringkasan Ulasan dan Penjualan Produk (untuk daftar di Dashboard)
// Endpoint: GET /api/sales/product-review-summary
router.get(
    '/product-review-summary',
    salesController.getProductReviewSummary
);

// Rute 3: Laporan Penjualan Detail (Tabel)
router.get(
    '/report', 
    salesController.getSalesReport 
);

// Rute 4: Ringkasan Pendapatan (Per Lokasi)
router.get(
    '/summary-revenue', 
    salesController.getSummaryRevenue
);

// Rute 5: Ringkasan Kuantitas Produk Terjual (Per Lokasi)
router.get(
    '/summary-quantity', 
    salesController.getSummaryQuantity
);

// Rute 6: Produk Terjual per Jenis Produk (untuk Pie Chart)
router.get(
    '/summary-products-sold',
    salesController.getProductsSoldSummary
);

// Rute 7: Ringkasan Penjualan per Tipe Pesanan (Online vs Offline)
router.get(
    '/summary-order-type',
    salesController.getSalesByOrderTypeSummary
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