// config/db.js
const mysql = require('mysql2');
require('dotenv').config(); // Memuat variabel dari .env

// Buat "pool" koneksi. Pool lebih efisien daripada membuat koneksi baru setiap saat
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 8889, // <-- TAMBAHKAN BARIS INI
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Ekspor promise agar bisa digunakan di file lain
module.exports = pool.promise();