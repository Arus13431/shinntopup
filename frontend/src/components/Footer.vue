<template>
  <footer class="shinn-footer mt-auto py-5">
    <div class="container">
      <div class="row g-4 mb-5">
        <!-- Brand Info -->
        <div class="col-lg-4 col-md-6">
          <div class="d-flex align-items-center gap-2 mb-3">
            <div class="footer-logo-icon">
              <i class="bi bi-lightning-charge-fill"></i>
            </div>
            <span class="footer-logo-text">Shinn<span class="text-accent">TopUp</span></span>
          </div>
          <p class="text-muted small lh-lg">
            ShinnTopUp adalah platform top-up game online terpopuler dan terpercaya di Indonesia. Kami menyediakan layanan top-up instan 24 jam dengan sistem pembayaran otomatis terlengkap, aman, dan harga pelajar.
          </p>
          <div class="d-flex gap-3 mt-4">
            <a href="#" class="social-icon"><i class="bi bi-instagram"></i></a>
            <a href="#" class="social-icon"><i class="bi bi-tiktok"></i></a>
            <a href="#" class="social-icon"><i class="bi bi-youtube"></i></a>
            <a href="#" class="social-icon"><i class="bi bi-discord"></i></a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="col-lg-2 col-6 col-md-3">
          <h5 class="footer-heading mb-3 text-white">Navigasi</h5>
          <ul class="list-unstyled footer-links d-flex flex-column gap-2">
            <li><router-link to="/">Beranda</router-link></li>
            <li><router-link to="/dashboard">Riwayat Transaksi</router-link></li>
            <li><router-link to="/auth">Masuk Akun</router-link></li>
            <li><a href="#recommendation">Rekomendasi AI</a></li>
          </ul>
        </div>

        <!-- Support / Help -->
        <div class="col-lg-2 col-6 col-md-3">
          <h5 class="footer-heading mb-3 text-white">Dukungan</h5>
          <ul class="list-unstyled footer-links d-flex flex-column gap-2">
            <li><a href="#">Hubungi CS</a></li>
            <li><a href="#">FAQ / Bantuan</a></li>
            <li><a href="#">Ketentuan Layanan</a></li>
            <li><a href="#">Kebijakan Privasi</a></li>
          </ul>
        </div>

        <!-- Payment Channels Supported Grid -->
        <div class="col-lg-4 col-md-6">
          <h5 class="footer-heading mb-3 text-white">Metode Pembayaran Resmi</h5>
          <p class="text-muted small mb-3">Kami menerima berbagai opsi pembayaran aman demi kenyamanan Anda.</p>
          <div class="payment-grid d-flex flex-wrap gap-2">
            <span class="payment-badge">QRIS</span>
            <span class="payment-badge">GoPay</span>
            <span class="payment-badge">OVO</span>
            <span class="payment-badge">Dana</span>
            <span class="payment-badge">ShopeePay</span>
            <span class="payment-badge">BCA VA</span>
            <span class="payment-badge">BNI VA</span>
            <span class="payment-badge">Mandiri VA</span>
            <span class="payment-badge">Indomaret</span>
            <span class="payment-badge">Alfamart</span>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-top border-secondary pt-4 text-center">
        <p class="text-muted small mb-0">
          &copy; {{ new Date().getFullYear() }} ShinnTopUp. Seluruh Hak Cipta Dilindungi.
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.shinn-footer {
  background-color: var(--bg-secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.shinn-footer::before {
  content: "";
  position: absolute;
  top: -100px;
  left: 20%;
  width: 400px;
  height: 300px;
  background: radial-gradient(circle at center, 
                              rgba(62, 207, 207, 0.1) 0%, 
                              rgba(123, 94, 167, 0.15) 45%, 
                              transparent 70%);
  filter: blur(50px);
  pointer-events: none;
  z-index: -1;
}

.shinn-footer::after {
  content: "";
  position: absolute;
  bottom: -100px;
  right: 15%;
  width: 300px;
  height: 250px;
  background: radial-gradient(circle at center, 
                              rgba(123, 94, 167, 0.12) 0%, 
                              rgba(62, 207, 207, 0.08) 50%, 
                              transparent 70%);
  filter: blur(45px);
  pointer-events: none;
  z-index: -1;
}

.footer-logo-icon {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: white;
  font-size: 14px;
}

.footer-logo-text {
  font-family: var(--font-title);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.text-accent {
  color: var(--color-accent);
}

.footer-heading {
  font-family: var(--font-title);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.footer-links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease, padding-left 0.2s ease;
}

.footer-links a:hover {
  color: var(--color-accent);
  padding-left: 4px;
}

.social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: var(--bg-tertiary);
  color: var(--text-white);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
}

.social-icon:hover {
  background-color: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.payment-grid {
  max-width: 320px;
}

.payment-badge {
  background-color: var(--bg-tertiary);
  color: var(--text-white);
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
