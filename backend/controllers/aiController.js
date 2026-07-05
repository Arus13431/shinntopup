import { GoogleGenerativeAI } from '@google/generative-ai';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { mockProducts } from './productController.js';

// Helper untuk inisialisasi Gemini model
const getGeminiModel = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// @desc    AI Chatbot Support Widget
// @route   POST /api/ai/chat
// @access  Public
export const chatSupport = async (req, res, next) => {
  const { message, history } = req.body;

  try {
    let products = [];
    if (mongoose.connection.readyState !== 1) {
      products = mockProducts.filter(p => p.active);
    } else {
      products = await Product.find({ active: true }).select('name category slug');
    }
    const productList = products.map(p => `- ${p.name} (Kategori: ${p.category}, Link: /topup/${p.slug})`).join('\n');

    const model = getGeminiModel();

    if (!model) {
      // Fallback jika API key belum terpasang
      return res.json({
        success: true,
        response: `Halo Sobat Shinn! Saya Shinn, asisten AI resmi ShinnTopUp. Sayangnya fitur percakapan langsung belum aktif karena kunci API belum diatur pada sistem.
        
Namun, saat ini saya bisa memberikan informasi bahwa platform kami melayani top-up instan untuk:
${productList || '- Belum ada game terdaftar'}

Silakan gunakan menu pembayaran atau hubungi Customer Service kami jika ada kendala ya! 😊`
      });
    }

    // Bangun sistem instruksi & history sesuai aturan Shinn
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: `Kamu adalah Shinn, asisten AI resmi dari ShinnTopUp — platform top-up game dan voucher digital terpercaya di Indonesia.
          
Tugas utama kamu adalah membantu pengguna menjelajahi platform, menjawab pertanyaan seputar layanan top-up, memandu transaksi, dan membantu menyelesaikan kendala Sobat Shinn di website.

Aturan Komunikasi:
1. Gunakan Bahasa Indonesia dengan nada bicara yang ramah, santai (casual), tetapi tetap sopan dan menghormati pengguna.
2. Sapa pengguna dengan sebutan "Sobat Shinn", kecuali jika mereka memberikan nama mereka, maka panggil "Kak [nama]".
3. Gunakan emoji secara hemat (maksimal 1 atau 2 emoji per pesan) untuk menjaga agar obrolan tetap menyenangkan dan ringan.
4. Jawab secara singkat dan padat — usahakan tidak lebih dari 3 paragraf pendek, kecuali pengguna meminta penjelasan detail.
5. Selalu tutup pesan dengan menawarkan bantuan lebih lanjut yang ramah untuk meningkatkan kepuasan pengguna.

Batasan Keamanan & Operasional (Penting!):
- JANGAN PERNAH meminta atau menerima data sensitif seperti kata sandi (password), kode OTP, PIN, nomor kartu kredit, atau CVV. Jika pengguna mencoba membagikannya, SEGERA berikan peringatan keras dan ingatkan mereka agar tidak melakukannya demi keamanan.
- JANGAN PERNAH memberikan harga spesifik atau menjanjikan harga tertentu. Arahkan pengguna ke halaman detail produk game terkait untuk melihat harga terkini yang akurat.
- Kamu TIDAK BISA memproses atau mensimulasikan transaksi riil.
- Jika ada pertanyaan di luar pengetahuanmu atau kendala teknis yang kompleks, sarankan mereka secara sopan untuk langsung menghubungi tim Customer Service resmi ShinnTopUp.

Katalog Produk Game Aktif Saat Ini:
${productList}` }]
        },
        ...(history || []).map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        }))
      ]
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({
      success: true,
      response: text
    });

  } catch (error) {
    next(error);
  }
};

// @desc    AI Recommendation Panel (Homepage)
// @route   POST /api/ai/recommend
// @access  Public
export const aiRecommend = async (req, res, next) => {
  const { query, budget } = req.body;

  try {
    // Ambil data produk & nominal lengkap
    let products = [];
    if (mongoose.connection.readyState !== 1) {
      products = mockProducts.filter(p => p.active);
    } else {
      products = await Product.find({ active: true });
    }
    
    // Format katalog untuk Gemini
    let catalogText = '';
    products.forEach(p => {
      catalogText += `Game: ${p.name} (Slug: ${p.slug}, Kategori: ${p.category})\nPaket Nominal:\n`;
      p.packages.forEach(pkg => {
        const finalPrice = Math.round(pkg.price * (1 - (pkg.discount / 100)));
        catalogText += `  - ${pkg.name} | ID Paket: ${pkg.id} | Harga: Rp ${finalPrice.toLocaleString('id-ID')} (Asli: Rp ${pkg.price.toLocaleString('id-ID')}, Diskon: ${pkg.discount}%)\n`;
      });
      catalogText += '\n';
    });

    const model = getGeminiModel();

    if (!model) {
      return res.json({
        success: true,
        response: `Halo! Di ShinnTopUp, kami merekomendasikan **Mobile Legends (74 Diamonds - Rp 22.000)** atau **Free Fire (140 Diamonds - Rp 20.000)** jika budget Anda di bawah Rp 30.000. Untuk budget lebih, Anda bisa membeli paket dengan badge **Best Value** seperti **355 Diamonds Free Fire (Rp 50.000)**! (Catatan: Aktifkan \`GEMINI_API_KEY\` untuk rekomendasi AI real-time).`
      });
    }

    const prompt = `Kamu adalah mesin rekomendasi belanja pintar di beranda ShinnTopUp.
Tugas kamu adalah menganalisis input user berupa pertanyaan/minat (${query || 'tidak ada'}) dan budget uang belanja mereka (sebesar Rp ${budget || '0'}).
Rekomendasikan game dan paket nominal spesifik yang ada di katalog kami yang sesuai dengan budget atau preferensi mereka.

Katalog Game ShinnTopUp saat ini:
${catalogText}

Aturan Respon:
1. Jawab dalam Bahasa Indonesia yang singkat, ramah, dan interaktif (maksimal 3-4 paragraf).
2. Sebutkan nama game, nama nominal paket, dan harga finalnya secara jelas.
3. Berikan link halaman detail game dengan format markdown menggunakan slug produk. Contoh: [Top-Up Mobile Legends](/topup/mobile-legends).
4. Yakinkan mereka untuk segera melakukan transaksi karena prosesnya instan dan aman.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({
      success: true,
      response: text
    });

  } catch (error) {
    next(error);
  }
};
