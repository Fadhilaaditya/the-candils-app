const express = require('express');
const cors = require('cors');
const path = require('path');

// --- Load Environment (.env.development atau .env.production) ---
require('dotenv').config({
  path: process.env.NODE_ENV === 'production'
    ? path.resolve(__dirname, '.env.production')
    : path.resolve(__dirname, '.env.development')
});

// --- Cloudinary Config ---
const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// --- Import Routes ---
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const cartRoutes = require('./routes/cart');
const homeRoutes = require('./routes/homeRoutes');
const salesRoutes = require('./routes/salesRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// -----------------------------------------------------------------
// PERBAIKAN CORS: Izinkan permintaan dari frontend lokal (Vite default: 5173)
// -----------------------------------------------------------------
const allowedOrigins = [
    // Tambahkan domain production Anda
    'https://backend-the-candils.vercel.app', 
    // Tambahkan domain frontend lokal default Vite
    'http://localhost:5173', 
    // Frontend Deployed (Vercel)
    'https://dev-the-candils-app.vercel.app',
    // Frontend Deployed (Hostinger)
    'https://the-candils.com',
    'https://www.the-candils.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan permintaan jika origin tidak didefinisikan (Postman, cURL)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

// --- Middleware ---
// CORS harus dipasang sebelum route
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/products/:produkId/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/users', userRoutes);

// --- Default Route ---
app.get('/', (req, res) => {
  res.send({ message: 'API is running...' });
});

// --- Error Handler (Opsional) ---
app.use((err, req, res, next) => {
  console.error('🔥 ERROR:', err);
  // Log error jika CORS yang memblokir
  if (err.message.includes('CORS')) {
      console.error('CORS BLOCK:', req.originalUrl, 'from', req.headers.origin);
  }
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// --- Start Server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT} (mode: ${process.env.NODE_ENV || 'development'})`);
});

module.exports = app;