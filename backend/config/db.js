// config/db.js
const mysql = require('mysql2');
require('dotenv').config(); 

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
    // ✅ TAMBAHKAN SSL
    ssl: {
      rejectUnauthorized: false // Railway butuh ini
    }
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

// Test Connection (opsional, bisa dihapus di production)
pool.getConnection()
  .then(connection => {
    console.log("✅ KONEKSI DATABASE BERHASIL!");
    connection.release(); 
  })
  .catch(err => {
    console.error("❌ ERROR KONEKSI DATABASE:", err.message);
    // Jangan log full error di production (bisa expose credentials)
  });

module.exports = pool;