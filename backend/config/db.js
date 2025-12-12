// db.js
const mysql = require('mysql2')
const path = require('path')
require('dotenv').config({
  path:
    process.env.NODE_ENV === 'production'
      ? path.resolve(__dirname, '..', '.env.production')
      : path.resolve(__dirname, '..', '.env.development'),
})

// -------------------------------
// 📌 Konfigurasi Database
// -------------------------------
const connectionConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,

  // Konfigurasi Standar (Aman untuk Railway)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // WAJIB: Aktifkan SSL untuk Railway
  ssl: {
    rejectUnauthorized: false
  }
}

// Debug output
console.log('🔍 Database Configuration:')
console.log('   Environment:', process.env.NODE_ENV || 'development')
console.log('   Host:', connectionConfig.host)
console.log('   Port:', connectionConfig.port)
console.log('   Database:', connectionConfig.database)

// -------------------------------
// 📌 Pool Koneksi
// -------------------------------
const pool = mysql.createPool(connectionConfig).promise()

// Wrapper untuk handle auto-retry saat ECONNRESET
const originalQuery = pool.query.bind(pool)

pool.query = async function (...args) {
  try {
    return await originalQuery(...args)
  } catch (err) {
    if (err.code === 'ECONNRESET' || err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.warn('🔄 Database connection lost (ECONNRESET), retrying query...')
      return await originalQuery(...args)
    }
    throw err
  }
}

// -------------------------------
// 📌 Error Handling
// -------------------------------
pool.on('error', (err) => {
  console.error('💥 Database pool error:', err.code)

  switch (err.code) {
    case 'PROTOCOL_CONNECTION_LOST':
      console.log('🔄 Connection lost, reconnecting...')
      break
    case 'ER_CON_COUNT_ERROR':
      console.error('⚠️ Too many connections')
      break
    case 'ECONNREFUSED':
      console.error('⚠️ Connection refused — check DB credentials')
      break
  }
})

// -------------------------------
// 📌 Test Koneksi (Development Only)
// -------------------------------
if (process.env.NODE_ENV !== 'production') {
  pool
    .getConnection()
    .then(async (conn) => {
      console.log('✅ Koneksi database berhasil!')
      const [info] = await conn.query('SELECT DATABASE() as db, NOW() as time')
      console.log('   Connected to:', info[0].db)
      console.log('   Server time:', info[0].time)
      conn.release()
    })
    .catch((err) => {
      console.error('❌ Gagal koneksi ke database:')
      console.error('   Code:', err.code)
      console.error('   Message:', err.message)
    })
}

module.exports = pool
