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
const cartRoutes = require('./routes/cart'); 
// 💡 TAMBAHKAN INI: Impor Pool dari file konfigurasi database
const pool = require('./config/db'); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rute ---
app.get('/', (req, res) => {
  res.send('Server API The Candils berjalan!');
});

// ... (Pendaftaran Rute Lain) ...
app.use('/api/auth', authRoutes);
app.use('/api/products/:produkId/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/cart', cartRoutes);


// ----------------------------------------------------
// ⚠️ MODIFIKASI DIMULAI DI SINI: Membuat Server Menunggu DB
// ----------------------------------------------------

async function startServer() {
  try {
    // 1. Cek Koneksi Database (Memaksa error muncul jika gagal)
    console.log("🟡 Memeriksa koneksi database...");
    const connection = await pool.getConnection();
    connection.release();
    console.log("✅ Koneksi database berhasil diverifikasi!");

    // 2. Jika sukses, baru jalankan Express.js
    app.listen(PORT, () => {
      // Perbarui log agar lebih jelas di Railway
      console.log(`✅ Server Express.js berjalan di port ${PORT} dan siap melayani!`);
    });
    
  } catch (err) {
    // 3. Jika ada error koneksi DB, tampilkan detail error dan matikan proses
    console.error("🔴 SERVER GAGAL START. Error Koneksi Database:", err.message || JSON.stringify(err));
    // Mematikan proses penting agar Railway tahu server gagal
    process.exit(1); 
  }
}

// Jalankan server
startServer();