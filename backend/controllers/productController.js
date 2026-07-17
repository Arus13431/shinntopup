import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import { mockTransactions } from './paymentController.js';
import mongoose from 'mongoose';

// Fallback in-memory catalog untuk Mode Demo Offline
export let mockProducts = [
  {
    _id: 'mock-ml-123',
    name: 'Mobile Legends: Bang Bang',
    slug: 'mobile-legends',
    category: 'MOBA',
    developer: 'Moonton',
    image: '/assets/games/mobile-legends.jpg',
    bannerImage: '/assets/games/mobile-legends.jpg',
    idType: 'id-server',
    idLabel: 'User ID',
    serverLabel: 'Zone ID',
    idRegex: '^[0-9]{5,10}$',
    serverRegex: '^[0-9]{3,5}$',
    active: true,
    isHot: true,
    packages: [
      { id: 'ml-36', name: '36 Diamonds', price: 11000, discount: 5, isPopular: false, isBestValue: false },
      { id: 'ml-74', name: '74 Diamonds', price: 22000, discount: 8, isPopular: true, isBestValue: false },
      { id: 'ml-222', name: '222 Diamonds', price: 65000, discount: 10, isPopular: false, isBestValue: false },
      { id: 'ml-366', name: '366 Diamonds', price: 110000, discount: 12, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-mc-123',
    name: 'Magic Chess Go Go',
    slug: 'magic-chess',
    category: 'MOBA',
    developer: 'Moonton',
    image: '/assets/games/magic-chess.jpg',
    bannerImage: '/assets/games/magic-chess.jpg',
    idType: 'id-server',
    idLabel: 'User ID',
    serverLabel: 'Zone ID',
    idRegex: '^[0-9]{5,10}$',
    serverRegex: '^[0-9]{3,5}$',
    active: true,
    isHot: true,
    packages: [
      { id: 'mc-50', name: '50 Coins', price: 15000, discount: 0, isPopular: false, isBestValue: false },
      { id: 'mc-150', name: '150 Coins', price: 45000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'mc-500', name: '500 Coins', price: 135000, discount: 10, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-ab-123',
    name: 'Arena Breakout Infinite',
    slug: 'arena-breakout',
    category: 'FPS',
    developer: 'Tencent Games',
    image: '/assets/games/arena-breakout.jpg',
    bannerImage: '/assets/games/arena-breakout.jpg',
    idType: 'id-only',
    idLabel: 'Player ID',
    idRegex: '^[0-9]{8,12}$',
    active: true,
    packages: [
      { id: 'ab-100', name: '100 Bonds', price: 16500, discount: 0, isPopular: false, isBestValue: false },
      { id: 'ab-500', name: '500 Bonds', price: 79000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'ab-1000', name: '1000 Bonds', price: 159000, discount: 10, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-ff-123',
    name: 'Free Fire',
    slug: 'free-fire',
    category: 'BATTLE ROYALE',
    developer: 'Garena',
    image: '/assets/games/free-fire.jpg',
    bannerImage: '/assets/games/free-fire.jpg',
    idType: 'id-only',
    idLabel: 'Player ID',
    idRegex: '^[0-9]{8,12}$',
    active: true,
    packages: [
      { id: 'ff-50', name: '50 Diamonds', price: 8000, discount: 0, isPopular: false, isBestValue: false },
      { id: 'ff-140', name: '140 Diamonds', price: 20000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'ff-355', name: '355 Diamonds', price: 50000, discount: 10, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-ffm-123',
    name: 'Free Fire MAX',
    slug: 'free-fire-max',
    category: 'BATTLE ROYALE',
    developer: 'Garena',
    image: '/assets/games/free-fire-max.jpg',
    bannerImage: '/assets/games/free-fire-max.jpg',
    idType: 'id-only',
    idLabel: 'Player ID',
    idRegex: '^[0-9]{8,12}$',
    active: true,
    packages: [
      { id: 'ffm-50', name: '50 Diamonds', price: 8000, discount: 0, isPopular: false, isBestValue: false },
      { id: 'ffm-140', name: '140 Diamonds', price: 20000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'ffm-355', name: '355 Diamonds', price: 50000, discount: 10, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-pubg-123',
    name: 'PUBG Mobile',
    slug: 'pubg-mobile',
    category: 'BATTLE ROYALE',
    developer: 'Krafton',
    image: '/assets/games/pubg-mobile.jpg',
    bannerImage: '/assets/games/pubg-mobile.jpg',
    idType: 'id-only',
    idLabel: 'Character ID',
    idRegex: '^[0-9]{7,11}$',
    active: true,
    packages: [
      { id: 'pubg-60', name: '60 Unknown Cash', price: 15000, discount: 0, isPopular: false, isBestValue: false },
      { id: 'pubg-325', name: '325 Unknown Cash', price: 75000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'pubg-660', name: '660 Unknown Cash', price: 145000, discount: 10, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-genshin-123',
    name: 'Genshin Impact',
    slug: 'genshin-impact',
    category: 'RPG',
    developer: 'miHoYo',
    image: '/assets/games/genshin-impact.jpg',
    bannerImage: '/assets/games/genshin-impact.jpg',
    idType: 'id-server',
    idLabel: 'UID',
    serverLabel: 'Server',
    idRegex: '^[0-9]{9}$',
    serverRegex: '^(america|europe|asia|tw_hk_mo)$',
    active: true,
    packages: [
      { id: 'genshin-60', name: '60 Genesis Crystals', price: 16500, discount: 0, isPopular: false, isBestValue: false },
      { id: 'genshin-300', name: '300 Genesis Crystals', price: 79000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'genshin-blessing', name: 'Welkin Moon Blessing', price: 79000, discount: 15, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-codm-123',
    name: 'Call of Duty Mobile',
    slug: 'codm',
    category: 'FPS',
    developer: 'Tencent Games',
    image: '/assets/games/codm.jpg',
    bannerImage: '/assets/games/codm.jpg',
    idType: 'id-only',
    idLabel: 'OpenID',
    idRegex: '^[0-9a-fA-F-]{15,40}$',
    active: true,
    packages: [
      { id: 'codm-31', name: '31 CP', price: 8000, discount: 0, isPopular: false, isBestValue: false },
      { id: 'codm-127', name: '127 CP', price: 30000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'codm-630', name: '630 CP', price: 140000, discount: 10, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-hsr-123',
    name: 'Honkai: Star Rail',
    slug: 'honkai-star-rail',
    category: 'RPG',
    developer: 'miHoYo',
    image: '/assets/games/honkai-star-rail.jpg',
    bannerImage: '/assets/games/honkai-star-rail.jpg',
    idType: 'id-server',
    idLabel: 'UID',
    serverLabel: 'Server',
    idRegex: '^[0-9]{9}$',
    serverRegex: '^(prod_official_asia|prod_official_usa|prod_official_euro|prod_official_cht)$',
    active: true,
    packages: [
      { id: 'hsr-60', name: '60 Stellar Jades', price: 16500, discount: 0, isPopular: false, isBestValue: false },
      { id: 'hsr-300', name: '300 Stellar Jades', price: 79000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'hsr-express', name: 'Express Supply Pass', price: 79000, discount: 15, isPopular: false, isBestValue: true }
    ]
  },
  {
    _id: 'mock-val-123',
    name: 'Valorant',
    slug: 'valorant',
    category: 'FPS',
    developer: 'Riot Games',
    image: '/assets/games/valorant.jpg',
    bannerImage: '/assets/games/valorant.jpg',
    idType: 'id-only',
    idLabel: 'Riot ID',
    idRegex: '^.+#[a-zA-Z0-9]{2,5}$',
    active: true,
    packages: [
      { id: 'val-475', name: '475 Valorant Points', price: 55000, discount: 0, isPopular: false, isBestValue: false },
      { id: 'val-1000', name: '1000 Valorant Points', price: 110000, discount: 5, isPopular: true, isBestValue: false },
      { id: 'val-2050', name: '2050 Valorant Points', price: 220000, discount: 10, isPopular: false, isBestValue: true }
    ]
  }
];

// @desc    Get all active products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    let productsList = [];
    if (mongoose.connection.readyState !== 1) {
      const statsMap = {};
      mockTransactions.forEach(t => {
        if (t.paymentStatus === 'success') {
          statsMap[t.gameSlug] = (statsMap[t.gameSlug] || 0) + 1;
        }
      });
      productsList = [...mockProducts].filter(p => p.active);
      productsList.sort((a, b) => {
        const countA = statsMap[a.slug] || 0;
        const countB = statsMap[b.slug] || 0;
        return countB - countA;
      });
      return res.json({
        success: true,
        products: productsList
      });
    }

    const transactionStats = await Transaction.aggregate([
      { $match: { paymentStatus: 'success' } },
      { $group: { _id: '$gameSlug', count: { $sum: 1 } } }
    ]);
    const statsMap = {};
    transactionStats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    productsList = await Product.find({ active: true });
    productsList.sort((a, b) => {
      const countA = statsMap[a.slug] || 0;
      const countB = statsMap[b.slug] || 0;
      return countB - countA;
    });

    res.json({
      success: true,
      products: productsList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const product = mockProducts.find(p => p.slug === req.params.slug && p.active);
      if (!product) {
        res.status(404);
        throw new Error('Produk game tidak ditemukan (Mode Demo)');
      }
      return res.json({
        success: true,
        product
      });
    }

    const product = await Product.findOne({ slug: req.params.slug, active: true });
    if (!product) {
      res.status(404);
      throw new Error('Produk game tidak ditemukan');
    }
    res.json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product (Admin)
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, developer, idType, idLabel, serverLabel, idRegex, serverRegex, packages } = req.body;
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const image = req.body.image || `/assets/games/${slug}.jpg`;
    const bannerImage = req.body.bannerImage || `/assets/games/${slug}.jpg`;

    if (mongoose.connection.readyState !== 1) {
      const newProduct = {
        _id: `mock-game-${Date.now()}`,
        name,
        slug,
        category,
        developer: developer || 'Unknown Developer',
        image,
        bannerImage,
        idType,
        idLabel,
        serverLabel,
        idRegex: idRegex || '^[0-9]+$',
        serverRegex: serverRegex || '^[0-9]+$',
        active: true,
        packages: typeof packages === 'string' ? JSON.parse(packages) : packages
      };

      mockProducts.push(newProduct);

      return res.status(201).json({
        success: true,
        message: 'Produk game berhasil ditambahkan (Mode Demo)',
        product: newProduct
      });
    }

    const finalImage = req.files && req.files.image ? req.files.image[0].path : (req.body.image || `/assets/games/${slug}.jpg`);
    const finalBannerImage = req.files && req.files.bannerImage ? req.files.bannerImage[0].path : (req.body.bannerImage || `/assets/games/${slug}.jpg`);

    const product = await Product.create({
      name,
      slug,
      category,
      developer: developer || 'Unknown Developer',
      image: finalImage,
      bannerImage: finalBannerImage,
      idType,
      idLabel,
      serverLabel,
      idRegex: idRegex || '^[a-zA-Z0-9#]+$',
      serverRegex: serverRegex || '^[a-zA-Z0-9]+$',
      packages: typeof packages === 'string' ? JSON.parse(packages) : packages
    });

    res.status(201).json({
      success: true,
      message: 'Produk game berhasil ditambahkan',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const idx = mockProducts.findIndex(p => p._id === req.params.id);
      if (idx === -1) {
        res.status(404);
        throw new Error('Produk tidak ditemukan (Mode Demo)');
      }

      const { name, category, developer, idType, idLabel, serverLabel, idRegex, serverRegex, packages, active } = req.body;
      
      const product = mockProducts[idx];
      if (name) {
        product.name = name;
        product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
      
      if (category) product.category = category;
      if (developer) product.developer = developer;
      if (idType) product.idType = idType;
      if (idLabel) product.idLabel = idLabel;
      if (serverLabel) product.serverLabel = serverLabel;
      if (idRegex) product.idRegex = idRegex;
      if (serverRegex) product.serverRegex = serverRegex;
      if (active !== undefined) product.active = active;
      
      if (packages) {
        product.packages = typeof packages === 'string' ? JSON.parse(packages) : packages;
      }

      return res.json({
        success: true,
        message: 'Produk game berhasil diperbarui (Mode Demo)',
        product
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Produk tidak ditemukan');
    }

    const { name, category, developer, idType, idLabel, serverLabel, idRegex, serverRegex, packages, active } = req.body;
    
    if (name) {
      product.name = name;
      product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
    
    if (category) product.category = category;
    if (developer) product.developer = developer;
    if (idType) product.idType = idType;
    if (idLabel) product.idLabel = idLabel;
    if (serverLabel) product.serverLabel = serverLabel;
    if (idRegex) product.idRegex = idRegex;
    if (serverRegex) product.serverRegex = serverRegex;
    if (active !== undefined) product.active = active;
    
    if (packages) {
      product.packages = typeof packages === 'string' ? JSON.parse(packages) : packages;
    }

    if (req.files) {
      if (req.files.image) {
        product.image = req.files.image[0].path;
      }
      if (req.files.bannerImage) {
        product.bannerImage = req.files.bannerImage[0].path;
      }
    }

    const updatedProduct = await product.save();
    res.json({
      success: true,
      message: 'Produk game berhasil diperbarui',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const idx = mockProducts.findIndex(p => p._id === req.params.id);
      if (idx === -1) {
        res.status(404);
        throw new Error('Produk tidak ditemukan (Mode Demo)');
      }
      mockProducts.splice(idx, 1);
      return res.json({
        success: true,
        message: 'Produk game berhasil dihapus (Mode Demo)'
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error('Produk tidak ditemukan');
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Produk game berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed initial game products
// @route   POST /api/products/seed
// @access  Public
export const seedProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Product.deleteMany({});
    }

    const initialProducts = [
      {
        name: 'Mobile Legends: Bang Bang',
        slug: 'mobile-legends',
        category: 'MOBA',
        developer: 'Moonton',
        image: '/assets/games/mobile-legends.jpg',
        bannerImage: '/assets/games/mobile-legends.jpg',
        idType: 'id-server',
        idLabel: 'User ID',
        serverLabel: 'Zone ID',
        idRegex: '^[0-9]{5,10}$',
        serverRegex: '^[0-9]{3,5}$',
        isHot: true,
        packages: [
          { id: 'ml-36', name: '36 Diamonds', price: 11000, discount: 5, isPopular: false, isBestValue: false },
          { id: 'ml-74', name: '74 Diamonds', price: 22000, discount: 8, isPopular: true, isBestValue: false },
          { id: 'ml-222', name: '222 Diamonds', price: 65000, discount: 10, isPopular: false, isBestValue: false },
          { id: 'ml-366', name: '366 Diamonds', price: 110000, discount: 12, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Magic Chess Go Go',
        slug: 'magic-chess',
        category: 'MOBA',
        developer: 'Moonton',
        image: '/assets/games/magic-chess.jpg',
        bannerImage: '/assets/games/magic-chess.jpg',
        idType: 'id-server',
        idLabel: 'User ID',
        serverLabel: 'Zone ID',
        idRegex: '^[0-9]{5,10}$',
        serverRegex: '^[0-9]{3,5}$',
        isHot: true,
        packages: [
          { id: 'mc-50', name: '50 Coins', price: 15000, discount: 0, isPopular: false, isBestValue: false },
          { id: 'mc-150', name: '150 Coins', price: 45000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'mc-500', name: '500 Coins', price: 135000, discount: 10, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Arena Breakout Infinite',
        slug: 'arena-breakout',
        category: 'FPS',
        developer: 'Tencent Games',
        image: '/assets/games/arena-breakout.jpg',
        bannerImage: '/assets/games/arena-breakout.jpg',
        idType: 'id-only',
        idLabel: 'Player ID',
        idRegex: '^[0-9]{8,12}$',
        packages: [
          { id: 'ab-100', name: '100 Bonds', price: 16500, discount: 0, isPopular: false, isBestValue: false },
          { id: 'ab-500', name: '500 Bonds', price: 79000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'ab-1000', name: '1000 Bonds', price: 159000, discount: 10, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Free Fire',
        slug: 'free-fire',
        category: 'BATTLE ROYALE',
        developer: 'Garena',
        image: '/assets/games/free-fire.jpg',
        bannerImage: '/assets/games/free-fire.jpg',
        idType: 'id-only',
        idLabel: 'Player ID',
        idRegex: '^[0-9]{8,12}$',
        packages: [
          { id: 'ff-50', name: '50 Diamonds', price: 8000, discount: 0, isPopular: false, isBestValue: false },
          { id: 'ff-140', name: '140 Diamonds', price: 20000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'ff-355', name: '355 Diamonds', price: 50000, discount: 10, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Free Fire MAX',
        slug: 'free-fire-max',
        category: 'BATTLE ROYALE',
        developer: 'Garena',
        image: '/assets/games/free-fire-max.jpg',
        bannerImage: '/assets/games/free-fire-max.jpg',
        idType: 'id-only',
        idLabel: 'Player ID',
        idRegex: '^[0-9]{8,12}$',
        packages: [
          { id: 'ffm-50', name: '50 Diamonds', price: 8000, discount: 0, isPopular: false, isBestValue: false },
          { id: 'ffm-140', name: '140 Diamonds', price: 20000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'ffm-355', name: '355 Diamonds', price: 50000, discount: 10, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'PUBG Mobile',
        slug: 'pubg-mobile',
        category: 'BATTLE ROYALE',
        developer: 'Krafton',
        image: '/assets/games/pubg-mobile.jpg',
        bannerImage: '/assets/games/pubg-mobile.jpg',
        idType: 'id-only',
        idLabel: 'Character ID',
        idRegex: '^[0-9]{7,11}$',
        packages: [
          { id: 'pubg-60', name: '60 Unknown Cash', price: 15000, discount: 0, isPopular: false, isBestValue: false },
          { id: 'pubg-325', name: '325 Unknown Cash', price: 75000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'pubg-660', name: '660 Unknown Cash', price: 145000, discount: 10, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Genshin Impact',
        slug: 'genshin-impact',
        category: 'RPG',
        developer: 'miHoYo',
        image: '/assets/games/genshin-impact.jpg',
        bannerImage: '/assets/games/genshin-impact.jpg',
        idType: 'id-server',
        idLabel: 'UID',
        serverLabel: 'Server',
        idRegex: '^[0-9]{9}$',
        serverRegex: '^(america|europe|asia|tw_hk_mo)$',
        packages: [
          { id: 'genshin-60', name: '60 Genesis Crystals', price: 16500, discount: 0, isPopular: false, isBestValue: false },
          { id: 'genshin-300', name: '300 Genesis Crystals', price: 79000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'genshin-blessing', name: 'Welkin Moon Blessing', price: 79000, discount: 15, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Call of Duty Mobile',
        slug: 'codm',
        category: 'FPS',
        developer: 'Tencent Games',
        image: '/assets/games/codm.jpg',
        bannerImage: '/assets/games/codm.jpg',
        idType: 'id-only',
        idLabel: 'OpenID',
        idRegex: '^[0-9a-fA-F-]{15,40}$',
        packages: [
          { id: 'codm-31', name: '31 CP', price: 8000, discount: 0, isPopular: false, isBestValue: false },
          { id: 'codm-127', name: '127 CP', price: 30000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'codm-630', name: '630 CP', price: 140000, discount: 10, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Honkai: Star Rail',
        slug: 'honkai-star-rail',
        category: 'RPG',
        developer: 'miHoYo',
        image: '/assets/games/honkai-star-rail.jpg',
        bannerImage: '/assets/games/honkai-star-rail.jpg',
        idType: 'id-server',
        idLabel: 'UID',
        serverLabel: 'Server',
        idRegex: '^[0-9]{9}$',
        serverRegex: '^(prod_official_asia|prod_official_usa|prod_official_euro|prod_official_cht)$',
        packages: [
          { id: 'hsr-60', name: '60 Stellar Jades', price: 16500, discount: 0, isPopular: false, isBestValue: false },
          { id: 'hsr-300', name: '300 Stellar Jades', price: 79000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'hsr-express', name: 'Express Supply Pass', price: 79000, discount: 15, isPopular: false, isBestValue: true }
        ]
      },
      {
        name: 'Valorant',
        slug: 'valorant',
        category: 'FPS',
        developer: 'Riot Games',
        image: '/assets/games/valorant.jpg',
        bannerImage: '/assets/games/valorant.jpg',
        idType: 'id-only',
        idLabel: 'Riot ID',
        idRegex: '^.+#[a-zA-Z0-9]{2,5}$',
        packages: [
          { id: 'val-475', name: '475 Valorant Points', price: 55000, discount: 0, isPopular: false, isBestValue: false },
          { id: 'val-1000', name: '1000 Valorant Points', price: 110000, discount: 5, isPopular: true, isBestValue: false },
          { id: 'val-2050', name: '2050 Valorant Points', price: 220000, discount: 10, isPopular: false, isBestValue: true }
        ]
      }
    ];

    let seededCount = 0;
    if (mongoose.connection.readyState === 1) {
      const seeded = await Product.insertMany(initialProducts);
      seededCount = seeded.length;
      res.json({
        success: true,
        message: 'Berhasil melakukan seeding data 10 produk game kustom!',
        count: seededCount
      });
    } else {
      res.json({
        success: true,
        message: 'Database MongoDB offline. Menggunakan katalog demo in-memory.',
        count: mockProducts.length
      });
    }
  } catch (error) {
    next(error);
  }
};
