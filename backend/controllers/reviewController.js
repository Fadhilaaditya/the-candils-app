const db = require('../config/db');
const cloudinary = require('cloudinary').v2; // Import Cloudinary

// @route   GET /api/products/:produkId/reviews
// @desc    Mendapatkan semua ulasan untuk satu produk (Versi Sederhana)
// @access  Public
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { produkId } = req.params;

    // Query SELECT sederhana, tidak perlu JOIN
    const query = `
      SELECT 
        ulasanId, produkId, namaReviewer, rating, komentar, foto, tanggalUlasan
      FROM 
        Ulasan
      WHERE 
        produkId = ?
      ORDER BY 
        tanggalUlasan DESC; 
    `;

    const [reviews] = await db.query(query, [produkId]);

    res.json(reviews);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/products/:produkId/reviews
// @desc    Membuat ulasan baru (Versi Sederhana)
// @access  Public (Siapapun bisa, tidak perlu authMiddleware)
exports.createReview = async (req, res) => {
  try {
    const { produkId } = req.params;
    
    // Ambil data baru dari body
    const { namaReviewer, rating, komentar } = req.body;

    // Validasi dasar
    if (!namaReviewer || !rating) {
      return res.status(400).json({ message: 'Nama Reviewer dan Rating wajib diisi.' });
    }
    // Pastikan rating adalah angka dan valid
    const numRating = parseInt(rating, 10);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: 'Rating harus berupa angka antara 1 dan 5.' });
    }

    // Cek apakah ada file foto yang diupload
    let fotoUrl = null;
    if (req.file) {
      try {
        // Konversi buffer menjadi Data URI
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataUri = 'data:' + req.file.mimetype + ';base64,' + b64;
        
        // Upload ke Cloudinary
        const result = await cloudinary.uploader.upload(dataUri, {
          folder: 'ulasan_produk', // Folder khusus untuk ulasan
        });

        fotoUrl = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary Upload Error:', uploadError);
        return res.status(500).json({ message: 'Gagal mengupload gambar.' });
      }
    }

    // Masukkan ulasan ke database
    const query = `
      INSERT INTO Ulasan (produkId, namaReviewer, rating, komentar, foto) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      produkId,
      namaReviewer,
      numRating,
      komentar || null,
      fotoUrl
    ]);

    res.status(201).json({ message: 'Ulasan berhasil ditambahkan', ulasanId: result.insertId });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

