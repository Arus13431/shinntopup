<template>
  <div class="container py-3">
    <!-- HERO BANNER PROMO (Swiper Slider) -->
    <section class="hero-section mb-5" ref="heroRef">
      <swiper
        :modules="swiperModules"
        :slides-per-view="1"
        :space-between="20"
        :loop="true"
        :pagination="{ clickable: true }"
        :autoplay="{ delay: 5000, disableOnInteraction: false }"
        class="promo-swiper"
      >
        <swiper-slide v-for="(banner, index) in promoBanners" :key="index">
          <div class="banner-slide-content rounded-4 p-4 p-md-5 d-flex align-items-center" :style="{ backgroundImage: banner.bg }">
            <div class="col-lg-7 text-start">
              <span class="badge bg-danger mb-2 text-uppercase letter-spacing-1">{{ banner.tag }}</span>
              <h1 class="display-5 fw-extrabold text-white mb-3 text-shadow">{{ banner.title }}</h1>
              <p class="lead text-white-80 mb-4 d-none d-md-block">{{ banner.desc }}</p>
              <router-link :to="banner.link" class="btn btn-shinn-primary text-white">
                {{ banner.btnText }} <i class="bi bi-arrow-right-short fs-5 text-white"></i>
              </router-link>
            </div>
          </div>
        </swiper-slide>
      </swiper>
    </section>

    <!-- SECTION REKOMENDASI UNTUK KAMU / GAME TERPOPULER (At least 8 games) -->
    <section class="recommendation-section mb-5 text-start" ref="recRef">
      <h3 class="fw-bold mb-4 d-flex align-items-center gap-2 text-white">
        <i class="bi bi-star-fill text-accent animate-pulse-accent"></i> {{ recommendationTitle }}
      </h3>
      <div v-if="loading" class="row g-3">
        <div v-for="n in 8" :key="n" class="col-xl-3 col-md-4 col-6">
          <div class="skeleton-card glass-card" style="aspect-ratio: 3 / 4; height: auto;">
            <div class="skeleton skeleton-img h-100 w-100"></div>
          </div>
        </div>
      </div>
      <div v-else class="row g-3">
        <div 
          v-for="game in recommendedGames" 
          :key="game.slug" 
          class="col-xl-3 col-md-4 col-6"
        >
          <div @click="goToDetail(game.slug)" class="custom-game-card">
            <div 
              class="game-card-bg" 
              :style="{ backgroundImage: 'url(' + game.image + '), linear-gradient(135deg, #1d1e26, #14151b)' }"
            ></div>
            <div class="game-card-overlay"></div>
            <div v-if="game.isHot" class="game-card-badge">HOT</div>
            <div class="game-card-content-wrapper">
              <div class="game-card-details">
                <div class="game-name-title text-white fw-bold">{{ game.name }}</div>
                <div class="game-developer-text">{{ game.developer || 'Unknown' }}</div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="recommendedGames.length === 0" class="col-12 py-4 text-center text-muted">
          Belum ada game populer saat ini.
        </div>
      </div>
    </section>

    <!-- SECTION REKOMENDASI AI (Gemini Assistant) -->
    <section id="recommendation" class="ai-recommender-section mb-5" ref="aiRef">
      <div class="glass-card premium-glass-card p-4 p-md-5 bg-gradient-ai position-relative overflow-hidden">
        <div class="ai-bg-glow"></div>
        <div class="ai-bg-glow-left"></div>
        <div class="row align-items-center position-relative z-index-1">
          <div class="col-lg-5 mb-4 mb-lg-0 text-start">
            <div class="d-flex align-items-center gap-2 mb-2 text-accent">
              <i class="bi bi-robot fs-4 text-accent"></i>
              <span class="fw-bold text-uppercase letter-spacing-1 text-accent">Asisten Belanja AI</span>
            </div>
            <h2 class="fw-bold mb-3 text-gradient-blue">Bingung Mau Top-Up Game Apa?</h2>
            <p class="text-white small lh-lg">
              Tanyakan pada Gemini AI kami! Berikan budget belanja kamu atau cari game bergenre tertentu. AI kami akan memindai katalog aktif ShinnTopUp untuk memberikan nominal paket terbaik!
            </p>
          </div>
          <div class="col-lg-7">
            <div class="glass-card premium-glass-card p-4 bg-dark-opacity">
              <form @submit.prevent="askAiRecommendation" class="row g-3">
                <div class="col-md-7 text-start">
                  <label class="form-label text-white small fw-semibold">Mau cari game/kriteria seperti apa?</label>
                  <input 
                    v-model="aiQuery" 
                    type="text" 
                    class="form-control bg-transparent border-secondary text-white placeholder-muted" 
                    placeholder="misal: Game MOBA seru, game santai" 
                  />
                </div>
                <div class="col-md-5 text-start">
                  <label class="form-label text-white small fw-semibold">Budget Kamu (Rp)</label>
                  <input 
                    v-model.number="aiBudget" 
                    type="number" 
                    class="form-control bg-transparent border-secondary text-white placeholder-muted" 
                    placeholder="misal: 30000" 
                  />
                </div>
                <div class="col-12 text-end">
                  <button type="submit" class="btn btn-shinn-primary px-4 text-white" :disabled="aiLoading">
                    <span v-if="aiLoading" class="spinner-border spinner-border-sm me-2 text-white"></span>
                    <i v-else class="bi bi-cpu me-1 text-white"></i>
                    <span class="text-white">{{ aiLoading ? 'Menganalisis...' : 'Tanya Rekomendasi' }}</span>
                  </button>
                </div>
              </form>

              <!-- AI Response Box with Typewriter effect -->
              <transition name="fade">
                <div v-if="aiResponse || aiTypingText" class="mt-4 p-3 border border-secondary rounded-3 text-start bg-dark-opacity">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <div class="bot-avatar-mini"><i class="bi bi-robot text-white"></i></div>
                    <span class="fw-bold text-accent small">Saran Gemini AI:</span>
                  </div>
                  <div class="ai-text-output text-white" v-html="renderMarkdown(aiTypingText || aiResponse)"></div>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION KATEGORI FILTERS -->
    <section id="game-list" class="category-filters-section mb-4 text-start" ref="gamesRef">
      <h3 class="fw-bold mb-4 d-flex align-items-center gap-2 text-white">
        <i class="bi bi-grid-fill text-accent"></i> Jelajahi Game
      </h3>
      <div class="d-flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button 
          v-for="cat in categories" 
          :key="cat" 
          @click="activeCategory = cat"
          class="btn btn-filter px-4 py-2 text-white"
          :class="{ 'active': activeCategory === cat }"
        >
          {{ cat }}
        </button>
      </div>
    </section>

    <!-- GRID PRODUK GAME -->
    <!-- REMOVED - reason: targets class observer-fade-up which has no JS observer, causing the section to be invisible (opacity: 0) -->
    <!-- <section class="products-grid-section mb-5 observer-fade-up"> -->
    <section class="products-grid-section mb-5" ref="productsRef">
      <!-- Skeleton Loading State -->
      <div v-if="loading" class="row g-3">
        <div v-for="n in 8" :key="n" class="col-xl-3 col-md-4 col-6">
          <div class="skeleton-card glass-card" style="aspect-ratio: 3 / 4; height: auto;">
            <div class="skeleton skeleton-img h-100 w-100"></div>
          </div>
        </div>
      </div>

      <!-- Loaded Data -->
      <div v-else class="d-flex flex-column align-items-center gap-4">
        <div class="row g-3 w-100">
          <div 
            v-for="game in filteredProducts.slice(0, visibleGamesCount)" 
            :key="game.slug" 
            class="col-xl-3 col-md-4 col-6"
          >
            <!-- Custom Game Card Portrait 3:4 -->
            <div @click="goToDetail(game.slug)" class="custom-game-card">
              <div 
                class="game-card-bg" 
                :style="{ backgroundImage: 'url(' + game.image + '), linear-gradient(135deg, #1d1e26, #14151b)' }"
              ></div>
              <div class="game-card-overlay"></div>
              <div v-if="game.isHot" class="game-card-badge">HOT</div>
              
              <div class="game-card-content-wrapper">
                <div class="game-card-details">
                  <div class="game-name-title text-white fw-bold">{{ game.name }}</div>
                  <div class="game-developer-text">{{ game.developer || 'Unknown' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProducts.length === 0" class="col-12 py-5 text-center text-muted">
            <i class="bi bi-search fs-1 mb-3 d-block text-secondary"></i>
            Belum ada game terdaftar untuk kategori ini.
          </div>
        </div>

        <!-- Tombol Outlined Kuning Neon Tampilkan Lainnya -->
        <button 
          v-if="filteredProducts.length > visibleGamesCount"
          @click="showMoreGames" 
          class="btn btn-show-more mt-3"
        >
          Tampilkan Lainnya...
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useScrollAnimation } from '../composables/useScrollAnimation';
import axios from 'axios';

// Swiper.js imports
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const router = useRouter();
const authStore = useAuthStore();

// Refs for scroll animations
const heroRef = ref(null);
const recRef = ref(null);
const aiRef = ref(null);
const gamesRef = ref(null);
// REMOVED - reason: adding productsRef to enable scroll animation on game list grid
// useScrollAnimation(heroRef);
// useScrollAnimation(recRef);
// useScrollAnimation(aiRef);
// useScrollAnimation(gamesRef);
const productsRef = ref(null);

useScrollAnimation(heroRef);
useScrollAnimation(recRef);
useScrollAnimation(aiRef);
useScrollAnimation(gamesRef);
useScrollAnimation(productsRef);

// Swiper Config
const swiperModules = [Autoplay, Pagination, Navigation];
const promoBanners = [
  {
    tag: 'PROMO BULANAN',
    title: 'Top-Up Mobile Legends Diskon 12%',
    desc: 'Beli diamond Mobile Legends khusus minggu ini untuk mendapatkan harga termurah dengan pembayaran terlengkap via QRIS & E-Wallet.',
    btnText: 'Top-Up Sekarang',
    link: '/topup/mobile-legends',
    bg: 'linear-gradient(135deg, #0f1c3f 0%, #1a6fd4 100%)'
  },
  {
    tag: 'PROMO MERDEKA',
    title: 'Genshin Impact Welkin Moon Spesial',
    desc: 'Dapatkan Welkin Moon Blessing dengan harga diskon khusus hanya di ShinnTopUp. Proses instan langsung masuk ke UID kamu!',
    btnText: 'Lihat Detail',
    link: '/topup/genshin-impact',
    bg: 'linear-gradient(135deg, #2b043d 0%, #8e2de2 100%)'
  },
  {
    tag: 'DISCOUNT DAY',
    title: 'Free Fire Diamond Murah Gila',
    desc: 'Top-up Diamonds Free Fire mulai dari Rp 8.000 saja. Cepat, aman, dan langsung diverifikasi otomatis oleh AI.',
    btnText: 'Beli Sekarang',
    link: '/topup/free-fire',
    bg: 'linear-gradient(135deg, #441409 0%, #ff4b2b 100%)'
  }
];

// Products & Filter
const products = ref([]);
const loading = ref(true);
const activeCategory = ref('SEMUA');
const categories = ['SEMUA', 'MOBA', 'FPS', 'RPG', 'BATTLE ROYALE', 'STRATEGY'];

// Visibility Count (at least 8)
const visibleGamesCount = ref(8);
const showMoreGames = () => {
  visibleGamesCount.value += 8;
};

// Recommendation Title dynamic
const recommendationTitle = computed(() => {
  const hasFavs = authStore.isAuthenticated && authStore.user?.favoriteGames && authStore.user.favoriteGames.length > 0;
  return hasFavs ? 'Rekomendasi untuk Kamu' : 'Game Terpopuler';
});

// Recommended Games (from MongoDB favorites if logged in, fallback to popular/hot games)
const recommendedGames = computed(() => {
  const hasFavs = authStore.isAuthenticated && authStore.user?.favoriteGames && authStore.user.favoriteGames.length > 0;
  if (hasFavs) {
    return products.value.filter(p => authStore.user.favoriteGames.includes(p.slug));
  } else {
    // Fallback: hot games or first 8 products
    const hotGames = products.value.filter(p => p.isHot);
    if (hotGames.length > 0) return hotGames.slice(0, 8);
    return products.value.slice(0, 8);
  }
});

// AI Recommender
const aiQuery = ref('');
const aiBudget = ref(null);
const aiLoading = ref(false);
const aiResponse = ref('');
const aiTypingText = ref('');

onMounted(async () => {
  try {
    // Jalankan seeding otomatis
    await axios.post('/api/products/seed');
    
    // Tarik daftar produk game
    const response = await axios.get('/api/products');
    if (response.data.success) {
      products.value = response.data.products;
    }
  } catch (error) {
    console.error('Gagal memuat produk game:', error);
  } finally {
    loading.value = false;
  }

  // Animations initialized via useScrollAnimation composable hooks above
});

// Filter produk berdasarkan kategori
const filteredProducts = computed(() => {
  if (activeCategory.value === 'SEMUA') {
    return products.value;
  }
  return products.value.filter(p => p.category === activeCategory.value);
});

// Navigasi ke detail
const goToDetail = (slug) => {
  router.push(`/topup/${slug}`);
};

// AI Rekomendasi Gemini
const askAiRecommendation = async () => {
  if (aiLoading.value) return;
  aiLoading.value = true;
  aiResponse.value = '';
  aiTypingText.value = '';

  try {
    const res = await axios.post('/api/ai/recommend', {
      query: aiQuery.value,
      budget: aiBudget.value
    });

    if (res.data.success) {
      const fullText = res.data.response;
      let index = 0;
      
      const timer = setInterval(() => {
        if (index < fullText.length) {
          aiTypingText.value += fullText.charAt(index);
          index++;
        } else {
          clearInterval(timer);
          aiResponse.value = fullText;
          aiTypingText.value = '';
          aiLoading.value = false;
        }
      }, 10);
    }
  } catch (error) {
    aiResponse.value = 'Aduh, asisten AI Gemini sedang sibuk. Silakan tanyakan beberapa saat lagi!';
    aiLoading.value = false;
  }
};

// Sederhanakan markdown render
const renderMarkdown = (text) => {
  if (!text) return '';
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-accent" style="text-decoration: underline; font-weight: 600;">$1</a>')
    .replace(/\n/g, '<br/>')
    .replace(/- (.*?)(<br\/>|$)/g, '<li class="ms-3 small">$1</li>');
};
</script>

<style scoped>
/* Hero section & Banner CSS */
.hero-section {
  position: relative;
}

.promo-swiper {
  width: 100%;
}

.banner-slide-content {
  background-size: cover;
  background-position: center;
  min-height: 280px;
  position: relative;
  overflow: hidden;
}

.banner-slide-content::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.banner-slide-content > div {
  position: relative;
  z-index: 2;
}

.text-shadow {
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
}

.text-white-80 {
  color: rgba(255, 255, 255, 0.85);
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

/* AI Recommender CSS */
.bg-gradient-ai {
  background: linear-gradient(135deg, #06112a 0%, #0b061c 50%, #030408 100%);
  border: 1.5px solid rgba(56, 189, 248, 0.35) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.55), 0 0 25px rgba(56, 189, 248, 0.08) !important;
  isolation: isolate;
}

.ai-bg-glow {
  position: absolute;
  top: -120px;
  right: -120px;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle at center, 
                              rgba(56, 189, 248, 0.25) 0%, 
                              rgba(139, 92, 246, 0.22) 45%, 
                              transparent 70%);
  filter: blur(45px);
  z-index: -1;
  pointer-events: none;
  animation: pulseGlow 12s ease-in-out infinite;
}

.ai-bg-glow-left {
  position: absolute;
  bottom: -120px;
  left: -120px;
  width: 350px;
  height: 350px;
  background: radial-gradient(circle at center, 
                              rgba(139, 92, 246, 0.25) 0%, 
                              rgba(56, 189, 248, 0.18) 45%, 
                              transparent 70%);
  filter: blur(45px);
  z-index: -1;
  pointer-events: none;
  animation: pulseGlowLeft 15s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-30px, 20px) scale(1.15);
    opacity: 1;
  }
}

