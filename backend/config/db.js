// config/db.js
const mysql = require('mysql2');
const url = require('url'); 
// Pastikan require('dotenv').config() TIDAK ADA di sini.

const isRailwayDeployment = process.env.RAILWAY_ENVIRONMENT || process.env.DATABASE_URL;
let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY: Pastikan hanya DATABASE_URL yang digunakan ---
  
  // 💡 Ganti dengan DATABASE_URL dari Railway
  const dbUrl = new URL(process.env.DATABASE_URL); 

  connectionConfig = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    port: dbUrl.port,
    // SSL DIHAPUS (Sesuai dengan solusi terakhir)
  };
} else {
  // --- KONFIGURASI UNTUK LOKAL ---
  connectionConfig = {
    host: process.env.DB_HOST || 'localhost', // Tambahkan fallback eksplisit
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


// Test Connection
pool.getConnection()
  .then(connection => {
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    connection.release(); 
  })
  .catch(err => {
    // ❌ Logging yang kuat
    console.error("❌ ERROR KONEKSI DATABASE GAGAL. Detail:", err.code || err.message || JSON.stringify(err));
  });

module.exports = pool;