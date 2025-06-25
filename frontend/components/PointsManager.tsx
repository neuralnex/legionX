"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Plus, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface PointsManagerProps {
  currentPoints: number
  onPointsUpdate: (newPoints: number) => void
}

export function PointsManager({ currentPoints, onPointsUpdate }: PointsManagerProps) {
  const [pointsToBuy, setPointsToBuy] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  const handleBuyPoints = async () => {
    if (pointsToBuy < 1) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number of points (minimum 1)",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/buy-listing-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ points: pointsToBuy })
      })

      if (!response.ok) {
        throw new Error('Failed to initiate payment')
      }

      const { paymentLink } = await response.json()
      
      // Redirect to Flutterwave payment page
      window.location.href = paymentLink
      
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      toast({
        title: "Payment failed",
        description: "Unable to initiate payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Listing Points
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Balance */}
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{currentPoints}</div>
          <div className="text-sm text-gray-400">Available Points</div>
          <div className="text-xs text-gray-500 mt-1">
            1 point = $1 USD = 1 listing
          </div>
        </div>

        {/* Buy Points */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium">Buy More Points</span>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={pointsToBuy}
              onChange={(e) => setPointsToBuy(parseInt(e.target.value) || 1)}
              className="flex-1"
              placeholder="Number of points"
            />
            <Button
              onClick={handleBuyPoints}
              disabled={isLoading}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Buy ${pointsToBuy}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-green-500 text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Redirecting to payment...
          </motion.div>
        )}

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Points are used to list agents and models</p>
          <p>• Each listing costs 1 point</p>
          <p>• Payments are processed securely via Flutterwave</p>
        </div>
      </CardContent>
    </Card>
  )
} 