@keyframes pulseGlowLeft {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(30px, -20px) scale(1.12);
    opacity: 0.95;
  }
}

.bg-dark-opacity {
  background-color: rgba(13, 16, 36, 0.6);
}

.placeholder-muted::placeholder {
  color: rgba(255, 255, 255, 0.4) !important;
}

.bot-avatar-mini {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.ai-text-output {
  font-size: 13px;
  line-height: 1.6;
}

/* Kategori Filters */
.btn-filter {
  background-color: var(--bg-secondary);
  color: var(--text-muted);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.btn-filter:hover, .btn-filter.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
  box-shadow: 0 5px 15px rgba(138, 43, 226, 0.3);
}

/* Custom Game Card Portrait 3:4 with glowing accents */
.custom-game-card {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.05);
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(19, 22, 41, 0.4);
  isolation: isolate;
}

.custom-game-card::before {
  content: "";
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle at center, 
                              rgba(62, 207, 207, 0.22) 0%, 
                              rgba(123, 94, 167, 0.26) 40%, 
                              rgba(13, 15, 26, 0.85) 75%, 
                              transparent 100%);
  border-radius: 50%;
  filter: blur(15px);
  z-index: 2;
  pointer-events: none;
  transition: transform 0.5s ease, opacity 0.5s ease;
  opacity: 0.7;
}

