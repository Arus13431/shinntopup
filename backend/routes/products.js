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
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Pastikan direktori uploads ada
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Hanya diperbolehkan meng-upload gambar (.jpeg/.jpg/.png/.webp)'));
  }
});

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
