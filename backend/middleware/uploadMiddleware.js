const multer = require('multer');
const path = require('path');
// Tidak perlu lagi mengimpor fs karena kita tidak menulis ke disk

// ❌ HAPUS: Semua kode yang memeriksa/membuat folder './uploads/'
// if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }

/**
 * 1. Konfigurasi Penyimpanan (MemoryStorage)
 * Mengubah penyimpanan dari disk lokal menjadi memori server.
 */
const storage = multer.memoryStorage(); // 💡 PERUBAHAN KRUSIAL: Menyimpan file di memori

/**
 * 2. Konfigurasi Filter File (Keamanan)
 * Memastikan hanya file gambar yang boleh di-upload.
 */
const fileFilter = (req, file, cb) => {
  // Tentukan tipe file yang diizinkan
  const allowedTypes = /jpeg|jpg|png|webp/;
  
  // Cek ekstensi file
  const isExtValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // Cek mimetype file
  const isMimeValid = allowedTypes.test(file.mimetype);

  if (isExtValid && isMimeValid) {
    // Jika valid, terima file
    return cb(null, true);
  } else {
    // Jika tidak valid, tolak file dan kirim error
    cb(new Error('Hanya file gambar (jpeg, jpg, png, webp) yang diizinkan!'), false);
  }
};

/**
 * 3. Inisialisasi Multer
 * Gabungkan semua konfigurasi.
 */
const upload = multer({
  storage: storage,       // Menggunakan memoryStorage
  fileFilter: fileFilter, 
  limits: { 
    fileSize: 2 * 1024 * 1024 // Batas ukuran file: 2 MB
  } 
});

// Ekspor middleware 'upload'
module.exports = upload;