import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null jika checkout sebagai tamu (guest)
  },
  email: {
    type: String,
    required: [true, 'Email untuk notifikasi harus diisi'],
    match: [/^\S+@\S+\.\S+$/, 'Format email tidak valid']
  },
  whatsapp: {
    type: String,
    default: ''
  },
  gameSlug: {
    type: String,
    required: true
  },
  gameName: {
    type: String,
    required: true
  },
  gameUserId: {
    type: String,
    required: true
  },
  gameServerId: {
    type: String,
    default: ''
  },
  nickname: {
    type: String,
    required: true
  },
  packageId: {
    type: String,
    required: true
  },
  packageName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  adminFee: {
    type: Number,
    default: 1500
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending'
  },
  snapToken: {
    type: String,
    default: ''
  },
  qrisUrl: {
    type: String,
    default: ''
  },
  deeplinkUrl: {
    type: String,
    default: ''
  },
  vaNumber: {
    type: String,
    default: ''
  },
  paymentCode: {
    type: String,
    default: ''
  },
  midtransResponse: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
