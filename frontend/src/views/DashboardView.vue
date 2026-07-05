<template>
  <div>
    <div class="container py-4 text-start">
    <div class="row g-4">
      <!-- Sidebar Navigation -->
      <div class="col-lg-3">
        <div class="glass-card p-4 border-secondary text-center position-relative overflow-hidden mb-4">
          <!-- Ambient glowing effect -->
          <div class="profile-glow-ring"></div>

          <!-- Circular avatar with custom file upload options -->
          <div class="avatar-container mx-auto mb-3">
            <div class="avatar-glowing-neon" :style="{ borderColor: '#3ECFCF' }">
              <span v-if="!authStore.user?.avatar" class="avatar-letter">{{ authStore.user?.username?.charAt(0).toUpperCase() }}</span>
              <img v-else :src="authStore.user?.avatar" class="avatar-image-pic" alt="Avatar" />
            </div>
            <div class="level-badge bg-gradient-neon-purple text-white fw-bold">
              LVL {{ authStore.user?.level || 1 }}
            </div>
          </div>

          <div class="mb-3">
            <label for="avatar-file-input" class="btn btn-sm btn-shinn-outline py-1 px-3 mt-1 cursor-pointer" style="font-size: 11px;">
              <i class="bi bi-camera-fill me-1"></i> Ubah Foto
            </label>
            <input 
              type="file" 
              id="avatar-file-input" 
              class="d-none" 
              accept="image/png, image/jpeg, image/jpg, image/webp" 
              @change="onAvatarFileChange" 
            />
            <div v-if="avatarUploadError" class="text-danger small mt-1" style="font-size: 11px; font-weight: 500;">
              <i class="bi bi-exclamation-circle-fill me-1"></i>{{ avatarUploadError }}
            </div>
            <div v-if="avatarUploadSuccess" class="text-success small mt-1" style="font-size: 11px; font-weight: 500;">
              <i class="bi bi-check-circle-fill me-1"></i>{{ avatarUploadSuccess }}
            </div>
          </div>

          <h4 class="fw-bold mb-1 text-white text-truncate">{{ authStore.user?.username }}</h4>
          <p class="text-muted small mb-3">{{ authStore.user?.email }}</p>

          <!-- Level Progression Bar -->
          <div class="level-progress-container px-2 mb-4 text-start">
            <div class="d-flex justify-content-between mb-1">
              <span class="text-accent fw-bold small">Level {{ authStore.user?.level || 1 }}</span>
              <span class="text-white-50 small">{{ authStore.user?.xp || 0 }} / {{ (authStore.user?.level || 1) * 100 }} XP</span>
            </div>
            <div class="progress progression-bar bg-dark-opacity" style="height: 6px;">
              <div 
                class="progress-bar bg-gradient-neon-teal" 
                role="progressbar" 
                :style="{ width: xpPercentage + '%' }" 
                :aria-valuenow="authStore.user?.xp || 0" 
                aria-valuemin="0" 
                :aria-valuemax="(authStore.user?.level || 1) * 100"
              ></div>
            </div>
          </div>

          <!-- Nav Tabs vertical (Nested Routes Navigation) -->
          <div class="d-flex flex-column gap-1 text-start">
            <router-link 
              v-for="tab in tabItems" 
              :key="tab.id"
              :to="{ name: tab.routeName }"
              class="btn btn-sidebar-tab text-white d-flex align-items-center justify-content-between text-decoration-none"
              :class="{ 'active': activeTab === tab.id }"
            >
              <div>
                <i :class="tab.icon + ' me-2 text-white'"></i>
                <span class="text-white fw-semibold small">{{ tab.label }}</span>
              </div>
              <span v-if="tab.badge" class="badge rounded-pill bg-danger text-white xs-badge">{{ tab.badge }}</span>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Main Panel Area (Nested Router Content) -->
      <div class="col-lg-9">
        <div class="glass-card p-4 p-md-5 border-secondary min-panel-height position-relative overflow-hidden">
          <router-view v-slot="{ Component }">
            <transition name="route-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>
    </div>
  </div>

  <!-- Custom Avatar Cropping Canvas Modal -->
  <div v-if="showCropModal" class="custom-modal-overlay">
    <div class="custom-modal-content glass-card p-4 text-center">
      <h5 class="fw-bold text-white mb-3">Sesuaikan Foto Profil</h5>
      
      <div class="crop-preview-wrapper mb-3 text-center">
        <canvas ref="cropCanvasRef" width="200" height="200" class="mx-auto rounded-circle border border-accent shadow-lg bg-dark"></canvas>
      </div>
      
      <div class="mb-3 text-start">
        <div class="d-flex justify-content-between small text-white-50 mb-1">
          <span>Perbesar Gambar (Zoom)</span>
          <span>{{ zoomVal.toFixed(1) }}x</span>
        </div>
        <input type="range" class="form-range custom-slider" v-model.number="zoomVal" min="1" max="3" step="0.1" @input="drawCrop" />
      </div>
      <div class="mb-3 text-start">
        <div class="d-flex justify-content-between small text-white-50 mb-1">
          <span>Geser Horizontal (X)</span>
          <span>{{ offsetX }} px</span>
        </div>
        <input type="range" class="form-range custom-slider" v-model.number="offsetX" min="-150" max="150" step="1" @input="drawCrop" />
      </div>
      <div class="mb-3 text-start">
        <div class="d-flex justify-content-between small text-white-50 mb-1">
          <span>Geser Vertikal (Y)</span>
          <span>{{ offsetY }} px</span>
        </div>
        <input type="range" class="form-range custom-slider" v-model.number="offsetY" min="-150" max="150" step="1" @input="drawCrop" />
      </div>

      <div class="d-flex gap-2 justify-content-end mt-4">
        <button class="btn btn-secondary px-3 py-1.5" @click="showCropModal = false">Batal</button>
        <button class="btn btn-shinn-primary px-4 py-1.5 text-white" @click="saveCroppedAvatar" :disabled="uploadingCropped">
          <span v-if="uploadingCropped" class="spinner-border spinner-border-sm me-1 text-white"></span>
          Terapkan
        </button>
      </div>
    </div>
  </div>

  <!-- Daily Check-In Modal Calendar Grid -->
  <div v-if="authStore.showCheckInModal" class="custom-modal-overlay">
    <div class="custom-modal-content checkin-modal glass-card p-4 text-center overflow-hidden">
      <!-- Claim Animation Canvas -->
      <canvas ref="claimCanvasRef" class="claim-animation-canvas"></canvas>
      
      <!-- Floating +XP indicator -->
      <div v-if="showXpFloat" class="xp-float-indicator">{{ xpFloatText }}</div>

      <button class="btn-close-modal" @click="authStore.showCheckInModal = false"><i class="bi bi-x-lg"></i></button>
      
      <i class="bi bi-calendar-check-fill text-accent fs-1 mb-2 d-inline-block"></i>
      <h4 class="fw-bold text-white mb-1">Check-In Harian</h4>
      <p class="text-white-50 small mb-3">Check-in berturut-turut untuk melipatgandakan reward XP dan menaikkan Level akun Anda!</p>
      
      <!-- Custom Banners inside Modal -->
      <div v-if="checkInModalSuccess" class="alert alert-success-custom d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3 text-start">
        <i class="bi bi-check-circle-fill text-success fs-5"></i>
        <div>{{ checkInModalSuccess }}</div>
      </div>

      <div v-if="checkInModalError" class="alert alert-danger-custom d-flex align-items-center gap-2 py-2 px-3 small border-0 mb-3 text-start">
        <i class="bi bi-exclamation-triangle-fill text-danger fs-5"></i>
        <div>{{ checkInModalError }}</div>
      </div>

      <div class="checkin-grid mb-4">
        <div v-for="day in 7" :key="day" class="checkin-day-card-wrapper">
          <div 
            class="checkin-day-card text-center" 
            :class="{ 
              'claimed': isDayClaimed(day),
              'active': isCurrentCheckInDay(day),
              'day-7': day === 7
            }"
          >
            <div class="day-num small">Hari {{ day }}</div>
            <div class="gift-icon-container my-2">
              <i class="bi" :class="getCheckInIcon(day)"></i>
            </div>
            <div class="day-xp fw-bold">+{{ getDayXp(day) }} XP</div>
          </div>
        </div>
      </div>

      <button 
        @click="triggerCheckIn" 
        class="btn btn-checkin-claim w-100 text-white py-2.5 fw-bold"
        :disabled="hasCheckedInToday || checkInLoading"
      >
        <span v-if="hasCheckedInToday" class="text-white">Sudah Check-In Hari Ini</span>
        <span v-else-if="checkInLoading" class="text-white">Mengklaim...</span>
        <span v-else class="text-white">Klaim XP Sekarang!</span>
      </button>
    </div>
  </div>

  <!-- Congratulations Level Milestone Modal -->
  <div v-if="showMilestoneModal" class="custom-modal-overlay">
    <!-- Confetti Canvas -->
    <canvas ref="confettiCanvasRef" class="confetti-canvas"></canvas>

    <div class="custom-modal-content milestone-modal glass-card p-5 text-center">
      <button class="btn-close-modal" @click="showMilestoneModal = false"><i class="bi bi-x-lg"></i></button>
      
      <div class="milestone-badge-glow mx-auto mb-3">
        <i class="bi bi-trophy-fill text-warning fs-1"></i>
      </div>
      <h3 class="fw-bold text-white mb-2">SELAMAT! LEVEL UP</h3>
      <h1 class="fw-bold text-accent mb-3">Level {{ milestoneLevel }}</h1>
      <p class="text-white-50 mb-4">Anda telah mencapai milestone level baru! Sebagai penghargaan, berikut adalah kupon diskon spesial untuk Anda:</p>
      
      <div class="voucher-box p-3 rounded border border-warning bg-dark-opacity mb-4 position-relative">
        <div class="small text-white-50 text-uppercase fw-semibold mb-1">Kode Voucher</div>
        <div class="fs-4 fw-bold text-warning letter-spacing-1">{{ getMilestoneVoucherCode(milestoneLevel) }}</div>
        <button @click="copyVoucherCode(getMilestoneVoucherCode(milestoneLevel))" class="btn btn-sm btn-outline-warning mt-2 px-3 py-1">
          <i class="bi" :class="voucherCopied ? 'bi-check-lg' : 'bi-clipboard'"></i>
          {{ voucherCopied ? ' Disalin!' : ' Salin Kode' }}
        </button>
      </div>
      
      <button class="btn btn-shinn-primary w-100 py-2.5 text-white fw-bold" @click="showMilestoneModal = false">
        Klaim & Lanjutkan
      </button>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Sidebar menu options
