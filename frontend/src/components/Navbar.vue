<template>
  <nav class="navbar navbar-expand-lg navbar-dark sticky-top shinn-navbar" :class="{ 'scrolled': isScrolled }">
    <div class="container">
      <!-- Logo Brand -->
      <router-link class="navbar-brand d-flex align-items-center gap-2" to="/">
        <div class="logo-icon">
          <i class="bi bi-lightning-charge-fill"></i>
        </div>
        <span class="logo-text">Shinn<span class="text-accent">TopUp</span></span>
      </router-link>

      <!-- Toggle Button Mobile -->
      <button class="navbar-toggler border-0" type="button" @click="isMobileMenuOpen = true" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Mobile Menu Overlay -->
      <div class="navbar-collapse-overlay d-lg-none" :class="{ 'show': isMobileMenuOpen }" @click="isMobileMenuOpen = false"></div>

      <div class="collapse navbar-collapse" :class="{ 'show': isMobileMenuOpen }" id="navbarNav">
        <!-- Close Button for Mobile -->
        <button class="mobile-menu-close d-lg-none" @click="isMobileMenuOpen = false" aria-label="Close menu">
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- Compact Toggleable Search (Desktop) & Default (Mobile) -->
        <div class="ms-auto my-2 my-lg-0 search-container position-relative" :class="{ 'expanded': isSearchExpanded }">
          <!-- Desktop Search Toggle Trigger -->
          <button 
            @click="toggleSearch" 
            class="btn btn-link text-white-50 p-0 me-2 d-none d-lg-inline-block search-toggle-btn"
            title="Cari Game"
          >
            <i class="bi bi-search fs-5"></i>
          </button>
          
          <div class="search-input-wrapper" :class="{ 'mobile-show': isSearchExpanded }">
            <div class="input-group">
              <span class="input-group-text bg-transparent border-end-0 border-secondary text-muted d-lg-none">
                <i class="bi bi-search"></i>
              </span>
              <input 
                v-model="searchQuery" 
                @input="onSearchInput" 
                @focus="showSuggestions = true"
                @blur="closeSuggestions"
                @keydown.esc="closeSearch"
                type="text" 
                class="form-control bg-transparent border-start-0 border-secondary text-white py-1.5" 
                placeholder="Cari game..." 
                ref="searchInputRef"
              />
            </div>

            <!-- Auto-Suggest Dropdown -->
            <div v-if="showSuggestions && suggestions.length > 0" class="suggestions-dropdown glass-card">
              <div 
                v-for="game in suggestions" 
                :key="game.slug" 
                @mousedown="selectGame(game.slug)"
                class="suggestion-item d-flex align-items-center gap-3"
              >
                <img :src="game.image" :alt="game.name" class="suggestion-img" />
                <div class="flex-grow-1">
                  <div class="suggestion-title text-white fw-bold">{{ game.name }}</div>
                  <span class="badge bg-secondary-opacity text-accent small badge-category">{{ game.category }}</span>
                </div>
              </div>
            </div>
            <div v-else-if="showSuggestions && searchQuery && suggestions.length === 0" class="suggestions-dropdown glass-card p-3 text-center text-muted">
              Game tidak ditemukan
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <ul class="navbar-nav ms-auto align-items-lg-center gap-3">
          <li class="nav-item">
            <router-link class="nav-link" to="/" active-class="active" @click="closeMobileMenu">Home</router-link>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="/#game-list" @click="closeMobileMenu">Top Up</a>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/transaction/check" active-class="active" @click="closeMobileMenu">Cek Transaksi</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/voucher" active-class="active" @click="closeMobileMenu">Voucher</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/help" active-class="active" @click="closeMobileMenu">Bantuan</router-link>
          </li>
          
          <!-- Admin Link -->
          <li v-if="authStore.isAdmin" class="nav-item">
            <router-link class="btn btn-sm btn-outline-warning" to="/admin" @click="closeMobileMenu">
              <i class="bi bi-shield-lock-fill me-1"></i>Admin
            </router-link>
          </li>

          <!-- Cart Link (jika ada transaksi pending di store) -->
          <li v-if="cartStore.hasActiveCheckout" class="nav-item">
            <router-link class="nav-link position-relative px-2" to="/checkout" @click="closeMobileMenu">
              <i class="bi bi-cart3 fs-5"></i>
              <span class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span class="visually-hidden">Checkout pending</span>
              </span>
            </router-link>
          </li>

          <!-- Auth Buttons / User Dropdown -->
          <li v-if="authStore.isAuthenticated" class="nav-item dropdown">
            <a class="nav-link dropdown-toggle d-flex align-items-center gap-2 user-menu" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <!-- Dynamically show custom profile picture, or initial initials with deterministic bg color -->
              <div v-if="authStore.user?.avatar" class="avatar-image-container">
                <img :src="authStore.user.avatar" class="navbar-avatar-image" alt="Avatar" />
              </div>
              <div v-else class="avatar-placeholder" :style="{ backgroundColor: getDeterministicColor(authStore.user?.username) }">
                {{ authStore.user?.username?.charAt(0).toUpperCase() }}
              </div>
              <span class="d-lg-none d-inline text-white">{{ authStore.user?.username }}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark glass-card p-2 border-secondary shadow-lg">
              <li>
                <div class="px-3 py-2 text-white border-bottom border-secondary mb-2">
                  <div class="fw-bold">{{ authStore.user?.username }}</div>
                  <div class="small text-muted mb-1">{{ authStore.user?.email }}</div>
                  <div class="d-flex align-items-center gap-1.5 mt-1 text-accent fs-7">
                    <i class="bi bi-award-fill"></i>
                    <span>Level {{ authStore.user?.level || 1 }}</span>
                  </div>
                </div>
              </li>
              <li>
                <router-link class="dropdown-item rounded" :to="{ name: 'dashboard-home' }" @click="closeMobileMenu">
                  <i class="bi bi-grid-1x2-fill me-2 text-accent"></i>Dashboard Saya
                </router-link>
              </li>
              <li>
                <router-link class="dropdown-item rounded" :to="{ name: 'dashboard-transactions' }" @click="closeMobileMenu">
                  <i class="bi bi-clock-history me-2 text-accent"></i>Riwayat Transaksi
                </router-link>
              </li>
              <li>
                <hr class="dropdown-divider border-secondary" />
              </li>
              <li>
                <a @click.prevent="logout" class="dropdown-item rounded text-danger" href="#">
                  <i class="bi bi-box-arrow-right me-2"></i>Keluar
                </a>
              </li>
            </ul>
          </li>
          <li v-else class="nav-item">
            <router-link class="btn btn-shinn-primary text-white" to="/auth" @click="closeMobileMenu">
              <i class="bi bi-box-arrow-in-right me-1 text-white"></i><span class="text-white">Masuk / Daftar</span>
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import api from '../services/api';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const cartStore = useCartStore();

