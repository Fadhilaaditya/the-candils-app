// (Lokasi: file index.js di root backend Anda)

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Impor Rute
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pesananRoutes = require('./routes/pesananRoutes'); 
// --- VVV PASTIKAN BARIS INI ADA VVV ---
const cartRoutes = require('./routes/cart'); 
// ------------------------------------

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
// Ini sudah benar, mengizinkan semua domain
app.use(cors()); 
app.use(express.json());

// Middleware untuk menyajikan file statis (gambar)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rute ---
app.get('/', (req, res) => {
  res.send('Server API The Candils berjalan!');
});

// Rute untuk Autentikasi
app.use('/api/auth', authRoutes);

// Rute untuk Produk & Ulasan
app.use('/api/products/:produkId/reviews', reviewRoutes);
app.use('/api/products', productRoutes);

// Rute untuk Pesanan
app.use('/api/pesanan', pesananRoutes);

// --- VVV PASTIKAN RUTE INI DIDAFTARKAN VVV ---
// Ini mendaftarkan semua rute dari 'cart.js' 
// (GET /, POST /add, PUT /update, DELETE /remove)
// di bawah prefix /api/cart
app.use('/api/cart', cartRoutes);
// -------------------------------------------

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});