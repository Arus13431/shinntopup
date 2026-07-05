<template>
  <div class="container py-5 my-5">
    <div class="row justify-content-center">
      <div class="col-lg-5 col-md-8 col-sm-10">
        <!-- Sleek Dark Gaming Auth Card -->
        <div class="glass-card p-4 p-md-5 border-secondary shadow-lg auth-card-fade">
          <!-- Switch Tabs -->
          <div class="d-flex justify-content-center border-bottom border-secondary mb-4 gap-4 pb-2">
            <button 
              @click="switchTab('login')" 
              class="btn-tab text-uppercase fw-bold text-white" 
              :class="{ 'active': activeTab === 'login' }"
            >
              Masuk
            </button>
            <button 
              @click="switchTab('register')" 
              class="btn-tab text-uppercase fw-bold text-white" 
              :class="{ 'active': activeTab === 'register' }"
            >
              Daftar
            </button>
          </div>

          <!-- Wrap forms in transition for smooth tab animations -->
          <transition name="form-fade" mode="out-in">
            <!-- LOGIN FORM -->
            <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="d-flex flex-column gap-3" key="login">
              <div class="form-group text-start">
                <label class="form-label text-white small fw-bold">Alamat Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white">
                    <i class="bi bi-envelope-fill"></i>
                  </span>
                  <input 
                    v-model="loginEmail" 
                    type="email" 
                    class="form-control bg-dark-opacity border-secondary text-white input-glow" 
                    placeholder="nama@email.com" 
                    required 
                  />
                </div>
              </div>

              <div class="form-group text-start">
                <label class="form-label text-white small fw-bold">Kata Sandi</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                  <input 
                    v-model="loginPassword" 
                    type="password" 
                    class="form-control bg-dark-opacity border-secondary text-white input-glow" 
                    placeholder="••••••••" 
                    required 
                  />
                </div>
              </div>

              <!-- Error Message Display (di bawah form tanpa reload) -->
              <transition name="fade">
                <div v-if="errorMessage" class="alert alert-danger-custom text-start py-2 px-3 small mt-1" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                </div>
              </transition>

              <button type="submit" class="btn btn-shinn-primary w-100 py-2.5 mt-2" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2 text-white"></span>
                <span class="text-white">{{ authStore.loading ? 'Memproses...' : 'Masuk Ke Akun' }}</span>
              </button>

              <div class="d-flex justify-content-between mt-2 small">
                <a @click.prevent="switchTab('register')" href="#" class="text-accent text-decoration-none">Belum punya akun? Daftar di sini</a>
                <a @click.prevent="alert('Silakan hubungi admin di Bantuan untuk reset password.')" href="#" class="text-muted text-decoration-none">Lupa password?</a>
              </div>
            </form>

            <!-- REGISTER FORM -->
            <form v-else @submit.prevent="handleRegister" class="d-flex flex-column gap-3" key="register">
              <div class="form-group text-start">
                <label class="form-label text-white small fw-bold">Nama Lengkap</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white">
                    <i class="bi bi-person-fill"></i>
                  </span>
                  <input 
                    v-model="registerUsername" 
                    type="text" 
                    class="form-control bg-dark-opacity border-secondary text-white input-glow" 
                    placeholder="Masukkan nama lengkap" 
                    required 
                  />
                </div>
              </div>

              <div class="form-group text-start">
                <label class="form-label text-white small fw-bold">Alamat Email</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white">
                    <i class="bi bi-envelope-fill"></i>
                  </span>
                  <input 
                    v-model="registerEmail" 
                    type="email" 
                    class="form-control bg-dark-opacity border-secondary text-white input-glow" 
                    placeholder="nama@email.com" 
                    required 
                  />
                </div>
              </div>

              <div class="form-group text-start">
                <label class="form-label text-white small fw-bold">Kata Sandi (Min. 8 Karakter)</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white">
                    <i class="bi bi-lock-fill"></i>
                  </span>
                  <input 
                    v-model="registerPassword" 
                    type="password" 
                    class="form-control bg-dark-opacity border-secondary text-white input-glow" 
                    placeholder="Buat kata sandi baru" 
                    required 
                  />
                </div>
              </div>

              <div class="form-group text-start">
                <label class="form-label text-white small fw-bold">Konfirmasi Kata Sandi</label>
                <div class="input-group">
                  <span class="input-group-text bg-dark-opacity border-secondary text-white">
                    <i class="bi bi-shield-lock-fill"></i>
                  </span>
                  <input 
                    v-model="registerPasswordConfirm" 
                    type="password" 
                    class="form-control bg-dark-opacity border-secondary text-white input-glow" 
                    placeholder="Ulangi kata sandi" 
                    required 
                  />
                </div>
              </div>

              <!-- Error Message Display -->
              <transition name="fade">
                <div v-if="errorMessage" class="alert alert-danger-custom text-start py-2 px-3 small mt-1" role="alert">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
                </div>
              </transition>

              <button type="submit" class="btn btn-shinn-primary w-100 py-2.5 mt-2" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="spinner-border spinner-border-sm me-2 text-white"></span>
                <span class="text-white">{{ authStore.loading ? 'Mendaftar...' : 'Daftar Akun Baru' }}</span>
              </button>
            </form>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const activeTab = ref('login');
