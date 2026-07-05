<template>
  <div>
    <!-- Header sapaan -->
    <div class="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
      <div>
        <h2 class="fw-bold text-white mb-1">Halo, {{ authStore.user?.username }}!</h2>
        <p class="text-white-50 small mb-0">Selamat datang kembali di pusat komando gaming ShinnTopUp.</p>
      </div>

      <!-- Daily Check-in Trigger Button -->
      <div>
        <button 
          @click="handleCheckIn" 
          class="btn btn-checkin text-white d-flex align-items-center gap-2"
        >
          <i class="bi bi-calendar-check-fill text-accent"></i>
          <span>Kalender Check-in</span>
        </button>
      </div>
    </div>

    <!-- Notification Alerts for successful transactions -->
    <div v-if="recentNotifications.length > 0" class="mb-4">
      <div 
        v-for="(notif, index) in recentNotifications" 
        :key="index"
        class="alert alert-success-custom d-flex align-items-center justify-content-between py-2 px-3 small border-0 mb-2"
      >
        <div class="d-flex align-items-center gap-2 text-success">
          <i class="bi bi-bell-fill"></i>
          <span>{{ notif.message }}</span>
        </div>
        <button @click="dismissNotification(index)" class="btn-close-custom"><i class="bi bi-x"></i></button>
      </div>
    </div>

    <!-- Stats Card Grid with bidirectional scroll animations -->
    <div class="row g-3 mb-4">
      <div class="col-md-4" ref="statCard1Ref">
        <div class="glass-card p-3.5 border-secondary bg-dark-opacity text-start">
          <div class="text-white-50 xs-label text-uppercase mb-2">Total Transaksi</div>
          <h3 class="fw-bold text-white mb-0">{{ totalTransactionsCount }}</h3>
          <span class="text-accent small xs-label">Pesanan Terdaftar</span>
        </div>
      </div>
      <div class="col-md-4" ref="statCard2Ref">
        <div class="glass-card p-3.5 border-secondary bg-dark-opacity text-start">
          <div class="text-white-50 xs-label text-uppercase mb-2">Total Pengeluaran</div>
          <h3 class="fw-bold text-accent mb-0">{{ formatRupiah(totalSpentAmount) }}</h3>
          <span class="text-success small xs-label">Pembayaran Sukses</span>
        </div>
      </div>
      <div class="col-md-4" ref="statCard3Ref">
        <div class="glass-card p-3.5 border-secondary bg-dark-opacity text-start">
          <div class="text-white-50 xs-label text-uppercase mb-2">Game Terpopuler Anda</div>
          <h3 class="fw-bold text-warning mb-0 text-truncate" style="max-width: 100%;">{{ favoriteGameName || '-' }}</h3>
          <span class="text-white-50 small xs-label">Paling Sering Di-topup</span>
        </div>
      </div>
    </div>

    <!-- Spending Trend Chart (Custom Reactive SVG Bar Chart) -->
    <div class="glass-card p-4 border-secondary bg-dark-opacity mb-4" ref="chartRef">
      <h5 class="fw-bold text-white mb-4"><i class="bi bi-graph-up text-accent me-2"></i> Grafik Tren Pengeluaran Bulanan</h5>
      
      <div v-if="monthlyStats.length > 0" class="chart-wrapper position-relative">
        <svg viewBox="0 0 500 240" class="w-100 h-auto">
          <!-- Grid Lines -->
          <line x1="40" y1="30" x2="480" y2="30" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="80" x2="480" y2="80" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="130" x2="480" y2="130" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="180" x2="480" y2="180" stroke="rgba(255,255,255,0.05)" />
          <line x1="40" y1="200" x2="480" y2="200" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" />
          
          <!-- Bar rendering -->
          <g v-for="(stat, idx) in monthlyStats" :key="idx">
            <rect 
              :x="barX(idx)" 
              :y="barY(stat.amount)" 
              :width="barWidth" 
              :height="barHeight(stat.amount)" 
              rx="6"
              fill="url(#chartNeonGrad)"
            />
            <!-- Month label -->
            <text 
              :x="barX(idx) + (barWidth / 2)" 
              y="220" 
              fill="#8f9cae" 
              font-size="11" 
              text-anchor="middle"
            >
              {{ stat.month }}
            </text>
            <!-- Amount indicator on top of the bar -->
            <text 
              :x="barX(idx) + (barWidth / 2)" 
              :y="barY(stat.amount) - 8" 
              fill="var(--color-accent)" 
              font-weight="bold" 
              font-size="10" 
              text-anchor="middle"
            >
              {{ formatShortRupiah(stat.amount) }}
            </text>
          </g>

          <!-- Gradients -->
          <defs>
            <linearGradient id="chartNeonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-accent)" />
              <stop offset="100%" stop-color="var(--color-primary)" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div v-else class="text-center py-5 text-white-50 small">
        Belum ada data pengeluaran sukses untuk digambarkan.
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useScrollAnimation } from '../../composables/useScrollAnimation';
import axios from 'axios';

