// config/db.js
const mysql = require('mysql2');
// Pastikan package 'dotenv' sudah terinstal: npm install dotenv
require('dotenv').config(); 

// 1. Tentukan apakah menggunakan DATABASE_URL (disediakan oleh Railway)
const isRailwayDeployment = process.env.DATABASE_URL;

let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY ---
  // Railway menyediakan seluruh info koneksi dalam satu string (URI)
  connectionConfig = {
    uri: process.env.DATABASE_URL,
    // Beberapa layanan cloud memerlukan SSL, ini opsional dan bisa dihapus/diubah.
    // Jika koneksi gagal, coba hapus baris ini (atau ubah menjadi ssl: {})
    ssl: {
        rejectUnauthorized: false
    } 
  };
} else {
  // --- KONFIGURASI UNTUK LOKAL (Development) ---
  // Menggunakan variabel lingkungan terpisah dari file .env lokal
  connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
  };
}


// Buat Pool Koneksi
const pool = mysql.createPool({
  ...connectionConfig, // Sebarkan konfigurasi yang telah dipilih
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();


// 2. Tambahkan Logging untuk Memverifikasi Koneksi (Wajib untuk Debugging Deployment)
// Ini akan memaksa error koneksi muncul di logs Railway jika gagal.
pool.getConnection()
  .then(connection => {
    // Jika koneksi berhasil
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    connection.release(); // Lepaskan koneksi kembali ke pool
  })
  .catch(err => {
    // ❌ Jika koneksi gagal, tampilkan error spesifik di log
    console.error("❌ ERROR KONEKSI DATABASE GAGAL:", err.message);
    // Ini penting agar Anda dapat melihat penyebab kegagalan di logs Railway.
  });


// Ekspor promise pool agar bisa digunakan di route handler Anda
module.exports = pool;