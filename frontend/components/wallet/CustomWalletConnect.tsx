"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, X, AlertCircle, CheckCircle2, Smartphone, QrCode } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface WalletOption {
  id: string
  name: string
  icon: string
  isInstalled: boolean
}

interface CustomWalletConnectProps {
  onConnect?: (walletName: string, walletApi?: any) => void
  onClose?: () => void
  isOpen?: boolean
}

// Mobile wallet configurations
const MOBILE_WALLETS = [
  { id: 'eternl', name: 'Eternl', icon: '🔷', color: 'bg-blue-500' },
  { id: 'yoroi', name: 'Yoroi', icon: '🟡', color: 'bg-yellow-500' },
  { id: 'flint', name: 'Flint', icon: '🔥', color: 'bg-orange-500' },
  { id: 'nami', name: 'Nami', icon: '🔵', color: 'bg-blue-600' },
  { id: 'typhon', name: 'Typhon', icon: '🌪️', color: 'bg-purple-500' },
  { id: 'gerowallet', name: 'GeroWallet', icon: '🟢', color: 'bg-green-500' }
];

// Desktop wallet configurations
const DESKTOP_WALLETS = [
  { id: 'nami', name: 'Nami', icon: '🔵', color: 'bg-blue-600' },
  { id: 'eternl', name: 'Eternl', icon: '🔷', color: 'bg-blue-500' },
  { id: 'flint', name: 'Flint', icon: '🔥', color: 'bg-orange-500' },
  { id: 'yoroi', name: 'Yoroi', icon: '🟡', color: 'bg-yellow-500' },
  { id: 'typhon', name: 'Typhon', icon: '🌪️', color: 'bg-purple-500' },
  { id: 'gerowallet', name: 'GeroWallet', icon: '🟢', color: 'bg-green-500' },
  { id: 'nufi', name: 'NuFi', icon: '🟣', color: 'bg-purple-600' },
  { id: 'lace', name: 'Lace', icon: '💎', color: 'bg-indigo-500' }
];

export function CustomWalletConnect() {
  const { 
    isConnected, 
    address, 
    availableWallets, 
    isLoadingWalletData, 
    connectWallet, 
    connectMobileWallet,
    disconnectWallet,
    isMobile 
  } = useWallet()

  const [isConnecting, setIsConnecting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)

  const handleWalletConnect = async (walletName: string) => {
    setIsConnecting(true)
    try {
      if (isMobile && MOBILE_WALLETS.find(w => w.id === walletName)) {
        await connectMobileWallet(walletName)
      } else {
        await connectWallet(walletName)
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleMobileWalletConnect = async (walletName: string) => {
    setIsConnecting(true)
    try {
      await connectMobileWallet(walletName)
      setSelectedWallet(walletName)
      setShowQRCode(true)
    } catch (error) {
      console.error('Failed to connect mobile wallet:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const generateQRCodeData = (walletName: string) => {
    const config = {
      name: 'LegionX',
      url: window.location.origin,
      icon: `${window.location.origin}/placeholder-logo.png`,
      description: 'AI Model Marketplace'
    };

    return JSON.stringify({
      type: 'wallet-connect',
      wallet: walletName,
      ...config
    });
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <div className="font-medium">Connected</div>
          <div className="text-muted-foreground">
            {address.slice(0, 8)}...{address.slice(-8)}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnectWallet}
          disabled={isLoadingWalletData}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isConnecting}>
          <Wallet className="mr-2 h-4 w-4" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose your preferred Cardano wallet to connect to LegionX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mobile Wallets Section */}
          {isMobile && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Smartphone className="h-4 w-4" />
                <h3 className="font-medium">Mobile Wallets</h3>
                <Badge variant="secondary">Mobile</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {MOBILE_WALLETS.map((wallet) => (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    className="h-auto p-3 flex flex-col items-center gap-2"
                    onClick={() => handleMobileWalletConnect(wallet.id)}
                    disabled={isConnecting || !availableWallets.includes(wallet.id)}
                  >
                    <span className="text-lg">{wallet.icon}</span>
                    <span className="text-xs font-medium">{wallet.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Desktop Wallets Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4" />
              <h3 className="font-medium">Desktop Wallets</h3>
              <Badge variant="secondary">Browser</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DESKTOP_WALLETS.map((wallet) => (
                <Button
                  key={wallet.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-center gap-2"
                  onClick={() => handleWalletConnect(wallet.id)}
                  disabled={isConnecting || !availableWallets.includes(wallet.id)}
                >
                  <span className="text-lg">{wallet.icon}</span>
                  <span className="text-xs font-medium">{wallet.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile Connection Instructions */}
          {isMobile && (
            <Card className="bg-muted/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Tap a mobile wallet above to open it directly. If the wallet isn't installed, 
                  you'll be redirected to download it.
                </p>
              </CardContent>
            </Card>
          )}

          {/* QR Code Dialog for Desktop */}
          <Dialog open={showQRCode && !isMobile} onOpenChange={setShowQRCode}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect {selectedWallet}</DialogTitle>
                <DialogDescription>
                  Scan this QR code with your mobile wallet
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 border rounded-lg">
                  <QrCode className="h-32 w-32" />
                  {/* TODO: Add actual QR code generation */}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Open {selectedWallet} on your mobile device and scan this QR code to connect
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getWalletDownloadUrl(walletId: string): string {
  const urls: Record<string, string> = {
    nami: "https://namiwallet.io/",
    eternl: "https://eternl.io/",
    flint: "https://flint-wallet.com/",
    yoroi: "https://yoroi-wallet.com/",
    typhon: "https://typhonwallet.io/",
    gerowallet: "https://gerowallet.io/",
    nufi: "https://nu.fi/",
    lace: "https://www.lace.io/",
  }
  return urls[walletId] || "#"
}

// Add type declarations for window.cardano
declare global {
  interface Window {
    cardano?: {
      nami?: any
      eternl?: any
      flint?: any
      yoroi?: any
      typhon?: any
      gerowallet?: any
      nufi?: any
      lace?: any
    }
  }
}
