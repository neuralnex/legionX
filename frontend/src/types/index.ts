export interface User {
  id: string;
  name: string;
  email: string;
  walletAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'SALE' | 'RENT';
  category: 'GAMING' | 'WORKSTATION' | 'MINING';
  specifications: {
    [key: string]: string;
  };
  images: string[];
  seller: User;
  buyer?: User;
  status: 'AVAILABLE' | 'SOLD' | 'RENTED';
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  listingId: string;
  userId: string;
  type: 'subscription' | 'full';
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  createdAt: string;
  updatedAt: string;
  listing?: Listing;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
} 