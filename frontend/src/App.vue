<template>
  <div class="d-flex flex-column min-vh-screen">
    <!-- Shooting Stars Background -->
    <div class="shooting-stars-container">
      <div class="shooting-star"></div>
      <div class="shooting-star"></div>
      <div class="shooting-star"></div>
      <div class="shooting-star"></div>
      <div class="shooting-star"></div>
    </div>

    <!-- Navbar Global -->
    <Navbar />

    <!-- Main Content Area -->
    <main class="flex-grow-1 py-4">
      <router-view v-slot="{ Component }">
        <transition name="route-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer Global -->
    <Footer />

    <!-- Widget AI Chat (Floating) -->
    <AIChatWidget />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import AIChatWidget from './components/AIChatWidget.vue';

const authStore = useAuthStore();

onMounted(async () => {
  // Rehydrate Pinia store from localStorage on app mount
  authStore.rehydrate();
  
  // Ambil data profil terbaru jika user memiliki token tersimpan
  if (authStore.isAuthenticated) {
    await authStore.checkAuth();
  }
});
</script>

<style>
/* Reset dasar & styling layout */
.min-vh-screen {
  min-height: 100vh;
}
</style>
