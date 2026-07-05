<template>
  <div class="container py-5">
    <div class="row justify-content-center text-start">
      <div class="col-lg-8 col-md-10">
        
        <!-- STEPPER HEADER -->
        <div class="stepper-header mb-5 d-flex align-items-center justify-content-between">
          <div class="stepper-step d-flex flex-column align-items-center" :class="{ 'active': currentStep === 1, 'completed': currentStep > 1 }">
            <div class="step-circle">1</div>
            <span class="step-title mt-2">Ringkasan</span>
          </div>
          <div class="stepper-bar flex-grow-1" :class="{ 'active': currentStep > 1 }"></div>
          <div class="stepper-step d-flex flex-column align-items-center" :class="{ 'active': currentStep === 2, 'completed': currentStep > 2 }">
            <div class="step-circle">2</div>
            <span class="step-title mt-2">Pembayaran</span>
          </div>
          <div class="stepper-bar flex-grow-1" :class="{ 'active': currentStep > 2 }"></div>
          <div class="stepper-step d-flex flex-column align-items-center" :class="{ 'active': currentStep === 3, 'completed': currentStep > 3 }">
            <div class="step-circle">3</div>
            <span class="step-title mt-2">Instruksi</span>
          </div>
          <div class="stepper-bar flex-grow-1" :class="{ 'active': currentStep > 3 }"></div>
          <div class="stepper-step d-flex flex-column align-items-center" :class="{ 'active': currentStep === 4 }">
            <div class="step-circle">4</div>
            <span class="step-title mt-2">Konfirmasi</span>
          </div>
        </div>

        <!-- MAIN CHECKOUT GLASS CARD -->
        <div v-if="cartStore.selectedGame || currentStep === 4" class="glass-card p-4 p-md-5 border-secondary shadow-lg position-relative overflow-hidden">
          
          <!-- STEP 1: RINGKASAN ORDER -->
          <div v-if="currentStep === 1">
            <h3 class="fw-bold mb-4 text-white"><i class="bi bi-file-earmark-text text-accent me-2"></i> Ringkasan Pembelian</h3>
            
            <div class="d-flex align-items-center gap-3 p-3 bg-secondary-opacity rounded-3 mb-4">
              <img :src="cartStore.selectedGame?.image" :alt="cartStore.selectedGame?.name" class="checkout-game-img rounded-3" />
              <div>
                <h5 class="fw-bold text-white mb-1">{{ cartStore.selectedGame?.name }}</h5>
                <span class="badge bg-secondary-opacity text-accent small">{{ cartStore.selectedGame?.category }}</span>
              </div>
            </div>

            <div class="row g-4 mb-4">
              <div class="col-md-6">
                <div class="mb-3">
                  <div class="small text-muted mb-1">Nickname Akun</div>
                  <div class="fw-bold text-white fs-5">{{ cartStore.checkedUser?.nickname }}</div>
                </div>
                <div class="mb-3">
                  <div class="small text-muted mb-1">User ID Game</div>
                  <div class="fw-bold text-white">
                    {{ cartStore.checkedUser?.userId }}
                    <span v-if="cartStore.checkedUser?.serverId" class="text-muted"> ({{ cartStore.checkedUser?.serverId }})</span>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="mb-3">
                  <div class="small text-muted mb-1">Paket yang Dipilih</div>
                  <div class="fw-bold text-accent fs-5">{{ cartStore.selectedPackage?.name }}</div>
                </div>
                <div class="mb-3">
                  <div class="small text-muted mb-1">Email Penerima</div>
                  <div class="fw-bold text-white">{{ cartStore.guestEmail }}</div>
                </div>
              </div>
            </div>

            <!-- Price Summary -->
            <div class="bg-secondary-opacity rounded-3 p-4 mb-4">
              <div class="d-flex justify-content-between mb-2 small text-muted">
                <span>Harga Paket</span>
                <span class="text-decoration-line-through">{{ formatRupiah(cartStore.selectedPackage?.price) }}</span>
              </div>
              <div v-if="cartStore.selectedPackage?.discount > 0" class="d-flex justify-content-between mb-2 small text-danger">
                <span>Potongan Diskon ({{ cartStore.selectedPackage?.discount }}%)</span>
                <span>-{{ formatRupiah(Math.round(cartStore.selectedPackage?.price * cartStore.selectedPackage?.discount / 100)) }}</span>
              </div>
              <div class="d-flex justify-content-between mb-3 small text-muted">
                <span>Biaya Admin (Flat)</span>
                <span>{{ formatRupiah(cartStore.adminFee) }}</span>
              </div>
              <hr class="border-secondary mb-3" />
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="fw-bold text-white mb-0">Total Pembayaran</h5>
                <h3 class="fw-extrabold text-accent mb-0">{{ formatRupiah(cartStore.totalAmount) }}</h3>
              </div>
            </div>

            <!-- Next Button -->
            <div class="d-flex gap-3 justify-content-between mt-4">
              <button @click="cancelCheckout" class="btn btn-shinn-outline px-4">Batalkan</button>
              <button @click="currentStep = 2" class="btn btn-shinn-primary px-5 text-white">
                Lanjutkan <i class="bi bi-arrow-right ms-1 text-white"></i>
              </button>
            </div>
          </div>

          <!-- STEP 2: METODE PEMBAYARAN -->
          <div v-else-if="currentStep === 2">
            <h3 class="fw-bold mb-4 text-white"><i class="bi bi-wallet2 text-accent me-2"></i> Pilih Metode Pembayaran</h3>

            <!-- E-Wallets -->
            <div class="mb-4">
              <h6 class="text-muted border-bottom border-secondary pb-2 mb-3">E-Wallet (Konfirmasi Instan)</h6>
              <div class="row g-3">
                <div v-for="method in eWallets" :key="method.id" class="col-md-4 col-6">
                  <div 
                    @click="selectedPaymentMethod = method" 
                    class="payment-method-card text-center h-100 d-flex flex-column justify-content-center p-3"
                    :class="{ 'active': selectedPaymentMethod?.id === method.id }"
                  >
                    <div class="payment-icon mb-2">
                      <i class="bi bi-wallet2 fs-3 text-accent animate-pulse-accent"></i>
                    </div>
                    <div class="fw-bold text-white mb-1">{{ method.name }}</div>
                    <div class="small text-muted">{{ formatRupiah(cartStore.totalAmount) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Virtual Accounts -->
            <div class="mb-4">
              <h6 class="text-muted border-bottom border-secondary pb-2 mb-3">Virtual Account (Transfer Bank)</h6>
              <div class="row g-3">
                <div v-for="method in virtualAccounts" :key="method.id" class="col-md-3 col-6">
                  <div 
                    @click="selectedPaymentMethod = method" 
                    class="payment-method-card text-center h-100 d-flex flex-column justify-content-center p-3"
                    :class="{ 'active': selectedPaymentMethod?.id === method.id }"
                  >
                    <div class="payment-icon mb-2">
                      <i class="bi bi-bank fs-3 text-info"></i>
                    </div>
                    <div class="fw-bold text-white mb-1">{{ method.name }}</div>
                    <div class="small text-muted">{{ formatRupiah(cartStore.totalAmount) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Retail Stores -->
            <div class="mb-4">
              <h6 class="text-muted border-bottom border-secondary pb-2 mb-3">Gerai Retail / Minimarket</h6>
              <div class="row g-3">
                <div v-for="method in retailStores" :key="method.id" class="col-md-6 col-6">
                  <div 
                    @click="selectedPaymentMethod = method" 
                    class="payment-method-card text-center h-100 d-flex flex-column justify-content-center p-3"
                    :class="{ 'active': selectedPaymentMethod?.id === method.id }"
                  >
                    <div class="payment-icon mb-2">
                      <i class="bi bi-shop fs-3 text-warning"></i>
                    </div>
                    <div class="fw-bold text-white mb-1">{{ method.name }}</div>
                    <div class="small text-muted">{{ formatRupiah(cartStore.totalAmount) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex gap-3 justify-content-between mt-5 pt-3 border-top border-secondary">
              <button @click="currentStep = 1" class="btn btn-shinn-outline px-4"><i class="bi bi-arrow-left me-1"></i> Kembali</button>
              <button 
                @click="payNow" 
                class="btn btn-shinn-primary px-5 text-white"
                :disabled="!selectedPaymentMethod || loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2 text-white"></span>
                <i v-else class="bi bi-shield-lock-fill me-1 text-white"></i>
                <span class="text-white">Bayar Sekarang</span>
              </button>
            </div>
          </div>

          <!-- STEP 3: DETAIL INSTRUKSI & TIMER POLLING -->
          <div v-else-if="currentStep === 3">
            <div class="d-flex align-items-center justify-content-between border-bottom border-secondary pb-3 mb-4">
              <h3 class="fw-bold mb-0 text-white"><i class="bi bi-clock-history text-danger me-2 animate-pulse-accent"></i> Selesaikan Pembayaran</h3>
              <div class="d-flex align-items-center gap-2 text-danger small bg-danger-opacity px-3 py-1.5 rounded-pill border border-danger-opacity">
                <i class="bi bi-clock-fill text-danger"></i>
                <span class="fw-bold text-danger">{{ formattedTime }}</span>
              </div>
            </div>

            <div class="row g-4 mb-4">
              <div class="col-md-7">
                <h5 class="fw-bold text-white mb-3">Petunjuk Pembayaran ({{ selectedPaymentMethod?.name }})</h5>
                
                <!-- QRIS / E-Wallet Instruction -->
                <div v-if="selectedPaymentMethod?.group === 'wallet'" class="text-start">
                  <p class="text-white-80 small">1. Pindai kode QRIS di samping menggunakan aplikasi e-wallet Anda (GoPay, OVO, DANA, LinkAja, atau m-Banking).</p>
                  <p class="text-white-80 small">2. Pastikan nominal pembayaran sudah sesuai yaitu <strong>{{ formatRupiah(cartStore.totalAmount) }}</strong>.</p>
                  <p class="text-white-80 small">3. Masukkan PIN transaksi e-wallet Anda.</p>
                  <p class="text-white-80 small">4. Transaksi akan langsung terverifikasi otomatis setelah pembayaran selesai.</p>
                </div>

                <!-- VA Instructions -->
                <div v-else-if="selectedPaymentMethod?.group === 'va'" class="text-start">
                  <div class="mb-4">
                    <span class="small text-muted d-block mb-1">Nomor Virtual Account</span>
                    <div class="d-flex align-items-center gap-2">
                      <span class="fw-extrabold text-accent fs-4 font- Rajdhani">{{ mockVaNumber }}</span>
                      <button @click="copyText(mockVaNumber)" class="btn btn-sm btn-shinn-outline py-1 px-2">
                        <i class="bi bi-clipboard"></i> Salin
                      </button>
                    </div>
                  </div>
                  <p class="text-white-80 small">1. Gunakan ATM, m-Banking, atau Internet Banking Anda.</p>
                  <p class="text-white-80 small">2. Pilih menu transfer dan pilih transfer ke Virtual Account.</p>
                  <p class="text-white-80 small">3. Masukkan nomor Virtual Account di atas.</p>
                  <p class="text-white-80 small">4. Masukkan nominal tagihan tepat sebesar <strong>{{ formatRupiah(cartStore.totalAmount) }}</strong>.</p>
                  <p class="text-white-80 small">5. Ikuti petunjuk layar ATM/m-Banking untuk menyelesaikan transaksi.</p>
                </div>

                <!-- Retail Instructions -->
                <div v-else-if="selectedPaymentMethod?.group === 'retail'" class="text-start">
                  <div class="mb-4">
                    <span class="small text-muted d-block mb-1">Kode Pembayaran Retail</span>
                    <div class="d-flex align-items-center gap-2">
                      <span class="fw-extrabold text-accent fs-4 font- Rajdhani">{{ mockRetailCode }}</span>
                      <button @click="copyText(mockRetailCode)" class="btn btn-sm btn-shinn-outline py-1 px-2">
                        <i class="bi bi-clipboard"></i> Salin
                      </button>
                    </div>
                  </div>
                  <p class="text-white-80 small">1. Kunjungi gerai retail <strong>{{ selectedPaymentMethod?.name }}</strong> terdekat.</p>
                  <p class="text-white-80 small">2. Katakan ke kasir bahwa Anda ingin membayar tagihan transaksi digital ShinnTopUp.</p>
                  <p class="text-white-80 small">3. Tunjukkan Kode Pembayaran di atas ke kasir.</p>
                  <p class="text-white-80 small">4. Bayarkan nominal sebesar <strong>{{ formatRupiah(cartStore.totalAmount) }}</strong> secara tunai atau debit.</p>
                  <p class="text-white-80 small">5. Simpan struk bukti pembayaran yang diberikan kasir.</p>
                </div>

                <!-- Polling Status Visual -->
                <div class="mt-4 p-3 bg-secondary-opacity rounded-3 border border-secondary d-flex align-items-center gap-3">
                  <span class="spinner-border text-accent spinner-border-sm" role="status"></span>
                  <span class="text-white-80 small">Sistem sedang mendeteksi pembayaran Anda secara real-time...</span>
                </div>
              </div>

              <!-- Visual Component Side (QR Code or logo) -->
              <div class="col-md-5 d-flex flex-column align-items-center justify-content-center text-center">
                <div v-if="selectedPaymentMethod?.group === 'wallet'" class="qr-container bg-white p-3 rounded-4 mb-3 border border-secondary shadow-lg">
                  <!-- QR Code Mock generator -->
                  <div class="qr-mock d-flex flex-column align-items-center justify-content-center">
                    <i class="bi bi-qr-code fs-1 text-dark" style="font-size: 140px !important;"></i>
                    <div class="fw-bold text-dark mt-2 small">PINDAI MENGGUNAKAN E-WALLET</div>
                  </div>
                </div>
                <div v-else class="logo-payment-showcase p-4 bg-secondary-opacity rounded-4 mb-3 border border-secondary text-center">
                  <i v-if="selectedPaymentMethod?.group === 'va'" class="bi bi-bank fs-1 text-accent d-block mb-3"></i>
                  <i v-else class="bi bi-shop fs-1 text-accent d-block mb-3"></i>
                  <span class="fw-bold text-white fs-5">{{ selectedPaymentMethod?.name }}</span>
                </div>

                <div class="small text-muted mb-3">Order ID: {{ activeOrderId }}</div>
                
                <!-- Deep Link Midtrans Simulator -->
                <a :href="midtransRedirectUrl" target="_blank" class="btn btn-sm btn-shinn-outline w-100 py-2">
                  <i class="bi bi-box-arrow-up-right me-1"></i> Buka Simulator Pembayaran
                </a>
              </div>
            </div>

            <!-- Cancel Button -->
            <div class="d-flex justify-content-between mt-4 border-top border-secondary pt-3">
              <button @click="cancelCheckout" class="btn btn-shinn-outline px-4 text-danger border-danger-opacity">
                Batalkan Pembelian
              </button>
              
              <!-- Direct Simulation Trigger (Useful for offline DB testing) -->
              <button @click="simulatePaymentSuccess" class="btn btn-sm btn-outline-warning px-3 py-1">
                <i class="bi bi-cpu"></i> Simulasikan Sukses (Demo)
              </button>
            </div>
          </div>

          <!-- STEP 4: KONFIRMASI PEMBAYARAN BERHASIL -->
          <div v-else-if="currentStep === 4" class="text-center py-4">
            <div class="success-animation-container mb-4">
              <div class="checkmark-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center rounded-circle" style="width: 80px; height: 80px;">
                <i class="bi bi-check-lg text-white" style="font-size: 48px;"></i>
              </div>
            </div>

            <h2 class="fw-bold text-white mb-2">Pembayaran Berhasil!</h2>
            <p class="text-white-80 max-width-sm mx-auto mb-4" style="max-width: 500px;">
              Terima kasih! Top-up game Anda telah diproses oleh AI otomatis ShinnTopUp. Item digital akan segera ditambahkan ke akun game Anda dalam 1-3 menit.
            </p>

            <div class="bg-secondary-opacity rounded-3 p-4 text-start mb-5 max-width-md mx-auto" style="max-width: 600px;">
              <h5 class="fw-bold text-white mb-3 border-bottom border-secondary pb-2">Rincian Transaksi</h5>
              <div class="row g-2 text-white-80 small">
                <div class="col-6 text-muted">Order ID:</div>
                <div class="col-6 text-end fw-bold">{{ finalInvoice.orderId }}</div>
                <div class="col-6 text-muted">Game:</div>
                <div class="col-6 text-end fw-bold text-accent">{{ finalInvoice.gameName }}</div>
                <div class="col-6 text-muted">User ID Akun:</div>
                <div class="col-6 text-end">{{ finalInvoice.userIdGame }} {{ finalInvoice.serverIdGame ? `(${finalInvoice.serverIdGame})` : '' }}</div>
                <div class="col-6 text-muted">Nickname:</div>
                <div class="col-6 text-end fw-bold text-success">{{ finalInvoice.nickname }}</div>
                <div class="col-6 text-muted">Paket Nominal:</div>
                <div class="col-6 text-end">{{ finalInvoice.packageName }}</div>
                <div class="col-6 text-muted">Metode Pembayaran:</div>
                <div class="col-6 text-end text-uppercase">{{ finalInvoice.paymentMethod }}</div>
                <hr class="border-secondary my-2" />
                <div class="col-6 text-muted fs-6">Total Pembayaran:</div>
                <div class="col-6 text-end fw-bold text-accent fs-6">{{ formatRupiah(finalInvoice.totalAmount) }}</div>
              </div>
            </div>

            <!-- Success Check-in visual / points feedback -->
            <div v-if="authStore.isAuthenticated" class="alert alert-dark bg-secondary-opacity border-accent-opacity py-3 px-4 rounded-3 d-inline-flex align-items-center gap-3 mb-4">
              <i class="bi bi-gift fs-4 text-accent animate-pulse-accent"></i>
              <div class="text-start text-white small">
                <strong>Hore!</strong> Anda mendapatkan bonus <strong>+50 Poin Member</strong> dari transaksi ini.
              </div>
            </div>

            <div>
              <button @click="backToHome" class="btn btn-shinn-primary px-5 text-white">
                Kembali ke Beranda
              </button>
            </div>
          </div>

        </div>

        <!-- EMPTY STATE -->
        <div v-else class="glass-card p-5 text-center text-muted">
          <i class="bi bi-file-earmark-x fs-1 mb-3 d-block text-secondary"></i>
          Tidak ada data checkout aktif saat ini.
          <div class="mt-4">
            <router-link to="/" class="btn btn-shinn-primary text-white">Kembali ke Beranda</router-link>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { usePaymentStore } from '../stores/payment';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const router = useRouter();
const cartStore = useCartStore();
const paymentStore = usePaymentStore();
const authStore = useAuthStore();

const currentStep = ref(1);
const selectedPaymentMethod = ref(null);
const loading = ref(false);

const activeOrderId = ref('');
const midtransRedirectUrl = ref('');
const mockVaNumber = ref('');
const mockRetailCode = ref('');

// Polling interval & timers
let pollingInterval = null;
let countdownTimer = null;
const timeLeft = ref(900); // 15 menit

// Final invoice details for Step 4
const finalInvoice = ref({
  orderId: '',
  gameName: '',
  userIdGame: '',
  serverIdGame: '',
  nickname: '',
  packageName: '',
  paymentMethod: '',
  totalAmount: 0
});

// The 11 Payment Methods list
const eWallets = [
  { id: 'qris', name: 'QRIS (Gopay/OVO/DANA)', group: 'wallet' },
  { id: 'gopay', name: 'GoPay', group: 'wallet' },
  { id: 'ovo', name: 'OVO', group: 'wallet' },
  { id: 'dana', name: 'DANA', group: 'wallet' },
  { id: 'shopeepay', name: 'ShopeePay', group: 'wallet' }
];

const virtualAccounts = [
  { id: 'bca_va', name: 'BCA Virtual Account', group: 'va' },
  { id: 'bni_va', name: 'BNI Virtual Account', group: 'va' },
  { id: 'mandiri_va', name: 'Mandiri Virtual Account', group: 'va' },
  { id: 'bri_va', name: 'BRI Virtual Account', group: 'va' }
];

const retailStores = [
  { id: 'indomaret', name: 'Indomaret', group: 'retail' },
  { id: 'alfamart', name: 'Alfamart', group: 'retail' }
];

const formattedTime = computed(() => {
  const mins = Math.floor(timeLeft.value / 60);
  const secs = timeLeft.value % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

onMounted(() => {
  if (!cartStore.selectedGame) {
    router.push('/');
  }
});

onUnmounted(() => {
  stopPolling();
  stopTimer();
});

const formatRupiah = (val) => {
  if (!val) return 'Rp 0';
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const copyText = (text) => {
  navigator.clipboard.writeText(text);
  alert('Disalin ke papan klip!');
};

// Start 15 mins Countdown
const startTimer = () => {
  stopTimer();
  timeLeft.value = 900;
  countdownTimer = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      stopTimer();
      alert('Waktu pembayaran telah habis.');
      cancelCheckout();
    }
  }, 1000);
};

const stopTimer = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
};

// Polling status
const startPolling = (orderId) => {
  stopPolling();
  pollingInterval = setInterval(async () => {
    try {
      const response = await paymentStore.checkTransactionStatus(orderId);
      if (response && response.success) {
        if (response.status === 'success') {
          stopPolling();
          stopTimer();
          
          // Set invoice data
          const tx = response.transaction || {
            orderId: activeOrderId.value,
            gameName: cartStore.selectedGame?.name,
            gameUserId: cartStore.checkedUser?.userId,
            gameServerId: cartStore.checkedUser?.serverId,
            nickname: cartStore.checkedUser?.nickname,
            packageName: cartStore.selectedPackage?.name,
            paymentMethod: selectedPaymentMethod.value?.name,
            totalAmount: cartStore.totalAmount
          };
          
          finalInvoice.value = {
            orderId: tx.orderId,
            gameName: tx.gameName || cartStore.selectedGame?.name,
            userIdGame: tx.gameUserId || cartStore.checkedUser?.userId,
            serverIdGame: tx.gameServerId || cartStore.checkedUser?.serverId,
            nickname: tx.nickname || cartStore.checkedUser?.nickname,
            packageName: tx.packageName || cartStore.selectedPackage?.name,
            paymentMethod: tx.paymentMethod || selectedPaymentMethod.value?.name,
            totalAmount: tx.totalAmount || cartStore.totalAmount
          };

          // Increment local points for authenticated user simulation
          if (authStore.isAuthenticated && authStore.user) {
            authStore.user.points = (authStore.user.points || 0) + 50;
          }

          cartStore.clearCart();
          currentStep.value = 4;
        } else if (response.status === 'failed') {
          stopPolling();
          stopTimer();
          alert('Pembayaran gagal terverifikasi.');
          cancelCheckout();
        }
      }
    } catch (err) {
      console.error('Polling error:', err);
    }
  }, 3000);
};

const stopPolling = () => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

// Proyeksikan instruksi berdasarkan tipe pembayaran & submit ke backend
const payNow = async () => {
  if (loading.value || !selectedPaymentMethod.value) return;
  loading.value = true;

  try {
    const payload = {
      gameSlug: cartStore.selectedGame.slug,
      packageId: cartStore.selectedPackage.id,
      userIdGame: cartStore.checkedUser.userId,
      serverIdGame: cartStore.checkedUser.serverId,
      nickname: cartStore.checkedUser.nickname,
      email: cartStore.guestEmail,
      paymentMethod: selectedPaymentMethod.value.id
    };

    const response = await paymentStore.processPayment(payload);
    const { orderId, snapToken, redirectUrl } = response;

    activeOrderId.value = orderId;
    midtransRedirectUrl.value = redirectUrl;

    // Generate mock visual instruction codes
    if (selectedPaymentMethod.value.group === 'va') {
      mockVaNumber.value = `88301${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    } else if (selectedPaymentMethod.value.group === 'retail') {
      mockRetailCode.value = `SHN-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Go to instructions
    currentStep.value = 3;
    startTimer();
    startPolling(orderId);

  } catch (error) {
    alert(error.response?.data?.message || 'Gagal memproses pembayaran. Silakan coba metode lain.');
  } finally {
    loading.value = false;
  }
};

// Simulate payment success manually (useful in demo offline database mode)
const simulatePaymentSuccess = async () => {
  if (!activeOrderId.value) return;
  try {
    // In demo mode we can update status of mock transactions to success or simulate settlement webhook
    // Just directly call status check endpoint which is offline mode or update mock transaction
    stopPolling();
    stopTimer();

    finalInvoice.value = {
      orderId: activeOrderId.value,
      gameName: cartStore.selectedGame?.name,
      userIdGame: cartStore.checkedUser?.userId,
      serverIdGame: cartStore.checkedUser?.serverId,
      nickname: cartStore.checkedUser?.nickname,
      packageName: cartStore.selectedPackage?.name,
      paymentMethod: selectedPaymentMethod.value?.name || 'QRIS',
      totalAmount: cartStore.totalAmount
    };

    if (authStore.isAuthenticated && authStore.user) {
      authStore.user.points = (authStore.user.points || 0) + 50;
    }

    cartStore.clearCart();
    currentStep.value = 4;
  } catch (error) {
    console.error('Failure simulating success:', error);
  }
};

const cancelCheckout = () => {
  const confirmCancel = confirm('Apakah Anda yakin ingin membatalkan transaksi top-up ini?');
  if (confirmCancel) {
    const slug = cartStore.selectedGame?.slug;
    cartStore.clearCart();
    stopPolling();
    stopTimer();
    if (slug) {
      router.push(`/topup/${slug}`);
    } else {
      router.push('/');
    }
  }
};

const backToHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* Stepper Styles */
.stepper-header {
  max-width: 650px;
  margin: 0 auto;
}

.stepper-step {
  z-index: 2;
  position: relative;
}

.step-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--glass-border);
  color: var(--text-muted);
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 15px;
}

.step-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.stepper-step.active .step-circle {
  border-color: var(--color-accent);
  background: rgba(62, 207, 207, 0.1);
  color: var(--color-accent);
  box-shadow: 0 0 12px rgba(62, 207, 207, 0.4);
}

.stepper-step.active .step-title {
  color: var(--color-accent);
  font-weight: 700;
}

.stepper-step.completed .step-circle {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
  box-shadow: 0 0 10px rgba(123, 94, 167, 0.3);
}

.stepper-step.completed .step-title {
  color: var(--color-primary);
}

.stepper-bar {
  height: 2px;
  background: var(--glass-border);
  margin: 0 10px;
  margin-top: -20px;
  z-index: 1;
  transition: all 0.3s ease;
}

.stepper-bar.active {
  background: var(--color-primary);
}

/* Checkout content styles */
.checkout-game-img {
  width: 65px;
  height: 65px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bg-danger-opacity {
  background-color: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.2);
}

.bg-secondary-opacity {
  background-color: rgba(19, 22, 41, 0.6);
}

/* Payment Method Selection Card */
.payment-method-card {
  border: 2px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  background-color: var(--bg-secondary);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
}

.payment-method-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(123, 94, 167, 0.25);
}

.payment-method-card.active {
  border-color: var(--color-accent);
  background-color: rgba(62, 207, 207, 0.05);
  box-shadow: 0 8px 20px rgba(62, 207, 207, 0.15);
}

.payment-method-card.active::after {
  content: "✓";
  position: absolute;
  top: 8px;
  right: 12px;
  color: var(--color-accent);
  font-weight: bold;
  font-size: 15px;
}

/* Custom visual components instruction */
.qr-container {
  max-width: 200px;
}

.qr-mock {
  width: 170px;
  height: 170px;
}

.checkmark-circle {
  box-shadow: 0 0 20px rgba(40, 167, 69, 0.4);
}

.border-accent-opacity {
  border-color: rgba(62, 207, 207, 0.2);
}

/* Animation */
@keyframes pulse {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

.animate-pulse-accent {
  animation: pulse 2s infinite ease-in-out;
}
</style>
