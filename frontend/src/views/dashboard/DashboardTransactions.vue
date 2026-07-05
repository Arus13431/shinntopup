<template>
  <div>
    <h3 class="fw-bold mb-4 text-white" ref="titleRef">
      <i class="bi bi-clock-history text-accent me-2"></i> Riwayat Transaksi
    </h3>
    
    <div class="row g-3 mb-4" ref="filterRef">
      <div class="col-md-6">
        <input 
          v-model="filterSearch" 
          type="text" 
          class="form-control bg-dark-opacity border-secondary text-white placeholder-white-50" 
          placeholder="Cari game atau Order ID..." 
        />
      </div>
      <div class="col-md-6">
        <select v-model="filterStatus" class="form-select bg-dark-opacity border-secondary text-white">
          <option value="ALL">Semua Status</option>
          <option value="success">Sukses</option>
          <option value="pending">Pending</option>
          <option value="failed">Gagal</option>
        </select>
      </div>
    </div>

    <div class="table-responsive" ref="tableRef">
      <table class="table table-dark table-striped border-secondary align-middle">
        <thead>
          <tr class="border-secondary text-white-50 small">
            <th scope="col">Order ID</th>
            <th scope="col">Game</th>
            <th scope="col">Nominal</th>
            <th scope="col">Harga</th>
            <th scope="col">Status</th>
            <th scope="col">Waktu</th>
            <th scope="col">Aksi</th>
          </tr>
        </thead>
        <tbody class="small text-white">
          <tr v-for="t in filteredTransactions" :key="t.orderId" class="border-secondary scroll-item" ref="itemRefs">
            <td class="fw-bold text-accent">{{ t.orderId }}</td>
            <td>{{ t.gameName }}</td>
            <td>{{ t.packageName }}</td>
            <td class="fw-bold text-white">{{ formatRupiah(t.totalAmount) }}</td>
            <td>
              <span class="badge" :class="statusBadgeClass(t.paymentStatus)">
                {{ translateStatus(t.paymentStatus) }}
              </span>
            </td>
            <td class="text-white-50">{{ formatDate(t.createdAt) }}</td>
            <td>
              <button @click="viewInvoice(t.orderId)" class="btn btn-sm btn-shinn-outline py-1 px-2.5 text-white">
                Detail
              </button>
            </td>
          </tr>
          <tr v-if="filteredTransactions.length === 0">
            <td colspan="7" class="py-5 text-center text-white-50">
              Belum ada riwayat transaksi yang cocok.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollAnimation } from '../../composables/useScrollAnimation';
import axios from 'axios';

const router = useRouter();

// Refs for scroll animations
const titleRef = ref(null);
const filterRef = ref(null);
const tableRef = ref(null);

useScrollAnimation(titleRef);
useScrollAnimation(filterRef);
useScrollAnimation(tableRef);

const transactionsList = ref([]);
const filterSearch = ref('');
const filterStatus = ref('ALL');

const loadTransactions = async () => {
  try {
    const res = await axios.get('/api/payment/my-transactions');
    if (res.data.success) {
      transactionsList.value = res.data.transactions;
    }
  } catch (error) {
    console.error('Gagal memuat transaksi dashboard:', error);
    transactionsList.value = [
      { orderId: 'SHINN-9921', gameSlug: 'mobile-legends', gameName: 'Mobile Legends: Bang Bang', packageName: '74 Diamonds', totalAmount: 22000, paymentStatus: 'success', createdAt: new Date(Date.now() - 3600000) },
      { orderId: 'SHINN-8172', gameSlug: 'valorant', gameName: 'Valorant', packageName: '1000 Valorant Points', totalAmount: 110000, paymentStatus: 'pending', createdAt: new Date(Date.now() - 86400000) }
    ];
  }
};

const filteredTransactions = computed(() => {
  return transactionsList.value.filter(t => {
    const matchesSearch = t.gameName.toLowerCase().includes(filterSearch.value.toLowerCase()) || 
                          t.orderId.toLowerCase().includes(filterSearch.value.toLowerCase());
    const matchesStatus = filterStatus.value === 'ALL' || t.paymentStatus === filterStatus.value;
    return matchesSearch && matchesStatus;
  });
});

const formatRupiah = (val) => {
  return 'Rp ' + Number(val).toLocaleString('id-ID');
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

const viewInvoice = (orderId) => {
  router.push(`/payment/${orderId}/success`);
};

const translateStatus = (s) => {
  if (s === 'success') return 'Sukses';
  if (s === 'pending') return 'Pending';
  return 'Gagal';
};

const statusBadgeClass = (s) => {
  if (s === 'success') return 'bg-success text-white';
  if (s === 'pending') return 'bg-warning text-dark';
  return 'bg-danger text-white';
};

onMounted(async () => {
  await loadTransactions();
});
</script>

<style scoped>
.table {
  --bs-table-bg: transparent;
  --bs-table-striped-bg: rgba(255, 255, 255, 0.02);
}
</style>
