import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  registerUser, 
  loginUser, 
  logoutUser,
  getUserProfile, 
  updateUserProfile,
  checkInUser,
  uploadAvatar
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const router = express.Router();

// Konfigurasi Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Konfigurasi Cloudinary Storage untuk Multer (Avatar)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shinntopup-avatars',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp']
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

// Rate limiter khusus untuk login: maksimal 5 percobaan per menit per IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 menit
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Batas percobaan login terlampaui. Harap coba lagi dalam 1 menit.'
  }
});

router.post('/register', registerUser);
router.post('/login', loginLimiter, loginUser);
router.post('/logout', logoutUser);
router.post('/checkin', protect, checkInUser);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

export default router;
