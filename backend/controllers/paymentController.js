import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import { mockUsers } from './authController.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import midtransClient from 'midtrans-client';
import crypto from 'crypto';
import mongoose from 'mongoose';

import { mockProducts } from './productController.js';

// Fallback in-memory catalog untuk Mode Demo Offline
const getMockProduct = (slug) => {
  return mockProducts.find(c => c.slug === slug);
};

// Fallback database dalam memori untuk Transaksi Demo
export const mockTransactions = [
  {
    orderId: 'SHINN-MOCK-1001',
    userId: 'mock-admin-123',
    email: 'admin@gmail.com',
    gameSlug: 'mobile-legends',
    gameName: 'Mobile Legends: Bang Bang',
    gameUserId: '12345678',
    gameServerId: '1234',
    nickname: 'HeroShinn',
    packageId: 'ml-74',
    packageName: '74 Diamonds',
    price: 20240,
    adminFee: 1500,
    totalAmount: 21740,
    paymentMethod: 'qris',
    paymentStatus: 'success',
    snapToken: 'mock_snap_token_123',
    createdAt: new Date(Date.now() - 86400000 * 2)
  },
  {
    orderId: 'SHINN-MOCK-1002',
    userId: 'mock-admin-123',
    email: 'admin@gmail.com',
    gameSlug: 'free-fire',
    gameName: 'Free Fire',
    gameUserId: '87654321',
    gameServerId: '',
    nickname: 'FireFighter',
    packageId: 'ff-140',
    packageName: '140 Diamonds',
    price: 19000,
    adminFee: 1500,
    totalAmount: 20500,
    paymentMethod: 'gopay',
    paymentStatus: 'success',
    snapToken: 'mock_snap_token_124',
    createdAt: new Date(Date.now() - 86400000 * 1)
  }
];

// Validasi & check Game ID + Server ID via Gemini AI
export const validateIdGame = async (req, res, next) => {
  const { gameSlug, userId, serverId } = req.body;

  try {
    let product;
    if (mongoose.connection.readyState !== 1) {
      product = getMockProduct(gameSlug);
    } else {
      product = await Product.findOne({ slug: gameSlug });
    }

    if (!product) {
      res.status(404);
      throw new Error('Produk game tidak ditemukan');
    }

    // 1. Validasi Regex Dasar
    const idRegex = new RegExp(product.idRegex || '^[0-9]+$');
    if (!idRegex.test(userId)) {
      return res.status(400).json({
        success: false,
        message: `Format ${product.idLabel} tidak valid. Harus sesuai dengan format game.`
      });
    }

    if (product.idType === 'id-server' && serverId) {
      const serverRegex = new RegExp(product.serverRegex || '^[0-9]+$');
      if (!serverRegex.test(serverId)) {
        return res.status(400).json({
          success: false,
          message: `Format ${product.serverLabel} tidak valid.`
        });
      }
    }

    // 2. Hubungi Gemini AI untuk memvalidasi/mensimulasikan nickname secara realistis
    let nickname = `Player_${userId.substring(0, 4)}`; // Default fallback

    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-preview' });
        
        const prompt = `Anda adalah API sistem verifikator nickname game dari database game ShinnTopUp.
Tugas Anda adalah memvalidasi data masukan user dan menghasilkan nickname game fiktif yang keren dan sangat realistis sesuai nama game tersebut.
Format input:
- Nama Game: ${product.name}
- User ID: ${userId}
- Server/Zone ID: ${serverId || 'Tidak ada'}

Hasilkan respon dalam format JSON mentah tanpa pembungkus markdown (seperti \`\`\`json) dan tanpa teks pengantar apapun.
Format JSON wajib seperti ini:
{
  "valid": true,
  "nickname": "NickNameKerenGameItu"
}`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        
        // Membersihkan jika Gemini membungkus dengan ```json
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const responseData = JSON.parse(cleanedText);
        
        if (responseData.valid && responseData.nickname) {
          nickname = responseData.nickname;
        }
      } catch (aiError) {
        console.error('Gemini Nickname Checker Error:', aiError);
        nickname = `${product.name.split(' ')[0]}_Pro_${userId.substring(Math.max(0, userId.length - 4))}`;
      }
    } else {
      nickname = `${product.name.split(' ')[0]}_Player_${userId.substring(Math.max(0, userId.length - 4))}`;
    }

    return res.json({
      success: true,
      message: 'ID Valid',
      data: {
        userId,
        serverId: serverId || '',
        nickname
      }
    });

  } catch (error) {
    next(error);
  }
};