const isDashboard = computed(() => route.path.startsWith('/dashboard'));

const searchQuery = ref('');
const suggestions = ref([]);
const showSuggestions = ref(false);
const allGames = ref([]);

const isSearchExpanded = ref(false);
const searchInputRef = ref(null);
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

let debounceTimer = null;

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20;
};

// Ambil data semua game aktif untuk auto-suggest lokal berkecepatan tinggi
onMounted(async () => {
  window.addEventListener('scroll', handleScroll);
  handleScroll();
  try {
    const response = await api.get('/api/products');
    if (response.data.success) {
      allGames.value = response.data.products;
    }
  } catch (error) {
    console.error('Gagal mengambil daftar game pencarian:', error);
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Auto-Suggest dengan Debounce 300ms
const onSearchInput = () => {
  clearTimeout(debounceTimer);
  showSuggestions.value = true;
  
  debounceTimer = setTimeout(() => {
    if (!searchQuery.value.trim()) {
      suggestions.value = [];
      return;
    }
    const query = searchQuery.value.toLowerCase();
    suggestions.value = allGames.value.filter(game => 
      game.name.toLowerCase().includes(query) || 
      game.category.toLowerCase().includes(query)
    );
  }, 300);
};

const closeSuggestions = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 250);
};

const selectGame = (slug) => {
  searchQuery.value = '';
  suggestions.value = [];
  isSearchExpanded.value = false;
  isMobileMenuOpen.value = false;
  router.push(`/topup/${slug}`);
};

const toggleSearch = () => {
  isSearchExpanded.value = !isSearchExpanded.value;
  if (isSearchExpanded.value) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
};

const closeSearch = () => {
  isSearchExpanded.value = false;
  showSuggestions.value = false;
};

const logout = async () => {
  await authStore.logout();
  cartStore.clearCart();
  isMobileMenuOpen.value = false;
  router.push('/');
};

// Deterministic background color generator for profile initials
const getDeterministicColor = (username) => {
  if (!username) return '#7B5EA7';
  const colors = ['#7B5EA7', '#3ECFCF', '#FF7F50', '#FFD700', '#1E90FF', '#FF1493', '#32CD32'];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
</script>

<style scoped>
.shinn-navbar {
  background: rgba(13, 15, 26, 0.45) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  transition: all 0.3s ease;
  z-index: 1030;
}

.shinn-navbar.scrolled {
  background: rgba(13, 15, 26, 0.95) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border-bottom: 1px solid rgba(62, 207, 207, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.6);
}

.logo-icon {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(62, 207, 207, 0.4);
  color: white;
}

.logo-text {
  font-family: var(--font-title);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.text-accent {
  color: var(--color-accent);
}

.search-container {
  display: flex;
  align-items: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.search-toggle-btn {
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.search-toggle-btn:hover {
  color: var(--color-accent);
}

.search-input-wrapper {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

/* On desktop: expand when active */
@media (min-width: 992px) {
  .search-input-wrapper {
    width: 0;
    opacity: 0;
    overflow: hidden;
    transform: scaleX(0.9);
    transform-origin: right;
  }
  .search-container.expanded .search-input-wrapper {
    width: 250px;
    opacity: 1;
    overflow: visible;
    transform: scaleX(1);
    margin-left: 8px;
  }
}

/* Slide out menu for mobile from right */
@media (max-width: 991px) {
  .navbar-collapse {
    position: fixed;
    top: 0;
    right: -100%;
    width: 290px;
    height: 100vh;
    background: #131629 !important;
    box-shadow: -10px 0 30px rgba(0, 0, 0, 0.7);
    padding: 70px 24px 24px;
    transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
    display: block !important;
    z-index: 1045;
  }
  
  .navbar-collapse.show {
    right: 0;
  }
  
  .navbar-collapse-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    z-index: 1040;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }
  
  .navbar-collapse-overlay.show {
    opacity: 1;
    visibility: visible;
  }
  
  .mobile-menu-close {
    position: absolute;
    top: 20px;
    right: 20px;
    font-size: 22px;
    color: #E8E8F0;
    background: transparent;
    border: none;
    outline: none;
    transition: color 0.2s ease;
  }
  
  .mobile-menu-close:hover {
    color: var(--color-accent);
  }
  
  .search-container {
    width: 100%;
    margin-bottom: 20px;
  }
  
  .search-input-wrapper {
    width: 100%;
    opacity: 1;
    overflow: visible;
  }
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  margin-top: 8px;
  z-index: 1000;
  max-height: 280px;
  overflow-y: auto;
  border-color: rgba(255, 255, 255, 0.1);
  padding: 8px 0;
}

.suggestion-item {
  padding: 10px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.suggestion-item:hover {
  background-color: rgba(62, 207, 207, 0.12);
}

.suggestion-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.suggestion-title {
  font-weight: 600;
  font-size: 14px;
}

.badge-category {
  font-size: 10px;
  padding: 3px 6px;
  background-color: rgba(62, 207, 207, 0.08);
  border: 1px solid rgba(62, 207, 207, 0.2);
}

/* Slide-in indicator under navigation links */
.navbar-nav .nav-link {
  position: relative;
  transition: color 0.3s ease;
}

.navbar-nav .nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background-color: var(--color-accent);
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.navbar-nav .nav-link:hover::after,
.navbar-nav .nav-link.active::after {
  width: 100%;
}

.user-menu {
  cursor: pointer;
}

.avatar-image-container {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--color-accent);
  box-shadow: 0 0 10px rgba(62, 207, 207, 0.3);
  transition: box-shadow 0.3s ease;
}

.avatar-image-container:hover {
  box-shadow: 0 0 15px rgba(62, 207, 207, 0.6);
}

.navbar-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  box-shadow: 0 0 8px rgba(62, 207, 207, 0.3);
}

/* Dropdown Menu Scale & Fade animations */
.dropdown-menu {
  display: block;
  opacity: 0;
  visibility: hidden;
  transform: scale(0.95) translateY(-10px);
  transform-origin: top right;
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.2s;
  background-color: #131629 !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: scale(1) translateY(0);
}

.dropdown-item {
  padding: 10px 16px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background-color: rgba(123, 94, 167, 0.2);
  color: var(--color-accent) !important;
}

.fs-7 {
  font-size: 0.8rem;
}
</style>

