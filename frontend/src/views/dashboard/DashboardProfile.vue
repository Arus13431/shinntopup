<template>
  <div>
    <h3 class="fw-bold mb-4 text-white" ref="titleRef">
      <i class="bi bi-person-circle text-accent me-2"></i> Profil Saya
    </h3>
    
    <div v-if="profileSuccess" class="alert alert-success d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-check-circle-fill"></i>
      <div>Profil berhasil diperbarui!</div>
    </div>
    <div v-if="profileError" class="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
      <i class="bi bi-exclamation-triangle-fill"></i>
      <div>{{ profileError }}</div>
    </div>

    <form @submit.prevent="handleUpdateProfile" class="d-flex flex-column gap-3 max-width-md" ref="formRef">

      <div class="form-group text-start">
        <label class="form-label text-white small fw-bold">Nama Pengguna (Username)</label>
        <input 
          v-model="profileUsername" 
          type="text" 
          class="form-control bg-dark-opacity border-secondary text-white" 
          required 
        />
      </div>

      <div class="form-group text-start">
        <label class="form-label text-white small fw-bold">Nomor WhatsApp</label>
        <input 
          v-model="profilePhone" 
          type="text" 
          class="form-control bg-dark-opacity border-secondary text-white" 
          placeholder="Contoh: 08123456789" 
        />
      </div>

      <div class="form-group text-start">
        <label class="form-label text-white-50 small fw-bold">Alamat Email (Tidak dapat diubah)</label>
        <input 
          :value="authStore.user?.email" 
          type="email" 
          class="form-control bg-dark-opacity border-secondary text-white-50" 
          disabled 
        />
      </div>

      <div class="text-end mt-2">
        <button type="submit" class="btn btn-shinn-primary px-4 text-white" :disabled="profileLoading">
          <span v-if="profileLoading" class="spinner-border spinner-border-sm me-2 text-white"></span>
          <span class="text-white">Simpan Perubahan</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useScrollAnimation } from '../../composables/useScrollAnimation';

const authStore = useAuthStore();

const titleRef = ref(null);
const formRef = ref(null);

useScrollAnimation(titleRef);
useScrollAnimation(formRef);

const profileUsername = ref('');
const profilePhone = ref('');
const profileLoading = ref(false);
const profileSuccess = ref(false);
const profileError = ref('');

const handleUpdateProfile = async () => {
  profileSuccess.value = false;
  profileError.value = '';
  profileLoading.value = true;

  try {
    const res = await authStore.updateProfile({
      username: profileUsername.value,
      phone: profilePhone.value
    });
    if (res.success) {
      profileSuccess.value = true;
    }
  } catch (err) {
    profileError.value = err.response?.data?.message || 'Gagal memperbarui profil.';
  } finally {
    profileLoading.value = false;
  }
};

onMounted(() => {
  profileUsername.value = authStore.user?.username || '';
  profilePhone.value = authStore.user?.phone || '';
});
</script>

<style scoped>
.max-width-md {
  max-width: 600px;
}
</style>