const tabItems = computed(() => {
  return [
    { id: 'home', label: 'Beranda', icon: 'bi-grid-fill', routeName: 'dashboard-home' },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: 'bi-clock-history', routeName: 'dashboard-transactions' },
    { id: 'favorites', label: 'Favorit Game', icon: 'bi-heart-fill', routeName: 'dashboard-favorites' },
    { id: 'profile', label: 'Profil Saya', icon: 'bi-person-circle', routeName: 'dashboard-profile' },
    { id: 'settings', label: 'Pengaturan', icon: 'bi-gear-fill', routeName: 'dashboard-settings' }
  ];
});

// Compute activeTab from route name to drive highlight styling
const activeTab = computed(() => {
  if (route.name === 'dashboard-home') return 'home';
  if (route.name === 'dashboard-transactions') return 'transactions';
  if (route.name === 'dashboard-favorites') return 'favorites';
  if (route.name === 'dashboard-profile') return 'profile';
  if (route.name === 'dashboard-settings') return 'settings';
  return 'home';
});

const avatarUploadError = ref('');
const avatarUploadSuccess = ref('');

// Calculations for Level Progression Bar
const xpPercentage = computed(() => {
  const currentLvl = authStore.user?.level || 1;
  const currentXp = authStore.user?.xp || 0;
  const xpNeeded = currentLvl * 100;
  return Math.min(100, Math.max(0, (currentXp / xpNeeded) * 100));
});