// Create Midtrans Snap Transaction
export const createTransaction = async (req, res, next) => {
  const { gameSlug, packageId, userIdGame, serverIdGame, nickname, email, whatsapp, paymentMethod } = req.body;

  try {
    let product;
    if (mongoose.connection.readyState !== 1) {
      product = getMockProduct(gameSlug);
    } else {
      product = await Product.findOne({ slug: gameSlug });
    }

    if (!product) {
      res.status(404);
      throw new Error('Produk game tidak ditemukan');
    }

    const packageItem = product.packages.find(pkg => pkg.id === packageId);
    if (!packageItem) {
      res.status(400);
      throw new Error('Paket nominal tidak ditemukan');
    }

    // Hitung diskon & harga final
    const priceAfterDiscount = Math.round(packageItem.price * (1 - (packageItem.discount / 100)));
    const adminFee = 1500; // Biaya admin flat
    const totalAmount = priceAfterDiscount + adminFee;

    // 2. Buat Order ID unik
    const orderId = `SHINN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const serverKey = process.env.MIDTRANS_SERVER_KEY; 
    const clientKey = process.env.MIDTRANS_CLIENT_KEY; 
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    let snapToken = '';
    let redirectUrl = '';
    let qrisUrl = '';
    let deeplinkUrl = '';
    let vaNumber = '';
    let paymentCode = '';

    const hasMidtransKey = typeof serverKey === 'string' && serverKey.trim().length > 0;

    if (hasMidtransKey) {
      try {
        console.log('Mencoba menghubungi Midtrans Sandbox secara nyata via Core API / Charge...');
        const coreApi = new midtransClient.CoreApi({
          isProduction: false,
          serverKey: serverKey.trim(),
          clientKey: clientKey ? clientKey.trim() : ''
        });

        const baseParameter = {
          payment_type: '',
          transaction_details: {
            order_id: orderId,
            gross_amount: totalAmount
          },
          item_details: [
            {
              id: packageId,
              price: priceAfterDiscount,
              quantity: 1,
              name: `${product.name} - ${packageItem.name}`
            },
            {
              id: 'admin-fee',
              price: adminFee,
              quantity: 1,
              name: 'Biaya Admin'
            }
          ],
          customer_details: {
            email: email,
            first_name: nickname
          }
        };

        const method = paymentMethod ? paymentMethod.toLowerCase() : 'qris';
        
        if (method === 'qris') {
          baseParameter.payment_type = 'qris';
          baseParameter.qris = { acquirer: 'gopay' };
        } else if (method === 'gopay') {
          baseParameter.payment_type = 'gopay';
        } else if (method === 'shopeepay') {
          baseParameter.payment_type = 'shopeepay';
          baseParameter.shopeepay = {
            callback_url: 'https://shinntopup.com/payment/success'
          };
        } else if (method === 'ovo') {
          baseParameter.payment_type = 'qris';
          baseParameter.qris = { acquirer: 'gopay' };
        } else if (method === 'dana') {
          baseParameter.payment_type = 'qris';
          baseParameter.qris = { acquirer: 'gopay' };
        } else if (method.endsWith('_va')) {
          baseParameter.payment_type = 'bank_transfer';
          const bankName = method.split('_')[0]; // bca, bni, bri, mandiri
          if (bankName === 'mandiri') {
            baseParameter.payment_type = 'echannel';
            baseParameter.echannel = {
              bill_info1: 'Pembayaran Topup',
              bill_info2: 'Game ShinnTopUp'
            };
          } else {
            baseParameter.bank_transfer = { bank: bankName };
          }
        } else if (method === 'alfamart' || method === 'indomaret') {
          baseParameter.payment_type = 'cstore';
          baseParameter.cstore = {
            store: method,
            message: 'Pembayaran ShinnTopUp'
          };
        } else {
          baseParameter.payment_type = 'qris';
          baseParameter.qris = { acquirer: 'gopay' };
        }

        const chargeRes = await coreApi.charge(baseParameter);
        
        // Parse Midtrans Core API response values
        if (chargeRes.actions) {
          const qrAction = chargeRes.actions.find(a => a.name === 'generate-qr-code');
          const dlAction = chargeRes.actions.find(a => a.name === 'deeplink-redirect');
          if (qrAction) qrisUrl = qrAction.url;
          if (dlAction) deeplinkUrl = dlAction.url;
        }

        if (chargeRes.va_numbers && chargeRes.va_numbers.length > 0) {
          vaNumber = chargeRes.va_numbers[0].va_number;
        } else if (chargeRes.bill_key) {
          vaNumber = `${chargeRes.biller_code} - ${chargeRes.bill_key}`;
        } else if (chargeRes.permata_va_number) {
          vaNumber = chargeRes.permata_va_number;
        }

        if (chargeRes.payment_code) {
          paymentCode = chargeRes.payment_code;
        }

        snapToken = chargeRes.transaction_id || `core_${Date.now()}`;
        redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;

        console.log(`Core API Charge Berhasil. Order ID: ${orderId}`);
      } catch (midtransError) {
        console.error('=== KONEKSI MIDTRANS SANDBOX GAGAL ===');
        console.error('Alasan Kesalahan API Midtrans:', midtransError.message || midtransError);
        if (midtransError.ApiResponse) {
          console.error('Detail Response dari Midtrans:', JSON.stringify(midtransError.ApiResponse));
        }
        console.error('======================================');
        console.log('Jatuh kembali (fallback) ke mode mock/sandbox lokal untuk keperluan pengujian...');
        
        // Simulasikan instruksi mock
        const method = paymentMethod ? paymentMethod.toLowerCase() : 'qris';
        if (method === 'qris' || method === 'gopay' || method === 'ovo' || method === 'dana' || method === 'shopeepay') {
          qrisUrl = 'https://merchants-app.sbx.midtrans.com/v4/qris/gopay/A120260525010346yzAIu0oJbsID/qr-code';
          deeplinkUrl = 'https://gopay.co.id/pay/shinn';
        } else if (method.endsWith('_va')) {
          vaNumber = `88301${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        } else if (method === 'alfamart' || method === 'indomaret') {
          paymentCode = `SHN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
        snapToken = `mock_snap_token_${Date.now()}`;
        redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
      }
    } else if (isDevelopment) {
      console.log('Environment MIDTRANS_SERVER_KEY kosong. Menggunakan fallback Mock Token dalam mode development...');
      snapToken = `mock_snap_token_${Date.now()}`;
      redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
      
      const method = paymentMethod ? paymentMethod.toLowerCase() : 'qris';
      if (method === 'qris' || method === 'gopay' || method === 'ovo' || method === 'dana' || method === 'shopeepay') {
        qrisUrl = 'https://merchants-app.sbx.midtrans.com/v4/qris/gopay/A120260525010346yzAIu0oJbsID/qr-code';
        deeplinkUrl = 'https://gopay.co.id/pay/shinn';
      } else if (method.endsWith('_va')) {
        vaNumber = `88301${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      } else if (method === 'alfamart' || method === 'indomaret') {
        paymentCode = `SHN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    } else {
      console.error('Gagal memproses transaksi: MIDTRANS_SERVER_KEY tidak tersedia di environment non-development.');
      res.status(500);
      throw new Error('Kunci Server Midtrans (MIDTRANS_SERVER_KEY) wajib disediakan.');
    }

    // Offline Mode Fallback
    if (mongoose.connection.readyState !== 1) {
      // Mock instructions for offline DB mode
      const method = paymentMethod ? paymentMethod.toLowerCase() : 'qris';
      if (method === 'qris' || method === 'gopay' || method === 'ovo' || method === 'dana' || method === 'shopeepay') {
        qrisUrl = 'https://merchants-app.sbx.midtrans.com/v4/qris/gopay/A120260525010346yzAIu0oJbsID/qr-code';
        deeplinkUrl = 'https://gopay.co.id/pay/shinn';
      } else if (method.endsWith('_va')) {
        vaNumber = `88301${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      } else if (method === 'alfamart' || method === 'indomaret') {
        paymentCode = `SHN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const mockTx = {
        orderId,
        userId: req.user ? (req.user._id || req.user.id) : null,
        email,
        whatsapp: whatsapp || '',
        gameSlug,
        gameName: product.name,
        gameUserId: userIdGame,
        gameServerId: serverIdGame || '',
        nickname,
        packageId,
        packageName: packageItem.name,
        price: priceAfterDiscount,
        adminFee,
        totalAmount,
        paymentMethod,
        paymentStatus: 'pending', // Setel pending agar frontend bisa melakukan polling dan mensimulasikan
        snapToken,
        qrisUrl,
        deeplinkUrl,
        vaNumber,
        paymentCode,
        createdAt: new Date()
      };
      mockTransactions.push(mockTx);

      return res.status(201).json({
        success: true,
        message: 'Transaksi berhasil dibuat (Mode Demo)',
        data: {
          orderId: mockTx.orderId,
          snapToken: mockTx.snapToken,
          redirectUrl,
          qrisUrl,
          deeplinkUrl,
          vaNumber,
          paymentCode,
          totalAmount: mockTx.totalAmount
        }
      });
    }

    // 4. Simpan Transaksi di DB
    const transaction = await Transaction.create({
      orderId,
      userId: req.user ? req.user._id : null,
      email,
      whatsapp: whatsapp || '',
      gameSlug,
      gameName: product.name,
      gameUserId: userIdGame,
      gameServerId: serverIdGame || '',
      nickname,
      packageId,
      packageName: packageItem.name,
      price: priceAfterDiscount,
      adminFee,
      totalAmount,
      paymentMethod,
      paymentStatus: 'pending',
      snapToken,
      qrisUrl,
      deeplinkUrl,
      vaNumber,
      paymentCode
    });

    res.status(201).json({
      success: true,
      message: 'Transaksi berhasil dibuat',
      data: {
        orderId: transaction.orderId,
        snapToken: transaction.snapToken,
        redirectUrl,
        qrisUrl,
        deeplinkUrl,
        vaNumber,
        paymentCode,
        totalAmount: transaction.totalAmount
      }
    });

  } catch (error) {
    next(error);
  }
};

// Webhook Notifikasi Midtrans
export const midtransNotification = async (req, res, next) => {
  const notification = req.body;

  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    
    // Verifikasi signature key jika key tersedia
    if (serverKey && serverKey.trim().length > 0) {
      const { order_id, status_code, gross_amount, signature_key } = notification;
      const hash = crypto.createHash('sha512')
        .update(order_id + status_code + gross_amount + serverKey)
        .digest('hex');

      if (hash !== signature_key) {
        return res.status(401).json({
          success: false,
          message: 'Signature Key tidak valid!'
        });
      }
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    let dbStatus = 'pending';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'challenge') {
        dbStatus = 'pending';
      } else if (fraudStatus === 'accept') {
        dbStatus = 'success';
      }
    } else if (transactionStatus === 'settlement') {
      dbStatus = 'success';
    } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
      dbStatus = 'failed';
    } else if (transactionStatus === 'pending') {
      dbStatus = 'pending';
    }

    // Update status transaksi di database
    const transaction = await Transaction.findOneAndUpdate(
      { orderId },
      { 
        paymentStatus: dbStatus,
        midtransResponse: notification
      },
      { new: true }
    );

    if (transaction && dbStatus === 'success') {
      // Jika user login, masukkan game ke favoritnya secara otomatis jika belum ada
      if (transaction.userId) {
        await Product.findOneAndUpdate(
          { slug: transaction.gameSlug },
          {} // Hanya trigger
        );

        // Tambah XP proportional belanja (Rp 10.000 spent = 5 XP)
        try {
          const user = await User.findById(transaction.userId);
          if (user) {
            const xpEarned = Math.floor(transaction.totalAmount / 10000) * 5;
            if (xpEarned > 0) {
              user.xp = (user.xp || 0) + xpEarned;
              while (true) {
                const xpNeeded = user.level * 100;
                if (user.xp >= xpNeeded) {
                  user.xp -= xpNeeded;
                  user.level = (user.level || 1) + 1;
                } else {
                  break;
                }
              }
              await user.save();
            }
          }
        } catch (xpErr) {
          console.error('Failed to reward XP via webhook:', xpErr);
        }
      }
    }

    res.json({
      success: true,
      message: `Status transaksi ${orderId} berhasil diperbarui menjadi ${dbStatus}`
    });

  } catch (error) {
    next(error);
  }
};

// Polling status transaksi (untuk frontend processing page)
export const getTransactionStatus = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const transaction = mockTransactions.find(t => t.orderId === req.params.orderId);
      if (!transaction) {
        res.status(404);
        throw new Error('Transaksi tidak ditemukan (Mode Demo)');
      }
      return res.json({
        success: true,
        status: transaction.paymentStatus,
        transaction
      });
    }

    const transaction = await Transaction.findOne({ orderId: req.params.orderId });
    if (!transaction) {
      res.status(404);
      throw new Error('Transaksi tidak ditemukan');
    }
    
    res.json({
      success: true,
      status: transaction.paymentStatus,
      transaction
    });
  } catch (error) {
    next(error);
  }
};

// Simulasikan sukses pembayaran (untuk demo & sandbox testing)
export const simulatePaymentSuccess = async (req, res, next) => {
  const { orderId } = req.params;

  try {
    if (mongoose.connection.readyState !== 1) {
      const transaction = mockTransactions.find(t => t.orderId === orderId);
      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan (Mode Demo)'
        });
      }
      transaction.paymentStatus = 'success';

      let xpEarned = 0;
      let leveledUp = false;
      if (transaction.userId) {
        const user = mockUsers.find(u => u._id === transaction.userId);
        if (user) {
          xpEarned = Math.floor(transaction.totalAmount / 10000) * 5;
          if (xpEarned > 0) {
            user.xp = (user.xp || 0) + xpEarned;
            while (true) {
              const xpNeeded = user.level * 100;
              if (user.xp >= xpNeeded) {
                user.xp -= xpNeeded;
                user.level = (user.level || 1) + 1;
                leveledUp = true;
              } else {
                break;
              }
            }
          }
        }
      }

      return res.json({
        success: true,
        message: 'Pembayaran disimulasikan sukses (Mode Demo)',
        transaction,
        xpEarned,
        leveledUp
      });
    }

    const transaction = await Transaction.findOneAndUpdate(
      { orderId },
      { paymentStatus: 'success' },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }

    let xpEarned = 0;
    let leveledUp = false;
    if (transaction.userId) {
      try {
        const user = await User.findById(transaction.userId);
        if (user) {
          xpEarned = Math.floor(transaction.totalAmount / 10000) * 5;
          if (xpEarned > 0) {
            user.xp = (user.xp || 0) + xpEarned;
            while (true) {
              const xpNeeded = user.level * 100;
              if (user.xp >= xpNeeded) {
                user.xp -= xpNeeded;
                user.level = (user.level || 1) + 1;
                leveledUp = true;
              } else {
                break;
              }
            }
            await user.save();
          }
        }
      } catch (xpErr) {
        console.error('Failed to update XP during simulation:', xpErr);
      }
    }

    return res.json({
      success: true,
      message: 'Pembayaran disimulasikan sukses',
      transaction,
      xpEarned,
      leveledUp
    });
  } catch (error) {
    next(error);
  }
};

// Ambil riwayat transaksi user login (untuk Dashboard)
export const getUserTransactions = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const transactions = mockTransactions.filter(t => t.userId === req.user._id || t.userId === req.user.id);
      return res.json({
        success: true,
        transactions: transactions.sort((a, b) => b.createdAt - a.createdAt)
      });
    }

    const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

// Ambil statistik pengeluaran bulanan dan per game (untuk Dashboard chart)
export const getSpendingStats = async (req, res, next) => {
  try {
    let transactions;
    if (mongoose.connection.readyState !== 1) {
      transactions = mockTransactions.filter(t => (t.userId === req.user._id || t.userId === req.user.id) && t.paymentStatus === 'success');
    } else {
      transactions = await Transaction.find({ 
        userId: req.user._id,
        paymentStatus: 'success'
      });
    }

    // 1. Pengeluaran per Game
    const spendByGame = {};
    // 2. Pengeluaran per Bulan
    const spendByMonth = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

    transactions.forEach(t => {
      // By Game
      spendByGame[t.gameName] = (spendByGame[t.gameName] || 0) + t.totalAmount;

      // By Month
      const date = new Date(t.createdAt);
      const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
      spendByMonth[monthLabel] = (spendByMonth[monthLabel] || 0) + t.totalAmount;
    });

    const gameStats = Object.keys(spendByGame).map(name => ({
      name,
      amount: spendByGame[name]
    }));

    const monthlyStats = Object.keys(spendByMonth).map(month => ({
      month,
      amount: spendByMonth[month]
    }));

    res.json({
      success: true,
      stats: {
        gameStats,
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
};
