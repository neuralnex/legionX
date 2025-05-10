import axios from 'axios';
import type { AxiosRequestConfig } from 'axios/index';
import { AuthResponse, Listing, ApiResponse } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return response.data.data;
  },

  register: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password });
    return response.data.data;
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await api.get<ApiResponse<AuthResponse>>('/auth/me');
    return response.data.data;
  },

  linkWallet: async (walletAddress: string): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/link-wallet', { walletAddress });
    return response.data.data;
  },
};

export const listingService = {
  getListings: async (): Promise<Listing[]> => {
    const response = await api.get<ApiResponse<Listing[]>>('/listings');
    return response.data.data;
  },

  getListing: async (id: string): Promise<Listing> => {
    const response = await api.get<ApiResponse<Listing>>(`/listings/${id}`);
    return response.data.data;
  },

  createListing: async (formData: FormData): Promise<Listing> => {
    const response = await api.post<ApiResponse<Listing>>('/listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  updateListing: async (id: string, formData: FormData): Promise<Listing> => {
    const response = await api.put<ApiResponse<Listing>>(`/listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  deleteListing: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/listings/${id}`);
  },

  purchaseListing: async (listingId: string, type: 'subscription' | 'full'): Promise<Listing> => {
    const response = await api.post<ApiResponse<Listing>>('/listings/purchase', { listingId, type });
    return response.data.data;
  },

  getMyListings: async (): Promise<Listing[]> => {
    const response = await api.get<ApiResponse<Listing[]>>('/listings/my');
    return response.data.data;
  },
};

export const purchaseService = {
  getPurchases: async () => {
    const response = await api.get('/purchases');
    return response.data;
  },

  getPurchase: async (id: string) => {
    const response = await api.get(`/purchases/${id}`);
    return response.data;
  },
};

export default api; 