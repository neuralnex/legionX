"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface FiatPurchaseProps {
  listingId: string
  title: string
  description: string
  price: number // Price in USD
  itemType: 'agent' | 'model'
  accessType?: 'lifetime' | 'subscription'
  onPurchaseComplete?: () => void
}

export function FiatPurchase({ 
  listingId, 
  title, 
  description, 
  price, 
  itemType, 
  accessType = 'lifetime',
  onPurchaseComplete 
}: FiatPurchaseProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const { toast } = useToast()

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/initiate-purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ listingId })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initiate purchase')
      }

      const { paymentLink } = await response.json()
      
      // Redirect to Flutterwave payment page
      window.location.href = paymentLink
      
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onPurchaseComplete?.()
      }, 3000)
    } catch (error) {
      toast({
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "Unable to initiate purchase. Please try again.",
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
          <CreditCard className="h-5 w-5 text-blue-500" />
          Purchase {itemType === 'agent' ? 'Agent' : 'Model'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Item Details */}
        <div className="space-y-2">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Type:</span>
            <span className="capitalize text-blue-400">{itemType}</span>
            {itemType === 'model' && (
              <>
                <span className="text-gray-500">•</span>
                <span className="capitalize text-green-400">{accessType} access</span>
              </>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-4">
          <div className="text-3xl font-bold text-white">${price}</div>
          <div className="text-sm text-gray-400">USD</div>
        </div>

        {/* Purchase Button */}
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Purchase for ${price}
            </>
          )}
        </Button>

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
          <p>• Secure payment via Flutterwave</p>
          <p>• {itemType === 'agent' ? 'Full ownership transfer' : `${accessType} access`}</p>
          <p>• Instant delivery after payment</p>
          {itemType === 'model' && accessType === 'subscription' && (
            <p>• Subscription valid for 30 days</p>
          )}
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-yellow-900/20 border border-yellow-800 rounded-lg">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-300">
            <p className="font-medium">Important:</p>
            <p>You will be redirected to our secure payment processor. Please complete the payment to receive your {itemType}.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 