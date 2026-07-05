<template>
  <div>
    <h3 class="fw-bold mb-4 text-white" ref="titleRef">
      <i class="bi bi-gear-fill text-accent me-2"></i> Pengaturan Akun
    </h3>
    
    <div v-if="settingsSuccess" class="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-check-circle-fill"></i>
      <div>Kata sandi Anda berhasil diubah!</div>
    </div>
    <div v-if="settingsError" class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <div>{{ settingsError }}</div>
    </div>

    <form @submit.prevent="handleUpdatePassword" class="d-flex flex-column gap-3 max-width-md" ref="formRef">
      <div class="form-group text-start">
        <label class="form-label text-white small fw-bold">Kata Sandi Baru</label>
        <input 
          v-model="newPassword" 
          type="password" 
          class="form-control bg-dark-opacity border-secondary text-white" 
          placeholder="Min. 8 karakter" 
          required
        />
      </div>

      <div class="form-group text-start">
        <label class="form-label text-white small fw-bold">Konfirmasi Kata Sandi Baru</label>
        <input 
          v-model="newPasswordConfirm" 
          type="password" 
          class="form-control bg-dark-opacity border-secondary text-white" 
          placeholder="Ulangi kata sandi baru" 
          required
        />
      </div>

      <div class="text-end mt-2">
        <button type="submit" class="btn btn-shinn-primary px-4 text-white" :disabled="profileLoading">
          <span v-if="profileLoading" class="spinner-border spinner-border-sm me-2 text-white"></span>
          <span class="text-white">Ubah Kata Sandi</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useScrollAnimation } from '../../composables/useScrollAnimation';

const authStore = useAuthStore();

const titleRef = ref(null);
const formRef = ref(null);

useScrollAnimation(titleRef);
useScrollAnimation(formRef);

const newPassword = ref('');
const newPasswordConfirm = ref('');
const profileLoading = ref(false);
const settingsSuccess = ref(false);
const settingsError = ref('');

const handleUpdatePassword = async () => {
  settingsSuccess.value = false;
  settingsError.value = '';

  if (newPassword.value.length < 8) {
    settingsError.value = 'Kata sandi baru minimal 8 karakter!';
    return;
  }

  if (newPassword.value !== newPasswordConfirm.value) {
    settingsError.value = 'Konfirmasi kata sandi baru tidak cocok!';
    return;
  }

  profileLoading.value = true;
  try {
    const res = await authStore.updateProfile({
      password: newPassword.value
    });
    if (res.success) {
      settingsSuccess.value = true;
      newPassword.value = '';
      newPasswordConfirm.value = '';
    }
  } catch (err) {
    settingsError.value = err.response?.data?.message || 'Gagal memperbarui kata sandi.';
  } finally {
    profileLoading.value = false;
  }
};
</script>

<style scoped>
.max-width-md {
  max-width: 600px;
}
</style>
