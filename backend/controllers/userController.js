const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT userId, username, namaLengkap, role FROM Users ORDER BY userId DESC');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// POST /api/users
exports.createUser = async (req, res) => {
  const { username, password, namaLengkap, role } = req.body;

  if (!username || !password || !namaLengkap || !role) {
    return res.status(400).json({ message: 'Mohon lengkapi semua data' });
  }

  try {
    // Cek username existing
    const [existing] = await db.query('SELECT userId FROM Users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Username sudah digunakan' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
      'INSERT INTO Users (username, password, namaLengkap, role) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, namaLengkap, role]
    );

    res.status(201).json({ message: 'User berhasil dibuat' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// PUT /api/users/:id
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, namaLengkap, role } = req.body;

  try {
    // Cek user exists
    const [user] = await db.query('SELECT * FROM Users WHERE userId = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    // Cek username conflict jika ganti username
    if (username && username !== user[0].username) {
      const [existing] = await db.query('SELECT userId FROM Users WHERE username = ?', [username]);
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Username sudah digunakan' });
      }
    }

    let updateQuery = 'UPDATE Users SET username = ?, namaLengkap = ?, role = ?';
    let params = [username, namaLengkap, role];

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateQuery += ', password = ?';
      params.push(hashedPassword);
    }

    updateQuery += ' WHERE userId = ?';
    params.push(id);

    await db.query(updateQuery, params);

    res.json({ message: 'User berhasil diupdate' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    // Prevent deleting self? (Optional safety)
    if (req.user.id == id) {
       return res.status(400).json({ message: 'Tidak dapat menghapus akun sendiri saat sedang login.' });
    }

    const [result] = await db.query('DELETE FROM Users WHERE userId = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }
    res.json({ message: 'User berhasil dihapus' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