// Canvas image crop state
const showCropModal = ref(false);
const cropCanvasRef = ref(null);
const zoomVal = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const cropImage = ref(null);
const uploadingCropped = ref(false);

const onAvatarFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    avatarUploadError.value = 'Format file harus PNG, JPEG, JPG, atau WEBP';
    avatarUploadSuccess.value = '';
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    avatarUploadError.value = 'Ukuran file maksimal 2MB';
    avatarUploadSuccess.value = '';
    return;
  }

  avatarUploadError.value = '';
  avatarUploadSuccess.value = '';
  
  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.src = event.target.result;
    img.onload = () => {
      cropImage.value = img;
      zoomVal.value = 1;
      offsetX.value = 0;
      offsetY.value = 0;
      showCropModal.value = true;
      setTimeout(() => {
        drawCrop();
      }, 50);
    };
  };
  reader.readAsDataURL(file);
};

const drawCrop = () => {
  const canvas = cropCanvasRef.value;
  if (!canvas || !cropImage.value) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 200, 200);

  ctx.save();
  ctx.beginPath();
  ctx.arc(100, 100, 98, 0, Math.PI * 2);
  ctx.clip();

  const img = cropImage.value;
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const minDim = Math.min(iw, ih);

  const sw = minDim / zoomVal.value;
  const sh = minDim / zoomVal.value;

  const maxOffset = (minDim - sw) / 2;
  const sx = (iw - sw) / 2 + Math.max(-maxOffset, Math.min(maxOffset, offsetX.value * (iw / 200)));
  const sy = (ih - sh) / 2 + Math.max(-maxOffset, Math.min(maxOffset, offsetY.value * (ih / 200)));

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, 200, 200);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(100, 100, 98, 0, Math.PI * 2);
  ctx.strokeStyle = '#3ECFCF';
  ctx.lineWidth = 3;
  ctx.stroke();
};

