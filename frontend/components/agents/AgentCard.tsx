"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Star, Coins, Download, ExternalLink, Eye, FileText, ChevronDown, ChevronUp } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"
import type { Listing } from "@/types/api"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'
import IPFSViewer from '@/components/IPFSViewer'

// Legacy props interface for backward compatibility
interface LegacyAgentCardProps {
  id: string
  title: string
  creator: string
  price: string
  image: string
  likes: number
  listing?: never
}

// New props interface
interface NewAgentCardProps {
  agent: any // Using any for now since we're updating the structure
  listing?: never
  id?: never
  title?: never
  creator?: never
  price?: never
  image?: never
  likes?: never
}

type AgentCardProps = LegacyAgentCardProps | NewAgentCardProps

function FallbackComponent({ error }: { error: Error }) {
  console.error("❌ AgentCard error:", error)
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 h-[320px] flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 text-sm mb-2">Error loading agent</p>
        <p className="text-gray-500 text-xs">{error.message}</p>
      </div>
    </div>
  )
}

const AgentCard = (props: AgentCardProps) => {
  const router = useRouter()
  const [liked, setLiked] = useState(false)
  const [showIPFS, setShowIPFS] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Determine if we're using legacy props or new agent prop
  const isLegacy = "id" in props && props.id !== undefined

  // Extract data based on prop format with safe fallbacks
  const data = isLegacy
    ? {
        id: props.id || "unknown",
        title: props.title || "Untitled Agent",
        creator: props.creator || "Unknown Creator",
        price: props.price || "$0.00",
        image: props.image || "/placeholder.svg?height=400&width=400",
        likes: props.likes || 0,
        isPremium: false,
        features: [],
        type: "ai-agent",
      }
    : {
        id: props.agent?.id || "unknown",
        title: props.agent?.title || "Untitled Agent",
        creator: props.agent?.creator?.name || props.agent?.creator?.email || "Unknown Creator",
        price: props.agent?.price ? `$${parseFloat(props.agent.price).toFixed(2)}` : "$0.00",
        image: props.agent?.image || "/placeholder.svg?height=400&width=400",
        likes: props.agent?.likes || 0,
        isPremium: props.agent?.isPremium || false,
        features: props.agent?.capabilities || [],
        type: props.agent?.modelType || "ai-agent",
      }

  const [likeCount, setLikeCount] = useState(data.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handlePurchase = () => {
    router.push(`/purchase/${data.id}`)
  }

  const handleViewDetails = () => {
    router.push(`/agents/${data.id}`)
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price) / 1000000 // Convert from Lovelace to ADA
    return `$${numPrice.toFixed(2)}`
  }

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'agent':
        return 'bg-blue-500'
      case 'model':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getAgentTypeLabel = (type: string) => {
    switch (type) {
      case 'agent':
        return 'AI Agent'
      case 'model':
        return 'AI Model'
      default:
        return type
    }
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <Card className="bg-gray-800/50 border-gray-700 hover:border-gray-600 transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-user.jpg" alt={data.creator} />
                <AvatarFallback className="bg-gray-700 text-white">
                  {data.creator.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-white text-lg">{data.title}</CardTitle>
                <p className="text-gray-400 text-sm">by {data.creator}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getAgentTypeColor(data.type)}>
                {getAgentTypeLabel(data.type)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="text-gray-400 hover:text-white"
              >
                {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-300 text-sm line-clamp-2">{data.description || "No description available"}</p>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">{formatPrice(data.price)}</span>
              <div className="flex items-center text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm ml-1">4.8</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                onClick={handlePurchase}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              >
                Purchase
              </Button>
            </div>
          </div>

          {/* IPFS Content Section */}
          {data.ipfsHash && (
            <div className="border-t border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-white">IPFS Content</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowIPFS(!showIPFS)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {showIPFS ? 'Hide' : 'View'} Files
                </Button>
              </div>
              
              {showIPFS && (
                <IPFSViewer
                  ipfsHash={data.ipfsHash}
                  title={`${data.title} Files`}
                  description="Core files and resources for this agent"
                  fileType="document"
                />
              )}
            </div>
          )}

          {/* Detailed Information */}
          {showDetails && data.metadata && (
            <div className="border-t border-gray-700 pt-4 space-y-3">
              <h4 className="text-sm font-medium text-white">Technical Details</h4>
              
              {data.metadata.version && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Version:</span>
                  <span className="text-white">{data.metadata.version}</span>
                </div>
              )}
              
              {data.metadata.modelType && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Model Type:</span>
                  <span className="text-white">{data.metadata.modelType}</span>
                </div>
              )}
              
              {data.metadata.abilities && data.metadata.abilities.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400">Abilities:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.metadata.abilities.slice(0, 3).map((ability: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {ability}
                      </Badge>
                    ))}
                    {data.metadata.abilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{data.metadata.abilities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
              
              {data.metadata.dependencies && data.metadata.dependencies.length > 0 && (
                <div>
                  <span className="text-sm text-gray-400">Dependencies:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {data.metadata.dependencies.slice(0, 3).map((dep: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dep}
                      </Badge>
                    ))}
                    {data.metadata.dependencies.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{data.metadata.dependencies.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Model-specific pricing for models */}
          {data.type === 'model' && data.metadata?.pricing && (
            <div className="border-t border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-white mb-2">Pricing Options</h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {data.metadata.pricing.lifetime > 0 && (
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-white font-medium">${data.metadata.pricing.lifetime}</div>
                    <div className="text-gray-400">Lifetime</div>
                  </div>
                )}
                {data.metadata.pricing.monthly > 0 && (
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-white font-medium">${data.metadata.pricing.monthly}</div>
                    <div className="text-gray-400">Monthly</div>
                  </div>
                )}
                {data.metadata.pricing.yearly > 0 && (
                  <div className="bg-gray-700/50 rounded p-2 text-center">
                    <div className="text-white font-medium">${data.metadata.pricing.yearly}</div>
                    <div className="text-gray-400">Yearly</div>
                  </div>
                )}
              </div>
              </div>
            )}
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}

export default AgentCard
