export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  token: string;
  walletAddress?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  type: 'SALE' | 'RENT';
  category: 'GAMING' | 'WORKSTATION' | 'MINING';
  price: {
    subscription: number;
    full: number;
  };
  images: string[];
  specifications: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    motherboard: string;
    powerSupply: string;
  };
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
} 