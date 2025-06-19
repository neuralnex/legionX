// Authentication Types
export interface User {
  id: string
  address?: string
  name?: string
  email?: string
  avatar?: string
  wallet?: string
  isVerified: boolean
  verificationTxHash?: string
  isPremium: boolean
  premiumExpiry?: string | null
  premiumTxHash?: string
  hasAnalyticsAccess: boolean
  analyticsExpiry?: string | null
  analyticsTxHash?: string
  createdAt: string
  updatedAt: string
}

export interface RegisterRequest {
  email: string
  wallet: string
}

export interface WalletLoginRequest {
  wallet: string
  rewardAddress?: string
}

export interface LinkWalletRequest {
  email: string
  wallet: string
}

export interface AuthResponse {
  message: string
  token: string
  user: User
}

// AI Model Metadata (matches backend AIModelMetadata)
export interface AIModelMetadata {
  name: string
  description: string
  version: string
  framework: string
  inputFormat: string
  outputFormat: string
  accessPoint: {
    type: 'aws' | 'azure' | 'gcp' | 'custom'
    endpoint: string
    region?: string
    credentials?: {
      accessKeyId?: string
      secretAccessKey?: string
    }
  }
  requirements: {
    minMemory?: number
    minGPU?: boolean
    minCPUCores?: number
  }
  pricing: {
    perRequest?: number
    perHour?: number
    perMonth?: number
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

// Agent Types (matches backend Agent entity)
export interface Agent {
  id: number
  name: string
  description: string
  modelVersion: string
  metadataUri: string
  creator: User
  listings: Listing[]
  createdAt: string
  updatedAt: string
}

// Listing Types - Updated to match backend Listing entity
export interface Listing {
  id: string
  seller: User
  agent: Agent
  price: string // BigInt as string for precision
  fullPrice?: string // BigInt as string for full purchase price
  duration: number // Subscription duration in months
  subscriptionId?: string
  modelMetadata: AIModelMetadata
  txHash: string
  confirmations?: number
  metadataUri: string
  status: 'pending' | 'active' | 'sold' | 'cancelled'
  title: string
  description: string
  assetId: string
  ownerAddress: string
  isPremium: boolean
  premiumExpiry?: string | null
  premiumTxHash?: string
  isActive: boolean
  listingFeeTxHash?: string
  createdAt: string
  updatedAt: string
}

// Updated CreateListingRequest to match backend expectations
export interface CreateListingRequest {
  agentId: string
  price: string // BigInt as string
  duration: number
  modelMetadata: AIModelMetadata
  title: string
  description: string
  assetId: string
  ownerAddress: string
}

export interface ListingsResponse {
  listings: Listing[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface ListingsQuery {
  page?: number
  limit?: number
  type?: string
  minPrice?: number
  maxPrice?: number
  search?: string
}

// Purchase Types - Updated to match backend Purchase entity
export interface Purchase {
  id: string
  listing: Listing
  buyer: User
  status: "pending" | "completed" | "failed" | "cancelled"
  amount: string // BigInt as string
  txHash?: string | null
  confirmations?: number | null
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseRequest {
  listingId: string
  paymentMethod?: "wallet"
}

export interface UpdatePurchaseRequest {
  status?: "pending" | "completed" | "failed" | "cancelled"
  txHash?: string
  confirmations?: number
}

export interface PurchasesResponse {
  purchases: Purchase[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export interface PurchasesQuery {
  page?: number
  limit?: number
  status?: string
}

// Premium Types
export interface PremiumFeature {
  id: string
  name: string
  description: string
  price: number
}

export interface PremiumFeaturesResponse {
  features: PremiumFeature[]
}

// Access Control Types
export interface AssetMetadata {
  metadata: {
    name: string
    description: string
    attributes: Array<{
      trait_type: string
      value: string
    }>
  }
}

export interface AccessVerification {
  hasAccess: boolean
}

// Error Types
export interface APIError {
  error: {
    code: string
    message: string
    details?: { [key: string]: string }
  }
}

// Response Types
export interface APIResponse<T> {
  data?: T
  error?: APIError["error"]
}

// Pagination Types
export interface PaginationParams {
  page?: number
  limit?: number
}
