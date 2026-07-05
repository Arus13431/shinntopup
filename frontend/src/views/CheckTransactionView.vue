<template>
  <div class="container py-5 text-start auth-card-fade">
    <div class="row justify-content-center">
      <div class="col-lg-7 col-md-10">
        <!-- Search Card -->
        <div class="glass-card p-4 p-md-5 border-secondary shadow-lg mb-4">
          <div class="d-flex align-items-center gap-3 mb-4">
            <div class="logo-icon bg-gradient-electric-blue">
              <i class="bi bi-search text-white"></i>
            </div>
            <div>
              <h3 class="fw-bold text-white mb-1">Cek Status Transaksi</h3>
              <p class="text-muted small mb-0">Masukkan Order ID Anda untuk memantau status pembayaran secara real-time.</p>
            </div>
          </div>

          <form @submit.prevent="checkTransaction" class="d-flex flex-column flex-sm-row gap-3">
            <div class="flex-grow-1">
              <input 
                v-model="orderIdInput" 
                type="text" 
                class="form-control bg-dark-opacity border-secondary text-white py-2.5" 
                placeholder="Contoh: SHINN-1685412..." 
                required 
              />
            </div>
            <button type="submit" class="btn btn-shinn-primary px-4 py-2.5" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              <i v-else class="bi bi-search me-1"></i>
              Cari Transaksi
            </button>
          </form>

          <!-- Error Alert -->
          <transition name="fade">
            <div v-if="errorMessage" class="alert alert-danger-custom text-start py-2 px-3 small mt-3" role="alert">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            </div>
          </transition>
        </div>

        <!-- Result Card -->
        <transition name="fade">
          <div v-if="transaction" class="glass-card p-4 p-md-5 border-secondary shadow-lg">
            <div class="d-flex align-items-center justify-content-between border-bottom border-secondary pb-3 mb-4">
              <h5 class="fw-bold mb-0 text-white">Rincian Transaksi</h5>
              <span class="badge py-2 px-3" :class="statusBadgeClass(transaction.paymentStatus)">
                {{ translateStatus(transaction.paymentStatus) }}
              </span>
            </div>

            <!-- Details -->
            <div class="row g-3">
              <div class="col-sm-6">
                <div class="text-muted small">Order ID</div>
                <div class="text-accent fw-bold fs-5">{{ transaction.orderId }}</div>
              </div>
              <div class="col-sm-6">
                <div class="text-muted small">Nama Game</div>
                <div class="text-white fw-semibold">{{ transaction.gameName }}</div>
              </div>
              <div class="col-sm-6">
                <div class="text-muted small">Paket Nominal</div>
                <div class="text-white">{{ transaction.packageName }}</div>
              </div>
              <div class="col-sm-6">
                <div class="text-muted small">ID Akun Game</div>
                <div class="text-white">{{ transaction.gameUserId }} {{ transaction.gameServerId ? `(${transaction.gameServerId})` : '' }}</div>
              </div>
              <div class="col-sm-6">
                <div class="text-muted small">Metode Pembayaran</div>
                <div class="text-white text-uppercase fw-semibold">{{ transaction.paymentMethod }}</div>
              </div>
              <div class="col-sm-6">
                <div class="text-muted small">Waktu Transaksi</div>
                <div class="text-white-50">{{ formatDate(transaction.createdAt) }}</div>
              </div>
              <div class="col-12">
                <hr class="border-secondary my-2" />
              </div>
              <div class="col-sm-6">
                <div class="text-muted small">Total Harga</div>
                <div class="text-accent fw-extrabold fs-4">{{ formatRupiah(transaction.totalAmount) }}</div>
              </div>
            </div>

            <!-- Action back / buy again -->
            <div class="d-flex justify-content-end gap-2 mt-4">
              <router-link :to="'/topup/' + transaction.gameSlug" class="btn btn-shinn-outline px-4">
                Top-up Lagi <i class="bi bi-arrow-repeat ms-1"></i>
              </router-link>
              <router-link to="/" class="btn btn-shinn-primary px-4 text-white">
                Ke Beranda
              </router-link>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const orderIdInput = ref('');
const loading = ref(false);
const transaction = ref(null);
const errorMessage = ref('');

const checkTransaction = async () => {
  if (!orderIdInput.value.trim()) return;
  loading.value = true;
  errorMessage.value = '';
  transaction.value = null;

  try {
    const response = await api.get(`/api/payment/status/${orderIdInput.value.trim()}`);
    if (response.data.success && response.data.transaction) {
      transaction.value = response.data.transaction;
    } else {
      errorMessage.value = 'Transaksi tidak ditemukan.';
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Gagal mencari status transaksi. Silakan coba kembali.';
  } finally {
    loading.value = false;
  }
};

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const translateStatus = (s) => {
  if (s === 'success') return 'Sukses';
  if (s === 'pending') return 'Pending';
  return 'Gagal';
};

const statusBadgeClass = (s) => {
  if (s === 'success') return 'bg-success text-white';
  if (s === 'pending') return 'bg-warning text-dark';
  return 'bg-danger text-white';
};
</script>

<style scoped>
.logo-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.bg-dark-opacity {
  background-color: rgba(19, 22, 41, 0.6);
}
.alert-danger-custom {
  background-color: rgba(255, 70, 85, 0.15);
  border: 1px solid rgba(255, 70, 85, 0.3);
  color: #ff4655;
  border-radius: 8px;
}
.auth-card-fade {
  animation: card-entry 0.4s ease forwards;
}
@keyframes card-entry {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
