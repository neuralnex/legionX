"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useAgentDetail } from "@/hooks/useMarketplace"
import {
  Heart,
  Share2,
  Clock,
  Tag,
  Shield,
  Cpu,
  Code,
  HardDrive,
  Package,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function AgentDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: agent, isLoading, isError, error } = useAgentDetail(params.id)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(agent?.likes || 0)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  const handlePurchase = () => {
    router.push(`/purchase/${params.id}`)
  }

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (isError || !agent) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-6 py-4 rounded-xl">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 mr-2" />
              <h3 className="font-semibold">Error loading agent details</h3>
            </div>
            <p className="text-sm mb-4">
              {error?.message || "There was an error loading the agent details. Please try again later."}
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Retry
              </button>
              <Link
                href="/marketplace"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Return to marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Safe access to agent properties with fallbacks
  const capabilities = agent.capabilities && Array.isArray(agent.capabilities) ? agent.capabilities : []
  const dependencies =
    agent.requirements?.dependencies && Array.isArray(agent.requirements.dependencies)
      ? agent.requirements.dependencies
      : []

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left column - Image */}
            <div className="lg:w-1/2">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={agent.image || "/placeholder.svg?height=400&width=400"}
                    alt={agent.title || "Agent"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    onError={(e) => {
                      console.warn("❌ Agent image failed to load:", agent.image)
                      e.currentTarget.src = "/placeholder.svg?height=400&width=400"
                    }}
                  />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Created</span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {agent.createdAt ? new Date(agent.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium">Price</span>
                    </div>
                    <span className="text-sm text-purple-400 font-medium">{agent.price || "Free"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Details */}
            <div className="lg:w-1/2">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold">{agent.title || "Untitled Agent"}</h1>
                <div className="flex space-x-3">
                  <button
                    onClick={handleLike}
                    className="flex items-center text-gray-400 hover:text-red-500"
                    aria-label={liked ? "Unlike" : "Like"}
                  >
                    <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                    <span className="ml-1">{likeCount}</span>
                  </button>
                  <button className="text-gray-400 hover:text-white" aria-label="Share">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="relative w-8 h-8 mr-3">
                  <Image
                    src={agent.creator?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={agent.creator?.username || "Creator"}
                    fill
                    className="rounded-full object-cover"
                    sizes="32px"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                    }}
                  />
                </div>
                <div>
                  <p className="text-sm">
                    Created by{" "}
                    <Link
                      href={`/creators/${agent.creator?.id || "unknown"}`}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      {agent.creator?.username || "Unknown Creator"}
                    </Link>
                  </p>
                </div>
                {agent.isPremium && (
                  <div className="ml-auto bg-purple-900/30 text-purple-400 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Premium
                  </div>
                )}
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Description</h2>
                <p className="text-gray-300">{agent.description || "No description available."}</p>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Capabilities</h2>
                <div className="flex flex-wrap gap-2">
                  {capabilities.length > 0 ? (
                    capabilities.map((capability, index) => (
                      <span key={index} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {capability}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No capabilities listed.</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Cpu className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Model Type</p>
                      <p className="font-medium">{agent.modelType || "Not specified"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Code className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Version</p>
                      <p className="font-medium">{agent.version || "1.0.0"}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <HardDrive className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Min Memory</p>
                      <p className="font-medium">{agent.requirements?.minMemory || 4} GB</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Min Storage</p>
                      <p className="font-medium">{agent.requirements?.minStorage || 2} GB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Dependencies</h2>
                <div className="flex flex-wrap gap-2">
                  {dependencies.length > 0 ? (
                    dependencies.map((dependency, index) => (
                      <span key={index} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {dependency}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No dependencies listed.</p>
                  )}
                </div>
              </div>

              <motion.button
                onClick={handlePurchase}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center"
              >
                Purchase for {agent.price || "Free"}
                <ChevronRight className="h-5 w-5 ml-2" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
