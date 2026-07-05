<template>
  <div class="container py-5 text-start auth-card-fade">
    <div class="row justify-content-center">
      <div class="col-lg-8">
        <!-- Header -->
        <div class="glass-card p-4 p-md-5 border-secondary text-center position-relative overflow-hidden mb-4">
          <div class="profile-glow-ring"></div>
          <h2 class="fw-bold text-white mb-2">Pusat Bantuan & Layanan CS</h2>
          <p class="text-muted mb-0">Kami di ShinnTopUp siap membantu memecahkan kendala transaksi Sobat Shinn 24/7.</p>
        </div>

        <!-- FAQ Accordion -->
        <div class="glass-card p-4 p-md-5 border-secondary mb-4">
          <h4 class="fw-bold text-white mb-4"><i class="bi bi-question-circle text-accent me-2"></i> FAQ - Pertanyaan Sering Diajukan</h4>
          
          <div class="accordion accordion-dark" id="faqAccordion">
            <div v-for="(item, idx) in faqs" :key="idx" class="accordion-item bg-transparent border-secondary mb-3">
              <h2 class="accordion-header">
                <button 
                  class="accordion-button bg-transparent text-white fw-bold collapsed border-0 py-3" 
                  type="button" 
                  data-bs-toggle="collapse" 
                  :data-bs-target="'#collapse-' + idx"
                  aria-expanded="false" 
                  :aria-controls="'collapse-' + idx"
                >
                  {{ item.question }}
                </button>
              </h2>
              <div 
                :id="'collapse-' + idx" 
                class="accordion-collapse collapse" 
                data-bs-parent="#faqAccordion"
              >
                <div class="accordion-body text-white-50 small pt-0 pb-3">
                  {{ item.answer }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Support Card -->
        <div class="glass-card p-4 p-md-5 border-secondary bg-gradient-ai">
          <h4 class="fw-bold text-white mb-3 text-center"><i class="bi bi-headset text-accent me-2"></i> Hubungi Customer Service Resmi</h4>
          <p class="text-white-50 text-center small mb-4">Jika ada kendala yang belum terjawab di atas, hubungi asisten CS kami untuk penanganan langsung.</p>
          
          <div class="row g-3 justify-content-center">
            <div class="col-md-5">
              <a href="https://wa.me/628123456789" target="_blank" class="btn btn-cs-whatsapp w-100 py-3 text-decoration-none d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-whatsapp fs-5"></i>
                <span class="fw-bold">WhatsApp ShinnCS</span>
              </a>
            </div>
            <div class="col-md-5">
              <a href="https://t.me/shinntopup_bot" target="_blank" class="btn btn-cs-telegram w-100 py-3 text-decoration-none d-flex align-items-center justify-content-center gap-2">
                <i class="bi bi-telegram fs-5"></i>
                <span class="fw-bold">Telegram Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const faqs = [
  {
    question: "Bagaimana cara melakukan top-up di ShinnTopUp?",
    answer: "Caranya sangat mudah! 1) Pilih game yang ingin di-topup di halaman utama. 2) Masukkan User ID dan Zone ID akun game Anda. 3) Pilih nominal paket yang diinginkan. 4) Pilih metode pembayaran dan masukkan email Anda. 5) Selesaikan pembayaran dan diamond akan otomatis masuk secara instan!"
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "ShinnTopUp mendukung berbagai opsi pembayaran instan mulai dari E-Wallet (QRIS, GoPay, OVO, DANA, ShopeePay), Transfer Bank Virtual Account (BCA, BNI, Mandiri, BRI), hingga melalui Gerai Minimarket terdekat (Indomaret dan Alfamart)."
  },
  {
    question: "Berapa lama waktu proses pengiriman produk?",
    answer: "Rata-rata transaksi kami diproses secara otomatis oleh sistem dalam 1 - 3 menit setelah pembayaran Anda terverifikasi oleh gateway pembayaran Midtrans."
  },
  {
    question: "Apakah transaksi di website ini aman?",
    answer: "Sangat aman! Seluruh transaksi diproses menggunakan gateway pembayaran berlisensi Midtrans Sandbox secara terenkripsi. ShinnTopUp tidak menyimpan informasi perbankan Anda dan kami menggunakan sesi JWT yang aman untuk melindungi data profil."
  },
  {
    question: "Bagaimana jika saya salah memasukkan User ID Game?",
    answer: "Harap periksa kembali User ID dan Zone ID Anda sebelum menekan tombol Bayar. Kami menyediakan tombol verifikasi Nickname (Cek ID) untuk membantu mencegah salah kirim. Transaksi yang sudah terlanjur sukses dikirim ke ID yang salah tidak dapat ditarik kembali."
  }
];
</script>

<style scoped>
.accordion-button:not(.collapsed) {
  color: var(--color-accent);
  box-shadow: none;
}
.accordion-button::after {
  filter: invert(1);
}
.accordion-item {
  border-radius: 8px !important;
}
.btn-cs-whatsapp {
  background-color: #25d366;
  color: #000000 !important;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);
  transition: all 0.3s ease;
}
.btn-cs-whatsapp:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.5);
}
.btn-cs-telegram {
  background-color: #0088cc;
  color: #ffffff !important;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 136, 204, 0.3);
  transition: all 0.3s ease;
}
.btn-cs-telegram:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 136, 204, 0.5);
}
.bg-gradient-ai {
  background: linear-gradient(135deg, rgba(62, 207, 207, 0.05) 0%, rgba(123, 94, 167, 0.05) 100%);
}
.profile-glow-ring {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(62, 207, 207, 0.15) 0%, rgba(62, 207, 207, 0) 70%);
  pointer-events: none;
}
.auth-card-fade {
  animation: card-entry 0.4s ease forwards;
}
@keyframes card-entry {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
