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

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
})

// Request interceptor to add auth token and log requests
api.interceptors.request.use(
  (config) => {
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
      console.log("🔑 Added auth token to request")
    }
    return config
  },
  (error) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling and logging
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response Success:", {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      data: response.data,
      headers: response.headers,
    })
    return response
  },
  (error) => {
    console.error("❌ API Response Error:", {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      responseData: error.response?.data,
      responseHeaders: error.response?.headers,
      requestData: error.config?.data,
      isNetworkError: !error.response,
      isTimeoutError: error.code === "ECONNABORTED",
    })

    if (error.response?.status === 401) {
      console.log("🔒 401 Unauthorized - clearing auth state")
      // Import dynamically to avoid circular dependency
      import("../store/useAuthStore").then((module) => {
        const useAuthStore = module.default
        useAuthStore.getState().logout()
      })
    }
    return Promise.reject(error)
  },
)

// Authentication API
export const authAPI = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log("📝 Auth API - Register called with:", data)
    try {
      const response = await api.post<AuthResponse>("/auth/register", data)
      console.log("✅ Register response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Register error:", error)
      throw error
    }
  },

  loginWithWallet: async (data: WalletLoginRequest): Promise<AuthResponse> => {
    console.log("🔑 Auth API - Login with wallet called with:", data)
    console.log("🌐 API Base URL:", process.env.NEXT_PUBLIC_API_URL)
    console.log("🔗 Full login URL:", `${process.env.NEXT_PUBLIC_API_URL}/auth/login/wallet`)

    try {
      const response = await api.post<AuthResponse>("/auth/login/wallet", data)
      console.log("✅ Login with wallet response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Login with wallet error:", error)
      throw error
    }
  },

  linkWallet: async (data: LinkWalletRequest): Promise<AuthResponse> => {
    console.log("🔗 Auth API - Link wallet called with:", data)
    try {
      const response = await api.post<AuthResponse>("/auth/link-wallet", data)
      console.log("✅ Link wallet response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Link wallet error:", error)
      throw error
    }
  },

  verifyToken: async (): Promise<{ message: string; user: User }> => {
    console.log("🔍 Auth API - Verify token called")
    try {
      const response = await api.get("/auth/verify")
      console.log("✅ Verify token response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Verify token error:", error)
      throw error
    }
  },

  getProfile: async (): Promise<{ user: User }> => {
    console.log("👤 Auth API - Get profile called")
    try {
      const response = await api.get("/auth/profile")
      console.log("✅ Get profile response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get profile error:", error)
      throw error
    }
  },
}

