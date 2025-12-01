const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController');
const upload = require('../middleware/uploadMiddleware');

// @route   GET /api/products/:produkId/reviews
// @desc    Mendapatkan semua ulasan
// @access  Public
router.get('/', reviewController.getReviewsByProduct);

// @route   POST /api/products/:produkId/reviews
// @desc    Membuat ulasan baru
// @access  Public (TIDAK ADA authMiddleware)
router.post('/', upload.single('foto'), reviewController.createReview); 

module.exports = router;