import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { listingsAPI, purchasesAPI, premiumAPI } from "@/lib/api"
import type {
  Listing,
  CreateListingRequest,
  ListingsQuery,
  Purchase,
  CreatePurchaseRequest,
  PremiumFeature,
} from "@/types/api"

// Marketplace Listings
export function useMarketplace(filters: ListingsQuery = {}) {
  return useQuery({
    queryKey: ["marketplace", filters],
    queryFn: () => listingsAPI.getAll(filters),
    staleTime: 60_000, // 1 minute
    placeholderData: {
      listings: [
        {
          id: "1",
          title: "CodeCraft Pro",
          description:
            "An AI agent specialized in writing clean, efficient code across multiple programming languages.",
          price: 0.25,
          type: "coding",
          features: ["Code Generation", "Debugging", "Optimization"],
          images: ["/placeholder.svg?height=400&width=400"],
          seller: {
            id: "101",
            username: "Ella Smith",
          },
          isPremium: true,
          isActive: true,
          createdAt: "2023-09-15T10:30:00Z",
          updatedAt: "2023-09-15T10:30:00Z",
        },
        {
          id: "2",
          title: "Data Sage",
          description: "Expert in data analysis, visualization, and extracting insights from complex datasets.",
          price: 0.18,
          type: "data-analysis",
          features: ["Data Analysis", "Visualization", "Insights"],
          images: ["/placeholder.svg?height=400&width=400"],
          seller: {
            id: "102",
            username: "Alex Kim",
          },
          isPremium: false,
          isActive: true,
          createdAt: "2023-09-14T10:30:00Z",
          updatedAt: "2023-09-14T10:30:00Z",
        },
        {
          id: "3",
          title: "Text Genius",
          description:
            "Specialized in content creation, copywriting, and text analysis with advanced language understanding.",
          price: 0.15,
          type: "content",
          features: ["Content Creation", "Copywriting", "Text Analysis"],
          images: ["/placeholder.svg?height=400&width=400"],
          seller: {
            id: "103",
            username: "Omar Hassan",
          },
          isPremium: false,
          isActive: true,
          createdAt: "2023-09-13T10:30:00Z",
          updatedAt: "2023-09-13T10:30:00Z",
        },
        {
          id: "4",
          title: "Pixel Muse",
          description: "Creative AI for generating and editing images, designs, and visual content.",
          price: 0.22,
          type: "visual",
          features: ["Image Generation", "Design", "Visual Content"],
          images: ["/placeholder.svg?height=400&width=400"],
          seller: {
            id: "104",
            username: "Lily Lane",
          },
          isPremium: true,
          isActive: true,
          createdAt: "2023-09-12T10:30:00Z",
          updatedAt: "2023-09-12T10:30:00Z",
        },
      ],
      pagination: {
        total: 4,
        page: 1,
        limit: 8,
        pages: 1,
      },
    },
    // Add error handling
    retry: (failureCount, error) => {
      console.error("❌ Marketplace query error:", error)
      return failureCount < 2
    },
  })
}

export function useListingDetail(id: string) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => listingsAPI.getById(id),
    staleTime: 60_000, // 1 minute
    enabled: !!id,
    retry: (failureCount, error) => {
      console.error("❌ Listing detail query error:", error)
      return failureCount < 2
    },
  })
}

export function useCreateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateListingRequest) => listingsAPI.create(data),
    onSuccess: (response) => {
      // Handle the new response structure
      queryClient.invalidateQueries({ queryKey: ["marketplace"] })
      console.log("✅ Listing created successfully:", response.message)
    },
    onError: (error) => {
      console.error("❌ Failed to create listing:", error)
    },
  })
}

export function useUpdateListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateListingRequest> }) => listingsAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["listing", id] })
      queryClient.invalidateQueries({ queryKey: ["marketplace"] })
    },
    onError: (error) => {
      console.error("❌ Failed to update listing:", error)
    },
  })
}

