<template>
  <div class="container py-5 text-center">
    <div class="row justify-content-center text-start">
      <div class="col-lg-6 col-md-8 col-sm-10">
        <div v-if="transaction" class="glass-card p-4 p-md-5 border-success-glow shadow-lg position-relative overflow-hidden">
          
          <!-- Animated Checkmark -->
          <div class="svg-container text-center mb-4">
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>

          <h3 class="fw-bold text-center text-success mb-2">Top-Up Berhasil!</h3>
          <p class="text-muted small text-center mb-4">Pembayaran sukses diterima dan produk telah dikirimkan ke akun game Anda secara instan.</p>

          <!-- Transaction Summary Card -->
          <div class="p-3 bg-secondary-opacity rounded-3 mb-4 border border-secondary">
            <h6 class="fw-bold mb-3 border-bottom border-secondary pb-2"><i class="bi bi-file-earmark-text text-accent"></i> Detail Transaksi</h6>
            
            <div class="d-flex flex-column gap-2 small">
              <div class="d-flex justify-content-between">
                <span class="text-muted">Order ID</span>
                <span class="text-white fw-bold">{{ transaction.orderId }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Game</span>
                <span class="text-white">{{ transaction.gameName }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Item Nominal</span>
                <span class="text-accent fw-bold">{{ transaction.packageName }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">User ID</span>
                <span class="text-white">{{ transaction.gameUserId }} {{ transaction.gameServerId ? `(${transaction.gameServerId})` : '' }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Nickname</span>
                <span class="text-white fw-bold">{{ transaction.nickname }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Metode Pembayaran</span>
                <span class="text-white text-uppercase">{{ transaction.paymentMethod }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Tanggal Transaksi</span>
                <span class="text-white">{{ formatDate(transaction.createdAt) }}</span>
              </div>
              <hr class="border-secondary my-1" />
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-white fw-bold">Total Pembayaran</span>
                <span class="text-success fw-bold fs-5">{{ formatRupiah(transaction.totalAmount) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2">
            <router-link to="/" class="btn btn-shinn-primary flex-grow-1 py-2 text-white">
              <span class="text-white"><i class="bi bi-house-door-fill me-1 text-white"></i> Kembali ke Home</span>
            </router-link>
            <router-link to="/dashboard?tab=transactions" class="btn btn-shinn-outline flex-grow-1 py-2">
              <i class="bi bi-clock-history me-1"></i> Lihat Riwayat Transaksi
            </router-link>
          </div>

        </div>

        <div v-else class="glass-card p-5 text-center text-muted">
          <span class="spinner-border spinner-border-sm me-2"></span> Memuat data transaksi...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const orderId = route.params.orderId;
const transaction = ref(null);

onMounted(async () => {
  try {
    const res = await axios.get(`/api/payment/status/${orderId}`);
    if (res.data.success) {
      transaction.value = res.data.transaction;
    }
  } catch (error) {
    console.error('Gagal mengambil detail transaksi sukses:', error);
  }
});

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()} ${getMonthName(d.getMonth())} ${d.getFullYear()} - ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`;
};

const getMonthName = (m) => {
  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  return months[m];
};
</script>

<style scoped>
.border-success-glow {
  border-color: rgba(40, 167, 69, 0.4);
  box-shadow: 0 8px 32px 0 rgba(40, 167, 69, 0.15);
}

.bg-secondary-opacity {
  background-color: rgba(23, 37, 53, 0.5);
}

/* Animated Checkmark CSS */
.svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.checkmark__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #7ac142;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.checkmark {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #7ac142;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s forwards;
}

.checkmark__check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}
@keyframes scale {
  0%, 100% { transform: none; }
  50% { transform: scale3d(1.1, 1.1, 1); }
}
@keyframes fill {
  100% { box-shadow: inset 0px 0px 0px 30px #7ac142; }
}
</style>