// Listings API
export const listingsAPI = {
  create: async (data: CreateListingRequest): Promise<Listing> => {
    console.log("📝 Listings API - Create called with:", data)
    try {
      const response = await api.post<Listing>("/listings", data)
      console.log("✅ Create listing response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Create listing error:", error)
      throw error
    }
  },

  getAll: async (params?: ListingsQuery): Promise<ListingsResponse> => {
    console.log("📋 Listings API - Get all called with params:", params)
    try {
      const response = await api.get<ListingsResponse>("/listings", { params })
      console.log("✅ Get all listings response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get all listings error:", error)
      throw error
    }
  },

  getById: async (id: string): Promise<Listing> => {
    console.log("🔍 Listings API - Get by ID called with:", id)
    try {
      const response = await api.get<Listing>(`/listings/${id}`)
      console.log("✅ Get listing by ID response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get listing by ID error:", error)
      throw error
    }
  },

  update: async (id: string, data: Partial<CreateListingRequest>): Promise<Listing> => {
    console.log("✏️ Listings API - Update called with:", { id, data })
    try {
      const response = await api.put<Listing>(`/listings/${id}`, data)
      console.log("✅ Update listing response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Update listing error:", error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    console.log("🗑️ Listings API - Delete called with:", id)
    try {
      await api.delete(`/listings/${id}`)
      console.log("✅ Delete listing successful")
    } catch (error) {
      console.error("❌ Delete listing error:", error)
      throw error
    }
  },
}

// Purchases API
export const purchasesAPI = {
  create: async (data: CreatePurchaseRequest): Promise<Purchase> => {
    console.log("💳 Purchases API - Create called with:", data)
    try {
      const response = await api.post<Purchase>("/purchases", data)
      console.log("✅ Create purchase response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Create purchase error:", error)
      throw error
    }
  },

  getAll: async (params?: PurchasesQuery): Promise<PurchasesResponse> => {
    console.log("📋 Purchases API - Get all called with params:", params)
    try {
      const response = await api.get<PurchasesResponse>("/purchases", { params })
      console.log("✅ Get all purchases response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get all purchases error:", error)
      throw error
    }
  },

  getById: async (id: string): Promise<Purchase> => {
    console.log("🔍 Purchases API - Get by ID called with:", id)
    try {
      const response = await api.get<Purchase>(`/purchases/${id}`)
      console.log("✅ Get purchase by ID response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get purchase by ID error:", error)
      throw error
    }
  },

  update: async (id: string, data: UpdatePurchaseRequest): Promise<Purchase> => {
    console.log("✏️ Purchases API - Update called with:", { id, data })
    try {
      const response = await api.put<Purchase>(`/purchases/${id}`, data)
      console.log("✅ Update purchase response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Update purchase error:", error)
      throw error
    }
  },

  confirm: async (id: string): Promise<Purchase> => {
    console.log("✅ Purchases API - Confirm called with:", id)
    try {
      const response = await api.post<Purchase>(`/purchases/${id}/confirm`)
      console.log("✅ Confirm purchase response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Confirm purchase error:", error)
      throw error
    }
  },
}

// Premium API
export const premiumAPI = {
  getFeatures: async (): Promise<PremiumFeaturesResponse> => {
    console.log("⭐ Premium API - Get features called")
    try {
      const response = await api.get<PremiumFeaturesResponse>("/premium/features")
      console.log("✅ Get premium features response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get premium features error:", error)
      throw error
    }
  },

  purchasePremiumListing: async (listingId: string): Promise<{ message: string }> => {
    console.log("💎 Premium API - Purchase premium listing called with:", listingId)
    try {
      const response = await api.post(`/premium/listing/${listingId}`)
      console.log("✅ Purchase premium listing response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Purchase premium listing error:", error)
      throw error
    }
  },

  subscribeToAnalytics: async (): Promise<{ message: string }> => {
    console.log("📊 Premium API - Subscribe to analytics called")
    try {
      const response = await api.post("/premium/analytics/subscribe")
      console.log("✅ Subscribe to analytics response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Subscribe to analytics error:", error)
      throw error
    }
  },
}

// Access Control API
export const accessAPI = {
  getMetadata: async (assetId: string): Promise<AssetMetadata> => {
    console.log("📋 Access API - Get metadata called with:", assetId)
    try {
      const response = await api.get<AssetMetadata>(`/access/metadata/${assetId}`)
      console.log("✅ Get metadata response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Get metadata error:", error)
      throw error
    }
  },

  verifyAccess: async (assetId: string): Promise<AccessVerification> => {
    console.log("🔐 Access API - Verify access called with:", assetId)
    try {
      const response = await api.get<AccessVerification>(`/access/verify/${assetId}`)
      console.log("✅ Verify access response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Verify access error:", error)
      throw error
    }
  },
}

// Health Check
export const healthAPI = {
  check: async (): Promise<{ status: string }> => {
    console.log("🏥 Health API - Check called")
    try {
      const response = await api.get("/health")
      console.log("✅ Health check response:", response.data)
      return response.data
    } catch (error) {
      console.error("❌ Health check error:", error)
      throw error
    }
  },
}

// Add environment variable logging
console.log("🌐 API Configuration:", {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  nodeEnv: process.env.NODE_ENV,
  allEnvVars: Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC_")),
})

export default api
