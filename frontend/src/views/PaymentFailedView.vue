<template>
  <div class="container py-5 text-center">
    <div class="row justify-content-center text-start">
      <div class="col-lg-6 col-md-8 col-sm-10">
        <div class="glass-card p-4 p-md-5 border-danger-glow shadow-lg">
          
          <!-- Animated Cross X -->
          <div class="svg-container text-center mb-4">
            <svg class="error-cross" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle class="error-cross__circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="error-cross__path-1" fill="none" d="M16 16 L36 36"/>
              <path class="error-cross__path-2" fill="none" d="M36 16 L16 36"/>
            </svg>
          </div>

          <h3 class="fw-bold text-center text-danger mb-2">Transaksi Gagal / Batal</h3>
          <p class="text-muted small text-center mb-4">
            Pembayaran Anda tidak dapat diselesaikan. Hal ini bisa terjadi karena pembatalan transaksi secara manual, kesalahan input payment gateway, saldo tidak mencukupi, atau waktu tunggu transaksi telah habis.
          </p>

          <!-- Transaction Summary Box -->
          <div v-if="transaction" class="p-3 bg-secondary-opacity rounded-3 mb-4 border border-secondary">
            <h6 class="fw-bold mb-3 border-bottom border-secondary pb-2"><i class="bi bi-file-earmark-x-fill text-danger"></i> Informasi Ringkas</h6>
            <div class="d-flex flex-column gap-2 small">
              <div class="d-flex justify-content-between">
                <span class="text-muted">Order ID</span>
                <span class="text-white">{{ transaction.orderId }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Game & Paket</span>
                <span class="text-white">{{ transaction.gameName }} ({{ transaction.packageName }})</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Total Pembayaran</span>
                <span class="text-white fw-bold">{{ formatRupiah(transaction.totalAmount) }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Status Transaksi</span>
                <span class="text-danger fw-bold uppercase">{{ transaction.paymentStatus }}</span>
              </div>
            </div>
          </div>

          <!-- Helper Alert -->
          <div class="alert alert-dark bg-secondary-opacity border-secondary p-3 mb-4 rounded-3 small text-muted">
            <h6 class="text-white fw-bold mb-1"><i class="bi bi-headset me-1 text-accent"></i> Butuh bantuan pembayaran?</h6>
            Hubungi Customer Service kami melalui widget Chat AI di kanan bawah atau WhatsApp resmi kami untuk menyelesaikan kendala Anda.
          </div>

          <!-- Actions -->
          <div class="d-flex gap-2">
            <router-link to="/" class="btn btn-shinn-primary flex-grow-1 py-2">
              <i class="bi bi-arrow-repeat me-1"></i> Coba Lagi
            </router-link>
            <a href="#" @click.prevent="openSupport" class="btn btn-shinn-outline flex-grow-1 py-2">
              <i class="bi bi-headset me-1"></i> Hubungi CS
            </a>
          </div>

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
    console.error('Gagal mengambil detail transaksi gagal:', error);
  }
});

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const openSupport = () => {
  alert('Customer Service (WhatsApp): +62 812-3456-7890. Anda juga bisa mengobrol dengan asisten chat bot AI di sudut kanan bawah halaman!');
};
</script>

<style scoped>
.border-danger-glow {
  border-color: rgba(220, 53, 69, 0.4);
  box-shadow: 0 8px 32px 0 rgba(220, 53, 69, 0.15);
}

.bg-secondary-opacity {
  background-color: rgba(23, 37, 53, 0.5);
}

/* Animated Red Cross CSS */
.svg-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-cross__circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 2;
  stroke-miterlimit: 10;
  stroke: #ff3838;
  fill: none;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}

.error-cross {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #fff;
  stroke-miterlimit: 10;
  box-shadow: inset 0px 0px 0px #ff3838;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s forwards;
}

.error-cross__path-1, .error-cross__path-2 {
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke: white;
  stroke-width: 3;
  stroke-linecap: round;
}

.error-cross__path-1 {
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}

.error-cross__path-2 {
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 1s forwards;
}

@keyframes stroke {
  100% { stroke-dashoffset: 0; }
}
@keyframes scale {
  0%, 100% { transform: none; }
  50% { transform: scale3d(1.1, 1.1, 1); }
}
@keyframes fill {
  100% { box-shadow: inset 0px 0px 0px 30px #ff3838; }
}
</style>