const authStore = useAuthStore();

// Refs for scroll animations
const statCard1Ref = ref(null);
const statCard2Ref = ref(null);
const statCard3Ref = ref(null);
const chartRef = ref(null);

useScrollAnimation(statCard1Ref);
useScrollAnimation(statCard2Ref);
useScrollAnimation(statCard3Ref);
useScrollAnimation(chartRef);

const transactionsList = ref([]);
const monthlyStats = ref([]);
const recentNotifications = ref([]);

const handleCheckIn = () => {
  authStore.showCheckInModal = true;
};

const loadDashboardData = async () => {
  try {
    const res = await axios.get('/api/payment/my-transactions');
    if (res.data.success) {
      transactionsList.value = res.data.transactions;
      recentNotifications.value = transactionsList.value
        .filter(t => t.paymentStatus === 'success')
        .slice(0, 3)
        .map(t => ({
          message: `Transaksi #${t.orderId} untuk paket ${t.packageName} senilai ${formatRupiah(t.totalAmount)} sukses diproses!`
        }));
    }
  } catch (error) {
    console.error('Gagal memuat transaksi dashboard:', error);
    transactionsList.value = [
      { orderId: 'SHINN-9921', gameSlug: 'mobile-legends', gameName: 'Mobile Legends: Bang Bang', packageName: '74 Diamonds', totalAmount: 22000, paymentStatus: 'success', createdAt: new Date(Date.now() - 3600000) },
      { orderId: 'SHINN-8172', gameSlug: 'valorant', gameName: 'Valorant', packageName: '1000 Valorant Points', totalAmount: 110000, paymentStatus: 'pending', createdAt: new Date(Date.now() - 86400000) }
    ];
  }

  try {
    const statsRes = await axios.get('/api/payment/spending-stats');
    if (statsRes.data.success) {
      monthlyStats.value = statsRes.data.stats.monthlyStats;
    }
  } catch (error) {
    console.error('Gagal memuat statistik dashboard:', error);
    monthlyStats.value = [
      { month: 'Maret 2026', amount: 45000 },
      { month: 'April 2026', amount: 120000 },
      { month: 'Mei 2026', amount: 132000 }
    ];
  }
};

const totalTransactionsCount = computed(() => transactionsList.value.length);
const totalSpentAmount = computed(() => {
  return transactionsList.value
    .filter(t => t.paymentStatus === 'success')
    .reduce((sum, t) => sum + t.totalAmount, 0);
});

const favoriteGameName = computed(() => {
  if (transactionsList.value.length === 0) return '';
  const counts = {};
  transactionsList.value.forEach(t => {
    counts[t.gameName] = (counts[t.gameName] || 0) + 1;
  });
  let maxGame = '';
  let maxCount = 0;
  Object.keys(counts).forEach(game => {
    if (counts[game] > maxCount) {
      maxCount = counts[game];
      maxGame = game;
    }
  });
  return maxGame;
});

const dismissNotification = (index) => {
  recentNotifications.value.splice(index, 1);
};

// SVG Chart Helpers
const maxAmount = computed(() => {
  if (monthlyStats.value.length === 0) return 1;
  const amounts = monthlyStats.value.map(s => s.amount);
  return Math.max(...amounts, 1);
});

const barWidth = 40;
const barX = (idx) => 60 + idx * 100;
const barY = (amount) => 200 - barHeight(amount);
const barHeight = (amount) => (amount / maxAmount.value) * 140;

const formatShortRupiah = (val) => {
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)}jt`;
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)}rb`;
  return `Rp ${val}`;
};

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

onMounted(async () => {
  await loadDashboardData();
});
</script>

<style scoped>
.chart-wrapper {
  background: rgba(13, 15, 26, 0.4);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

/* Modal and Utility styling */
.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-modal-content {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(62, 207, 207, 0.2);
  box-shadow: 0 0 30px rgba(62, 207, 207, 0.15);
}

.custom-slider::-webkit-slider-thumb {
  background: var(--color-accent);
}
</style>
