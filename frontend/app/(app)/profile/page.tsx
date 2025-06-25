"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Coins, ShoppingBag, User, Settings, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store/useAuthStore'
import { PointsManager } from '@/components/PointsManager'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  email: string
  name?: string
  listingPoints: number
  createdAt: string
}

interface Purchase {
  id: string
  agentTitle: string
  price: number
  status: 'completed' | 'pending' | 'failed'
  createdAt: string
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showPointsDialog, setShowPointsDialog] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchPurchases()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/auth/purchases', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setPurchases(data.purchases || [])
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-400 mb-4">Failed to load profile data.</p>
            <Button onClick={() => window.location.reload()}>
              Retry
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
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-gray-400">Manage your account and view your activity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-400 text-sm">Name</label>
                  <p className="text-white font-medium">{profile.name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <p className="text-white font-medium">{profile.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Member Since</label>
                  <p className="text-white font-medium">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Points Card */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  Listing Points
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-white">{profile.listingPoints}</div>
                  <div className="text-sm text-gray-400">Available Points</div>
                  <div className="text-xs text-gray-500 mt-1">
                    1 point = $1 USD = 1 listing
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPointsDialog(true)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  Buy More Points
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  My Purchases
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Coins className="h-4 w-4 mr-2" />
                  Transaction History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-400 hover:text-red-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Purchase History */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ShoppingBag className="h-5 w-5" />
                  Purchase History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No Purchases Yet</h3>
                    <p className="text-gray-400 mb-4">
                      Start exploring the marketplace to find AI agents and models
                    </p>
                    <Button onClick={() => window.location.href = '/marketplace'}>
                      Browse Marketplace
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-white">{purchase.agentTitle}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(purchase.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-400">${purchase.price}</p>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              purchase.status === 'completed'
                                ? 'bg-green-900/20 text-green-400'
                                : purchase.status === 'pending'
                                ? 'bg-yellow-900/20 text-yellow-400'
                                : 'bg-red-900/20 text-red-400'
                            }`}
                          >
                            {purchase.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Points Dialog */}
        {showPointsDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Buy Listing Points</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPointsDialog(false)}
                  className="text-gray-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              <PointsManager
                currentPoints={profile.listingPoints}
                onPointsUpdate={(newPoints) => {
                  setProfile(prev => prev ? { ...prev, listingPoints: newPoints } : null)
                  setShowPointsDialog(false)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 