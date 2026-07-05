import { defineStore } from 'pinia';
import api, { authService } from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Read from localStorage synchronously on creation
    const userVal = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    let initialUser = null;
    try {
      if (userVal) initialUser = JSON.parse(userVal);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
    const tokenVal = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    return {
      user: initialUser,
      isInitialized: !!tokenVal,
      loading: false,
      error: null,
      showCheckInModal: false
    };
  },
  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user && state.user.role === 'admin'
  },
  actions: {
    // Set user data & persist to localStorage
    setUser(user) {
      this.user = user;
      this.isInitialized = true;
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
        }
      }
    },

    // Rehydrate from localStorage
    rehydrate() {
      if (typeof window === 'undefined') return;
      try {
        const userVal = localStorage.getItem('user');
        const tokenVal = localStorage.getItem('authToken');
        if (userVal && tokenVal) {
          this.user = JSON.parse(userVal);
          this.isInitialized = true;
          // Sync cookie for axios request interceptor
          document.cookie = `authToken=${tokenVal}; path=/; max-age=604800; sameSite=strict`;
        }
      } catch (e) {
        console.error('Error rehydrating auth store from localStorage:', e);
      }
    },

    // Registrasi
    async register(username, email, password) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.register(username, email, password);
        if (data.success) {
          this.setUser(data.user);
          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }
        }
        return data;
      } catch (err) {
        // Fallback jika Server Offline / Error Koneksi Jaringan
        if (!err.response) {
          console.warn('Backend offline. Mengaktifkan Demo Mode Registrasi.');
          const mockUser = {
            _id: `mock-user-${Date.now()}`,
            username,
            email: email.toLowerCase(),
            role: 'user',
            avatar: '',
            phone: '',
            points: 0,
            level: 1,
            xp: 0,
            checkInStreak: 0,
            favoriteGames: []
          };
          this.setUser(mockUser);
          localStorage.setItem('authToken', 'mock_token_register_xyz');
          document.cookie = "authToken=mock_token_register_xyz; path=/; max-age=604800; sameSite=strict";
          return { success: true, message: 'Registrasi berhasil (Demo Mode)' };
        }
        this.error = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Login
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.login(email, password);
        if (data.success) {
          this.setUser(data.user);
          if (data.token) {
            localStorage.setItem('authToken', data.token);
          }
        }
        return data;
      } catch (err) {
        // Fallback jika Server Offline / Error Koneksi Jaringan
        if (!err.response) {
          console.warn('Backend offline. Mengaktifkan Demo Mode Login.');
          const role = email.toLowerCase().includes('admin') ? 'admin' : 'user';
          const mockUser = {
            _id: 'mock-client-admin',
            username: email.split('@')[0].toUpperCase(),
            email: email.toLowerCase(),
            role,
            avatar: '',
            phone: '081234567890',
            points: 150,
            level: 1,
            xp: 25,
            checkInStreak: 0,
            favoriteGames: ['mobile-legends']
          };
          this.setUser(mockUser);
          localStorage.setItem('authToken', 'mock_client_token_xyz');
          // Simulasikan cookie untuk frontend demo mode
          document.cookie = "authToken=mock_client_token_xyz; path=/; max-age=604800; sameSite=strict";
          return { success: true, message: 'Login berhasil (Demo Mode)' };
        }
        this.error = err.response?.data?.message || 'Email tidak ditemukan atau password salah.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Logout
    async logout() {
      try {
        await authService.logout();
      } catch (err) {
        console.error('Logout API failed:', err);
      }
      this.setUser(null);
      this.isInitialized = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=strict";
      }
    },

    // Sync profile & check auth
    async checkAuth() {
      try {
        const data = await authService.getProfile();
        if (data.success) {
          this.setUser(data.user);
          return true;
        }
        this.setUser(null);
        this.isInitialized = true;
        return false;
      } catch (err) {
        console.error('Session verification failed:', err);
        
        // Jika server mengembalikan response error (misal 401/403), berarti token tidak valid/habis masa berlaku
        if (err.response) {
          this.setUser(null);
          this.isInitialized = true;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; sameSite=strict";
          }
          return false;
        }

        // Fallback ke localStorage HANYA jika server benar-benar offline (tidak ada response)
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('user');
        if (token && user) {
          this.rehydrate();
          return true;
        }
        this.setUser(null);
        this.isInitialized = true;
        return false;
      }
    },

    // Update profile
    async updateProfile(profileData) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.updateProfile(profileData);
        if (data.success) {
          this.setUser(data.user);
        }
        return data;
      } catch (err) {
        // Fallback jika offline
        if (!err.response) {
          const updatedUser = { ...this.user, ...profileData };
          this.setUser(updatedUser);
          return { success: true, message: 'Profil diperbarui secara lokal (Offline)' };
        }
        this.error = err.response?.data?.message || 'Pembaruan profil gagal.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Upload avatar
    async uploadAvatar(formData) {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.uploadAvatar(formData);
        if (data.success) {
          this.setUser(data.user);
        }
        return data;
      } catch (err) {
        this.error = err.response?.data?.message || 'Gagal mengunggah foto profil.';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    // Toggle favorite game
    async toggleFavorite(gameSlug) {
      if (!this.user) return;
      const favorites = [...(this.user.favoriteGames || [])];
      const index = favorites.indexOf(gameSlug);
      if (index > -1) {
        favorites.splice(index, 1);
      } else {
        favorites.push(gameSlug);
      }
      return await this.updateProfile({ favoriteGames: favorites });
    },

    // Daily check-in
    async dailyCheckIn() {
      this.loading = true;
      this.error = null;
      try {
        const data = await authService.checkIn();
        if (data.success) {
          this.setUser(data.user);
        }
        return data;
      } catch (err) {
        // Fallback offline
        if (!err.response) {
          const now = new Date();
          const xpRewards = [10, 15, 20, 25, 30, 40, 50];
          const lastCheck = this.user.lastCheckIn ? new Date(this.user.lastCheckIn) : null;
          let streak = 1;
          if (lastCheck) {
            const oneDayMs = 24 * 60 * 60 * 1000;
            const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const d2 = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
            const diffDays = Math.round((d1 - d2) / oneDayMs);
            if (diffDays === 1) {
              streak = (this.user.checkInStreak || 0) % 7 + 1;
            } else {
              streak = 1;
            }
          }
          const xpEarned = xpRewards[streak - 1];
          this.user.xp = (this.user.xp || 0) + xpEarned;
          this.user.checkInStreak = streak;
          this.user.lastCheckIn = now;

          let leveledUp = false;
          let milestoneReached = false;
          let milestoneLevel = 0;
          while (true) {
            const xpNeeded = (this.user.level || 1) * 100;
            if (this.user.xp >= xpNeeded) {
              this.user.xp -= xpNeeded;
              this.user.level = (this.user.level || 1) + 1;
              leveledUp = true;
              if (this.user.level % 5 === 0) {
                milestoneReached = true;
                milestoneLevel = this.user.level;
              }
            } else {
              break;
            }
          }
          this.setUser(this.user);
          return {
            success: true,
            message: `Check-in sukses (Demo Mode offline)! +${xpEarned} XP ditambahkan.`,
            xpEarned,
            user: this.user,
            leveledUp,
            milestoneReached,
            milestoneLevel
          };
        }
        this.error = err.response?.data?.message || 'Check-in gagal.';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
