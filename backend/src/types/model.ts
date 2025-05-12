export interface AIModelMetadata {
  name: string;
  description: string;
  version: string;
  framework: string;  // e.g., "tensorflow", "pytorch", etc.
  inputFormat: string;  // e.g., "image", "text", "audio", etc.
  outputFormat: string;
  accessPoint: {
    type: 'aws' | 'azure' | 'gcp' | 'custom';
    endpoint: string;
    region?: string;
    credentials?: {
      accessKeyId?: string;
      secretAccessKey?: string;
    };
  };
  requirements: {
    minMemory?: number;  // in GB
    minGPU?: boolean;
    minCPUCores?: number;
  };
  pricing: {
    perRequest?: number;
    perHour?: number;
    perMonth?: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ModelListing {
  id: string;
  owner: string;
  price: bigint;
  metadata: AIModelMetadata;
  status: 'active' | 'inactive' | 'sold';
  createdAt: string;
  updatedAt: string;
} 