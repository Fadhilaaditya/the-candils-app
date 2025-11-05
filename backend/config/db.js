const mysql = require('mysql2');
const url = require('url'); 
// Asumsi: require('dotenv').config() sudah dipanggil di index.js

const isRailwayDeployment = process.env.DATABASE_URL;
let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK LINGKUNGAN CLOUD (Railway via DATABASE_URL) ---
  const dbUrl = new URL(process.env.DATABASE_URL);

  connectionConfig = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    // ✅ FIX PORT: Mengubah string port dari URL menjadi integer
    port: parseInt(dbUrl.port, 10), 
  };
} else {
  // --- KONFIGURASI UNTUK LINGKUNGAN LOKAL (Development) ---
  
  // ✅ FIX PORT: Mengubah string port dari DB_PORT menjadi integer
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: port,
  };
}

// --- LOGGING (Dihilangkan setelah testing, dipertahankan untuk final check) ---
// console.log("--- DEBUG KONFIGURASI KONEKSI ---");
// console.log("Host:", connectionConfig.host);
// console.log("Port:", connectionConfig.port, `(${typeof connectionConfig.port})`);
// console.log("User:", connectionConfig.user);
// console.log("Database:", connectionConfig.database);
// console.log("------------------------------------");

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
    // Menampilkan error jika koneksi gagal
    console.error("❌ ERROR KONEKSI DATABASE GAGAL. Detail:", err.code || err.message || JSON.stringify(err));
  });

module.exports = pool;
