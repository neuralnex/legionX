"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useMarketplace, type MarketplaceFilters } from "@/hooks/useMarketplace"
import AgentCard from "@/components/agents/AgentCard"
import AgentCardSkeleton from "@/components/agents/AgentCardSkeleton"
import { Search, Filter, SlidersHorizontal, ChevronDown, X, AlertCircle } from "lucide-react"

export default function MarketplacePage() {
  const [filters, setFilters] = useState<MarketplaceFilters>({
    page: 1,
    limit: 8,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const { data, isLoading, isError, error } = useMarketplace(filters)

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "knowledge", name: "Knowledge" },
    { id: "coding", name: "Coding" },
    { id: "content", name: "Content" },
    { id: "conversation", name: "Conversation" },
    { id: "data", name: "Data Analysis" },
    { id: "visual", name: "Visual" },
  ]

  const [selectedCategory, setSelectedCategory] = useState("all")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1])
  const [sortOption, setSortOption] = useState<MarketplaceFilters["sortBy"]>("newest")

  useEffect(() => {
    // Update filters when search term changes, with debounce
    const timer = setTimeout(() => {
      if (searchTerm) {
        setFilters((prev) => ({ ...prev, search: searchTerm }))
      } else {
        setFilters((prev) => {
          const newFilters = { ...prev }
          delete newFilters.search
          return newFilters
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    if (category === "all") {
      setFilters((prev) => {
        const newFilters = { ...prev }
        delete newFilters.category
        return newFilters
      })
    } else {
      setFilters((prev) => ({ ...prev, category }))
    }
  }

  const handlePriceChange = (values: [number, number]) => {
    setPriceRange(values)
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }))
  }

  const handleSortChange = (option: MarketplaceFilters["sortBy"]) => {
    setSortOption(option)
    setFilters((prev) => ({ ...prev, sortBy: option }))
  }

  const resetFilters = () => {
    setSelectedCategory("all")
    setPriceRange([0, 1])
    setSortOption("newest")
    setSearchTerm("")
    setFilters({
      page: 1,
      limit: 8,
    })
  }

  // Safe data access with fallbacks
  const listings = data?.listings || []
  const pagination = data?.pagination || null

  console.log("🔍 Marketplace data:", { data, listings, pagination, isLoading, isError, error })

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <h1 className="text-3xl font-bold mb-4 md:mb-0">AI Agent Marketplace</h1>

            <div className="flex flex-col sm:flex-row w-full md:w-auto space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8 overflow-hidden"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-purple-400 hover:text-purple-300 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reset all
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium mb-3">Categories</h3>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            checked={selectedCategory === category.id}
                            onChange={() => handleCategoryChange(category.id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-700 rounded-full bg-gray-800"
                          />
                          <span className="ml-2 text-sm text-gray-300">{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Price Range (ETH)</h3>
                    <div className="px-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-2">
                        <span>{priceRange[0].toFixed(2)}</span>
                        <span>{priceRange[1].toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange([Number.parseFloat(e.target.value), priceRange[1]])}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange([priceRange[0], Number.parseFloat(e.target.value)])}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mt-4"
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-3">Sort By</h3>
                    <div className="relative">
                      <select
                        value={sortOption || "newest"}
                        onChange={(e) => handleSortChange(e.target.value as MarketplaceFilters["sortBy"])}
                        className="block w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <AgentCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-6 py-4 rounded-xl">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 mr-2" />
                <h3 className="font-semibold">Error loading marketplace</h3>
              </div>
              <p className="text-sm mb-4">
                {error?.message || "There was an error loading the marketplace. Please try again later."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : !Array.isArray(listings) || listings.length === 0 ? (
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 text-center">
              <SlidersHorizontal className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No agents found</h3>
              <p className="text-gray-400 mb-4">
                {!Array.isArray(listings)
                  ? "There was an error loading the agents data."
                  : "Try adjusting your filters or search term"}
              </p>
              <button
                onClick={resetFilters}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <AgentCard key={listing.id} listing={listing} />
                ))}
              </div>

              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center mt-12">
                  <nav className="flex items-center space-x-2">
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                      disabled={(filters.page || 1) <= 1}
                      className="px-3 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: pagination.pages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setFilters((prev) => ({ ...prev, page: index + 1 }))}
                        className={`px-3 py-2 rounded-md ${
                          (filters.page || 1) === index + 1
                            ? "bg-purple-600 text-white"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setFilters((prev) => ({
                          ...prev,
                          page: Math.min(pagination.pages, (prev.page || 1) + 1),
                        }))
                      }
                      disabled={(filters.page || 1) >= pagination.pages}
                      className="px-3 py-2 rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
