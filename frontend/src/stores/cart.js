import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    selectedGame: null,       // { name, slug, image, bannerImage }
    checkedUser: {
      userId: '',
      serverId: '',
      nickname: ''
    },
    selectedPackage: null,     // { id, name, price, discount }
    selectedPaymentMethod: null, // { id, name, logo }
    guestEmail: ''
  }),
  getters: {
    hasActiveCheckout: (state) => 
      state.selectedGame && 
      state.checkedUser.nickname && 
      state.selectedPackage &&
      state.guestEmail,
    discountedPrice: (state) => {
      if (!state.selectedPackage) return 0;
      const discount = state.selectedPackage.discount || 0;
      return Math.round(state.selectedPackage.price * (1 - (discount / 100)));
    },
    adminFee: () => 1500,
    totalAmount() {
      return this.discountedPrice + this.adminFee;
    }
  },
  actions: {
    setCheckoutItem({ game, user, packageItem, paymentMethod, email }) {
      this.selectedGame = game;
      this.checkedUser = user;
      this.selectedPackage = packageItem;
      this.selectedPaymentMethod = paymentMethod;
      this.guestEmail = email;
    },
    clearCart() {
      this.selectedGame = null;
      this.checkedUser = { userId: '', serverId: '', nickname: '' };
      this.selectedPackage = null;
      this.selectedPaymentMethod = null;
      this.guestEmail = '';
    }
  }
});