const goToHome = () => {
  router.push('/');
};

const saveCroppedAvatar = () => {
  const canvas = cropCanvasRef.value;
  if (!canvas) return;
  uploadingCropped.value = true;
  avatarUploadError.value = '';
  avatarUploadSuccess.value = '';
  
  canvas.toBlob(async (blob) => {
    if (!blob) {
      uploadingCropped.value = false;
      return;
    }
    const croppedFile = new File([blob], 'avatar.png', { type: 'image/png' });
    const formData = new FormData();
    formData.append('avatar', croppedFile);

    try {
      await authStore.uploadAvatar(formData);
      showCropModal.value = false;
      avatarUploadSuccess.value = 'Foto profil berhasil diperbarui!';
      setTimeout(() => {
        avatarUploadSuccess.value = '';
      }, 4000);
    } catch (err) {
      avatarUploadError.value = err.response?.data?.message || 'Gagal memperbarui foto profil.';
    } finally {
      uploadingCropped.value = false;
    }
  }, 'image/png');
};

onMounted(async () => {
  // Sync check initial auth
  if (!authStore.isAuthenticated) {
    const valid = await authStore.checkAuth();
    if (!valid && !authStore.isAuthenticated) {
      router.push('/auth');
    }
  }
});

// Daily Check-in state & calendar rules
const checkInLoading = ref(false);
const showXpFloat = ref(false);
const xpFloatText = ref('');
const checkInModalError = ref('');
const checkInModalSuccess = ref('');
const voucherCopied = ref(false);

const showMilestoneModal = ref(false);
const milestoneLevel = ref(5);

const claimCanvasRef = ref(null);
const confettiCanvasRef = ref(null);

const hasCheckedInToday = computed(() => {
  if (!authStore.user?.lastCheckIn) return false;
  const lastCheck = new Date(authStore.user.lastCheckIn);
  const now = new Date();
  return lastCheck.toDateString() === now.toDateString();
});

const currentActiveDay = computed(() => {
  if (hasCheckedInToday.value) {
    return null;
  }
  if (!authStore.user?.lastCheckIn) {
    return 1;
  }
  const lastCheck = new Date(authStore.user.lastCheckIn);
  const now = new Date();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d2 = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
  const diffDays = Math.round((d1 - d2) / oneDayMs);
  
  if (diffDays === 1) {
    return ((authStore.user.checkInStreak || 0) % 7) + 1;
  } else {
    return 1;
  }
});

const isCurrentCheckInDay = (day) => {
  return day === currentActiveDay.value;
};

