import axios from "axios"
import type {
  AuthResponse,
  RegisterRequest,
  WalletLoginRequest,
  LinkWalletRequest,
  User,
  Listing,
  CreateListingRequest,
  ListingsResponse,
  ListingsQuery,
  Purchase,
  CreatePurchaseRequest,
  UpdatePurchaseRequest,
  PurchasesResponse,
  PurchasesQuery,
  PremiumFeaturesResponse,
  AssetMetadata,
  AccessVerification,
} from "@/types/api"

// Log environment configuration
console.log("🌐 API Configuration:", {
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://legionx.onrender.com",
  environment: process.env.NODE_ENV,
  timestamp: new Date().toISOString(),
})

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://legionx.onrender.com",
  headers: { "Content-Type": "application/json" },
})

// Request interceptor to add auth token and log requests
api.interceptors.request.use((config) => {
  console.log("🚀 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    fullURL: `${config.baseURL}${config.url}`,
    headers: config.headers,
    data: config.data,
  })

  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      dataType: typeof response.data,
      dataPreview: typeof response.data === "string" ? response.data.substring(0, 200) + "..." : response.data,
      headers: response.headers,
    })
    return response
  },
  (error) => {
    console.error("❌ API Response Error:", {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestConfig: {
        method: error.config?.method,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      },
    })

    // Check for common network errors
    if (error.code === "ECONNREFUSED") {
      console.error("🔌 Network Error: Connection refused - API server may be down")
    } else if (error.code === "ENOTFOUND") {
      console.error("🌐 Network Error: DNS lookup failed - check API URL")
    } else if (error.message.includes("Network Error")) {
      console.error("🌐 Network Error: Possible CORS issue or server unreachable")
    }

    if (error.response?.status === 401) {
      // Import dynamically to avoid circular dependency
      import("../store/useAuthStore").then((module) => {
        const { useAuthStore } = module
        useAuthStore.getState().logout()
      })
    }
    return Promise.reject(error)
  },
)

// Health Check API
export const healthAPI = {
  check: async (): Promise<{ status: string }> => {
    console.log("❤️ Health API: Check request")
    const response = await api.get("/health")
    return response.data
  },
}

// API Root
export const rootAPI = {
  getRoot: async (): Promise<any> => {
    console.log("🏠 API Root: Get request")
    const response = await api.get("/")
    return response.data
  },
}

// Authentication API
export const authAPI = {
  login: async (data: { wallet: string; signature: string }): Promise<AuthResponse> => {
    console.log("🔐 Auth API: Login request", { wallet: data.wallet })
    const response = await api.post<AuthResponse>("/api/v1/auth/login", data)
    return response.data
  },

  getProfile: async (): Promise<{ user: User }> => {
    console.log("🔐 Auth API: Get profile request")
    const response = await api.get("/api/v1/auth/profile")
    return response.data
  },

  // Updated to use correct backend endpoints
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log("🔐 Auth API: Register request", { wallet: data.wallet })
    const response = await api.post<AuthResponse>("/api/v1/auth/register", data)
    return response.data
  },

  loginWithWallet: async (data: WalletLoginRequest): Promise<AuthResponse> => {
    console.log("🔐 Auth API: Wallet login request", {
      wallet: data.wallet,
      hasRewardAddress: !!data.rewardAddress,
    })
    const response = await api.post<AuthResponse>("/api/v1/auth/login/wallet", data)
    return response.data
  },

  linkWallet: async (data: LinkWalletRequest): Promise<AuthResponse> => {
    console.log("🔐 Auth API: Link wallet request", { wallet: data.wallet })
    const response = await api.post<AuthResponse>("/api/v1/auth/link-wallet", data)
    return response.data
  },

  verifyToken: async (): Promise<{ message: string; user: User }> => {
    console.log("🔐 Auth API: Verify token request")
    const response = await api.get("/api/v1/auth/verify")
    return response.data
  },
}

// Listings API
export const listingsAPI = {
  create: async (data: CreateListingRequest): Promise<{ listing: Listing; message: string }> => {
    console.log("📝 Listings API: Create request", { title: data.title })
    const response = await api.post<{ listing: Listing; message: string }>("/api/v1/listings", data)
    return response.data
  },

  getById: async (id: string): Promise<Listing> => {
    console.log("📄 Listings API: Get by ID request", { id })
    const response = await api.get<Listing>(`/api/v1/listings/${id}`)
    return response.data
  },

  update: async (id: string, data: Partial<CreateListingRequest>): Promise<Listing> => {
    console.log("✏️ Listings API: Update request", { id, data })
    const response = await api.put<Listing>(`/api/v1/listings/${id}`, data)
    return response.data
  },

  delete: async (id: string): Promise<void> => {
    console.log("🗑️ Listings API: Delete request", { id })
    await api.delete(`/api/v1/listings/${id}`)
  },

  // Updated to use correct backend endpoint
  getAll: async (params?: ListingsQuery): Promise<ListingsResponse> => {
    console.log("📋 Listings API: Get all request", { params })
    const response = await api.get<ListingsResponse>("/api/v1/listings", { params })

    // Additional validation for listings response
    if (typeof response.data === "string") {
      console.error("❌ Listings API returned HTML instead of JSON:", {
        responseType: typeof response.data,
        contentStart: (response.data as string).substring(0, 500),
        possibleCauses: [
          "Wrong API endpoint URL",
          "API server returning error page",
          "CORS preflight returning HTML",
          "API not properly configured",
        ],
      })
      throw new Error("API returned HTML instead of JSON - check your NEXT_PUBLIC_API_URL configuration")
    }

    return response.data
  },
}

