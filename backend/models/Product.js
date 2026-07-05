import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0 // dalam persen
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isBestValue: {
    type: Boolean,
    default: false
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nama produk game harus diisi'],
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    required: true,
    enum: ['MOBA', 'FPS', 'RPG', 'BATTLE ROYALE', 'OTHER']
  },
  image: {
    type: String,
    required: true // Path gambar card (e.g. /uploads/ml.jpg)
  },
  bannerImage: {
    type: String,
    required: true // Path banner detail (e.g. /uploads/ml-banner.jpg)
  },
  idType: {
    type: String,
    required: true,
    enum: ['id-server', 'id-only'],
    default: 'id-only'
  },
  idLabel: {
    type: String,
    default: 'User ID'
  },
  serverLabel: {
    type: String,
    default: 'Server ID'
  },
  idRegex: {
    type: String, // Pola regex validasi format ID
    default: '^[0-9]+$'
  },
  serverRegex: {
    type: String, // Pola regex validasi format Server ID jika ada
    default: '^[0-9]+$'
  },
  packages: [packageSchema],
  active: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