const isDayClaimed = (day) => {
  if (!authStore.user) return false;
  const streak = authStore.user.checkInStreak || 0;
  
  if (hasCheckedInToday.value) {
    return day <= streak;
  } else {
    if (!authStore.user.lastCheckIn) return false;
    const lastCheck = new Date(authStore.user.lastCheckIn);
    const now = new Date();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d2 = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
    const diffDays = Math.round((d1 - d2) / oneDayMs);
    
    if (diffDays === 1) {
      return day <= streak;
    } else {
      return false; // broken streak
    }
  }
};

const getDayXp = (day) => {
  const xpRewards = [10, 15, 20, 25, 30, 40, 50];
  return xpRewards[day - 1];
};

const getCheckInIcon = (day) => {
  if (isDayClaimed(day)) {
    return 'bi-check-circle-fill text-success';
  }
  if (day === 7) return 'bi-gift-fill text-warning';
  return 'bi-lightning-charge-fill text-muted';
};

const triggerCheckIn = async () => {
  if (checkInLoading.value) return;
  checkInLoading.value = true;
  checkInModalError.value = '';
  checkInModalSuccess.value = '';
  try {
    const res = await authStore.dailyCheckIn();
    
    // Play particle burst
    triggerClaimAnimation();
    
    // Show floating XP indicator
    xpFloatText.value = `+${res.xpEarned} XP`;
    showXpFloat.value = true;
    setTimeout(() => {
      showXpFloat.value = false;
    }, 2000);

    checkInModalSuccess.value = res.message || `Berhasil check-in harian! +${res.xpEarned} XP ditambahkan.`;

    // Check if leveled up with milestone
    if (res.leveledUp && res.milestoneReached) {
      milestoneLevel.value = res.milestoneLevel;
      showMilestoneModal.value = true;
      setTimeout(() => {
        triggerConfettiAnimation();
      }, 300);
    }
  } catch (err) {
    console.error(err);
    checkInModalError.value = err.response?.data?.message || 'Check-in gagal. Coba lagi besok!';
  } finally {
    checkInLoading.value = false;
  }
};

const getMilestoneVoucherCode = (lvl) => {
  return `SHINNLVL${lvl}`;
};

const copyVoucherCode = (code) => {
  navigator.clipboard.writeText(code);
  voucherCopied.value = true;
  setTimeout(() => {
    voucherCopied.value = false;
  }, 3000);
};

const triggerClaimAnimation = () => {
  const canvas = claimCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  const particles = [];
  const colors = ['#7B5EA7', '#3ECFCF', '#FFD700', '#FF7F50'];
  
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2 + 80,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 4,
      radius: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008
    });
  }
  
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.alpha -= p.decay;
      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    if (active) {
      requestAnimationFrame(draw);
    }
  };
  draw();
};

const triggerConfettiAnimation = () => {
  const canvas = confettiCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
  const particles = [];
  const colors = ['#FFD700', '#FF1493', '#1E90FF', '#32CD32', '#FF4500'];
  
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * -50,
      vx: (Math.random() - 0.5) * 4,
      vy: Math.random() * 3 + 2,
      w: Math.random() * 8 + 4,
      h: Math.random() * 6 + 3,
      r: Math.random() * 360,
      vr: Math.random() * 4 - 2,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      p.y += p.vy;
      p.x += p.vx;
      p.r += p.vr;
      if (p.y < canvas.height) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    });
    if (active) {
      requestAnimationFrame(draw);
    }
  };
  draw();
};
</script>

<style scoped>
.min-panel-height {
  min-height: 520px;
}

.avatar-container {
  width: 90px;
  height: 90px;
  position: relative;
  margin-bottom: 20px;
}

.avatar-glowing-neon {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3.5px solid var(--color-accent);
  overflow: hidden;
  box-shadow: 0 0 15px rgba(62, 207, 207, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-tertiary);
}

.avatar-letter {
  font-family: var(--font-title);
  font-size: 36px;
  font-weight: 800;
  color: white;
}

