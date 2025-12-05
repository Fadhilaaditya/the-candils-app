// routes/auth.js
const express = require('express');
const router = express.Router();

// 1. Impor controller
const authController = require('../controllers/authController');

// 2. Impor middleware penjaga (BARU)
const authMiddleware = require('../middleware/authMiddleware');

// Rute login (Publik, tidak perlu middleware)
// Rute login (Publik, tidak perlu middleware)
router.post('/login', authController.login);

// Rute register (Publik, untuk membuat akun admin baru)
router.post('/register', authController.register);

// Rute /me (Dilindungi, HARUS login) (BARU)
// Ini akan menjalankan authMiddleware DULU, baru authController.getMe
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;