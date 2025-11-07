const mysql = require('mysql2');
require('dotenv').config();

const isRailwayDeployment = process.env.DATABASE_URL;
let connectionConfig = {};

console.log('🔍 Database Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Using:', isRailwayDeployment ? 'Railway (DATABASE_URL)' : 'Local MySQL');

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY (PRODUCTION) ---
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);

    connectionConfig = {
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.substring(1),
      port: parseInt(dbUrl.port, 10),
      // ✅ SSL Configuration (REQUIRED for Railway)
      ssl: {
        rejectUnauthorized: false
      },
      // ✅ Timeout Configuration
      connectTimeout: 60000,      // 60 seconds
      acquireTimeout: 60000,      // 60 seconds
      timeout: 60000,             // 60 seconds
      // ✅ Keep-Alive Configuration
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000  // 10 seconds
    };

    console.log('   Host:', dbUrl.hostname);
    console.log('   Port:', parseInt(dbUrl.port, 10));
    console.log('   Database:', dbUrl.pathname.substring(1));
  } catch (error) {
    console.error('❌ Error parsing DATABASE_URL:', error.message);
    throw error;
  }
} else {
  // --- KONFIGURASI UNTUK LOKAL (DEVELOPMENT) ---
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  connectionConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'candils_db',
    port: port,
    // Local tidak perlu SSL
    connectTimeout: 10000
  };

  console.log('   Host:', connectionConfig.host);
  console.log('   Port:', connectionConfig.port);
  console.log('   Database:', connectionConfig.database);
}

// --- BUAT POOL KONEKSI ---
const pool = mysql.createPool({
  ...connectionConfig,
  waitForConnections: true,
  connectionLimit: 5,           // ✅ Reduced from 10 to 5 for Railway free tier
  queueLimit: 0,
  maxIdle: 5,                   // ✅ Maximum idle connections
  idleTimeout: 60000,           // ✅ Close idle connections after 60s
  enableKeepAlive: true
}).promise();

// --- ERROR HANDLER ---
pool.on('error', (err) => {
  console.error('💥 Database pool error:', err.code);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('🔄 Connection lost, pool will reconnect automatically');
  } else if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('⚠️  Too many connections');
  } else if (err.code === 'ECONNREFUSED') {
    console.error('⚠️  Database connection refused');
  }
});

// --- TEST CONNECTION (Only in Development & Non-Vercel) ---
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  pool.getConnection()
    .then(connection => {
      console.log("✅ KONEKSI DATABASE BERHASIL!");
      return connection.query('SELECT DATABASE() as db, NOW() as time');
    })
    .then(([results, connection]) => {
      console.log('   Connected to:', results[0].db);
      console.log('   Server time:', results[0].time);
      if (connection) connection.release();
    })
    .catch(err => {
      console.error("❌ ERROR KONEKSI DATABASE:");
      console.error("   Code:", err.code);
      console.error("   Message:", err.message);
      
      // Don't throw in production, let app start anyway
      if (process.env.NODE_ENV !== 'production') {
        console.error("\n💡 Troubleshooting:");
        if (err.code === 'ECONNREFUSED') {
          console.error("   → Make sure MySQL is running");
          console.error("   → Check host and port in .env");
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
          console.error("   → Check username and password in .env");
        } else if (err.code === 'ER_BAD_DB_ERROR') {
          console.error("   → Database doesn't exist, create it first");
        }
      }
    });
}

module.exports = pool;