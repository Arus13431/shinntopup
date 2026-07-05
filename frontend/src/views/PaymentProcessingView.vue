<template>
  <div class="container py-4 text-start">
    <div class="text-start mb-3">
      <router-link to="/" class="btn-back text-decoration-none">
        <i class="bi bi-arrow-left"></i> Kembali ke Beranda
      </router-link>
    </div>

    <div v-if="tx" class="row g-4">
      
      <!-- COLUMN LEFT: INFO AKUN & RINCIAN PEMBAYARAN -->
      <div class="col-lg-5 col-md-12">
        <!-- Timer Pill (VA Only - Image 2 Style) -->
        <div v-if="isVaPayment" class="d-flex justify-content-start mb-3">
          <div class="timer-pill-badge font-Rajdhani">
            <i class="bi bi-clock-fill me-2 animate-pulse-accent"></i>{{ formattedTimeIndonesian }}
          </div>
        </div>

        <!-- Box Informasi Akun (Screenshot Style) -->
        <div class="account-info-card p-3 mb-4 rounded-4 d-flex gap-3 align-items-center">
          <!-- Game Banner Thumbnail -->
          <div class="game-artwork-wrapper rounded-3 position-relative overflow-hidden flex-shrink-0" style="width: 90px; height: 90px;">
            <img :src="`/assets/games/${tx.gameSlug}.jpg`" :alt="tx.gameName" class="w-100 h-100 object-fit-cover" />
            <div class="game-overlay-label text-center py-1 font-Rajdhani">{{ tx.gameName }}</div>
          </div>
          <!-- Details -->
          <div class="flex-grow-1 text-start">
            <div class="info-header mb-2 text-white-50 small fw-bold text-uppercase">Informasi Akun</div>
            <div class="d-flex flex-column gap-1 info-rows text-white">
              <div class="d-flex gap-2">
                <span class="text-muted-row label-width">Nickname</span>
                <span>:</span>
                <span class="fw-bold text-white">{{ tx.nickname }}</span>
              </div>
              <div class="d-flex gap-2">
                <span class="text-muted-row label-width">ID</span>
                <span>:</span>
                <span class="fw-bold text-white font-monospace">{{ tx.gameUserId }}</span>
              </div>
              <div v-if="tx.gameServerId" class="d-flex gap-2">
                <span class="text-muted-row label-width">Server</span>
                <span>:</span>
                <span class="fw-bold text-white font-monospace">{{ tx.gameServerId }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Box Rincian Pembayaran -->
        <div class="glass-card p-4 border-secondary bg-dark-opacity">
          <h5 class="fw-bold text-white mb-3"><i class="bi bi-receipt text-accent me-2"></i> Rincian Pembayaran</h5>
          <div class="d-flex flex-column gap-2 small">
            <div class="d-flex justify-content-between border-bottom border-secondary pb-2 text-muted">
              <span>Harga Paket ({{ tx.packageName }})</span>
              <span>{{ formatRupiah(tx.price) }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom border-secondary pb-2 text-muted">
              <span>Jumlah</span>
              <span>1x</span>
            </div>
            <div class="d-flex justify-content-between border-bottom border-secondary pb-2 text-muted">
              <span>Biaya Admin</span>
              <span>{{ formatRupiah(tx.adminFee) }}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center pt-2">
              <span class="fw-bold text-white fs-6">Subtotal</span>
              <span class="fw-extrabold text-accent fs-5 font-Rajdhani">{{ formatRupiah(tx.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Box Total Pembayaran (Image 1 Style - for E-wallet / Retail) -->
        <div v-if="!isVaPayment" class="total-pay-box p-3 mt-3 d-flex align-items-center justify-content-between">
          <span class="text-white fw-bold">Total Pembayaran</span>
          <div class="d-flex align-items-center gap-2">
            <span class="total-amount-val">{{ formatRupiah(tx.totalAmount) }}</span>
            <button @click="copyText(tx.totalAmount.toString())" class="btn-copy-total" title="Salin Total Pembayaran">
              <i class="bi bi-clipboard"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- COLUMN RIGHT: INSTRUKSI & STATUS PEMBAYARAN -->
      <div class="col-lg-7 col-md-12">
        <div class="glass-card p-4 p-md-5 border-secondary min-panel-height bg-dark-opacity">
          
          <!-- Metode Pembayaran Header (Screenshot style) -->
          <div class="text-start mb-4">
            <div class="text-white-50 small text-uppercase fw-bold mb-1">Metode Pembayaran</div>
            <h3 class="fw-extrabold text-white font-Rajdhani tracking-wider text-uppercase">{{ displayPaymentMethodName }}</h3>
          </div>

          <!-- VA Specific Number Box (Image 2 style) -->
          <div v-if="isVaPayment" class="va-number-box p-3 mb-4 d-flex align-items-center justify-content-between">
            <span class="va-label text-white fw-bold">Nomor Pembayaran</span>
            <div class="d-flex align-items-center gap-2">
              <span class="va-value">{{ displayVaNumber }}</span>
              <button @click="copyText(displayVaNumber)" class="btn-copy-va" title="Salin Nomor Pembayaran">
                <i class="bi bi-clipboard"></i>
              </button>
            </div>
          </div>

          <!-- Metadata Grid -->
          <div class="row g-3 mb-4 p-3 bg-secondary-opacity rounded-3 border border-secondary small">
            <div class="col-md-6 text-start">
              <div class="text-muted mb-1">Nomor Invoice</div>
              <div class="d-flex align-items-center gap-2">
                <span class="fw-bold text-accent font-monospace">{{ tx.orderId }}</span>
                <button @click="copyText(tx.orderId)" class="btn btn-xs btn-shinn-outline py-0.5 px-1.5" title="Salin Invoice ID">
                  <i class="bi bi-clipboard"></i>
                </button>
              </div>
            </div>
            <div class="col-md-6 text-start">
              <div class="text-muted mb-1">Status Pembayaran</div>
              <span 
                class="status-badge badge px-3 py-1.5 fw-bold text-uppercase"
                :class="tx.paymentStatus === 'success' ? 'paid' : 'unpaid'"
              >
                {{ tx.paymentStatus === 'success' ? 'Paid' : 'Unpaid' }}
              </span>
            </div>
            <hr class="border-secondary my-2" />
            <div class="col-6 text-start">
              <div class="text-muted mb-1">Status Transaksi</div>
              <span 
                class="status-badge badge px-3 py-1.5 fw-bold text-uppercase"
                :class="tx.paymentStatus === 'success' ? 'success' : 'pending'"
              >
                {{ translateStatus(tx.paymentStatus) }}
              </span>
            </div>
            <div class="col-6 text-start">
              <div class="text-muted mb-1">Pesan</div>
              <span class="text-white-80 fw-semibold">Your order is being processed. Please wait!</span>
            </div>
          </div>

          <!-- Action Buttons (VA or Retail) -->
          <div v-if="isVaPayment || isRetailPayment" class="d-flex flex-column gap-3 mb-4">
            <!-- Klik di sini untuk melakukan pembayaran (Retail Only - Image 1 style) -->
            <a v-if="isRetailPayment && paymentRedirectUrl !== '#'" :href="paymentRedirectUrl" target="_blank" class="btn-action-yellow text-decoration-none">
              <span>Klik di sini untuk melakukan pembayaran</span>
              <i class="bi bi-box-arrow-up-right"></i>
            </a>
            
            <!-- Contact Us button -->
            <a href="https://wa.me/6281234567890" target="_blank" class="btn-action-yellow text-decoration-none">
              <span>Contact Us</span>
            </a>
          </div>

          <!-- Detailed Instructions & Visuals (below details) -->
          <!-- QRIS Layout (Ticket only, no redirect button, Contact Us below the QR image) -->
          <div v-if="isQrisPayment" class="d-flex flex-column align-items-center justify-content-center text-center my-4">
            <!-- Padded White QR Box containing authentic QRIS ticket layout -->
            <div class="qris-voucher bg-white text-dark rounded-4 p-4 mb-3 border border-light shadow-lg mx-auto position-relative text-center" style="width: 100%; max-width: 340px; font-family: 'Inter', sans-serif;">
              <!-- Header Brand & Logos -->
              <div class="d-flex justify-content-between align-items-center mb-2 px-1">
                <div class="d-flex flex-column align-items-start">
                  <!-- QRIS Styled Text Logo -->
                  <div class="d-flex align-items-center gap-0.5">
                    <span class="fw-black font-Rajdhani text-primary-dark fs-3 lh-1">QR</span>
                    <span class="fw-black font-Rajdhani text-danger fs-3 lh-1">IS</span>
                  </div>
                  <span class="text-dark-50" style="font-size: 6px; font-weight: 800; letter-spacing: 0.3px; text-transform: uppercase;">
                    Quick Response Code Indonesian Standard
                  </span>
                </div>
                <!-- GPN Styled Logo -->
                <div class="gpn-logo d-flex align-items-center gap-1">
                  <svg width="32" height="20" viewBox="0 0 40 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5L2 15L12 25L8 15L12 5Z" fill="#dc3545"/>
                    <path d="M10 15L20 5L30 15L20 25L10 15Z" fill="#0c4a60"/>
                    <path d="M18 15L25 8L32 15L25 22L18 15Z" fill="#ffffff"/>
                  </svg>
                  <span class="fw-bold font-Rajdhani text-primary-dark" style="font-size: 14px;">gpn</span>
                </div>
              </div>
              
              <div class="border-top border-2 border-dark mb-3"></div>
              
              <!-- Merchant & Transaction Metadata -->
              <div class="mb-3 text-center text-dark">
                <div class="fw-extrabold text-uppercase font-Rajdhani tracking-wider mb-0.5" style="font-size: 14px; color: #0f172a;">
                  SHINNTOPUP (MIDTRANS SANDBOX)
                </div>
                <div class="font-monospace text-secondary fw-semibold" style="font-size: 10px; letter-spacing: 0.5px; color: #475569;">
                  NMID: ID1020261908872
                </div>
                <div class="font-monospace text-muted mt-0.5" style="font-size: 9px; color: #64748b;">
                  TID: {{ tx.orderId ? tx.orderId.substring(0, 12) : 'T12345678' }}
                </div>
              </div>

              <!-- Padded QR Code Box -->
              <div class="qr-code-holder bg-white p-3 border border-2 border-dark rounded-3 d-inline-block mx-auto mb-3" style="box-shadow: inset 0 0 8px rgba(0,0,0,0.05);">
                <img 
                  :src="displayQrisUrl" 
                  alt="QRIS QR Code" 
                  class="qr-image" 
                  style="width: 220px; height: 220px; display: block; object-fit: contain;" 
                />
              </div>

              <!-- Contact Us Button (QRIS Specific Location - below the QR image inside ticket) -->
              <div class="px-2 mb-3">
                <a href="https://wa.me/6281234567890" target="_blank" class="btn-action-yellow text-decoration-none">
                  <span>Contact Us</span>
                </a>
              </div>

              <!-- Footer scan guidelines -->
              <div class="text-center mt-2 px-1 text-dark">
                <div class="fw-bold text-uppercase tracking-wide" style="font-size: 9px; letter-spacing: 0.8px; color: #0f172a;">
                  Pindai & Bayar dengan E-Wallet Pilihan Anda
                </div>
                <div class="text-muted mt-1.5 lh-sm" style="font-size: 8.5px; font-weight: 500; color: #475569;">
                  Mendukung GoPay, OVO, DANA, ShopeePay, LinkAja, BCA Mobile, dan aplikasi m-Banking Indonesia lainnya.
                </div>
                <div class="my-2" style="border-top: 1px dashed #cbd5e1;"></div>
                <div class="text-muted text-uppercase tracking-wider fw-bold" style="font-size: 8px; letter-spacing: 0.5px; color: #94a3b8;">
                  Merchant Dicetak Oleh Midtrans Sandbox
                </div>
              </div>
            </div>

            <div class="fw-bold text-white mt-1 mb-2 font-Rajdhani" style="font-size: 13px; letter-spacing: 0.5px;">PINDAI KODE QRIS DI ATAS</div>
            <p class="text-white-50 small max-width-sm mb-3 text-center" style="max-width: 450px;">
              Silakan pindai kode QRIS di atas menggunakan aplikasi e-wallet pilihan Anda (GoPay, OVO, DANA, ShopeePay, LinkAja, atau m-Banking).
            </p>
          </div>

          <!-- Interactive E-Wallet Layout (No QR code, custom branded mockup) -->
          <div v-else-if="isEWalletPayment" class="my-4 text-start">
            <div :class="['wallet-mock-card', 'p-4', 'mb-4', 'rounded-4', 'text-white', walletBrand]">
              <!-- Mock Phone Status Bar -->
              <div class="d-flex justify-content-between align-items-center mb-4 opacity-50 small font-Rajdhani">
                <span>SHINN-NET <i class="bi bi-wifi"></i></span>
                <span>19:00</span>
                <span>100% <i class="bi bi-battery-full"></i></span>
              </div>
              
              <!-- Brand Logo Header & Title -->
              <div class="d-flex justify-content-between align-items-center mb-3">
                <div class="d-flex align-items-center gap-2">
                  <div class="brand-logo-circle d-flex align-items-center justify-content-center">
                    <i class="bi bi-wallet2 text-dark fs-5"></i>
                  </div>
                  <div>
                    <h5 class="fw-extrabold font-Rajdhani text-uppercase tracking-wider mb-0 fs-5">{{ walletBrand }} Pay</h5>
                    <span class="badge bg-white bg-opacity-20 text-white font-rajdhani small text-uppercase" style="font-size: 9px;">Instan & Aman</span>
                  </div>
                </div>
                <div class="text-end">
                  <span class="small text-white-50 d-block">Nominal Transfer</span>
                  <span class="fs-4 fw-extrabold font-Rajdhani">{{ formatRupiah(tx.totalAmount) }}</span>
                </div>
              </div>

              <!-- Animated Step Checker / Loader inside card -->
              <div class="interactive-loader-box p-3 rounded-3 mb-4 text-center">
                <div class="spinner-grow spinner-grow-sm text-white mb-2" role="status"></div>
                <div class="small fw-semibold">Menunggu otorisasi pembayaran dari aplikasi {{ walletBrand.toUpperCase() }} Anda...</div>
                <div class="progress mt-2.5" style="height: 4px; background: rgba(255, 255, 255, 0.1);">
                  <div class="progress-bar progress-bar-striped progress-bar-animated bg-white" role="progressbar" style="width: 75%"></div>
                </div>
              </div>

              <!-- Action Buttons for E-Wallet -->
              <div class="d-flex flex-column gap-2.5">
                <a :href="paymentRedirectUrl" target="_blank" :class="['btn-wallet-action', walletBrand, 'text-decoration-none']">
                  <i class="bi bi-box-arrow-up-right me-2"></i> Buka Aplikasi {{ walletBrand.toUpperCase() }}
                </a>
                
                <a href="https://wa.me/6281234567890" target="_blank" class="btn-wallet-contact text-decoration-none">
                  <i class="bi bi-chat-dots me-2"></i> Hubungi Customer Service (Contact Us)
                </a>
              </div>
            </div>
          </div>

          <!-- Bank VA Collapsible Instructions -->
          <div v-else-if="isVaPayment" class="my-3 text-start">
            <div class="accordion border-0" id="vaStepsAccordion">
              <div class="accordion-item bg-transparent border-secondary border rounded-3 overflow-hidden">
                <h2 class="accordion-header" id="headingVA">
                  <button class="accordion-button collapsed bg-transparent text-white fw-bold py-3" type="button" data-bs-toggle="collapse" data-bs-target="#collapseVA" aria-expanded="false" aria-controls="collapseVA">
                    <i class="bi bi-info-circle text-accent me-2"></i> Cara Melakukan Pembayaran VA
                  </button>
                </h2>
                <div id="collapseVA" class="accordion-collapse collapse" aria-labelledby="headingVA" data-bs-parent="#vaStepsAccordion">
                  <div class="accordion-body bg-dark-opacity text-white-50 small">
                    <ol class="ps-3 d-flex flex-column gap-2 mb-0">
                      <li>Buka aplikasi m-Banking Anda atau pergi ke ATM terdekat.</li>
                      <li>Pilih menu Transfer > Transfer Virtual Account.</li>
                      <li>Masukkan nomor Virtual Account di atas: <strong>{{ displayVaNumber }}</strong>.</li>
                      <li>Pastikan tagihan atas nama merchant <strong>ShinnTopUp</strong>.</li>
                      <li>Isi nominal pembayaran persis sebesar <strong>{{ formatRupiah(tx.totalAmount) }}</strong>.</li>
                      <li>Selesaikan transaksi dan simpan bukti transfer.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Retail Store Code display & instructions -->
          <div v-else-if="isRetailPayment" class="my-4 text-start">
            <div class="mb-4 bg-dark-opacity p-3 rounded-3 border border-secondary">
              <span class="small text-muted d-block mb-1">Kode Pembayaran Retail</span>
              <div class="d-flex align-items-center justify-content-between">
                <span class="fw-extrabold text-accent fs-4 font-Rajdhani">{{ tx.paymentCode || '-' }}</span>
                <button @click="copyText(tx.paymentCode)" class="btn btn-sm btn-shinn-outline py-1 px-2.5 text-white">
                  <i class="bi bi-clipboard"></i> Salin
                </button>
              </div>
            </div>

            <h6 class="fw-bold text-white mb-2">Langkah Pembayaran Gerai:</h6>
            <ol class="ps-3 text-white-50 small d-flex flex-column gap-2">
              <li>Kunjungi gerai retail terdekat pilihan Anda (Alfamart atau Indomaret).</li>
              <li>Sampaikan kepada kasir bahwa Anda ingin membayar tagihan merchant ShinnTopUp.</li>
              <li>Tunjukkan Kode Pembayaran di atas ke kasir.</li>
              <li>Bayarkan nominal tepat sebesar <strong>{{ formatRupiah(tx.totalAmount) }}</strong> secara tunai atau debit.</li>
              <li>Simpan struk transaksi sebagai bukti pembayaran yang sah.</li>
            </ol>
          </div>

          <!-- Polling State animation -->
          <div class="mt-4 p-3 bg-secondary-opacity rounded-3 border border-secondary text-center">
            <div class="d-flex align-items-center justify-content-center gap-3">
              <span class="spinner-border text-accent spinner-border-sm" role="status"></span>
              <span class="text-white-80 small fw-bold animate-pulse-accent">Sistem sedang memverifikasi pembayaran Anda secara real-time...</span>
            </div>
          </div>

          <!-- Simulator & Back actions -->
          <div class="mt-4 pt-3 border-top border-secondary d-flex flex-column flex-sm-row gap-2.5 justify-content-between">
            <button @click="router.push('/')" class="btn btn-sm btn-shinn-outline px-4 py-2">
              <i class="bi bi-house-door-fill me-1"></i> Kembali ke Beranda
            </button>
            <button @click="triggerPaymentSimulation" class="btn btn-sm btn-outline-warning px-4 py-2 text-uppercase">
              <i class="bi bi-cpu me-1"></i> Simulasikan Sukses (Demo)
            </button>
          </div>

        </div>
      </div>

    </div>

    <!-- Empty Loading State -->
    <div v-else class="glass-card p-5 text-center text-muted">
      <span class="spinner-border spinner-border-sm me-2"></span> Memuat detail transaksi pembayaran...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentStore } from '../stores/payment';

const route = useRoute();
const router = useRouter();
const paymentStore = usePaymentStore();

const orderId = route.params.orderId;
const tx = ref(null);
const timeLeft = ref(10800); // 3 jam (10800 detik)
let countdownInterval = null;
let pollingInterval = null;

// Fallback QR code image - pointing to the Midtrans Sandbox QRIS address
const qrFallbackUrl = computed(() => 'https://merchants-app.sbx.midtrans.com/v4/qris/gopay/A120260525010346yzAIu0oJbsID/qr-code');

const displayQrisUrl = computed(() => {
  if (!tx.value) return qrFallbackUrl.value;
  if (tx.value.qrisUrl && !tx.value.qrisUrl.includes('qrserver.com')) {
    return tx.value.qrisUrl;
  }
  return qrFallbackUrl.value;
});

const formattedTime = computed(() => {
  const hours = Math.floor(timeLeft.value / 3600);
  const mins = Math.floor((timeLeft.value % 3600) / 60);
  const secs = timeLeft.value % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const formattedTimeIndonesian = computed(() => {
  const hours = Math.floor(timeLeft.value / 3600);
  const mins = Math.floor((timeLeft.value % 3600) / 60);
  const secs = timeLeft.value % 60;
  
  let result = '';
  if (hours > 0) result += `${hours} Jam `;
  if (mins > 0 || hours > 0) result += `${mins} Menit `;
  result += `${secs} Detik`;
  return result;
});

const isQrisPayment = computed(() => {
  if (!tx.value) return false;
  return tx.value.paymentMethod?.toLowerCase() === 'qris';
});

const isEWalletPayment = computed(() => {
  if (!tx.value) return false;
  const m = tx.value.paymentMethod?.toLowerCase();
  return m === 'gopay' || m === 'ovo' || m === 'dana' || m === 'shopeepay';
});

const isVaPayment = computed(() => {
  if (!tx.value) return false;
  const m = tx.value.paymentMethod?.toLowerCase() || '';
  return m.endsWith('_va') || m.includes('va') || m.includes('virtual');
});

const isRetailPayment = computed(() => {
  if (!tx.value) return false;
  const m = tx.value.paymentMethod?.toLowerCase();
  return m === 'alfamart' || m === 'indomaret';
});

const walletBrand = computed(() => {
  if (!tx.value) return '';
  const m = tx.value.paymentMethod?.toLowerCase() || '';
  if (m.includes('dana')) return 'dana';
  if (m.includes('gopay')) return 'gopay';
  if (m.includes('ovo')) return 'ovo';
  if (m.includes('shopeepay')) return 'shopeepay';
  return '';
});

const displayPaymentMethodName = computed(() => {
  if (!tx.value) return '';
  const m = tx.value.paymentMethod?.toLowerCase() || '';
  if (m === 'qris') return 'QRIS OFFICIAL';
  if (m === 'gopay') return 'GOPAY OFFICIAL';
  if (m === 'ovo') return 'OVO OFFICIAL';
  if (m === 'dana') return 'DANA OFFICIAL';
  if (m === 'shopeepay') return 'SHOPEEPAY OFFICIAL';
  if (m === 'bca_va') return 'BCA VIRTUAL ACCOUNT';
  if (m === 'bni_va') return 'BNI VIRTUAL ACCOUNT';
  if (m === 'bri_va') return 'BRI VIRTUAL ACCOUNT';
  if (m === 'mandiri_va') return 'MANDIRI VIRTUAL ACCOUNT';
  if (m === 'alfamart') return 'ALFAMART STORE';
  if (m === 'indomaret') return 'INDOMARET STORE';
  return tx.value.paymentMethod.toUpperCase();
});

const displayVaNumber = computed(() => {
  if (tx.value?.vaNumber) return tx.value.vaNumber;
  const pm = tx.value?.paymentMethod?.toLowerCase() || '';
  let randVa = '1551413290051054'; // A realistic BCA VA number from the screenshot
  if (pm.includes('bca')) {
    randVa = '155141' + Math.floor(1000000000 + Math.random() * 9000000000);
  } else if (pm.includes('bni')) {
    randVa = '8810' + Math.floor(100000000000 + Math.random() * 900000000000);
  } else if (pm.includes('bri')) {
    randVa = '127' + Math.floor(1000000000000 + Math.random() * 9000000000000);
  } else if (pm.includes('mandiri')) {
    randVa = '896' + Math.floor(100000000000 + Math.random() * 900000000000);
  } else {
    randVa = '88301' + Math.floor(1000000000 + Math.random() * 9000000000);
  }
  return randVa;
});

const paymentRedirectUrl = computed(() => {
  if (!tx.value) return '#';
  if (tx.value.deeplinkUrl) return tx.value.deeplinkUrl;
  if (tx.value.snapToken) {
    return `https://app.sandbox.midtrans.com/snap/v2/vtweb/${tx.value.snapToken}`;
  }
  return '#';
});

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const copyText = (text) => {
  navigator.clipboard.writeText(text);
  alert('Berhasil disalin ke papan klip!');
};

const startCountdown = () => {
  clearInterval(countdownInterval);
  if (tx.value && tx.value.createdAt) {
    const elapsed = Math.floor((Date.now() - new Date(tx.value.createdAt).getTime()) / 1000);
    timeLeft.value = Math.max(0, 10800 - elapsed);
  } else {
    timeLeft.value = 10800;
  }
  countdownInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--;
    } else {
      clearInterval(countdownInterval);
      alert('Sesi pembayaran telah berakhir.');
      router.push(`/failed/${orderId}`);
    }
  }, 1000);
};

// Polling status dari database (setiap 5 detik)
const pollStatus = async () => {
  try {
    const res = await paymentStore.checkTransactionStatus(orderId);
    if (res.success) {
      tx.value = res.transaction;
      
      if (res.status === 'success' || res.status === 'settlement' || res.status === 'capture') {
        clearInterval(pollingInterval);
        clearInterval(countdownInterval);
        router.push(`/payment/${orderId}/success`);
      } else if (res.status === 'failed' || res.status === 'cancelled' || res.status === 'expire') {
        clearInterval(pollingInterval);
        clearInterval(countdownInterval);
        router.push(`/failed/${orderId}`);
      }
    }
  } catch (error) {
    console.error('Error polling status:', error);
  }
};

const triggerPaymentSimulation = async () => {
  try {
    const res = await paymentStore.simulateSuccess(orderId);
    if (res.success) {
      alert('Simulasi pembayaran sukses dikirim! Status pembayaran akan segera terverifikasi oleh polling.');
      await pollStatus();
    }
  } catch (error) {
    alert('Gagal memproses simulasi pembayaran.');
  }
};

onMounted(async () => {
  await pollStatus();
  
  if (tx.value) {
    startCountdown();
    // Jalankan polling setiap 5 detik
    pollingInterval = setInterval(pollStatus, 5000);
  } else {
    setTimeout(() => {
      if (!tx.value) {
        alert('Transaksi tidak ditemukan.');
        router.push('/');
      }
    }, 5000);
  }
});

onUnmounted(() => {
  clearInterval(pollingInterval);
  clearInterval(countdownInterval);
});

const translateStatus = (s) => {
  if (s === 'success') return 'Sukses';
  if (s === 'pending') return 'Pending';
  return 'Gagal';
};
</script>

<style scoped>
.btn-back {
  color: var(--text-muted);
  font-weight: 600;
  transition: color 0.2s ease;
  font-size: 14px;
}

.btn-back:hover {
  color: var(--color-accent);
}

.timer-pill-badge {
  background: linear-gradient(90deg, #dc3545 0%, #e63946 100%);
  color: #ffffff;
  padding: 6px 18px;
  border-radius: 20px;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.35);
  display: inline-flex;
  align-items: center;
}

.account-info-card {
  background: rgba(45, 43, 62, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.game-artwork-wrapper {
  border: 1.5px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.game-overlay-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.85);
  color: #ffffff;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
}

.label-width {
  width: 75px;
  display: inline-block;
}

.text-muted-row {
  color: #B2B9D0;
}

.info-rows {
  font-size: 13.5px;
}

.bg-secondary-opacity {
  background-color: rgba(19, 22, 41, 0.65);
}

.bg-dark-opacity {
  background-color: rgba(13, 16, 36, 0.5);
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.9; }
}

.animate-pulse-accent {
  animation: pulse 1.8s infinite ease-in-out;
}

/* Status Badge Styles with glowing transitions */
.status-badge {
  transition: all 0.5s ease;
}

.status-badge.paid {
  background-color: rgba(40, 167, 69, 0.15) !important;
  color: #28a745 !important;
  border: 1.5px solid #28a745 !important;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
}

.status-badge.unpaid {
  background-color: rgba(220, 53, 69, 0.15) !important;
  color: #dc3545 !important;
  border: 1.5px solid #dc3545 !important;
  box-shadow: 0 0 10px rgba(220, 53, 69, 0.15);
}

.status-badge.success {
  background-color: rgba(40, 167, 69, 0.15) !important;
  color: #28a745 !important;
  border: 1.5px solid #28a745 !important;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.3);
}

.status-badge.pending {
  background-color: rgba(255, 193, 7, 0.15) !important;
  color: #ffc107 !important;
  border: 1.5px solid #ffc107 !important;
  box-shadow: 0 0 10px rgba(255, 193, 7, 0.2);
}

/* High contrast typography for dark background readability */
.text-muted {
  color: #B2B9D0 !important;
}
.text-white-50 {
  color: #C2C9E0 !important;
}

/* Authentic QRIS Voucher Styling */
.qris-voucher {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}
.text-primary-dark {
  color: #0c4a60 !important;
}
.fw-black {
  font-weight: 900 !important;
}
.tracking-wider {
  letter-spacing: 0.05em;
}

/* Premium Layout Elements */
.va-number-box {
  background: rgba(26, 28, 48, 0.6);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(247, 224, 24, 0.15);
}
.va-label {
  font-size: 14px;
}
.va-value {
  font-family: 'Rajdhani', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: var(--color-accent);
  letter-spacing: 1px;
}
.btn-copy-va {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s, transform 0.2s;
  padding: 4px 8px;
}
.btn-copy-va:hover {
  opacity: 1;
  transform: scale(1.1);
  color: var(--color-accent);
}

.total-pay-box {
  background: rgba(26, 28, 48, 0.6);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(247, 224, 24, 0.15);
}
.total-amount-val {
  font-family: 'Rajdhani', sans-serif;
  font-size: 18px;
  font-weight: 800;
  color: var(--color-accent);
}
.btn-copy-total {
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}
.btn-copy-total:hover {
  opacity: 1;
  color: var(--color-accent);
}

.btn-action-yellow {
  background: #ffff00;
  color: #0d1024;
  font-weight: 800;
  border: none;
  border-radius: 8px;
  padding: 13px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(255, 255, 0, 0.25);
  text-decoration: none;
  font-size: 14.5px;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.btn-action-yellow:hover {
  background: #e5e500;
  color: #0d1024;
  box-shadow: 0 6px 20px rgba(255, 255, 0, 0.45);
  transform: translateY(-2px);
}
.btn-action-yellow i {
  font-size: 16px;
}

/* Accordion Styling overrides for Dark Mode */
.accordion-button:not(.collapsed) {
  color: var(--color-accent);
  background-color: rgba(62, 207, 207, 0.05);
  box-shadow: none;
}
.accordion-button::after {
  filter: invert(1);
}
.accordion-item {
  background-color: transparent;
}

/* Branded E-Wallet Card Themes */
.wallet-mock-card {
  position: relative;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.wallet-mock-card.dana {
  background: linear-gradient(135deg, #0070e0 0%, #0090ff 100%);
  border-color: rgba(0, 144, 255, 0.3);
  box-shadow: 0 10px 25px rgba(0, 112, 224, 0.35);
}

.wallet-mock-card.gopay {
  background: linear-gradient(135deg, #00875a 0%, #00b14f 100%);
  border-color: rgba(0, 177, 79, 0.3);
  box-shadow: 0 10px 25px rgba(0, 135, 90, 0.35);
}

.wallet-mock-card.ovo {
  background: linear-gradient(135deg, #4c2a86 0%, #7641cf 100%);
  border-color: rgba(118, 65, 207, 0.3);
  box-shadow: 0 10px 25px rgba(76, 42, 134, 0.35);
}

.wallet-mock-card.shopeepay {
  background: linear-gradient(135deg, #f53d2d 0%, #ff6e34 100%);
  border-color: rgba(255, 110, 52, 0.3);
  box-shadow: 0 10px 25px rgba(245, 61, 45, 0.35);
}

.brand-logo-circle {
  width: 40px;
  height: 40px;
  background: #ffffff;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.interactive-loader-box {
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

/* Branded buttons */
.btn-wallet-action {
  font-family: 'Rajdhani', sans-serif;
  font-size: 16px;
  font-weight: 800;
  border-radius: 8px;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-wallet-action.dana {
  background: #ffffff;
  color: #0070e0;
}
.btn-wallet-action.dana:hover {
  background: #f0f7ff;
  transform: translateY(-2px);
}

.btn-wallet-action.gopay {
  background: #ffffff;
  color: #00875a;
}
.btn-wallet-action.gopay:hover {
  background: #e8f9f2;
  transform: translateY(-2px);
}

.btn-wallet-action.ovo {
  background: #ffffff;
  color: #4c2a86;
}
.btn-wallet-action.ovo:hover {
  background: #f7f3fd;
  transform: translateY(-2px);
}

.btn-wallet-action.shopeepay {
  background: #ffffff;
  color: #f53d2d;
}
.btn-wallet-action.shopeepay:hover {
  background: #fff0ef;
  transform: translateY(-2px);
}

.btn-wallet-contact {
  font-family: 'Rajdhani', sans-serif;
  font-size: 14px;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
}
.btn-wallet-contact:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}
</style>
