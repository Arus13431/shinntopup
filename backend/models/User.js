import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Nama pengguna harus diisi'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email harus diisi'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid']
  },
  password: {
    type: String,
    required: [true, 'Password harus diisi'],
    minlength: [8, 'Password minimal 8 karakter'],
    select: false // Password tidak dikembalikan saat querying secara bawaan demi keamanan
  },
  avatar: {
    type: String,
    default: '' // Default empty so initials fallback is used
  },
  phone: {
    type: String,
    default: ''
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  xp: {
    type: Number,
    default: 0
  },
  checkInStreak: {
    type: Number,
    default: 0
  },
  lastCheckIn: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  favoriteGames: [{
    type: String // array of slug game
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enkripsi password sebelum disimpan
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Helper untuk verifikasi password
userSchema.methods.comparePassword = async function(candidatePassword, hashedPassword) {
  // Karena password diset select: false, kita perlu pass hashedPassword secara dinamis atau bandingkan secara manual
  return await bcrypt.compare(candidatePassword, hashedPassword || this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
