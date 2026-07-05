import { createRouter, createWebHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { useAuthStore } from '../stores/auth';

// Lazy loading views untuk optimasi performa
const HomeView = () => import('../views/HomeView.vue');
const ProductDetailView = () => import('../views/ProductDetailView.vue');
const CheckoutView = () => import('../views/CheckoutView.vue');
const PaymentProcessingView = () => import('../views/PaymentProcessingView.vue');
const PaymentSuccessView = () => import('../views/PaymentSuccessView.vue');
const PaymentFailedView = () => import('../views/PaymentFailedView.vue');
const AuthView = () => import('../views/AuthView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const DashboardHome = () => import('../views/dashboard/DashboardHome.vue');
const DashboardTransactions = () => import('../views/dashboard/DashboardTransactions.vue');
const DashboardFavorites = () => import('../views/dashboard/DashboardFavorites.vue');
const DashboardProfile = () => import('../views/dashboard/DashboardProfile.vue');
const DashboardSettings = () => import('../views/dashboard/DashboardSettings.vue');
const AdminView = () => import('../views/AdminView.vue');
const CheckTransactionView = () => import('../views/CheckTransactionView.vue');
const VoucherView = () => import('../views/VoucherView.vue');
const HelpView = () => import('../views/HelpView.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: { title: 'ShinnTopUp - Platform Top-Up Game Tercepat' }
  },
  {
    path: '/topup/:gameSlug',
    name: 'ProductDetail',
    component: ProductDetailView,
    meta: { title: 'Top-Up Game' }
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: CheckoutView,
    meta: { title: 'Checkout Pembayaran - ShinnTopUp' }
  },
  {
    path: '/payment/:orderId',
    name: 'PaymentProcessing',
    component: PaymentProcessingView,
    meta: { title: 'Memproses Pembayaran - ShinnTopUp' }
  },
  {
    path: '/payment/:orderId/success',
    name: 'PaymentSuccess',
    component: PaymentSuccessView,
    meta: { title: 'Pembayaran Sukses - ShinnTopUp' }
  },
  {
    path: '/failed/:orderId',
    name: 'PaymentFailed',
    component: PaymentFailedView,
    meta: { title: 'Pembayaran Gagal - ShinnTopUp' }
  },
  {
    path: '/auth',
    name: 'Auth',
    component: AuthView,
    meta: { title: 'Masuk atau Daftar - ShinnTopUp' }
  },
  {
    path: '/dashboard',
    component: DashboardView,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard-home',
        component: DashboardHome,
        meta: { title: 'Dashboard Saya - ShinnTopUp', requiresAuth: true }
      },
      {
        path: 'transactions',
        name: 'dashboard-transactions',
        component: DashboardTransactions,
        meta: { title: 'Riwayat Transaksi - ShinnTopUp', requiresAuth: true }
      },
      {
        path: 'favorites',
        name: 'dashboard-favorites',
        component: DashboardFavorites,
        meta: { title: 'Game Favorit - ShinnTopUp', requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'dashboard-profile',
        component: DashboardProfile,
        meta: { title: 'Profil Saya - ShinnTopUp', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'dashboard-settings',
        component: DashboardSettings,
        meta: { title: 'Pengaturan Akun - ShinnTopUp', requiresAuth: true }
      }
    ]
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { 
      title: 'Panel Admin - ShinnTopUp',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/transaction/check',
    name: 'CheckTransaction',
    component: CheckTransactionView,
    meta: { title: 'Cek Status Transaksi - ShinnTopUp' }
  },
  {
    path: '/voucher',
    name: 'Voucher',
    component: VoucherView,
    meta: { title: 'Voucher & Promo Aktif - ShinnTopUp' }
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpView,
    meta: { title: 'Pusat Bantuan FAQ - ShinnTopUp' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

// NProgress Configuration
NProgress.configure({ showSpinner: false, ease: 'ease', speed: 500 });

// Global Router Guards
router.beforeEach(async (to, from, next) => {
  NProgress.start();

  const authStore = useAuthStore();

  // Inisialisasi session dari cookie sebelum evaluasi rute
  if (!authStore.isInitialized) {
    await authStore.checkAuth();
  }
  
  // Set Title halaman dinamis
  document.title = to.meta.title || 'ShinnTopUp';

  // Proteksi rute otentikasi
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      NProgress.done();
      return next({ name: 'Auth', query: { redirect: to.fullPath } });
    }

    // Proteksi rute admin khusus
    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      NProgress.done();
      return next({ name: 'Home' });
    }
  }

  // Jika user sudah login mencoba membuka rute Auth, redirect ke dashboard
  if (to.name === 'Auth' && authStore.isAuthenticated) {
    NProgress.done();
    return next({ name: 'dashboard-home' });
  }

  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router;
