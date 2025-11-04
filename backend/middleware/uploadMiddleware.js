const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Tentukan folder tujuan untuk menyimpan file
const uploadDir = './uploads/';

// Cek apakah folder 'uploads/' sudah ada, jika tidak, buat folder tersebut
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

/**
 * 1. Konfigurasi Penyimpanan (DiskStorage)
 * Mengatur folder tujuan dan bagaimana file akan dinamai.
 */
const storage = multer.diskStorage({
  // Tentukan folder tujuan
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Simpan file di folder './uploads/'
  },
  
  // Tentukan nama file yang unik
  filename: (req, file, cb) => {
    // Buat nama unik untuk menghindari konflik nama file
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Ambil ekstensi file asli (misal: .png, .jpg)
    const extension = path.extname(file.originalname);
    // Gabungkan nama field ('foto') + nama unik + ekstensi
    // Hasil akhir: 'foto-1678886400000-123456789.png'
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  }
});

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
 * Gabungkan semua konfigurasi (storage, filter, dan batas ukuran file).
 */
const upload = multer({
  storage: storage,       // Gunakan konfigurasi 'storage' di atas
  fileFilter: fileFilter, // Gunakan konfigurasi 'fileFilter' di atas
  limits: { 
    fileSize: 2 * 1024 * 1024 // Batas ukuran file: 2 MB
  } 
});

// Ekspor middleware 'upload' agar bisa digunakan di file lain (routes)
module.exports = upload;
