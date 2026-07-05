import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Fallback database dalam memori untuk Demo Mode Offline
export const mockUsers = [
  {
    _id: 'mock-admin-123',
    username: 'Admin_Shinn',
    email: 'admin@gmail.com',
    password: 'password123',
    phone: '081234567890',
    points: 100,
    level: 1,
    xp: 20,
    checkInStreak: 0,
    lastCheckIn: null,
    avatar: '/assets/games/genshin-impact.jpg',
    role: 'admin',
    favoriteGames: ['mobile-legends']
  }
];

// Helper untuk generate JWT token (7 Hari)
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Harap isi semua field input');
    }

    if (password.length < 8) {
      res.status(400);
      throw new Error('Password minimal 8 karakter');
    }

    // Mode Demo Offline jika MongoDB tidak terhubung
    if (mongoose.connection.readyState !== 1) {
      const emailExists = mockUsers.find(u => u.email === email.toLowerCase());
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'Email sudah terdaftar (Mode Demo)' });
      }
      const usernameExists = mockUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Nama Pengguna sudah digunakan (Mode Demo)' });
      }

      const isFirst = mockUsers.length === 0;
      const isAdminEmail = email.toLowerCase().includes('admin');
      const role = (isFirst || isAdminEmail) ? 'admin' : 'user';

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        _id: `mock-user-${Date.now()}`,
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone: '',
        points: 0,
        level: 1,
        xp: 0,
        checkInStreak: 0,
        lastCheckIn: null,
        avatar: '',
        role,
        favoriteGames: []
      };

      mockUsers.push(newUser);

      const token = generateToken(newUser._id);
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(201).json({
        success: true,
        message: 'Registrasi berhasil (Mode Demo)',
        token,
        user: {
          _id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          avatar: newUser.avatar,
          phone: newUser.phone,
          points: newUser.points,
          level: newUser.level || 1,
          xp: newUser.xp || 0,
          checkInStreak: newUser.checkInStreak || 0,
          favoriteGames: newUser.favoriteGames
        }
      });
    }

    // Cek keunikan email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    // Cek keunikan username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Nama Pengguna sudah digunakan' });
    }

    const isFirstUser = (await User.countDocuments({})) === 0;
    const isAdminEmail = email.toLowerCase().includes('admin');
    const role = (isFirstUser || isAdminEmail) ? 'admin' : 'user';

    const user = await User.create({
      username,
      email,
      password,
      role
    });

    if (user) {
      const token = generateToken(user._id);
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      const userObj = user.toObject();
      delete userObj.password;

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        token,
        user: userObj
      });
    } else {
      res.status(400);
      throw new Error('Data user tidak valid');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error('Harap masukkan email dan password');
    }

    // Mode Demo Offline jika MongoDB tidak terhubung
    if (mongoose.connection.readyState !== 1) {
      const user = mockUsers.find(u => u.email === email.toLowerCase());

      // Hashing check or fallback
      let isMatch = false;
      if (user) {
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
          isMatch = await bcrypt.compare(password, user.password);
        } else {
          isMatch = user.password === password || password === 'password123';
        }
      }

      if (user && isMatch) {
        const token = generateToken(user._id);
        res.cookie('authToken', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.json({
          success: true,
          message: 'Login berhasil (Mode Demo)',
          token,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            points: user.points,
            level: user.level || 1,
            xp: user.xp || 0,
            checkInStreak: user.checkInStreak || 0,
            favoriteGames: user.favoriteGames
          }
        });
      } else {
        return res.status(401).json({ success: false, message: 'Email tidak ditemukan atau password salah (Mode Demo)' });
      }
    }

    // Ambil password secara eksplisit karena select: false di model
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password, user.password))) {
      const token = generateToken(user._id);
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      // Hilangkan password dari response objek
      const userObj = user.toObject();
      delete userObj.password;

      res.json({
        success: true,
        message: 'Login berhasil',
        token,
        user: userObj
      });
    } else {
      return res.status(401).json({ success: false, message: 'Email tidak ditemukan atau password salah' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const user = mockUsers.find(u => u._id === req.user._id || u._id === req.user.id);
      if (user) {
        return res.json({
          success: true,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            points: user.points,
            level: user.level || 1,
            xp: user.xp || 0,
            checkInStreak: user.checkInStreak || 0,
            favoriteGames: user.favoriteGames
          }
        });
      } else {
        res.status(404);
        throw new Error('Pengguna tidak ditemukan (Mode Demo)');
      }
    }

    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        success: true,
        user
      });
    } else {
      res.status(404);
      throw new Error('Pengguna tidak ditemukan');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const { username, password, phone, avatar, favoriteGames } = req.body;

    if (mongoose.connection.readyState !== 1) {
      const user = mockUsers.find(u => u._id === req.user._id || u._id === req.user.id);
      if (user) {
        if (username) {
          const usernameExists = mockUsers.find(u => u._id !== user._id && u.username.toLowerCase() === username.toLowerCase());
          if (usernameExists) {
            return res.status(400).json({ success: false, message: 'Nama Pengguna sudah digunakan (Mode Demo)' });
          }
          user.username = username;
        }
        if (password) user.password = password;
        if (phone !== undefined) user.phone = phone;
        if (avatar) user.avatar = avatar;
        if (favoriteGames) user.favoriteGames = favoriteGames;

        return res.json({
          success: true,
          message: 'Profil berhasil diperbarui (Mode Demo)',
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            points: user.points,
            level: user.level || 1,
            xp: user.xp || 0,
            checkInStreak: user.checkInStreak || 0,
            favoriteGames: user.favoriteGames
          }
        });
      } else {
        res.status(404);
        throw new Error('Pengguna tidak ditemukan (Mode Demo)');
      }
    }

    const user = await User.findById(req.user._id);

    if (user) {
      if (username) {
        const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
        if (usernameExists) {
          return res.status(400).json({ success: false, message: 'Nama Pengguna sudah digunakan' });
        }
        user.username = username;
      }
      
      if (password) {
        if (password.length < 8) {
          return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter' });
        }
        user.password = password;
      }

      if (phone !== undefined) {
        user.phone = phone;
      }

      if (avatar) {
        user.avatar = avatar;
      }

      if (favoriteGames) {
        user.favoriteGames = favoriteGames;
      }

      const updatedUser = await user.save();
      const userObj = updatedUser.toObject();
      delete userObj.password;

      res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
        user: userObj
      });
    } else {
      res.status(404);
      throw new Error('Pengguna tidak ditemukan');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Claim Daily Check-in points (+50 points)
// @route   POST /api/auth/checkin
// @access  Private
export const checkInUser = async (req, res, next) => {
  try {
    const xpRewards = [10, 15, 20, 25, 30, 40, 50];

    if (mongoose.connection.readyState !== 1) {
      const user = mockUsers.find(u => u._id === req.user._id || u._id === req.user.id);
      if (!user) {
        res.status(404);
        throw new Error('Pengguna tidak ditemukan (Mode Demo)');
      }

      const now = new Date();
      if (user.lastCheckIn) {
        const lastCheck = new Date(user.lastCheckIn);
        if (now.toDateString() === lastCheck.toDateString()) {
          return res.status(400).json({
            success: false,
            message: 'Anda sudah check-in hari ini.'
          });
        }
      }

      let streak = 1;
      if (user.lastCheckIn) {
        const lastCheck = new Date(user.lastCheckIn);
        const oneDayMs = 24 * 60 * 60 * 1000;
        const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const d2 = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
        const diffDays = Math.round((d1 - d2) / oneDayMs);
        
        if (diffDays === 1) {
          streak = (user.checkInStreak || 0) % 7 + 1;
        } else {
          streak = 1;
        }
      }

      const xpEarned = xpRewards[streak - 1];
      user.xp = (user.xp || 0) + xpEarned;
      user.checkInStreak = streak;
      user.lastCheckIn = now;

      let leveledUp = false;
      let milestoneReached = false;
      let milestoneLevel = 0;
      while (true) {
        const xpNeeded = user.level * 100;
        if (user.xp >= xpNeeded) {
          user.xp -= xpNeeded;
          user.level = (user.level || 1) + 1;
          leveledUp = true;
          if (user.level % 5 === 0) {
            milestoneReached = true;
            milestoneLevel = user.level;
          }
        } else {
          break;
        }
      }

      return res.json({
        success: true,
        message: `Berhasil check-in harian! +${xpEarned} XP ditambahkan.`,
        xpEarned,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          points: user.points,
          level: user.level,
          xp: user.xp,
          checkInStreak: user.checkInStreak,
          lastCheckIn: user.lastCheckIn,
          favoriteGames: user.favoriteGames
        },
        leveledUp,
        milestoneReached,
        milestoneLevel
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('Pengguna tidak ditemukan');
    }

    const now = new Date();
    if (user.lastCheckIn) {
      const lastCheck = new Date(user.lastCheckIn);
      if (now.toDateString() === lastCheck.toDateString()) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah check-in hari ini.'
        });
      }
    }

    let streak = 1;
    if (user.lastCheckIn) {
      const lastCheck = new Date(user.lastCheckIn);
      const oneDayMs = 24 * 60 * 60 * 1000;
      const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const d2 = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
      const diffDays = Math.round((d1 - d2) / oneDayMs);
      
      if (diffDays === 1) {
        streak = (user.checkInStreak || 0) % 7 + 1;
      } else {
        streak = 1;
      }
    }

    const xpEarned = xpRewards[streak - 1];
    user.xp = (user.xp || 0) + xpEarned;
    user.checkInStreak = streak;
    user.lastCheckIn = now;

    let leveledUp = false;
    let milestoneReached = false;
    let milestoneLevel = 0;
    while (true) {
      const xpNeeded = user.level * 100;
      if (user.xp >= xpNeeded) {
        user.xp -= xpNeeded;
        user.level = (user.level || 1) + 1;
        leveledUp = true;
        if (user.level % 5 === 0) {
          milestoneReached = true;
          milestoneLevel = user.level;
        }
      } else {
        break;
      }
    }

    await user.save();

    res.json({
      success: true,
      message: `Berhasil check-in harian! +${xpEarned} XP ditambahkan.`,
      xpEarned,
      user,
      leveledUp,
      milestoneReached,
      milestoneLevel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    res.json({
      success: true,
      message: 'Logout berhasil'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Harap sertakan file gambar');
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    if (mongoose.connection.readyState !== 1) {
      const user = mockUsers.find(u => u._id === req.user._id || u._id === req.user.id);
      if (user) {
        user.avatar = avatarUrl;
        return res.json({
          success: true,
          message: 'Avatar berhasil diunggah (Mode Demo)',
          avatarUrl,
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            phone: user.phone,
            points: user.points,
            level: user.level || 1,
            xp: user.xp || 0,
            checkInStreak: user.checkInStreak || 0,
            favoriteGames: user.favoriteGames
          }
        });
      } else {
        res.status(404);
        throw new Error('User tidak ditemukan (Mode Demo)');
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User tidak ditemukan');
    }

    user.avatar = avatarUrl;
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      message: 'Avatar berhasil diunggah',
      avatarUrl,
      user: userObj
    });
  } catch (error) {
    next(error);
  }
};

