// middleware/adminMiddleware.js
// Middleware ini harus dijalankan SETELAH authMiddleware

module.exports = function(req, res, next) {
  try {
    // Kita ambil data user dari 'req.user' yang sudah di-set oleh authMiddleware
    const userRole = req.user.role;

    // Cek apakah role-nya 'Admin' atau 'Super Admin'
    if (userRole === 'Admin' || userRole === 'Super Admin') {
      // Jika ya, izinkan lanjut ke controller
      next();
    } else {
      // Jika bukan, kirim error 403 (Forbidden)
      return res.status(403).json({ message: 'Akses ditolak. Hanya untuk Admin.' });
    }
  } catch (err) {
    res.status(401).json({ message: 'Otorisasi gagal.' });
  }
};