const errorMessage = ref('');

// Login Form
const loginEmail = ref('');
const loginPassword = ref('');

// Register Form
const registerUsername = ref('');
const registerEmail = ref('');
const registerPassword = ref('');
const registerPasswordConfirm = ref('');

const switchTab = (tab) => {
  activeTab.value = tab;
  errorMessage.value = '';
};

// Email regex pattern helper
const isValidEmail = (email) => {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
};

const handleLogin = async () => {
  errorMessage.value = '';
  
  if (!loginEmail.value || !loginPassword.value) {
    errorMessage.value = 'Harap isi semua input field!';
    return;
  }
  
  if (!isValidEmail(loginEmail.value)) {
    errorMessage.value = 'Format alamat email tidak valid!';
    return;
  }

  try {
    const res = await authStore.login(loginEmail.value, loginPassword.value);
    if (res.success) {
      const redirectPath = route.query.redirect || '/dashboard';
      router.push(redirectPath);
    } else {
      errorMessage.value = res.message || 'Login gagal. Silakan coba lagi.';
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || authStore.error || 'Email tidak ditemukan atau password salah.';
  }
};

const handleRegister = async () => {
  errorMessage.value = '';

  // Frontend validations
  if (!registerUsername.value || !registerEmail.value || !registerPassword.value) {
    errorMessage.value = 'Harap isi seluruh field pendaftaran!';
    return;
  }

  if (!isValidEmail(registerEmail.value)) {
    errorMessage.value = 'Format email tidak valid!';
    return;
  }

  if (registerPassword.value.length < 8) {
    errorMessage.value = 'Kata sandi minimal harus 8 karakter!';
    return;
  }

  if (registerPassword.value !== registerPasswordConfirm.value) {
    errorMessage.value = 'Konfirmasi kata sandi tidak cocok!';
    return;
  }

  try {
    const res = await authStore.register(registerUsername.value, registerEmail.value, registerPassword.value);
    if (res.success) {
      const redirectPath = route.query.redirect || '/dashboard';
      router.push(redirectPath);
    } else {
      errorMessage.value = res.message || 'Pendaftaran gagal.';
    }
  } catch (err) {
    errorMessage.value = err.response?.data?.message || authStore.error || 'Terjadi kesalahan saat mendaftar.';
  }
};
</script>

<style scoped>
.btn-tab {
  background: transparent;
  border: none;
  font-size: 15px;
  position: relative;
  padding-bottom: 8px;
  transition: all 0.2s ease;
}

.btn-tab:hover {
  color: var(--color-accent) !important;
}

.btn-tab.active {
  color: var(--color-accent) !important;
  font-weight: bold;
}

.btn-tab.active::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2.5px;
  background-color: var(--color-accent);
  box-shadow: 0 0 10px var(--color-accent);
}

.bg-dark-opacity {
  background-color: rgba(13, 16, 36, 0.6);
}

.form-control:focus {
  background-color: rgba(13, 16, 36, 0.8);
  border-color: var(--color-accent);
  box-shadow: 0 0 8px rgba(0, 210, 255, 0.25);
  color: white;
}

.input-group-text {
  border-color: rgba(255, 255, 255, 0.08);
}

.alert-danger-custom {
  background-color: rgba(255, 70, 85, 0.15);
  border: 1px solid rgba(255, 70, 85, 0.3);
  color: #ff4655;
  border-radius: 8px;
}

/* Auth Card entry animation */
.auth-card-fade {
  animation: card-entry 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
}

@keyframes card-entry {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Form transition switcher */
.form-fade-enter-active,
.form-fade-leave-active {
  transition: all 0.25s ease;
}

.form-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.form-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.input-glow:focus {
  border-color: var(--color-accent);
}
</style>
