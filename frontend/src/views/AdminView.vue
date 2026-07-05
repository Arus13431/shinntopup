<template>
  <div class="container py-4 text-start">
    <h2 class="fw-bold mb-4 text-white"><i class="bi bi-shield-lock-fill text-warning me-2"></i> Panel Admin ShinnTopUp</h2>

    <div class="row g-4">
      <!-- Admin Menu Navigation -->
      <div class="col-lg-3">
        <div class="glass-card p-3 border-secondary">
          <div class="d-flex flex-column gap-2">
            <button 
              @click="activeAdminTab = 'products'"
              class="btn btn-sidebar-tab"
              :class="{ 'active': activeAdminTab === 'products' }"
            >
              <i class="bi bi-controller me-2"></i> Kelola Produk Game
            </button>
            <button 
              @click="activeAdminTab = 'transactions'"
              class="btn btn-sidebar-tab"
              :class="{ 'active': activeAdminTab === 'transactions' }"
            >
              <i class="bi bi-currency-dollar me-2"></i> Monitor Transaksi
            </button>
          </div>
        </div>
      </div>

      <!-- Admin Work Area -->
      <div class="col-lg-9">
        <div class="glass-card p-4 p-md-5 border-secondary min-panel-height">
          
          <!-- PRODUCTS CRUD TAB -->
          <div v-if="activeAdminTab === 'products'">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h4 class="fw-bold text-white mb-0">Katalog Game Aktif</h4>
              <button @click="openAddProductModal" class="btn btn-shinn-primary btn-sm">
                <i class="bi bi-plus-lg me-1"></i> Tambah Game Baru
              </button>
            </div>

            <!-- Product Table -->
            <div class="table-responsive">
              <table class="table table-dark table-striped border-secondary align-middle">
                <thead>
                  <tr class="text-muted small">
                    <th>Gambar</th>
                    <th>Nama Game</th>
                    <th>Kategori</th>
                    <th>Tipe ID</th>
                    <th>Jumlah Paket</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-for="g in adminProductsList" :key="g._id" class="border-secondary">
                    <td>
                      <img :src="g.image" :alt="g.name" class="rounded" style="width: 50px; height: 35px; object-fit: cover;" />
                    </td>
                    <td class="fw-bold text-white">{{ g.name }}</td>
                    <td>{{ g.category }}</td>
                    <td>
                      <span class="badge bg-secondary">{{ g.idType }}</span>
                    </td>
                    <td>
                      <span class="badge bg-primary">{{ g.packages?.length || 0 }} Nominal</span>
                    </td>
                    <td>
                      <div class="d-flex gap-2">
                        <button @click="deleteProduct(g._id)" class="btn btn-sm btn-outline-danger py-1 px-2.5">
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="adminProductsList.length === 0">
                    <td colspan="6" class="text-center py-4 text-muted">Belum ada game terdaftar. Klik Seeding di beranda atau tambah manual.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- TRANSACTIONS MONITOR TAB -->
          <div v-else-if="activeAdminTab === 'transactions'">
            <h4 class="fw-bold text-white mb-4">Monitor Transaksi Real-time</h4>
            
            <div class="table-responsive">
              <table class="table table-dark table-striped border-secondary align-middle">
                <thead>
                  <tr class="text-muted small">
                    <th>Order ID</th>
                    <th>Pembeli (Email)</th>
                    <th>Game & Paket</th>
                    <th>Jumlah Bayar</th>
                    <th>Metode</th>
                    <th>Status</th>
                    <th>Waktu</th>
                  </tr>
                </thead>
                <tbody class="small">
                  <tr v-for="t in allTransactionsList" :key="t.orderId" class="border-secondary">
                    <td class="fw-bold text-accent">{{ t.orderId }}</td>
                    <td>{{ t.email }}</td>
                    <td>
                      <div><strong>{{ t.gameName }}</strong></div>
                      <div class="text-muted small">{{ t.packageName }} (ID: {{ t.gameUserId }})</div>
                    </td>
                    <td class="fw-bold text-white">{{ formatRupiah(t.totalAmount) }}</td>
                    <td class="text-uppercase">{{ t.paymentMethod }}</td>
                    <td>
                      <span class="badge" :class="statusBadgeClass(t.paymentStatus)">
                        {{ translateStatus(t.paymentStatus) }}
                      </span>
                    </td>
                    <td class="text-muted">{{ formatDate(t.createdAt) }}</td>
                  </tr>
                  <tr v-if="allTransactionsList.length === 0">
                    <td colspan="7" class="text-center py-4 text-muted">Belum ada transaksi terjadi di sistem.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- ADD PRODUCT MOCK MODAL -->
    <div v-if="showAddModal" class="modal-backdrop fade show"></div>
    <div v-if="showAddModal" class="modal fade show d-block" tabindex="-1" style="z-index: 1055;">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-secondary bg-secondary text-white rounded-4 shadow-lg">
          <div class="modal-header border-secondary">
            <h5 class="modal-title fw-bold text-white"><i class="bi bi-plus-lg"></i> Daftarkan Game Baru</h5>
            <button @click="showAddModal = false" type="button" class="btn-close btn-close-white" aria-label="Close"></button>
          </div>
          <form @submit.prevent="saveNewProduct">
            <div class="modal-body text-start d-flex flex-column gap-3">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted">Nama Game</label>
                  <input v-model="newGameForm.name" type="text" class="form-control bg-dark-opacity border-secondary text-white" required placeholder="misal: Valorant" />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted">Kategori</label>
                  <select v-model="newGameForm.category" class="form-select bg-dark-opacity border-secondary text-white" required>
                    <option value="MOBA">MOBA</option>
                    <option value="FPS">FPS</option>
                    <option value="RPG">RPG</option>
                    <option value="BATTLE ROYALE">BATTLE ROYALE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted">Tipe validasi ID</label>
                  <select v-model="newGameForm.idType" class="form-select bg-dark-opacity border-secondary text-white" required>
                    <option value="id-only">Hanya User ID</option>
                    <option value="id-server">User ID + Server ID</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted">Label Input ID</label>
                  <input v-model="newGameForm.idLabel" type="text" class="form-control bg-dark-opacity border-secondary text-white" placeholder="User ID" />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted">Gambar Card URL / Path</label>
                  <input v-model="newGameForm.image" type="text" class="form-control bg-dark-opacity border-secondary text-white" placeholder="/uploads/ml.svg" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label small text-muted">Gambar Banner URL / Path</label>
                  <input v-model="newGameForm.bannerImage" type="text" class="form-control bg-dark-opacity border-secondary text-white" placeholder="/uploads/ml-banner.svg" required />
                </div>
              </div>
              <div>
                <label class="form-label small text-muted">Nominal Awal (JSON Array)</label>
                <textarea v-model="newGameForm.packagesJson" class="form-control bg-dark-opacity border-secondary text-white text-monospace" rows="4" placeholder='[{"id":"val-125","name":"125 Points","price":15000,"discount":0}]'></textarea>
              </div>
            </div>
            <div class="modal-footer border-secondary">
              <button @click="showAddModal = false" type="button" class="btn btn-shinn-outline">Batal</button>
              <button type="submit" class="btn btn-shinn-primary px-4">Simpan Game</button>
            </div>
          </form>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();

