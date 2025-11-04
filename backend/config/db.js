// config/db.js
const mysql = require('mysql2');
require('dotenv').config(); 

// 1. Tentukan apakah menggunakan DATABASE_URL (disediakan oleh Railway)
const isRailwayDeployment = process.env.DATABASE_URL;

let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY ---
  connectionConfig = {
    uri: process.env.DATABASE_URL,
    // ⚠️ PENTING: Konfigurasi SSL dihilangkan karena sering menyebabkan kegagalan koneksi di lingkungan container.
    // Jika koneksi berhasil setelah ini, masalahnya adalah SSL.
  };
} else {
  // --- KONFIGURASI UNTUK LOKAL (Development) ---
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
  ...connectionConfig, 
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();


// 2. Tambahkan Logging untuk Memverifikasi Koneksi dan Menangkap Seluruh Objek Error
pool.getConnection()
  .then(connection => {
    // Jika koneksi berhasil
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    connection.release(); 
  })
  .catch(err => {
    // ❌ TANGKAP SELURUH OBJEK ERROR (bukan hanya .message)
    // Ini memastikan kita mendapatkan detail error, meskipun properti .message kosong.
    console.error("❌ ERROR KONEKSI DATABASE GAGAL. Detail:", err);
  });


// Ekspor promise pool
module.exports = pool;