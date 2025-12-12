// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // <-- HANYA SATU KALI DI SINI

// Kita ekspor fungsi 'login'
exports.login = async (req, res) => {
  // 1. Ambil username dan password dari body request
  const { username, password } = req.body;

  // Validasi input sederhana
  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password tidak boleh kosong' });
  }

  try {
    // 2. Cari user di database
    // (Saya ganti 'Users' jadi 'User' sesuai SQL tabel Anda, jika salah silakan ganti)
    const [users] = await db.query(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

    // 3. Cek apakah user ditemukan
    if (users.length === 0) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const user = users[0];

    // 4. Bandingkan password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    // 5. Jika password cocok, buat JSON Web Token (JWT)
    const payload = {
      user: {
        id: user.userId,
        username: user.username,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        // 6. Kirim token ke client
        res.json({
          message: 'Login berhasil',
          token: token,
          user: payload.user // Return user info including role
        });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Fungsi untuk registrasi admin baru
exports.register = async (req, res) => {
  const { username, password, namaLengkap, role } = req.body;

  if (!username || !password || !namaLengkap) {
    return res.status(400).json({ message: 'Mohon lengkapi semua data' });
  }

  try {
    // 1. Cek apakah username sudah ada
    const [existingUser] = await db.query(
      'SELECT userId FROM Users WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Simpan ke database
    // Default role 'admin' jika tidak ditentukan
    const userRole = role || 'admin';
    
    await db.query(
      'INSERT INTO Users (username, password, namaLengkap, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, namaLengkap, userRole]
    );

    res.status(201).json({ message: 'Registrasi berhasil' });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// --- INI KODE BARU YANG DITAMBAHKAN ---

// Fungsi untuk mendapatkan data user yang sedang login
exports.getMe = async (req, res) => {
  try {
    // Kita mendapatkan 'req.user.id' dari middleware
    const [users] = await db.query(
      'SELECT userId, username, namaLengkap, role FROM Users WHERE userId = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    res.json(users[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};