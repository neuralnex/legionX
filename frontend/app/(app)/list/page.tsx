"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Bot, Cpu, Coins, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import AgentListingForm from '@/components/listing/AgentListingForm'
import ModelListingForm from '@/components/listing/ModelListingForm'

type ListingType = 'agent' | 'model' | null

export default function ListPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ListingType>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [userPoints, setUserPoints] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserPoints()
  }, [])

  const fetchUserPoints = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const userData = await response.json()
        setUserPoints(userData.user.listingPoints || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user points:', error)
    }
  }

  const handleTypeSelect = (type: ListingType) => {
    if (userPoints < 1) {
      toast({
        title: "Insufficient Points",
        description: "You need at least 1 point to list an item. Please buy more points first.",
        variant: "destructive"
      })
      return
    }
    setSelectedType(type)
    setShowDropdown(false)
  }

  const handleListingComplete = () => {
    toast({
      title: "Listing Created!",
      description: "Your item has been successfully listed on the marketplace.",
    })
    router.push('/marketplace')
  }

  const listingTypes = [
    {
      type: 'agent' as const,
      icon: <Bot className="h-6 w-6" />,
      title: 'AI Agent',
      description: 'List a pre-built AI agent with specific capabilities and personality',
      features: ['Custom setup documentation', 'Dependency management', 'File upload', 'Ability configuration']
    },
    {
      type: 'model' as const,
      icon: <Cpu className="h-6 w-6" />,
      title: 'AI Model',
      description: 'List an AI model with API access and subscription options',
      features: ['API endpoint access', 'Multiple model types', 'Subscription plans', 'Usage-based pricing']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">List Your Item</h1>
          <p className="text-gray-400">Choose what you want to list on the marketplace</p>
        </div>

        {/* Points Check */}
        <div className="mb-6 p-4 rounded-lg border border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-white font-medium">Your Points: {userPoints}</span>
            </div>
            <div className="text-sm text-gray-400">
              Required: 1 point per listing
            </div>
          </div>
          {userPoints < 1 && (
            <div className="mt-2 p-3 bg-red-900/20 border border-red-800 rounded-lg">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Insufficient points. Please buy more points to list an item.</span>
              </div>
            </div>
          )}
        </div>

        {/* Type Selection */}
        {!selectedType && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">What would you like to list?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {listingTypes.map((item) => (
                  <motion.div
                    key={item.type}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative"
                  >
                    <Card
                      className={`bg-gray-700/50 border-2 cursor-pointer transition-all duration-200 ${
                        userPoints >= 1 
                          ? 'hover:border-purple-500 hover:bg-gray-700/70' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                      onClick={() => handleTypeSelect(item.type)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-purple-600/20 rounded-lg">
                            {item.icon}
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                            <p className="text-gray-400 text-sm">{item.description}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-300">Features:</h4>
                          <ul className="space-y-1">
                            {item.features.map((feature, index) => (
                              <li key={index} className="text-xs text-gray-400 flex items-center">
                                <span className="w-1 h-1 bg-purple-500 rounded-full mr-2"></span>
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-600">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Cost:</span>
                            <span className="text-yellow-400 font-medium">1 point</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Listing Forms */}
        <AnimatePresence mode="wait">
          {selectedType && (
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedType(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ← Back to selection
                </Button>
              </div>

              {selectedType === 'agent' && (
                <AgentListingForm 
                  onComplete={handleListingComplete}
                  onPointsUpdate={fetchUserPoints}
                />
              )}

              {selectedType === 'model' && (
                <ModelListingForm 
                  onComplete={handleListingComplete}
                  onPointsUpdate={fetchUserPoints}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 