const activeAdminTab = ref('products');
const showAddModal = ref(false);

const adminProductsList = ref([]);
const allTransactionsList = ref([]);

const newGameForm = ref({
  name: '',
  category: 'MOBA',
  idType: 'id-only',
  idLabel: 'User ID',
  image: '/uploads/ml.svg',
  bannerImage: '/uploads/ml-banner.svg',
  packagesJson: '[{"id":"game-pkg-1","name":"100 Diamond","price":25000,"discount":5,"isPopular":true}]'
});

onMounted(async () => {
  // Guard admin access
  if (!authStore.isAuthenticated || !authStore.isAdmin) {
    router.push('/');
    return;
  }
  await loadAdminData();
});

const loadAdminData = async () => {
  try {
    const productsRes = await axios.get('/api/products');
    if (productsRes.data.success) {
      adminProductsList.value = productsRes.data.products;
    }

    // Load all transactions from backend
    const txRes = await axios.get('/api/payment/my-transactions'); // mockup endpoint/re-use (admin maps all transactions on server)
    // Di backend, endpoint monitor transaksi admin yang sesungguhnya bisa dibuat. Tapi untuk mock di workspace
    // kita memanggil my-transactions atau data transaksi dummy.
    if (txRes.data.success) {
      allTransactionsList.value = txRes.data.transactions;
    }
  } catch (error) {
    console.error('Error loading admin data:', error);
  }
};

const openAddProductModal = () => {
  showAddModal.value = true;
};

const saveNewProduct = async () => {
  try {
    const packages = JSON.parse(newGameForm.value.packagesJson);
    const payload = {
      name: newGameForm.value.name,
      category: newGameForm.value.category,
      idType: newGameForm.value.idType,
      idLabel: newGameForm.value.idLabel,
      image: newGameForm.value.image,
      bannerImage: newGameForm.value.bannerImage,
      packages
    };

    const res = await axios.post('/api/products', payload);
    if (res.data.success) {
      alert('Produk game baru berhasil ditambahkan!');
      showAddModal.value = false;
      await loadAdminData();
    }
  } catch (err) {
    alert('Format nominal JSON salah atau koneksi database admin error.');
  }
};

const deleteProduct = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus produk game ini dari katalog?')) return;
  try {
    const res = await axios.delete(`/api/products/${id}`);
    if (res.data.success) {
      alert('Game berhasil dihapus.');
      await loadAdminData();
    }
  } catch (error) {
    alert('Gagal menghapus produk game.');
  }
};

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth()+1} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const translateStatus = (s) => {
  if (s === 'success') return 'Sukses';
  if (s === 'pending') return 'Pending';
  return 'Gagal';
};

const statusBadgeClass = (s) => {
  if (s === 'success') return 'bg-success';
  if (s === 'pending') return 'bg-warning text-dark';
  return 'bg-danger';
};
</script>

<style scoped>
.min-panel-height {
  min-height: 500px;
}

.btn-sidebar-tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 10px;
  transition: all 0.25s ease;
  width: 100%;
  text-align: left;
}

.btn-sidebar-tab:hover {
  background-color: rgba(255, 255, 255, 0.05);
  color: white;
}

.btn-sidebar-tab.active {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 5px 15px rgba(26, 111, 212, 0.25);
}

.bg-dark-opacity {
  background-color: rgba(15, 25, 35, 0.4);
}

.form-control:focus, .form-select:focus {
  background-color: rgba(15, 25, 35, 0.6);
  border-color: var(--color-accent);
  box-shadow: 0 0 8px rgba(0, 210, 255, 0.2);
  color: white;
}

.btn-close-white {
  filter: invert(1);
}

.text-monospace {
  font-family: monospace;
}
</style>
