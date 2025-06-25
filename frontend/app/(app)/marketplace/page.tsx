"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  ChevronDown,
  Star,
  TrendingUp
} from 'lucide-react'
import AgentCard from '@/components/agents/AgentCard'
import { useToast } from '@/hooks/use-toast'

interface Listing {
  id: string
  title: string
  description: string
  price: string
  type: string
  seller: {
    id: string
    name: string
    email: string
  }
  metadata?: any
  ipfsHash?: string
  createdAt: string
}

interface MarketplaceData {
  listings: Listing[]
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

export default function MarketplacePage() {
  const { toast } = useToast()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        ...(searchTerm && { search: searchTerm }),
        ...(selectedType && { type: selectedType }),
        ...(sortBy && { sortBy })
      })

      const response = await fetch(`/api/listings?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }

      const data: MarketplaceData = await response.json()
      setListings(data.listings)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching listings:', error)
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [currentPage, searchTerm, selectedType, sortBy])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? '' : type)
    setCurrentPage(1)
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    setCurrentPage(1)
  }

  const getStats = () => {
    const totalListings = listings.length
    const agents = listings.filter(l => l.type === 'agent').length
    const models = listings.filter(l => l.type === 'model').length
    const totalValue = listings.reduce((sum, l) => sum + parseFloat(l.price), 0)
    
    return { totalListings, agents, models, totalValue }
  }

  const stats = getStats()

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Marketplace</h1>
          <p className="text-gray-400">Discover and purchase AI agents and models</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Listings</p>
                  <p className="text-2xl font-bold">{stats.totalListings}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Agents</p>
                  <p className="text-2xl font-bold">{stats.agents}</p>
                </div>
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">A</span>
            </div>
          </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">AI Models</p>
                  <p className="text-2xl font-bold">{stats.models}</p>
                </div>
                <div className="h-8 w-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">M</span>
                    </div>
                  </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                  <div>
                  <p className="text-gray-400 text-sm">Total Value</p>
                  <p className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
                      </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search agents and models..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white"
                      />
                    </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              {/* Type Filter */}
              <div className="flex gap-1">
                <Button
                  variant={selectedType === 'agent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter('agent')}
                  className={selectedType === 'agent' ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
                >
                  Agents
                </Button>
                <Button
                  variant={selectedType === 'model' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeFilter('model')}
                  className={selectedType === 'model' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
                >
                  Models
                </Button>
                  </div>

              {/* Sort */}
                    <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-gray-600 text-gray-300"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Sort
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
                
                {showFilters && (
                  <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[150px]">
                    <div className="p-2">
                      <button
                        onClick={() => handleSort('newest')}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                          sortBy === 'newest' ? 'text-blue-400' : 'text-gray-300'
                        }`}
                      >
                        Newest First
                      </button>
                      <button
                        onClick={() => handleSort('oldest')}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                          sortBy === 'oldest' ? 'text-blue-400' : 'text-gray-300'
                        }`}
                      >
                        Oldest First
                      </button>
                      <button
                        onClick={() => handleSort('price-low')}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                          sortBy === 'price-low' ? 'text-blue-400' : 'text-gray-300'
                        }`}
                      >
                        Price: Low to High
                      </button>
                      <button
                        onClick={() => handleSort('price-high')}
                        className={`w-full text-left px-3 py-2 rounded text-sm hover:bg-gray-700 ${
                          sortBy === 'price-high' ? 'text-blue-400' : 'text-gray-300'
                        }`}
                      >
                        Price: High to Low
                      </button>
                    </div>
                  </div>
                )}
            </div>

              {/* View Mode */}
              <div className="flex border border-gray-600 rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-blue-600' : 'text-gray-300 hover:text-white'}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-blue-600' : 'text-gray-300 hover:text-white'}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
            </div>
          ) : (
            <>
            {/* Listings Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
                {listings.map((listing) => (
                <AgentCard
                  key={listing.id}
                  agent={{
                    id: listing.id,
                    title: listing.title,
                    description: listing.description,
                    price: listing.price,
                    type: listing.type,
                    creator: listing.seller,
                    metadata: listing.metadata,
                    ipfsHash: listing.ipfsHash,
                    createdAt: listing.createdAt
                  }}
                />
                ))}
              </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-600 text-gray-300"
                    >
                      Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page ? 'bg-blue-600' : 'border-gray-600 text-gray-300'}
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-600 text-gray-300"
                    >
                      Next
                  </Button>
                </div>
                </div>
              )}
            </>
          )}
      </div>
    </div>
  )
}