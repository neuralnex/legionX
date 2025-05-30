import { create } from "zustand"
import { persist } from "zustand/middleware"
import { authAPI } from "@/lib/api"
import type { User, RegisterRequest, WalletLoginRequest } from "@/types/api"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  token: string | null
  loginWithWallet: (wallet: string, rewardAddress?: string) => Promise<void>
  registerWithWallet: (wallet: string, rewardAddress?: string) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<User>) => void
  verifyToken: () => Promise<boolean>
  getProfile: () => Promise<void>
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      loginWithWallet: async (wallet: string, rewardAddress?: string) => {
        console.log("🔑 Auth Store - loginWithWallet called with:", { wallet, rewardAddress })
        console.log("🌐 Environment check:", {
          apiUrl: process.env.NEXT_PUBLIC_API_URL,
          nodeEnv: process.env.NODE_ENV,
        })

        try {
          const data: WalletLoginRequest = { wallet, rewardAddress }
          console.log("📤 Sending login request with data:", data)

          const response = await authAPI.loginWithWallet(data)
          console.log("📥 Login response received:", response)

          console.log("💾 Storing token in localStorage:", response.token)
          localStorage.setItem("token", response.token)

          console.log("🔄 Updating auth state with:", {
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          })

          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          })

          console.log("✅ Auth store state updated successfully")
        } catch (error: any) {
          console.error("❌ Wallet login error in auth store:", {
            error,
            message: error.message,
            response: error.response,
            request: error.request,
            config: error.config,
            stack: error.stack,
          })

          // Check if it's a network error
          if (!error.response) {
            console.error("🌐 Network Error Details:", {
              isNetworkError: true,
              errorCode: error.code,
              errorMessage: error.message,
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
              possibleCauses: [
                "API server is not running",
                "CORS issues",
                "Invalid API URL",
                "Network connectivity issues",
                "Firewall blocking requests",
              ],
            })
          }

          throw new Error(error.response?.data?.error?.message || error.message || "Wallet login failed")
        }
      },

      registerWithWallet: async (wallet: string, rewardAddress?: string) => {
        console.log("📝 Auth Store - registerWithWallet called with:", { wallet, rewardAddress })

        try {
          // Generate a placeholder email for API compatibility
          const email = `${wallet.slice(0, 8)}@wallet.local`
          const data: RegisterRequest = { email, wallet }
          console.log("📤 Sending register request with data:", data)

          const response = await authAPI.register(data)
          console.log("📥 Register response received:", response)

          console.log("💾 Storing token in localStorage:", response.token)
          localStorage.setItem("token", response.token)

          console.log("🔄 Updating auth state with:", {
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          })

          set({
            isAuthenticated: true,
            user: response.user,
            token: response.token,
          })

          console.log("✅ Auth store registration completed successfully")
        } catch (error: any) {
          console.error("❌ Wallet registration error in auth store:", {
            error,
            message: error.message,
            response: error.response,
            request: error.request,
            config: error.config,
            stack: error.stack,
          })

          // Check if it's a network error
          if (!error.response) {
            console.error("🌐 Network Error Details:", {
              isNetworkError: true,
              errorCode: error.code,
              errorMessage: error.message,
              apiUrl: process.env.NEXT_PUBLIC_API_URL,
            })
          }

          throw new Error(error.response?.data?.error?.message || error.message || "Wallet registration failed")
        }
      },

      verifyToken: async (): Promise<boolean> => {
        console.log("🔍 Auth Store - verifyToken called")

        try {
          const token = localStorage.getItem("token")
          console.log("🔑 Token from localStorage:", token ? "exists" : "not found")

          if (!token) {
            console.log("❌ No token found, setting unauthenticated state")
            set({ isAuthenticated: false, user: null, token: null })
            return false
          }

          console.log("📤 Verifying token with API...")
          const response = await authAPI.verifyToken()
          console.log("📥 Token verification response:", response)

          console.log("🔄 Updating auth state with verified user")
          set({
            isAuthenticated: true,
            user: response.user,
            token,
          })

          console.log("✅ Token verification successful")
          return true
        } catch (error: any) {
          console.error("❌ Token verification error:", {
            error,
            message: error.message,
            response: error.response,
          })

          console.log("🧹 Clearing invalid token and auth state")
          localStorage.removeItem("token")
          set({ isAuthenticated: false, user: null, token: null })
          return false
        }
      },

      getProfile: async () => {
        console.log("👤 Auth Store - getProfile called")

        try {
          const response = await authAPI.getProfile()
          console.log("📥 Get profile response:", response)

          console.log("🔄 Updating user in auth state")
          set({ user: response.user })

          console.log("✅ Profile updated successfully")
        } catch (error: any) {
          console.error("❌ Get profile error:", {
            error,
            message: error.message,
            response: error.response,
          })
          throw new Error(error.response?.data?.error?.message || error.message || "Failed to get profile")
        }
      },

      logout: () => {
        console.log("🚪 Auth Store - logout called")
        console.log("🧹 Removing token from localStorage")
        localStorage.removeItem("token")

        console.log("🔄 Clearing auth state")
        set({ isAuthenticated: false, user: null, token: null })

        console.log("✅ Logout completed")
      },

      updateUser: (userData: Partial<User>) => {
        console.log("👤 Auth Store - updateUser called with:", userData)
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }))
        console.log("✅ User updated in auth state")
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    },
  ),
)

export default useAuthStore
