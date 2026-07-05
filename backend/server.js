import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

// Impor Routes & Middlewares
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import paymentRoutes from './routes/payment.js';
import aiRoutes from './routes/ai.js';
import errorHandler from './middleware/errorHandler.js';

// Muat Variabel .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Konfigurasi __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Keamanan & Middleware Global
app.use(helmet({
  crossOriginResourcePolicy: false, // Memperbolehkan loading gambar dari server lokal
}));

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting (Proteksi DDoS sederhana)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 request per IP
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini, silakan coba lagi nanti.'
  }
});
app.use('/api/', limiter);

// 2. Serve Static Uploads (untuk gambar produk)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Routing API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);

// Root Route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Selamat datang di API ShinnTopUp Server'
  });
});

// 4. Centralized Error Handler Middleware
app.use(errorHandler);

// 5. Koneksi Database MongoDB & Start Server
const startServer = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shinntopup';
    console.log('Menghubungkan ke MongoDB...');
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    console.log('Koneksi database MongoDB berhasil!');

    app.listen(PORT, () => {
      console.log(`Server ShinnTopUp berjalan di port ${PORT}`);
      console.log(`Buka API di: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Koneksi Database Gagal:', error.message);
    console.log('\n[PERINGATAN] Server tidak dapat terhubung ke MongoDB.');
    console.log('Pastikan layanan MongoDB lokal sudah aktif, atau perbarui MONGO_URI di file .env.');
    console.log('Server akan tetap berjalan untuk keperluan testing frontend, tetapi fitur database tidak akan berfungsi.');
    
    // Fallback start server agar tidak menghentikan build/linting process
    app.listen(PORT, () => {
      console.log(`Server ShinnTopUp (Demo Mode Offline DB) berjalan di port ${PORT}`);
    });
  }
};

startServer();
