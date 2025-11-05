// config/db.js
const mysql = require('mysql2');
const url = require('url'); // Pastikan ini ada jika Anda menggunakan URL parsing

// ⚠️ HAPUS BARIS INI: require('dotenv').config(); 

const isRailwayDeployment = process.env.DATABASE_URL;
let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY ---
  const dbUrl = new URL(process.env.DATABASE_URL);

  connectionConfig = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    port: dbUrl.port,
    // Kita aktifkan SSL lagi karena sudah menghapus dotenv
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // --- KONFIGURASI UNTUK LOKAL (Pastikan Anda menggunakan dotenv di luar file ini) ---
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

// Test Connection (Gunakan logic ini, tetapi pastikan sudah dihapus dari index.js)
pool.getConnection()
  .then(connection => {
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    connection.release(); 
  })
  .catch(err => {
    // ⚠️ Jika Anda masih dapat error ini, coba matikan konfigurasi SSL
    console.error("❌ ERROR KONEKSI DATABASE:", err.message);
  });

module.exports = pool;