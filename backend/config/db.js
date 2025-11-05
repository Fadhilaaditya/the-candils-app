// backend/config/db.js

const mysql = require('mysql2');
const url = require('url'); 
// 💡 JAMINAN FIX: Memastikan variabel lingkungan dimuat
// Kapan pun file ini di-require oleh controller, kredensial pasti ada.

const isRailwayDeployment = process.env.DATABASE_URL;
let connectionConfig = {};

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK LINGKUNGAN CLOUD (Railway) ---
  
  // Karena DATABASE_URL mengandung host, user, password, dan port dalam satu string URI
  const dbUrl = new URL(process.env.DATABASE_URL);

  connectionConfig = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    // ✅ FIX PORT: Mengubah string port menjadi integer
    port: parseInt(dbUrl.port, 10), 
    // Jika perlu SSL/TLS untuk MySQL di Cloud (jarang, tapi mungkin)
    // ssl: { rejectUnauthorized: false } 
  };
} else {
  // --- KONFIGURASI UNTUK LINGKUNGAN LOKAL (Development/Testing) ---
  
  // ✅ FIX PORT: Membaca DB_PORT sebagai string dari .env dan mengubahnya menjadi integer
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: port,
  };
}

// --- DEBUG LOG (PENTING untuk konfirmasi) ---
console.log("--- DEBUG KONFIGURASI KONEKSI ---");
console.log("Host:", connectionConfig.host);
console.log("Port:", connectionConfig.port, `(${typeof connectionConfig.port})`);
console.log("User:", connectionConfig.user);
console.log("Database:", connectionConfig.database);
console.log("------------------------------------");

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
    // Menampilkan seluruh objek error agar kita tahu jika ada masalah otentikasi (ER_ACCESS_DENIED_ERROR)
    console.error("❌ ERROR KONEKSI DATABASE GAGAL. Detail:", err.code || err.message || JSON.stringify(err));
  });

module.exports = pool;