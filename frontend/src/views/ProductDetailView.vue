<template>
  <div class="container py-3">
    <!-- Back Button -->
    <div class="text-start mb-3">
      <router-link to="/" class="btn-back text-decoration-none">
        <i class="bi bi-arrow-left"></i> Kembali ke Beranda
      </router-link>
    </div>

    <!-- Skeleton Loading Detail -->
    <div v-if="loading" class="row g-4">
      <div class="col-lg-12 mb-4">
        <div class="skeleton-card glass-card" style="height: 300px;">
          <div class="skeleton skeleton-img h-100 w-100"></div>
        </div>
      </div>
      <div class="col-lg-7">
        <div class="skeleton-card glass-card p-4">
          <div class="skeleton skeleton-title mb-3"></div>
          <div class="skeleton skeleton-text mb-2"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      </div>
      <div class="col-lg-5">
        <div class="skeleton-card glass-card p-4">
          <div class="skeleton skeleton-title mb-3"></div>
          <div class="skeleton skeleton-text mb-2"></div>
        </div>
      </div>
    </div>

    <!-- Detail Content Loaded -->
    <div v-else-if="product" class="text-start">
      <!-- TWO COLUMN LAYOUT -->
      <div class="row g-4">
        <!-- COLUMN LEFT: GAME CARD, METODE PEMBAYARAN, ULASAN -->
        <div class="col-lg-5 col-md-12">
          
          <!-- GAME INFO PORTRAIT CARD -->
          <div class="glass-card premium-glass-card game-portrait-card mb-4 position-relative overflow-hidden" style="min-height: 380px; padding: 0;">
            <div 
              class="game-card-bg-full" 
              :style="{ backgroundImage: 'url(' + (product.bannerImage || product.image) + ')' }"
            ></div>
            <div class="game-card-overlay"></div>
            <div class="game-card-detail-content p-4 text-center mt-auto position-relative" style="z-index: 3;">
              <h3 class="fw-extrabold text-white mb-2 text-uppercase font-Rajdhani tracking-wider fs-3 text-shadow">{{ product.name }}</h3>
              
              <div class="d-flex align-items-center justify-content-center gap-2 mb-3 flex-wrap">
                <span class="badge bg-secondary-opacity text-accent small badge-category px-3 py-1.5">{{ product.category }}</span>
                <span class="badge bg-success-opacity text-success small px-3 py-1.5 d-flex align-items-center gap-1.5 border border-success-opacity">
                  <span class="dot-glowing-green"></span>
                  Tersedia
                </span>
              </div>
              
              <button 
                v-if="authStore.isAuthenticated"
                @click="toggleFavorite" 
                class="btn btn-sm btn-favorite-toggle mx-auto d-flex align-items-center gap-1.5 px-3 py-2"
                :class="{ 'is-favorite': isFavorite }"
                title="Favoritkan Game"
              >
                <i class="bi" :class="isFavorite ? 'bi-heart-fill text-danger' : 'bi-heart text-muted'"></i>
                <span class="small text-white-50">{{ isFavorite ? 'Favorit Saya' : 'Tambah Favorit' }}</span>
              </button>
            </div>
          </div>

          <!-- STEP 3: PILIH METODE PEMBAYARAN -->
          <div class="glass-card premium-glass-card p-4 mb-4">
            <div class="payment-step-header mb-4 d-flex align-items-stretch overflow-hidden rounded-3 border border-secondary shadow">
              <div class="step-badge-num bg-warning text-dark fw-extrabold px-3 py-2 d-flex align-items-center justify-content-center font-Rajdhani fs-5" style="min-width: 45px;">3</div>
              <div class="step-badge-title bg-dark-opacity text-white fw-bold px-3 py-2 flex-grow-1 text-uppercase font-Rajdhani d-flex align-items-center">Pilih Metode Pembayaran</div>
            </div>
            
            <div class="d-flex flex-column gap-3">
              <!-- QRIS Featured Box -->
              <div 
                @click="selectedPayment = allPaymentMethods.find(m => m.id === 'qris')"
                class="payment-featured-box p-3 rounded-3 d-flex align-items-center justify-content-between cursor-pointer position-relative overflow-hidden"
                :class="{ 'active': selectedPayment?.id === 'qris' }"
              >
                <div class="ribbon-wrapper">
                  <span class="ribbon-best-price">BEST PRICE</span>
                </div>
                
                <div class="d-flex align-items-center gap-3">
                  <div class="featured-logo bg-white px-3 py-1.5 rounded-3 text-dark fw-extrabold fs-5 font-Rajdhani" style="border: 2px solid #000; height: 40px; display: flex; align-items: center; justify-content: center;">QRIS</div>
                  <div class="text-start">
                    <div class="fw-bold text-white fs-6 font-Rajdhani">QRIS (All E-Wallet)</div>
                    <div class="text-white-50 small" style="font-size: 11px;">Satu QR Code untuk GoPay, OVO, DANA</div>
                  </div>
                </div>
                <div class="text-end me-4">
                  <div class="fw-extrabold text-accent fs-5 font-Rajdhani">{{ formatRupiah(calculateTotal(1500)) }}</div>
                </div>
              </div>

              <!-- Accordion 1: E-Wallet -->
              <div class="payment-accordion-item rounded-3 overflow-hidden border border-secondary">
                <div 
                  @click="toggleAccordion('wallet')"
                  class="accordion-trigger d-flex align-items-center justify-content-between p-3 cursor-pointer bg-dark-opacity"
                >
                  <span class="fw-bold text-white small font-Rajdhani"><i class="bi bi-wallet2 text-accent me-2"></i> E-Wallet</span>
                  <i class="bi text-white-50" :class="activeAccordion === 'wallet' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </div>
                <!-- Partner logos band -->
                <div class="accordion-partner-bar d-flex gap-2 px-3 py-2 bg-secondary-opacity flex-wrap border-top border-secondary">
                  <span class="partner-badge dana">DANA</span>
                  <span class="partner-badge gopay">GoPay</span>
                  <span class="partner-badge ovo">OVO</span>
                  <span class="partner-badge shopeepay">ShopeePay</span>
                </div>
                <transition name="collapse">
                  <div v-show="activeAccordion === 'wallet'" class="accordion-content p-3 bg-secondary-opacity border-top border-secondary">
                    <!-- Spacious Logo Grid (min. 16px gap is gap-3) -->
                    <div class="d-flex flex-wrap gap-3 justify-content-start">
                      <div 
                        v-for="method in eWallets.filter(m => m.id !== 'qris')" 
                        :key="method.id"
                        @click="selectedPayment = method"
                        class="payment-grid-card cursor-pointer"
                        :class="{ 'active': selectedPayment?.id === method.id }"
                      >
                        <div class="payment-icon-wrapper mb-2 text-accent">
                          <i class="bi fs-3" :class="method.icon"></i>
                        </div>
                        <div class="payment-name fw-bold small text-white">{{ method.name }}</div>
                        <div class="payment-fee text-accent mt-1 small">+{{ formatRupiah(method.fee) }}</div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Accordion 2: Virtual Account -->
              <div class="payment-accordion-item rounded-3 overflow-hidden border border-secondary">
                <div 
                  @click="toggleAccordion('va')"
                  class="accordion-trigger d-flex align-items-center justify-content-between p-3 cursor-pointer bg-dark-opacity"
                >
                  <span class="fw-bold text-white small font-Rajdhani"><i class="bi bi-bank text-accent me-2"></i> Virtual Account (Transfer)</span>
                  <i class="bi text-white-50" :class="activeAccordion === 'va' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </div>
                <div class="accordion-partner-bar d-flex gap-2 px-3 py-2 bg-secondary-opacity flex-wrap border-top border-secondary">
                  <span class="partner-badge text-info">BCA</span>
                  <span class="partner-badge text-info">BNI</span>
                  <span class="partner-badge text-info">BRI</span>
                  <span class="partner-badge text-info">Mandiri</span>
                </div>
                <transition name="collapse">
                  <div v-show="activeAccordion === 'va'" class="accordion-content p-3 bg-secondary-opacity border-top border-secondary">
                    <div class="d-flex flex-wrap gap-3 justify-content-start">
                      <div 
                        v-for="method in virtualAccounts" 
                        :key="method.id"
                        @click="selectedPayment = method"
                        class="payment-grid-card cursor-pointer"
                        :class="{ 'active': selectedPayment?.id === method.id }"
                      >
                        <div class="payment-icon-wrapper mb-2 text-accent">
                          <i class="bi fs-3" :class="method.icon"></i>
                        </div>
                        <div class="payment-name fw-bold small text-white">{{ method.name }}</div>
                        <div class="payment-fee text-accent mt-1 small">+{{ formatRupiah(method.fee) }}</div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>

              <!-- Accordion 3: Convenience Store -->
              <div class="payment-accordion-item rounded-3 overflow-hidden border border-secondary">
                <div 
                  @click="toggleAccordion('retail')"
                  class="accordion-trigger d-flex align-items-center justify-content-between p-3 cursor-pointer bg-dark-opacity"
                >
                  <span class="fw-bold text-white small font-Rajdhani"><i class="bi bi-shop text-accent me-2"></i> Gerai Retail</span>
                  <i class="bi text-white-50" :class="activeAccordion === 'retail' ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </div>
                <div class="accordion-partner-bar d-flex gap-2 px-3 py-2 bg-secondary-opacity flex-wrap border-top border-secondary">
                  <span class="partner-badge text-warning">Alfamart</span>
                  <span class="partner-badge text-warning">Indomaret</span>
                </div>
                <transition name="collapse">
                  <div v-show="activeAccordion === 'retail'" class="accordion-content p-3 bg-secondary-opacity border-top border-secondary">
                    <div class="d-flex flex-wrap gap-3 justify-content-start">
                      <div 
                        v-for="method in retailStores" 
                        :key="method.id"
                        @click="selectedPayment = method"
                        class="payment-grid-card cursor-pointer"
                        :class="{ 'active': selectedPayment?.id === method.id }"
                      >
                        <div class="payment-icon-wrapper mb-2 text-accent">
                          <i class="bi fs-3" :class="method.icon"></i>
                        </div>
                        <div class="payment-name fw-bold small text-white">{{ method.name }}</div>
                        <div class="payment-fee text-accent mt-1 small">+{{ formatRupiah(method.fee) }}</div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>
          </div>

          <!-- RATING & REVIEWS -->
          <div class="glass-card premium-glass-card p-4 mb-4 text-start">
            <h5 class="fw-bold text-white mb-3"><i class="bi bi-star-fill text-warning me-2"></i> Ulasan Pembeli</h5>
            <div class="d-flex align-items-center gap-2 mb-3">
              <span class="fs-2 fw-extrabold text-white font-Rajdhani">4.9</span>
              <div>
                <div class="text-warning">
                  <i class="bi bi-star-fill me-0.5"></i>
                  <i class="bi bi-star-fill me-0.5"></i>
                  <i class="bi bi-star-fill me-0.5"></i>
                  <i class="bi bi-star-fill me-0.5"></i>
                  <i class="bi bi-star-fill"></i>
                </div>
                <span class="text-muted small">dari 1.2K+ penilaian sukses</span>
              </div>
            </div>
            
            <div class="reviews-list d-flex flex-column gap-2.5">
              <div class="review-item p-2.5 rounded bg-dark-opacity small">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fw-bold text-white">r***a</span>
                  <span class="text-muted" style="font-size: 10px;">10 menit lalu</span>
                </div>
                <p class="text-white-50 mb-0" style="font-size: 11px;">"Proses cepat dan aman banget! Diamond langsung masuk ga nyampe semenit. Mantap ShinnTopUp!"</p>
              </div>
              <div class="review-item p-2.5 rounded bg-dark-opacity small">
                <div class="d-flex justify-content-between mb-1">
                  <span class="fw-bold text-white">m***x</span>
                  <span class="text-muted" style="font-size: 10px;">1 jam lalu</span>
                </div>
                <p class="text-white-50 mb-0" style="font-size: 11px;">"Baru pertama kali nyoba langsung ketagihan, UI responsif dan harganya paling murah."</p>
              </div>
            </div>
          </div>

        </div>

        <!-- COLUMN RIGHT: LENGKAPI DATA, NOMINAL, DETAIL KONTRAK, CTA BUTTON -->
        <div class="col-lg-7 col-md-12">
          
          <!-- STEP 1: LENGKAPI DATA AKUN -->
          <div class="glass-card premium-glass-card p-4 mb-4">
            <div class="payment-step-header mb-4 d-flex align-items-stretch overflow-hidden rounded-3 border border-secondary shadow">
              <div class="step-badge-num bg-warning text-dark fw-extrabold px-3 py-2 d-flex align-items-center justify-content-center font-Rajdhani fs-5" style="min-width: 45px;">1</div>
              <div class="step-badge-title bg-dark-opacity text-white fw-bold px-3 py-2 flex-grow-1 text-uppercase font-Rajdhani d-flex align-items-center">Lengkapi Data Akun</div>
            </div>
            
            <div class="row g-3 px-2">
              <div class="col-md-6 text-start">
                <label class="form-label text-muted small fw-semibold">{{ product.idLabel }}</label>
                <input 
                  v-model="userIdInput" 
                  type="text" 
                  class="form-control bg-dark-opacity border-secondary text-white" 
                  :placeholder="'Masukkan ' + product.idLabel"
                  required 
                />
              </div>
              
              <div v-if="product.idType === 'id-server'" class="col-md-6 text-start">
                <label class="form-label text-muted small fw-semibold">{{ product.serverLabel }}</label>
                <input 
                  v-model="serverIdInput" 
                  type="text" 
                  class="form-control bg-dark-opacity border-secondary text-white" 
                  :placeholder="'Masukkan ' + product.serverLabel" 
                />
              </div>

              <div class="col-12 mt-3 text-end">
                <button 
                  type="button" 
                  @click="checkGameId" 
                  class="btn btn-shinn-outline px-4 py-2" 
                  :disabled="isValidating || !userIdInput"
                >
                  <span v-if="isValidating" class="spinner-border spinner-border-sm me-2"></span>
                  <i v-else class="bi bi-shield-check me-1"></i>
                  Cek ID Nickname
                </button>
              </div>
            </div>

            <!-- Nickname feedback -->
            <transition name="fade">
              <div v-if="checkedNickname" class="mt-3 mx-2 alert alert-success d-flex align-items-center gap-3 border-success-opacity" role="alert">
                <i class="bi bi-check-circle-fill text-success fs-4"></i>
                <div>
                  <div class="small text-muted">ID Terverifikasi!</div>
                  <div class="fw-bold fs-5 text-success font-Rajdhani">{{ checkedNickname }}</div>
                </div>
              </div>
            </transition>
            <transition name="fade">
              <div v-if="validationError" class="mt-3 mx-2 alert alert-danger d-flex align-items-center gap-2" role="alert">
                <i class="bi bi-exclamation-triangle-fill text-danger"></i>
                <div>{{ validationError }}</div>
              </div>
            </transition>
          </div>

          <!-- STEP 2: PILIH NOMINAL -->
          <div class="glass-card premium-glass-card p-4 mb-4">
            <div class="payment-step-header mb-4 d-flex align-items-stretch overflow-hidden rounded-3 border border-secondary shadow">
              <div class="step-badge-num bg-warning text-dark fw-extrabold px-3 py-2 d-flex align-items-center justify-content-center font-Rajdhani fs-5" style="min-width: 45px;">2</div>
              <div class="step-badge-title bg-dark-opacity text-white fw-bold px-3 py-2 flex-grow-1 text-uppercase font-Rajdhani d-flex align-items-center">Pilih Nominal / Paket</div>
            </div>
            
            <div class="row g-3 px-2">
              <div 
                v-for="pkg in product.packages" 
                :key="pkg.id" 
                class="col-md-6 col-sm-6"
              >
                <div 
                  @click="selectPackage(pkg)" 
                  class="selection-grid-item text-start h-100 d-flex flex-column justify-content-between p-3"
                  :class="{ 'active': selectedPkg && selectedPkg.id === pkg.id }"
                >
                  <div class="mb-2 d-flex flex-wrap gap-1">
                    <span v-if="pkg.discount > 0" class="badge bg-danger small">Diskon {{ pkg.discount }}%</span>
                    <span v-if="pkg.isBestValue" class="badge bg-warning text-dark small"><i class="bi bi-star-fill"></i> Best Value</span>
                  </div>

                  <div class="fw-bold fs-5 text-white mb-2 font-Rajdhani">{{ pkg.name }}</div>
                  
                  <div>
                    <div v-if="pkg.discount > 0" class="text-decoration-line-through text-muted small">
                      {{ formatRupiah(pkg.price) }}
                    </div>
                    <div class="fw-bold text-accent fs-5">
                      {{ formatRupiah(calculateDiscount(pkg.price, pkg.discount)) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- AI RECOMMENDATION BOX -->
          <div v-if="aiSuggestion" class="glass-card premium-glass-card p-3 mb-4 bg-gradient-ai position-relative overflow-hidden">
            <div class="d-flex align-items-center gap-2 mb-2 text-accent">
              <i class="bi bi-robot animate-pulse-accent"></i>
              <span class="fw-bold small text-uppercase">Rekomendasi Paket AI</span>
            </div>
            <div class="small text-white-80" v-html="renderMarkdown(aiSuggestion)"></div>
          </div>

          <!-- STEP 4: DETAIL KONTAK -->
          <div class="glass-card premium-glass-card p-4 mb-4">
            <div class="payment-step-header mb-4 d-flex align-items-stretch overflow-hidden rounded-3 border border-secondary shadow">
              <div class="step-badge-num bg-warning text-dark fw-extrabold px-3 py-2 d-flex align-items-center justify-content-center font-Rajdhani fs-5" style="min-width: 45px;">4</div>
              <div class="step-badge-title bg-dark-opacity text-white fw-bold px-3 py-2 flex-grow-1 text-uppercase font-Rajdhani d-flex align-items-center">Detail Kontak</div>
            </div>
            
            <div class="row g-3 px-2">
              <div class="col-md-6 text-start">
                <label class="form-label text-muted small fw-semibold">No. WhatsApp</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white-50">
                    <span class="me-1">🇮🇩</span> +62
                  </span>
                  <input 
                    v-model="whatsappInput" 
                    type="text" 
                    class="form-control bg-dark-opacity border-secondary text-white" 
                    placeholder="8980xxxx" 
                    required 
                  />
                </div>
                <div class="text-white-50 mt-1.5" style="font-size: 10px; line-height: 1.4;">
                  Tulis tanpa angka 0 di depan. Contoh: 8980xxxx
                </div>
              </div>

              <div class="col-md-6 text-start">
                <label class="form-label text-muted small fw-semibold">Alamat Email Notifikasi</label>
                <input 
                  v-model="emailInput" 
                  type="email" 
                  class="form-control bg-dark-opacity border-secondary text-white" 
                  placeholder="nama@email.com" 
                  required 
                />
              </div>
            </div>
          </div>

          <!-- SUBMIT CTA BUTTON & HELPERS -->
          <div class="mb-4 text-center">
            <!-- Dynamic validation guidance message -->
            <transition name="fade">
              <div v-if="!isFormValid" class="text-white-50 small mb-3 px-3 py-2 rounded-3 bg-secondary-opacity border border-secondary d-inline-flex align-items-center gap-2">
                <i class="bi bi-info-circle text-accent"></i>
                <span>
                  Lengkapi data: 
                  <strong :class="userIdInput && checkedNickname ? 'text-success' : 'text-danger'">ID (Cek ID)</strong>, 
                  <strong :class="selectedPkg ? 'text-success' : 'text-danger'">Nominal</strong>, 
                  <strong :class="selectedPayment ? 'text-success' : 'text-danger'">Metode</strong>, 
                  <strong :class="whatsappInput && emailInput ? 'text-success' : 'text-danger'">Kontak</strong>.
                </span>
              </div>
            </transition>
            
            <button 
              type="button" 
              @click="openCheckoutModal" 
              class="btn btn-checkout-yellow w-100 py-3 text-dark fw-extrabold fs-5 text-uppercase font-Rajdhani shadow-lg position-relative overflow-hidden" 
              :class="{ 'btn-checkout-pulse': isFormValid }"
              :disabled="!isFormValid"
            >
              <span class="btn-shine-effect"></span>
              Pesan Sekarang! <i class="bi bi-cart-plus-fill ms-1 text-dark"></i>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- MODAL ORDER SUMMARY (SIMPEL & ELEGAN CARD) -->
    <transition name="modal-zoom">
      <div v-if="showModal" class="custom-modal-backdrop" @click.self="closeModal">
        <div class="modal-dialog modal-dialog-centered" style="max-width: 480px; width: 100%;">
          <div class="modal-content premium-glass-card text-white border-0 shadow-lg rounded-4 overflow-hidden">
            
            <div class="p-4 bg-dark-opacity">
              <!-- Header -->
              <div class="d-flex align-items-center justify-content-between mb-4">
                <h5 class="mb-0 fw-extrabold text-white text-uppercase tracking-wider font-Rajdhani d-flex align-items-center gap-2">
                  <i class="bi bi-shield-check text-accent fs-4 animate-pulse-accent"></i>
                  Konfirmasi Pembelian
                </h5>
                <button @click="closeModal" type="button" class="btn-close-custom bg-transparent border-0 text-white-50" aria-label="Close">
                  <i class="bi bi-x-lg fs-5"></i>
                </button>
              </div>
              
              <!-- Details List -->
              <div class="d-flex flex-column gap-3 mb-4 p-3 bg-secondary-opacity rounded-3 border border-secondary small text-start">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Game</span>
                  <span class="text-white fw-bold font-Rajdhani fs-6 text-uppercase">{{ product?.name }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Item / Paket</span>
                  <span class="text-accent fw-bold font-Rajdhani fs-6">{{ selectedPkg?.name }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">ID & Server</span>
                  <span class="text-white font-monospace fw-bold">{{ userIdInput }}<span v-if="serverIdInput" class="text-muted"> ({{ serverIdInput }})</span></span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Nama Pengguna</span>
                  <span class="text-success fw-extrabold font-Rajdhani fs-6">{{ checkedNickname }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">No. Whatsapp</span>
                  <span class="text-white font-monospace">+62 {{ whatsappInput }}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="text-muted">Pembayaran</span>
                  <span class="text-white text-uppercase fw-bold">{{ selectedPayment?.name }}</span>
                </div>
              </div>

              <!-- Pricing Details -->
              <div class="d-flex flex-column gap-2.5 small text-start border-top border-secondary pt-3 px-1">
                <div class="d-flex justify-content-between text-muted">
                  <span>Harga Paket</span>
                  <span>{{ formatRupiah(selectedPkg?.price) }}</span>
                </div>
                <div v-if="selectedPkg?.discount > 0" class="d-flex justify-content-between text-danger fw-bold">
                  <span>Diskon Paket ({{ selectedPkg?.discount }}%)</span>
                  <span>-{{ formatRupiah(Math.round(selectedPkg?.price * selectedPkg?.discount / 100)) }}</span>
                </div>
                <div class="d-flex justify-content-between text-muted">
                  <span>Biaya Admin</span>
                  <span>{{ formatRupiah(selectedPayment?.fee || 1500) }}</span>
                </div>
                <hr class="border-secondary my-2" />
                <div class="d-flex justify-content-between align-items-center py-1">
                  <span class="fw-bold text-white fs-6">Total Tagihan</span>
                  <span class="fw-extrabold text-accent fs-4 font-Rajdhani tracking-wider">{{ formatRupiah(selectedPayment ? calculateTotal(selectedPayment.fee) : calculateDiscount(selectedPkg.price, selectedPkg.discount)) }}</span>
                </div>
              </div>
              
              <!-- Actions -->
              <div class="d-flex gap-2.5 mt-4">
                <button type="button" @click="closeModal" class="btn btn-shinn-outline w-100 py-2.5 text-uppercase tracking-wider small">
                  Batal
                </button>
                <button 
                  type="button" 
                  @click="confirmAndPay" 
                  class="btn btn-shinn-primary w-100 py-2.5 text-white fw-bold text-uppercase tracking-wider small"
                  :disabled="isCreatingTx"
                >
                  <span v-if="isCreatingTx" class="spinner-border spinner-border-sm me-2 text-white"></span>
                  <span class="text-white">{{ isCreatingTx ? 'Memproses...' : 'Bayar Sekarang' }}</span>
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { usePaymentStore } from '../stores/payment';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const paymentStore = usePaymentStore();

const loading = ref(true);
const product = ref(null);

// Inputs
const userIdInput = ref('');
const serverIdInput = ref('');
const emailInput = ref('');
const whatsappInput = ref('');

// Nickname validator state
const isValidating = ref(false);
const checkedNickname = ref('');
const validationError = ref('');

// Selected Nominal & Payment Method & Modal Toggle
const selectedPkg = ref(null);
const selectedPayment = ref(null);
const showModal = ref(false);
const isCreatingTx = ref(false);

const aiSuggestion = ref('');

// Payment flow (V4)
const activeAccordion = ref('wallet');
const toggleAccordion = (name) => {
  if (activeAccordion.value === name) {
    activeAccordion.value = null;
  } else {
    activeAccordion.value = name;
  }
};

const eWallets = computed(() => allPaymentMethods.filter(m => ['gopay', 'ovo', 'dana', 'shopeepay'].includes(m.id)));
const virtualAccounts = computed(() => allPaymentMethods.filter(m => ['bca_va', 'bni_va', 'mandiri_va', 'bri_va'].includes(m.id)));
const retailStores = computed(() => allPaymentMethods.filter(m => ['alfamart', 'indomaret'].includes(m.id)));

// The Payment Methods list (Coinpedia removed)
const allPaymentMethods = [
  { id: 'qris', name: 'QRIS', icon: 'bi-qr-code text-accent', fee: 1500 },
  { id: 'gopay', name: 'GoPay', icon: 'bi-wallet2 text-success', fee: 1500 },
  { id: 'ovo', name: 'OVO', icon: 'bi-wallet2 text-primary', fee: 1500 },
  { id: 'dana', name: 'DANA', icon: 'bi-wallet2 text-info', fee: 1500 },
  { id: 'shopeepay', name: 'ShopeePay', icon: 'bi-wallet2 text-danger', fee: 1500 },
  { id: 'bca_va', name: 'VA BCA', icon: 'bi-bank text-info', fee: 1500 },
  { id: 'bni_va', name: 'VA BNI', icon: 'bi-bank text-info', fee: 1500 },
  { id: 'mandiri_va', name: 'VA Mandiri', icon: 'bi-bank text-info', fee: 1500 },
  { id: 'bri_va', name: 'VA BRI', icon: 'bi-bank text-info', fee: 1500 },
  { id: 'alfamart', name: 'Alfamart', icon: 'bi-shop text-warning', fee: 1500 },
  { id: 'indomaret', name: 'Indomaret', icon: 'bi-shop text-warning', fee: 1500 }
];

onMounted(async () => {
  const slug = route.params.gameSlug;
  try {
    const response = await axios.get(`/api/products/${slug}`);
    if (response.data.success) {
      product.value = response.data.product;
      
      // Auto-fill inputs if authenticated
      if (authStore.isAuthenticated) {
        emailInput.value = authStore.user.email;
        if (authStore.user.phone) {
          // trim leading country code if any
          const phoneClean = authStore.user.phone.replace(/^(\+62|62|0)/, '');
          whatsappInput.value = phoneClean;
        }
      }
      
      // Load AI suggest
      getAiSuggestions();
    }
  } catch (error) {
    console.error('Gagal mengambil data produk:', error);
    router.push('/');
  } finally {
    loading.value = false;
  }
});

const calculateDiscount = (price, discount) => {
  return Math.round(price * (1 - (discount / 100)));
};

const calculateTotal = (fee) => {
  if (!selectedPkg.value) return fee;
  const pkgPrice = calculateDiscount(selectedPkg.value.price, selectedPkg.value.discount);
  return pkgPrice + fee;
};

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const selectPackage = (pkg) => {
  selectedPkg.value = pkg;
};

const isFavorite = computed(() => {
  return authStore.user?.favoriteGames?.includes(product.value?.slug);
});

const toggleFavorite = async () => {
  if (!authStore.isAuthenticated) {
    router.push('/auth');
    return;
  }
  try {
    await authStore.toggleFavorite(product.value.slug);
  } catch (err) {
    console.error('Gagal toggle favorit:', err);
  }
};

const checkGameId = async () => {
  if (!userIdInput.value || isValidating.value) return;
  isValidating.value = true;
  validationError.value = '';
  checkedNickname.value = '';

  try {
    const response = await axios.post('/api/payment/validate-id', {
      gameSlug: product.value.slug,
      userId: userIdInput.value,
      serverId: serverIdInput.value
    });

    if (response.data.success) {
      checkedNickname.value = response.data.data.nickname;
    }
  } catch (error) {
    validationError.value = error.response?.data?.message || 'Gagal memverifikasi ID. Cek kembali format input.';
  } finally {
    isValidating.value = false;
  }
};

const getAiSuggestions = async () => {
  if (!product.value) return;
  try {
    const res = await axios.post('/api/ai/recommend', {
      query: `Rekomendasikan paket diamond/crystal terbaik khusus game ${product.value.name}`,
      budget: '50000'
    });
    if (res.data.success) {
      aiSuggestion.value = res.data.response;
    }
  } catch (err) {
    console.error('Gagal mengambil saran AI detail:', err);
  }
};

const isFormValid = computed(() => {
  return (
    product.value &&
    userIdInput.value &&
    checkedNickname.value &&
    selectedPkg.value &&
    selectedPayment.value &&
    emailInput.value &&
    emailInput.value.match(/^\S+@\S+\.\S+$/) &&
    whatsappInput.value &&
    whatsappInput.value.trim().length >= 8
  );
});

const openCheckoutModal = () => {
  if (!isFormValid.value) return;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const confirmAndPay = async () => {
  if (!selectedPayment.value || isCreatingTx.value) return;
  isCreatingTx.value = true;

  try {
    const payload = {
      gameSlug: product.value.slug,
      packageId: selectedPkg.value.id,
      userIdGame: userIdInput.value,
      serverIdGame: serverIdInput.value || '',
      nickname: checkedNickname.value,
      email: emailInput.value,
      whatsapp: '0' + whatsappInput.value, // add standard prefix
      paymentMethod: selectedPayment.value.id
    };

    const res = await paymentStore.processPayment(payload);
    showModal.value = false;
    router.push(`/payment/${res.orderId}`);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal membuat transaksi. Silakan coba kembali.');
  } finally {
    isCreatingTx.value = false;
  }
};

const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
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

.game-portrait-card {
  position: relative;
  min-height: 380px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  border-radius: 16px;
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.game-portrait-card:hover {
  transform: translateY(-4px);
}

.game-card-bg-full {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
  transition: transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.game-portrait-card:hover .game-card-bg-full {
  transform: scale(1.04);
}

.game-card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(9, 14, 26, 0.05) 0%,
    rgba(9, 14, 26, 0.4) 40%,
    rgba(9, 14, 26, 0.82) 75%,
    rgba(9, 14, 26, 0.98) 100%
  );
  z-index: 2;
}

.game-card-detail-content {
  position: relative;
  z-index: 3;
  width: 100%;
}

.btn-close-custom {
  color: var(--text-muted);
  opacity: 0.65;
  transition: all 0.2s ease;
}

.btn-close-custom:hover {
  color: #fff;
  opacity: 1;
  transform: rotate(90deg);
}

.text-shadow {
  text-shadow: 0 3px 10px rgba(0, 0, 0, 0.95);
}

.dot-glowing-green {
  width: 7px;
  height: 7px;
  background-color: #10b981;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 8px #10b981;
  animation: pulse-green 2s infinite;
}

.bg-success-opacity {
  background-color: rgba(16, 185, 129, 0.1) !important;
}

.border-success-opacity {
  border-color: rgba(16, 185, 129, 0.25) !important;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    transform: scale(0.9);
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}


.text-shadow {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.85);
}

/* Step style cards */
.step-card {
  position: relative;
  border-color: rgba(255, 255, 255, 0.08);
}

.bg-dark-opacity {
  background-color: rgba(15, 25, 35, 0.5);
}

.border-success-opacity {
  border-color: rgba(40, 167, 69, 0.2);
  background-color: rgba(40, 167, 69, 0.05);
}

.border-accent-opacity {
  border-color: rgba(0, 210, 255, 0.3);
}

.bg-gradient-ai {
  background: linear-gradient(135deg, rgba(26, 111, 212, 0.1) 0%, rgba(0, 210, 255, 0.05) 100%);
}

.form-control:focus {
  background-color: rgba(15, 25, 35, 0.7);
  border-color: var(--color-accent);
  box-shadow: 0 0 8px rgba(0, 210, 255, 0.2);
  color: white;
}

/* Favorite Toggle Button CSS */
.btn-favorite-toggle {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text-muted);
  transition: all 0.2s ease;
  padding: 4px 8px;
}

.btn-favorite-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--color-primary);
}

.btn-favorite-toggle.is-favorite {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
}

.btn-favorite-toggle.is-favorite i {
  color: #ef4444;
}

.btn-close-white {
  filter: invert(1);
}

.bg-secondary-opacity {
  background-color: rgba(19, 22, 41, 0.65) !important;
}

/* Featured Payment Box styling */
.payment-featured-box {
  background-color: var(--bg-secondary);
  border: 1.5px solid var(--glass-border);
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.payment-featured-box:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(123, 94, 167, 0.2);
}

.payment-featured-box.active {
  border-color: var(--color-accent);
  background-color: rgba(62, 207, 207, 0.05);
  box-shadow: 0 5px 15px rgba(62, 207, 207, 0.15);
}

.payment-featured-box.active::after {
  content: "✓";
  position: absolute;
  top: 12px;
  right: 16px;
  color: var(--color-accent);
  font-weight: bold;
  font-size: 16px;
}

/* Ribbons styling */
.ribbon-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  width: 75px;
  height: 75px;
  overflow: hidden;
  z-index: 10;
}

.ribbon-best-price {
  background-color: #d4ff00;
  color: #000000;
  text-align: center;
  font-weight: 850;
  font-size: 8px;
  line-height: 16px;
  transform: rotate(45deg);
  position: relative;
  left: -5px;
  top: 15px;
  width: 110px;
  display: block;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Accordion trigger styling */
.accordion-trigger {
  background-color: var(--bg-secondary);
  transition: background-color 0.2s;
  user-select: none;
}

.accordion-trigger:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

/* Accordion partner badges */
.accordion-partner-bar {
  background-color: rgba(13, 15, 26, 0.5);
}

.partner-badge {
  font-size: 8.5px;
  font-weight: 750;
  padding: 2px 6px;
  border-radius: 4px;
  background-color: rgba(13, 15, 26, 0.4);
  color: var(--text-muted);
  border: 1px solid rgba(255, 255, 255, 0.04);
  text-transform: uppercase;
}

.partner-badge.dana { color: #00d2ff; }
.partner-badge.gopay { color: #32cd32; }
.partner-badge.ovo { color: #8a2be2; }
.partner-badge.shopeepay { color: #ff5500; }

/* Dynamic grid layout for payments */
.payment-grid-card {
  flex: 1 1 calc(50% - 8px);
  min-width: 110px;
  background: rgba(13, 15, 26, 0.45);
  border: 1.5px solid var(--glass-border);
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  overflow: hidden;
}

.payment-grid-card:hover {
  border-color: var(--color-accent);
  transform: scale(1.03);
  box-shadow: 0 0 15px rgba(62, 207, 207, 0.2);
}

.payment-grid-card.active {
  border-color: var(--color-accent);
  background-color: rgba(62, 207, 207, 0.08);
  box-shadow: 0 0 15px rgba(62, 207, 207, 0.35);
}

.payment-grid-card.active::after {
  content: "✓";
  position: absolute;
  top: 6px;
  right: 10px;
  color: var(--color-accent);
  font-weight: bold;
  font-size: 12px;
}

/* Featured logo styling */
.featured-logo {
  font-weight: 900;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* Step header bar */
.payment-step-header {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.step-badge-num {
  font-family: var(--font-title);
  box-shadow: 2px 0 10px rgba(0,0,0,0.15);
}

.step-badge-title {
  letter-spacing: 0.5px;
}

/* Neon yellow button */
.btn-checkout-yellow {
  background-color: #d4ff00;
  color: #000000 !important;
  border: none;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 0 4px 15px rgba(212, 255, 0, 0.2);
}

.btn-checkout-yellow:hover:not(:disabled) {
  background-color: #fffa00;
  box-shadow: 0 4px 20px rgba(212, 255, 0, 0.45);
  transform: translateY(-2px);
}

.btn-checkout-yellow:disabled {
  background-color: rgba(212, 255, 0, 0.25);
  color: rgba(0, 0, 0, 0.5) !important;
  cursor: not-allowed;
  box-shadow: none;
}

/* Custom premium selection items for this view */
.selection-grid-item {
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: rgba(14, 22, 43, 0.45) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  position: relative;
  overflow: hidden;
}

.selection-grid-item:hover {
  transform: translateY(-3px) scale(1.02);
  border-color: rgba(56, 189, 248, 0.35) !important;
  box-shadow: 0 8px 25px rgba(56, 189, 248, 0.12);
}

.selection-grid-item.active {
  border-color: transparent !important;
  background: rgba(56, 189, 248, 0.06) !important;
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.2) !important;
}

.selection-grid-item.active::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1.5px;
  background: linear-gradient(135deg, #00d2ff 0%, #8b5cf6 60%, rgba(139, 92, 246, 0.1) 100%);
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}

/* Payment grid card active border gradient */
.payment-grid-card {
  border: 1.5px solid rgba(255, 255, 255, 0.08) !important;
  background: rgba(14, 22, 43, 0.45) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.payment-grid-card:hover {
  transform: translateY(-2px) scale(1.03);
  border-color: rgba(56, 189, 248, 0.35) !important;
  box-shadow: 0 8px 20px rgba(56, 189, 248, 0.1);
}

.payment-grid-card.active {
  border-color: transparent !important;
  background: rgba(56, 189, 248, 0.06) !important;
  box-shadow: 0 0 20px rgba(56, 189, 248, 0.2) !important;
}

.payment-grid-card.active::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1.5px;
  background: linear-gradient(135deg, #00d2ff 0%, #8b5cf6 60%, rgba(139, 92, 246, 0.1) 100%);
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}

/* Featured QRIS box active border gradient */
.payment-featured-box {
  border: 1.5px solid rgba(255, 255, 255, 0.08) !important;
  background: rgba(14, 22, 43, 0.45) !important;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}

.payment-featured-box:hover {
  transform: translateY(-2px);
  border-color: rgba(56, 189, 248, 0.35) !important;
  box-shadow: 0 8px 25px rgba(56, 189, 248, 0.12);
}

.payment-featured-box.active {
  border-color: transparent !important;
  background: rgba(56, 189, 248, 0.06) !important;
  box-shadow: 0 0 25px rgba(56, 189, 248, 0.2) !important;
}

.payment-featured-box.active::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1.5px;
  background: linear-gradient(135deg, #00d2ff 0%, #8b5cf6 60%, rgba(139, 92, 246, 0.1) 100%);
  -webkit-mask: 
     linear-gradient(#fff 0 0) content-box, 
     linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}

/* Collapse animation */
.collapse-enter-active,
.collapse-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Custom card modal styling and animations */
.custom-modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(9, 14, 26, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-zoom-enter-active,
.modal-zoom-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-zoom-enter-active .modal-content,
.modal-zoom-leave-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.modal-zoom-enter-from,
.modal-zoom-leave-to {
  opacity: 0;
}

.modal-zoom-enter-from .modal-content {
  transform: scale(0.92);
}

.modal-zoom-leave-to .modal-content {
  transform: scale(0.95);
}

/* Checkout CTA Button Pulse Glow & Shine Effect */
@keyframes checkout-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(212, 255, 0, 0.75);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(212, 255, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(212, 255, 0, 0);
  }
}

.btn-checkout-pulse {
  animation: checkout-pulse 2s infinite;
}

.btn-checkout-yellow .btn-shine-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-25deg);
  transition: 0.8s;
}

.btn-checkout-yellow:hover:not(:disabled) .btn-shine-effect {
  left: 125%;
}
</style>

