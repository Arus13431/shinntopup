import express from 'express';
import { 
  getProducts, 
  getProductBySlug, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  seedProducts 
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
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

// Konfigurasi Cloudinary Storage untuk Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'shinntopup-products',
    allowed_formats: ['jpeg', 'jpg', 'png', 'webp']
  }
});

const upload = multer({ storage });

const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'bannerImage', maxCount: 1 }
]);

// Routes
router.get('/', getProducts);
router.post('/seed', seedProducts);
router.get('/:slug', getProductBySlug);

// Protected Admin Routes
router.post('/', protect, adminOnly, uploadFields, createProduct);
router.put('/:id', protect, adminOnly, uploadFields, updateProduct);
router.delete('/:id', protect, adminOnly, deleteProduct);

export default router;
