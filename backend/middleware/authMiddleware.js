// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
  // 1. Ambil token dari header
  // Client akan mengirim token di header 'Authorization'
  // dengan format 'Bearer <token>'
  const authHeader = req.header('Authorization');

  // 2. Cek jika tidak ada header
  if (!authHeader) {
    return res.status(401).json({ message: 'Akses ditolak. Tidak ada token.' });
  }

  try {
    // 3. Ekstrak token-nya saja (tanpa 'Bearer ')
    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Format token salah.' });
    }

    // 4. Verifikasi token
    // Ini akan mendekripsi token menggunakan JWT_SECRET Anda
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. Simpan data user dari token ke 'req.user'
    // 'decoded.user' berasal dari 'payload' yang kita buat saat login
    req.user = decoded.user;

    // 6. Lanjutkan ke rute yang sebenarnya
    next();

  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid.' });
  }
};