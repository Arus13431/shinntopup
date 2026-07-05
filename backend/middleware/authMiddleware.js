import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const protect = async (req, res, next) => {
  let token;

  // Cek token dari cookies
  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  }
  // Fallback ke header Authorization jika cookie kosong
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ 
      success: false, 
      message: 'Akses ditolak, token tidak ditemukan atau tidak valid' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fallback Demo Mode jika MongoDB offline
    if (mongoose.connection.readyState !== 1) {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        username: decoded.id.includes('admin') ? 'Admin_Shinn' : 'Sobat_Shinn',
        email: decoded.id.includes('admin') ? 'admin@gmail.com' : 'user@gmail.com',
        role: decoded.id.includes('admin') ? 'admin' : 'user',
        points: 150,
        phone: '081234567890',
        avatar: '/assets/games/genshin-impact.jpg',
        favoriteGames: ['mobile-legends']
      };
      return next();
    }

    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Pengguna tidak ditemukan dengan token ini' 
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Akses ditolak, token kedaluwarsa atau tidak valid' 
    });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;
  if (req.cookies && req.cookies.authToken) {
    token = req.cookies.authToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token && token !== 'null' && token !== 'undefined') {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (mongoose.connection.readyState !== 1) {
        req.user = {
          _id: decoded.id,
          id: decoded.id,
          username: decoded.id.includes('admin') ? 'Admin_Shinn' : 'Sobat_Shinn',
          email: decoded.id.includes('admin') ? 'admin@gmail.com' : 'user@gmail.com',
          role: decoded.id.includes('admin') ? 'admin' : 'user',
          points: 150,
          phone: '081234567890',
          avatar: '/assets/games/genshin-impact.jpg',
          favoriteGames: ['mobile-legends']
        };
        return next();
      }

      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Abaikan token yang tidak valid
    }
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: 'Akses khusus Admin' 
    });
  }
};
