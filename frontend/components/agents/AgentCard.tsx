"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, Star } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"
import type { Listing } from "@/types/api"

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
  listing: Listing
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
  const [liked, setLiked] = useState(false)

  // Determine if we're using legacy props or new listing prop
  const isLegacy = "id" in props && props.id !== undefined

  // Extract data based on prop format with safe fallbacks
  const data = isLegacy
    ? {
        id: props.id || "unknown",
        title: props.title || "Untitled Agent",
        creator: props.creator || "Unknown Creator",
        price: props.price || "0.00 ADA",
        image: props.image || "/placeholder.svg?height=400&width=400",
        likes: props.likes || 0,
        isPremium: false,
        features: [],
        type: "ai-agent",
      }
    : {
        id: props.listing?.id || "unknown",
        title: props.listing?.title || "Untitled Agent",
        creator: props.listing?.seller?.username || "Unknown Creator",
        price: props.listing?.price ? `${props.listing.price.toFixed(2)} ADA` : "0.00 ADA",
        image:
          props.listing?.images && Array.isArray(props.listing.images) && props.listing.images.length > 0
            ? props.listing.images[0]
            : "/placeholder.svg?height=400&width=400",
        likes: 0, // This would come from backend
        isPremium: props.listing?.isPremium || false,
        features: props.listing?.features && Array.isArray(props.listing.features) ? props.listing.features : [],
        type: props.listing?.type || "ai-agent",
      }

  const [likeCount, setLikeCount] = useState(data.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      <motion.div
        className="agent-card bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
        whileHover={{ y: -5 }}
        transition={{ duration: 0.2 }}
      >
        <Link href={`/agents/${data.id}`}>
          <div className="relative aspect-square">
            <Image
              src={data.image || "/placeholder.svg"}
              alt={data.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              onError={(e) => {
                console.warn("❌ Image failed to load:", data.image)
                e.currentTarget.src = "/placeholder.svg?height=400&width=400"
              }}
            />
            {data.isPremium && (
              <div className="absolute top-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Premium
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg truncate">{data.title}</h3>
              <button
                onClick={handleLike}
                className="flex items-center text-gray-400 hover:text-red-500"
                aria-label={liked ? "Unlike" : "Like"}
              >
                <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                <span className="text-xs">{likeCount}</span>
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-3">Created by {data.creator}</p>
            <div className="flex justify-between items-center">
              <span className="font-medium text-purple-400">{data.price}</span>
              <span className="text-xs text-gray-400 capitalize">{data.type}</span>
            </div>
            {data.features && data.features.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {data.features.slice(0, 2).map((feature, index) => (
                  <span key={index} className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs">
                    {feature}
                  </span>
                ))}
                {data.features.length > 2 && (
                  <span className="text-gray-400 text-xs">+{data.features.length - 2} more</span>
                )}
              </div>
            )}
          </div>
        </Link>
      </motion.div>
    </ErrorBoundary>
  )
}

export default AgentCard
