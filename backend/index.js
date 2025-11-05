// backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Impor Rute
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pesananRoutes = require('./routes/pesananRoutes'); 
const cartRoutes = require('./routes/cart'); 

const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rute ---
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server API The Candils berjalan!',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Rute untuk Autentikasi
app.use('/api/auth', authRoutes);

// Rute untuk Produk & Ulasan
app.use('/api/products/:produkId/reviews', reviewRoutes);
app.use('/api/products', productRoutes);

// Rute untuk Pesanan
app.use('/api/pesanan', pesananRoutes);

// Rute untuk Cart
app.use('/api/cart', cartRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.path 
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    message: 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal error'
  });
});

// ✅ PENTING: Untuk local development SAJA
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

// ✅ CRITICAL: Export untuk Vercel
module.exports = app;