// Purchases API
export const purchasesAPI = {
  create: async (data: CreatePurchaseRequest): Promise<Purchase> => {
    console.log("💳 Purchases API: Create request", { listingId: data.listingId })
    const response = await api.post<Purchase>("/api/v1/purchases", data)
    return response.data
  },

  getById: async (id: string): Promise<Purchase> => {
    console.log("📄 Purchases API: Get by ID request", { id })
    const response = await api.get<Purchase>(`/api/v1/purchases/${id}`)
    return response.data
  },

  getUserPurchases: async (userId: string): Promise<PurchasesResponse> => {
    console.log("📋 Purchases API: Get user purchases request", { userId })
    const response = await api.get<PurchasesResponse>(`/api/v1/purchases/user/${userId}`)
    return response.data
  },

  // Updated to use correct backend endpoints
  getAll: async (params?: PurchasesQuery): Promise<PurchasesResponse> => {
    console.log("📋 Purchases API: Get all request", { params })
    const response = await api.get<PurchasesResponse>("/api/v1/purchases", { params })
    return response.data
  },

  update: async (id: string, data: UpdatePurchaseRequest): Promise<Purchase> => {
    console.log("✏️ Purchases API: Update request", { id, data })
    const response = await api.put<Purchase>(`/api/v1/purchases/${id}`, data)
    return response.data
  },

  confirm: async (id: string): Promise<Purchase> => {
    console.log("✅ Purchases API: Confirm request", { id })
    const response = await api.post<Purchase>(`/api/v1/purchases/${id}/confirm`)
    return response.data
  },
}

// Premium API
export const premiumAPI = {
  getFeatures: async (): Promise<PremiumFeaturesResponse> => {
    console.log("⭐ Premium API: Get features request")
    const response = await api.get<PremiumFeaturesResponse>("/api/v1/premium/features")
    return response.data
  },

  getAnalyticsFeatures: async (): Promise<PremiumFeaturesResponse> => {
    console.log("📊 Premium API: Get analytics features request")
    const response = await api.get<PremiumFeaturesResponse>("/api/v1/premium/analytics/features")
    return response.data
  },

  purchasePremiumListing: async (listingId: string): Promise<{ message: string }> => {
    console.log("⭐ Premium API: Purchase premium listing request", { listingId })
    const response = await api.post(`/api/v1/premium/listing/${listingId}`)
    return response.data
  },

  subscribeToAnalytics: async (): Promise<{ message: string }> => {
    console.log("📊 Premium API: Subscribe to analytics request")
    const response = await api.post("/api/v1/premium/analytics/subscribe")
    return response.data
  },
}

// Access Control API
export const accessAPI = {
  getMetadata: async (assetId: string): Promise<AssetMetadata> => {
    console.log("🔍 Access API: Get metadata request", { assetId })
    const response = await api.get<AssetMetadata>(`/api/v1/access/metadata/${assetId}`)
    return response.data
  },

  verifyAccess: async (assetId: string): Promise<AccessVerification> => {
    console.log("🔐 Access API: Verify access request", { assetId })
    const response = await api.get<AccessVerification>(`/api/v1/access/verify/${assetId}`)
    return response.data
  },
}

// IPFS API
export const ipfsAPI = {
  uploadFile: async (file: File): Promise<{ cid: string; ipfsHash: string; gatewayUrl: string }> => {
    console.log("📤 IPFS API: Upload file", { fileName: file.name, size: file.size })
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<{ success: boolean; cid: string; ipfsHash: string; gatewayUrl: string }>(
      "/api/v1/ipfs/upload-file",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data
  },

  uploadMetadata: async (metadata: any, imageCid: string, options: { name: string; description: string }): Promise<{ cid: string; ipfsHash: string; gatewayUrl: string }> => {
    console.log("📤 IPFS API: Upload metadata", { name: options.name })
    const response = await api.post<{ success: boolean; cid: string; ipfsHash: string; gatewayUrl: string }>(
      "/api/v1/ipfs/upload-metadata",
      { modelMetadata: metadata, imageCid, options }
    )
    return response.data
  },

  getFile: async (cid: string): Promise<{ data: any; contentType: string }> => {
    console.log("📥 IPFS API: Get file", { cid })
    const response = await api.get<{ success: boolean; data: any; contentType: string }>(`/api/v1/ipfs/file/${cid}`)
    return response.data
  },

  getMetadata: async (cid: string): Promise<{ metadata: any }> => {
    console.log("📥 IPFS API: Get metadata", { cid })
    const response = await api.get<{ success: boolean; metadata: any }>(`/api/v1/ipfs/metadata/${cid}`)
    return response.data
  },
}

export default api
