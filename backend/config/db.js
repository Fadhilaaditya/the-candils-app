// config/db.js
const mysql = require('mysql2');
const url = require('url'); // 💡 TAMBAHKAN INI
require('dotenv').config(); 

const isRailwayDeployment = process.env.DATABASE_URL;
let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY ---
  const dbUrl = new URL(process.env.DATABASE_URL); // Urai string URI

  connectionConfig = {
    // Gunakan komponen yang diurai
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1), // Menghilangkan garis miring awal (/)
    port: dbUrl.port,
    // SSL tetap dihilangkan
  };
} else {
  // --- KONFIGURASI UNTUK LOKAL ---
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


// 2. Logging
pool.getConnection()
  .then(connection => {
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    connection.release(); 
  })
  .catch(err => {
    // ❌ Sekarang kita menangkap seluruh objek error
    console.error("❌ ERROR KONEKSI DATABASE GAGAL. Detail:", err);
  });


module.exports = pool;