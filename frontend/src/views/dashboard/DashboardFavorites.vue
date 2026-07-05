<template>
  <div>
    <h3 class="fw-bold mb-4 text-white" ref="titleRef">
      <i class="bi bi-heart-fill text-danger me-2"></i> Game Favorit Saya
    </h3>
    <p class="text-white-50 small mb-4" ref="descRef">
      Game yang pernah Anda top-up akan otomatis dimasukkan ke daftar favorit untuk mempermudah akses cepat.
    </p>
    
    <div v-if="favoriteGames.length > 0" class="row g-3" ref="gridRef">
      <div v-for="game in favoriteGames" :key="game.slug" class="col-md-4 col-sm-6">
        <div @click="router.push(`/topup/${game.slug}`)" class="product-card p-3 text-center cursor-pointer position-relative">
          <img :src="game.image" :alt="game.name" class="w-100 rounded-3 mb-2" style="height: 110px; object-fit: cover;" />
          <h6 class="fw-bold text-white mb-0 text-truncate">{{ game.name }}</h6>
          <span class="badge bg-danger position-absolute top-2 start-2 xs-badge">FAVORIT</span>
        </div>
      </div>
    </div>
    <div class="text-center py-5 text-white-50 animate-pulse-accent" v-else>
      <i class="bi bi-heart fs-1 text-secondary mb-3 d-block"></i>
      Belum ada game favorit terdaftar. Lakukan top-up pertamamu untuk menambahkannya secara otomatis!
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useScrollAnimation } from '../../composables/useScrollAnimation';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();

const titleRef = ref(null);
const descRef = ref(null);
const gridRef = ref(null);

useScrollAnimation(titleRef);
useScrollAnimation(descRef);
useScrollAnimation(gridRef);

const allProducts = ref([]);

const loadProducts = async () => {
  try {
    const res = await axios.get('/api/products');
    if (res.data.success) {
      allProducts.value = res.data.products;
    }
  } catch (error) {
    console.error('Gagal memuat produk game:', error);
  }
};

const favoriteGames = computed(() => {
  if (!authStore.user || !authStore.user.favoriteGames) return [];
  return allProducts.value.filter(p => authStore.user.favoriteGames.includes(p.slug));
});

onMounted(async () => {
  await loadProducts();
});
</script>

<style scoped>
.product-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.product-card:hover {
  transform: translateY(-5px);
  border-color: var(--color-accent);
  box-shadow: 0 5px 15px rgba(62, 207, 207, 0.25);
  background: rgba(62, 207, 207, 0.05);
}

.xs-badge {
  font-size: 9px;
  padding: 3px 6px;
  border-radius: 4px;
}
</style>