export function useDeleteListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => listingsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] })
    },
    onError: (error) => {
      console.error("❌ Failed to delete listing:", error)
    },
  })
}

// Purchases
export function usePurchases(filters: { page?: number; limit?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["purchases", filters],
    queryFn: () => purchasesAPI.getAll(filters),
    staleTime: 30_000, // 30 seconds
    retry: (failureCount, error) => {
      console.error("❌ Purchases query error:", error)
      return failureCount < 2
    },
  })
}

export function usePurchaseDetail(id: string) {
  return useQuery({
    queryKey: ["purchase", id],
    queryFn: () => purchasesAPI.getById(id),
    staleTime: 30_000, // 30 seconds
    enabled: !!id,
    retry: (failureCount, error) => {
      console.error("❌ Purchase detail query error:", error)
      return failureCount < 2
    },
  })
}

export function useCreatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePurchaseRequest) => purchasesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
    },
    onError: (error) => {
      console.error("❌ Failed to create purchase:", error)
    },
  })
}

export function useUpdatePurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status?: "pending" | "completed" | "failed" | "cancelled"; txHash?: string; confirmations?: number } }) =>
      purchasesAPI.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["purchase", id] })
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
    },
    onError: (error) => {
      console.error("❌ Failed to update purchase:", error)
    },
  })
}

export function useConfirmPurchase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => purchasesAPI.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["purchase", id] })
      queryClient.invalidateQueries({ queryKey: ["purchases"] })
    },
    onError: (error) => {
      console.error("❌ Failed to confirm purchase:", error)
    },
  })
}

// Premium Features
export function usePremiumFeatures() {
  return useQuery({
    queryKey: ["premium-features"],
    queryFn: () => premiumAPI.getFeatures(),
    staleTime: 300_000, // 5 minutes
    retry: (failureCount, error) => {
      console.error("❌ Premium features query error:", error)
      return failureCount < 2
    },
  })
}

export function useAnalyticsFeatures() {
  return useQuery({
    queryKey: ["analytics-features"],
    queryFn: () => premiumAPI.getAnalyticsFeatures(),
    staleTime: 300_000, // 5 minutes
    retry: (failureCount, error) => {
      console.error("❌ Analytics features query error:", error)
      return failureCount < 2
    },
  })
}

export function usePurchasePremiumListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (listingId: string) => premiumAPI.purchasePremiumListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketplace"] })
    },
    onError: (error) => {
      console.error("❌ Failed to purchase premium listing:", error)
    },
  })
}

export function useSubscribeToAnalytics() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => premiumAPI.subscribeToAnalytics(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
    },
    onError: (error) => {
      console.error("❌ Failed to subscribe to analytics:", error)
    },
  })
}

// Legacy compatibility - keeping the old interface for existing components
export function useAgentDetail(id: string) {
  const { data, isLoading, isError, error } = useListingDetail(id)

  // Transform the listing data to match the old agent interface
  const transformedData = data
    ? {
        ...data,
        creator: data.seller,
        image: data.images?.[0] || "/placeholder.svg?height=400&width=400",
        likes: 0, // This would need to be added to the backend
        capabilities: data.features || [],
        modelType: data.type,
        version: "1.0.0", // Default version
        requirements: {
          minMemory: data.requirements?.minTokens || 4,
          minStorage: 2,
          dependencies: ["Node.js"],
        },
      }
    : null

  return {
    data: transformedData,
    isLoading,
    isError,
    error: error || (isError ? new Error("Failed to load agent details") : null),
  }
}

export function useAgentCreation() {
  return useCreateListing()
}

// Export types for components
export type { Listing as Agent, CreateListingRequest, Purchase, PremiumFeature }

// Add marketplace filters type
export interface MarketplaceFilters extends ListingsQuery {
  category?: string
  sortBy?: "newest" | "oldest" | "price_asc" | "price_desc"
}
