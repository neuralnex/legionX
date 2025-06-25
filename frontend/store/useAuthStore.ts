import { create } from 'zustand';
import { authAPI } from '@/lib/api';
import type { User } from '@/types/api';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  registerWeb2: (data: Web2RegisterRequest) => Promise<void>;
  loginWeb2: (data: Web2LoginRequest) => Promise<void>;
  logout: () => void;
}

interface RegisterRequest {
  email: string;
}

interface LoginRequest {
  email: string;
}

interface Web2RegisterRequest {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface Web2LoginRequest {
  email: string;
  password: string;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  register: async (data) => {
    try {
      console.log('📝 Auth Store: Register', data);
      const response = await authAPI.register(data);

      const token = response.data.token || response.data.accessToken;
      if (!token) {
        throw new Error('Registration failed: No token received from server.');
      }

      localStorage.setItem('token', token);
      localStorage.removeItem('legionx_logout');
      set({
        isAuthenticated: true,
        user: response.data.user,
        token: token,
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
      const response = await authAPI.loginWithEmail(data);
      
      const token = response.data.token || response.data.accessToken;
      if (!token) {
        throw new Error('Login failed: No token received from server.');
      }
      
      localStorage.setItem('token', token);
      localStorage.removeItem('legionx_logout');
      set({
        isAuthenticated: true,
        user: response.data.user,
        token: token,
      });
      console.log('✅ Login successful in store');
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Login failed');
    }
  },
  registerWeb2: async (data) => {
    try {
      console.log('📝 Auth Store: Web2 Register', data);
      const response = await authAPI.registerWeb2(data);

      const token = response.data.accessToken || response.data.token;
      if (!token) {
        throw new Error('Web2 Registration failed: No token received from server.');
      }

      localStorage.setItem('token', token);
      localStorage.removeItem('legionx_logout');
      set({
        isAuthenticated: true,
        user: response.data.user,
        token: token,
      });
      console.log('✅ Web2 Registration successful in store');
    } catch (error: any) {
      console.error('❌ Web2 Registration error:', error);
      throw new Error(
        error.response?.data?.error?.message || 'Web2 Registration failed'
      );
    }
  },
  loginWeb2: async (data) => {
    try {
      console.log('📝 Auth Store: Web2 Login', data);
      const response = await authAPI.login(data);
      
      const token = response.data.accessToken || response.data.token;
      if (!token) {
        throw new Error('Web2 Login failed: No token received from server.');
      }
      
      localStorage.setItem('token', token);
      localStorage.removeItem('legionx_logout');
      set({
        isAuthenticated: true,
        user: response.data.user,
        token: token,
      });
      console.log('✅ Web2 Login successful in store');
    } catch (error: any) {
      console.error('❌ Web2 Login error:', error);
      throw new Error(error.response?.data?.error?.message || error.message || 'Web2 Login failed');
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.setItem('legionx_logout', 'true');
    set({ isAuthenticated: false, user: null, token: null });
  },
}));
