"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAgentDetail } from '@/hooks/useMarketplace'
import { FiatPurchase } from '@/components/FiatPurchase'

export default function PurchasePage() {
  const params = useParams()
  const router = useRouter()
  const agentId = params.id as string
  const { data: agent, isLoading, error } = useAgentDetail(agentId)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-gray-400">Loading agent details...</p>
        </div>
      </div>
    )
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">Agent not found or error loading details.</p>
            <Button onClick={() => router.push('/marketplace')}>
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
          <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Purchase Agent</h1>
          <p className="text-gray-400">Complete your purchase to get full ownership of this agent</p>
                </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Agent Details */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Agent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">{agent.title}</h3>
                <p className="text-gray-400">{agent.description}</p>
          </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Type</span>
                  <p className="text-white font-medium">{agent.modelType}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Version</span>
                  <p className="text-white font-medium">{agent.version}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Memory Required</span>
                  <p className="text-white font-medium">{agent.requirements.minMemory}GB</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Storage Required</span>
                  <p className="text-white font-medium">{agent.requirements.minStorage}GB</p>
              </div>
            </div>

              {agent.capabilities && agent.capabilities.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Capabilities</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agent.capabilities.map((capability: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                      >
                        {capability}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.requirements.dependencies && agent.requirements.dependencies.length > 0 && (
                <div>
                  <span className="text-gray-500 text-sm">Dependencies</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {agent.requirements.dependencies.map((dependency: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-600/20 text-gray-400 text-xs rounded-full"
                      >
                        {dependency}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Purchase Component */}
          <div className="flex justify-center">
            <FiatPurchase
              listingId={agent.id}
              title={agent.title}
              description={agent.description}
              price={parseFloat(agent.price)}
              itemType="agent"
              onPurchaseComplete={() => {
                // Handle purchase completion
                router.push('/agents')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
