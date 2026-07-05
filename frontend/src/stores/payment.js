import { defineStore } from 'pinia';
import axios from 'axios';

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    loading: false,
    error: null,
    currentOrderId: '',
    currentStatus: ''
  }),
  actions: {
    // Membuat Transaksi di Backend & memanggil Snap popup
    async processPayment(checkoutData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.post('/api/payment/create-transaction', checkoutData);
        const responseData = response.data.data;
        this.currentOrderId = responseData.orderId;
        
        return responseData;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal memulai transaksi. Silakan coba lagi.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Polling Status Transaksi
    async checkTransactionStatus(orderId) {
      try {
        const response = await axios.get(`/api/payment/status/${orderId}`);
        if (response.data.success) {
          this.currentStatus = response.data.status;
          return response.data;
        }
      } catch (err) {
        console.error('Error checking transaction status:', err);
        throw err;
      }
    },

    // Simulasikan Sukses Pembayaran
    async simulateSuccess(orderId) {
      try {
        const response = await axios.post(`/api/payment/simulate-success/${orderId}`);
        return response.data;
      } catch (err) {
        console.error('Error simulating payment success:', err);
        throw err;
      }
    }
  }
});
