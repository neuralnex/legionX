import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import type { User } from '@/types/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  loginWithSignature: (data: { wallet: string; signature: string }) => Promise<void>;
  logout: () => void;
  registerWithWallet: (email: string, wallet: string) => Promise<void>;
}

interface RegisterRequest {
  email: string;
  wallet: string;
}

interface LoginRequest {
  wallet: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  register: async (data) => {
    try {
      console.log('📝 Auth Store: Register', data);
      const response = await authAPI.register(data);

      localStorage.setItem('token', response.token);
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      });
      console.log('✅ Registration successful in store');
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      throw new Error(
        error.response?.data?.error?.message || 'Registration failed'
      );
    }
  },
  login: async (data) => {
    try {
      console.log('📝 Auth Store: Login', data);
      const response = await authAPI.loginWithWallet(data);

      localStorage.setItem('token', response.token);
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      });
      console.log('✅ Login successful in store');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  },
  loginWithSignature: async (data) => {
    try {
      console.log('📝 Auth Store: Login with signature', data);
      const response = await authAPI.login(data);

      localStorage.setItem('token', response.token);
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      });
      console.log('✅ Login with signature successful in store');
    } catch (error: any) {
      console.error('❌ Login with signature error:', error);
      throw new Error(error.response?.data?.error?.message || 'Login failed');
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ isAuthenticated: false, user: null, token: null });
  },
  registerWithWallet: async (email: string, wallet: string) => {
    try {
      console.log('📝 Auth Store: Register with wallet', { email, wallet });
      const data: RegisterRequest = { email, wallet };
      const response = await authAPI.register(data);

      localStorage.setItem('token', response.token);
      set({
        isAuthenticated: true,
        user: response.user,
        token: response.token,
      });
      console.log('✅ Registration successful in store');
    } catch (error: any) {
      console.error('❌ Wallet registration error:', error);
      throw new Error(
        error.response?.data?.error?.message || 'Wallet registration failed'
      );
    }
  },
}));