.avatar-image-pic {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.level-badge {
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 20px;
  white-space: nowrap;
  letter-spacing: 0.5px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-glow-ring {
  position: absolute;
  top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(123, 94, 167, 0.1) 0%, rgba(0,0,0,0) 70%);
  pointer-events: none;
  z-index: 0;
}

.progression-bar {
  border-radius: 10px;
  overflow: hidden;
}

.bg-gradient-neon-teal {
  background: linear-gradient(90deg, var(--color-primary), var(--color-accent));
  box-shadow: 0 0 8px var(--color-accent);
}

.bg-gradient-neon-purple {
  background: linear-gradient(135deg, var(--color-primary), #a885f2);
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
}

.custom-modal-content {
  position: relative;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid rgba(62, 207, 207, 0.2);
  box-shadow: 0 0 30px rgba(62, 207, 207, 0.15);
}

.custom-slider {
  background: rgba(255, 255, 255, 0.1);
}

.custom-slider::-webkit-slider-thumb {
  background: var(--color-accent);
}

.checkin-modal {
  max-width: 550px;
  background: #0d0f1a;
  border-radius: 20px;
  border: 1px solid rgba(62, 207, 207, 0.25);
  box-shadow: 0 0 40px rgba(62, 207, 207, 0.2);
}

.btn-close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #8A8AAA;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
  z-index: 10;
}

.btn-close-modal:hover {
  color: var(--color-accent);
}

.checkin-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

@media (max-width: 576px) {
  .checkin-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
}

.checkin-day-card-wrapper {
  display: flex;
  flex-direction: column;
}

.checkin-day-card {
  background: rgba(19, 22, 41, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px 8px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.checkin-day-card.claimed {
  background: rgba(123, 94, 167, 0.08);
  border-color: rgba(123, 94, 167, 0.3);
  opacity: 0.85;
}

.checkin-day-card.claimed .gift-icon-container i {
  color: var(--color-accent) !important;
}

.checkin-day-card.active {
  background: rgba(62, 207, 207, 0.1);
  border-color: var(--color-accent);
  box-shadow: 0 0 15px rgba(62, 207, 207, 0.25);
  transform: scale(1.03) translateY(-2px);
}

.checkin-day-card.active .gift-icon-container i {
  color: var(--color-accent) !important;
  text-shadow: 0 0 10px var(--color-accent);
}

.checkin-day-card.day-7 {
  grid-column: span 2;
  background: linear-gradient(135deg, rgba(123, 94, 167, 0.15) 0%, rgba(62, 207, 207, 0.15) 100%);
  border-color: rgba(62, 207, 207, 0.4);
}

@media (max-width: 576px) {
  .checkin-day-card.day-7 {
    grid-column: span 3;
  }
}

.day-num {
  color: #8A8AAA;
  font-weight: 600;
  font-size: 11px;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.checkin-day-card.active .day-num {
  color: var(--color-accent);
  font-weight: bold;
}

.gift-icon-container i {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.checkin-day-card:hover .gift-icon-container i {
  transform: scale(1.1);
}

.day-xp {
  font-size: 12px;
  font-weight: bold;
  color: #ffffff;
}

.checkin-day-card.active .day-xp {
  color: var(--color-accent);
}

.btn-checkin-claim {
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  border: none;
  border-radius: 12px;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(62, 207, 207, 0.3);
}

.btn-checkin-claim:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(62, 207, 207, 0.5);
}

.btn-checkin-claim:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.3) !important;
  box-shadow: none;
  cursor: not-allowed;
}

.alert-success-custom {
  background: rgba(62, 207, 207, 0.1);
  border: 1px solid rgba(62, 207, 207, 0.2);
  color: var(--color-accent);
  border-radius: 12px;
}

.alert-danger-custom {
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  color: #ff6b6b;
  border-radius: 12px;
}

.claim-animation-canvas, .confetti-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 5;
}

.xp-float-indicator {
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
  font-weight: 800;
  color: var(--color-accent);
  text-shadow: 0 0 15px rgba(62, 207, 207, 0.8);
  animation: floatUp 2s cubic-bezier(0.08, 0.82, 0.17, 1) forwards;
  z-index: 1055;
  pointer-events: none;
}

@keyframes floatUp {
  0% {
    opacity: 0;
    transform: translate(-50%, 0) scale(0.8);
  }
  20% {
    opacity: 1;
    transform: translate(-50%, -50px) scale(1.2);
  }
  100% {
    opacity: 0;
    transform: translate(-50%, -150px) scale(1);
  }
}

.milestone-badge-glow {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 215, 0, 0.1);
  border: 2px solid #FFD700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}
</style>
