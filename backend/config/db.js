// config/db.js (Modifikasi bagian ini)

if (isRailwayDeployment) {
  // --- KONFIGURASI UNTUK RAILWAY ---
  const dbUrl = new URL(process.env.DATABASE_URL);

  connectionConfig = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    database: dbUrl.pathname.substring(1),
    port: dbUrl.port,
    // ⚠️ HAPUS SSL SAMA SEKALI
  };
} 
// ...