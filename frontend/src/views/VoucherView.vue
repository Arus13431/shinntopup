<template>
  <div class="container py-5 text-start auth-card-fade">
    <!-- Header -->
    <div class="glass-card p-4 p-md-5 border-secondary text-center position-relative overflow-hidden mb-5">
      <div class="profile-glow-ring"></div>
      <h2 class="fw-bold text-white mb-2"><i class="bi bi-ticket-perforated-fill text-accent me-2"></i> Voucher & Promo Aktif</h2>
      <p class="text-muted mb-0">Salin kode promo dan nikmati diskon khusus transaksi top-up game favoritmu di ShinnTopUp!</p>
    </div>

    <!-- Vouchers Grid -->
    <div class="row g-4">
      <div v-for="(voucher, idx) in vouchers" :key="idx" class="col-lg-4 col-md-6">
        <div class="glass-card p-4 border-secondary h-100 d-flex flex-column justify-content-between position-relative overflow-hidden voucher-card">
          <!-- Glow badge -->
          <div class="voucher-glow" :style="{ background: voucher.glow }"></div>

          <div>
            <div class="d-flex justify-content-between align-items-center mb-3 position-relative z-index-1">
              <span class="badge bg-secondary-opacity text-accent border border-accent-opacity px-2.5 py-1.5 fw-bold">{{ voucher.category }}</span>
              <span class="text-white-50 small"><i class="bi bi-clock me-1"></i> {{ voucher.validUntil }}</span>
            </div>
            
            <h5 class="fw-bold text-white mb-2 position-relative z-index-1">{{ voucher.title }}</h5>
            <p class="text-white-50 small mb-4 position-relative z-index-1">{{ voucher.desc }}</p>
          </div>

          <!-- Code Box -->
          <div class="code-box-wrapper d-flex align-items-center justify-content-between p-2.5 bg-dark-opacity rounded-3 border border-dashed border-secondary position-relative z-index-1">
            <span class="fw-mono text-accent fw-extrabold letter-spacing-1 ps-2">{{ voucher.code }}</span>
            <button @click="copyCode(voucher.code)" class="btn btn-sm btn-shinn-primary py-1 px-3">
              {{ copiedCode === voucher.code ? 'Tersalin' : 'Salin' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const copiedCode = ref('');

const vouchers = [
  {
    category: "DISKON MLBB",
    title: "Mobile Legends Spesial",
    desc: "Potongan harga sebesar 10% hingga Rp 15.000 untuk transaksi Diamond Mobile Legends.",
    code: "SHINNML10",
    validUntil: "30 Jun 2026",
    glow: "radial-gradient(circle, rgba(62, 207, 207, 0.15) 0%, rgba(62, 207, 207, 0) 70%)"
  },
  {
    category: "NEW MEMBER",
    title: "Sobat Shinn Baru",
    desc: "Diskon flat Rp 5.000 untuk transaksi pertama member baru yang terdaftar di database.",
    code: "SOBATBARU",
    validUntil: "31 Des 2026",
    glow: "radial-gradient(circle, rgba(123, 94, 167, 0.15) 0%, rgba(123, 94, 167, 0) 70%)"
  },
  {
    category: "QRIS PROMO",
    title: "Metode QRIS Cashback",
    desc: "Cashback 5% dalam bentuk poin loyalitas untuk semua transaksi game menggunakan opsi QRIS.",
    code: "SHINNQRIS5",
    validUntil: "15 Jul 2026",
    glow: "radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 70%)"
  }
];

const copyCode = (code) => {
  navigator.clipboard.writeText(code);
  copiedCode.value = code;
  setTimeout(() => {
    copiedCode.value = '';
  }, 2000);
};
</script>

<style scoped>
.fw-mono {
  font-family: 'Courier New', Courier, monospace;
}
.letter-spacing-1 {
  letter-spacing: 1px;
}
.bg-secondary-opacity {
  background-color: rgba(62, 207, 207, 0.08);
}
.border-accent-opacity {
  border-color: rgba(62, 207, 207, 0.2);
}
.bg-dark-opacity {
  background-color: rgba(19, 22, 41, 0.6);
}
.border-dashed {
  border-style: dashed !important;
}
.voucher-card {
  transition: all 0.3s ease;
}
.voucher-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-primary) !important;
  box-shadow: 0 8px 25px rgba(123, 94, 167, 0.15) !important;
}
.voucher-glow {
  position: absolute;
  top: -60px;
  right: -60px;
  width: 150px;
  height: 150px;
  z-index: 0;
  pointer-events: none;
}
.z-index-1 {
  position: relative;
  z-index: 1;
}
.profile-glow-ring {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(123, 94, 167, 0.1) 0%, rgba(123, 94, 167, 0) 70%);
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
