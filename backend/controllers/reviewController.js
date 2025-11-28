const db = require('../config/db');

// @route   GET /api/products/:produkId/reviews
// @desc    Mendapatkan semua ulasan untuk satu produk (Versi Sederhana)
// @access  Public
exports.getReviewsByProduct = async (req, res) => {
  try {
    const { produkId } = req.params;

    // Query SELECT sederhana, tidak perlu JOIN
    const query = `
      SELECT 
        ulasanId, produkId, namaReviewer, rating, komentar, tanggalUlasan
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

    // Masukkan ulasan ke database
    const query = `
      INSERT INTO Ulasan (produkId, namaReviewer, rating, komentar) 
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(query, [
      produkId,
      namaReviewer,
      numRating,
      komentar || null
    ]);

    res.status(201).json({ message: 'Ulasan berhasil ditambahkan', ulasanId: result.insertId });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

