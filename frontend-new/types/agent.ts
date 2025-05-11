export interface Agent {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'subscription' | 'ownership';
  creator: string;
  imageUrl?: string;
  metadata?: {
    capabilities: string[];
    requirements: string[];
    version: string;
    lastUpdated: string;
  };
} 