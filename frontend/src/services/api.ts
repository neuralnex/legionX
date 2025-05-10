import axios from 'axios';
import { AuthResponse, Listing, ApiResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
  linkWallet: async (data: { walletAddress: string }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/link-wallet', data);
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const listingService = {
  getListings: async (params?: any): Promise<ApiResponse<Listing[]>> => {
    const response = await api.get<ApiResponse<Listing[]>>('/listings', { params });
    return response.data;
  },
  getListing: async (id: string): Promise<ApiResponse<Listing>> => {
    const response = await api.get<ApiResponse<Listing>>(`/listings/${id}`);
    return response.data;
  },
  createListing: async (data: FormData): Promise<ApiResponse<Listing>> => {
    const response = await api.post<ApiResponse<Listing>>('/listings', data);
    return response.data;
  },
  updateListing: async (id: string, data: FormData): Promise<ApiResponse<Listing>> => {
    const response = await api.put<ApiResponse<Listing>>(`/listings/${id}`, data);
    return response.data;
  },
  deleteListing: async (id: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/listings/${id}`);
    return response.data;
  },
  getMyListings: async (): Promise<ApiResponse<Listing[]>> => {
    const response = await api.get<ApiResponse<Listing[]>>('/listings/my');
    return response.data;
  },
  purchaseListing: async (id: string): Promise<ApiResponse<Listing>> => {
    const response = await api.post<ApiResponse<Listing>>(`/listings/${id}/purchase`);
    return response.data;
  },
};

export const purchaseService = {
  createPurchase: async (data: { listingId: string; type: 'subscription' | 'full' }) => {
    const response = await api.post('/purchases', data);
    return response.data;
  },
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