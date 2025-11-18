const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ 
    path: path.resolve(__dirname, '.env.development') 
});

const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ... (Debugging logs)

// Impor Rute
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const pesananRoutes = require('./routes/pesananRoutes'); 
const cartRoutes = require('./routes/cart'); 
const salesRoutes = require('./routes/salesRoutes'); // ✅ IMPORT salesRoutes

const app = express();

// --- Middleware ---
app.use(cors()); 
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Rute ---
// ... (Rute dasar)

app.use('/api/auth', authRoutes);
app.use('/api/products/:produkId/reviews', reviewRoutes);
app.use('/api/products', productRoutes);
app.use('/api/pesanan', pesananRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/sales', salesRoutes); // ✅ DAFTARKAN RUTE SALES

// ... (Error Handler & Server Listening)

module.exports = app;