// Authentication Types
export interface User {
  id: string
  username: string
  email: string
  wallet?: string
  hasAnalyticsAccess: boolean
  analyticsExpiry?: string | null
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
  modelType: string
  capabilities: string[]
  parameters: { [key: string]: any }
  apiEndpoint?: string
  accessToken?: string
  pricing: {
    subscription?: {
      monthly: number
      yearly: number
    }
    oneTime?: number
  }
  requirements: {
    minMemory: number
    minStorage: number
    dependencies: string[]
  }
}

// Listing Types
export interface Listing {
  id: string
  title: string
  description: string
  price: number
  type: string
  features?: string[]
  requirements?: {
    minTokens?: number
    apiKey?: boolean
  }
  images: string[]
  seller: {
    id: string
    username: string
  }
  assetId?: string
  ownerAddress?: string
  isPremium: boolean
  premiumExpiry?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateListingRequest {
  title: string
  description: string
  price: number
  type: string
  features?: string[]
  requirements?: {
    minTokens?: number
    apiKey?: boolean
  }
  images?: string[]
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

// Purchase Types
export interface Purchase {
  id: string
  listing: {
    id: string
    title: string
    price: number
    seller?: {
      id: string
      username: string
    }
  }
  buyer: {
    id: string
    username: string
  }
  status: "pending" | "completed" | "failed" | "cancelled"
  amount: number
  txHash?: string | null
  confirmations?: number | null
  createdAt: string
  updatedAt: string
}

export interface CreatePurchaseRequest {
  listingId: string
  paymentMethod: "wallet"
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

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
}

// API Response wrapper
export interface APIResponse<T> {
  data?: T
  error?: APIError["error"]
}