.custom-game-card:hover::before {
  transform: translate(-10px, -10px) scale(1.25);
  opacity: 0.95;
}

.custom-game-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: var(--color-accent);
  box-shadow: 0 10px 25px rgba(62, 207, 207, 0.35);
}

.game-card-bg {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
}

.custom-game-card:hover .game-card-bg {
  transform: scale(1.08);
}

.game-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, rgba(13, 15, 26, 0) 40%, rgba(13, 15, 26, 0.95) 100%);
  z-index: 1;
}

.game-card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: #000;
  font-weight: 800;
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  z-index: 3;
  box-shadow: 0 0 10px rgba(62, 207, 207, 0.5);
}

.game-card-content-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 3;
}

.game-name-title {
  font-size: 15px;
  margin-bottom: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.8);
}

.game-developer-text {
  font-size: 11px;
  color: var(--text-muted);
}

/* Skeleton Loading CSS */
.skeleton-card {
  overflow: hidden;
}

.skeleton-img {
  height: 100%;
}

.bg-secondary-opacity {
  background-color: rgba(255, 255, 255, 0.08);
}

.badge-category {
  font-size: 10px;
  padding: 3px 6px;
  border: 1px solid rgba(62, 207, 207, 0.2);
}

/* Intersection Observer fade-up styling */
/* REMOVED - reason: replaced by useScrollAnimation and global.css .scroll-animate styles
.observer-fade-up {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

.observer-fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
*/
</style>
