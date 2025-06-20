"use client"

import { useState } from "react"
import { Wallet, X, AlertCircle, CheckCircle2, Download } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Desktop wallet configurations with proper logos and download URLs
const DESKTOP_WALLETS = {
  nami: {
    name: 'Nami',
    icon: '/wallets/nami.svg',
    fallbackIcon: '🔵',
    color: 'bg-blue-600',
    downloadUrl: 'https://namiwallet.io/',
    description: 'Lightweight Cardano wallet'
  },
  eternl: {
    name: 'Eternl',
    icon: '/wallets/eternl.svg',
    fallbackIcon: '🔷',
    color: 'bg-blue-500',
    downloadUrl: 'https://eternl.io/',
    description: 'Feature-rich Cardano wallet'
  },
  flint: {
    name: 'Flint',
    icon: '/wallets/flint.svg',
    fallbackIcon: '🔥',
    color: 'bg-orange-500',
    downloadUrl: 'https://flint-wallet.com/',
    description: 'Cross-platform Cardano wallet'
  },
  yoroi: {
    name: 'Yoroi',
    icon: '/wallets/yoroi.svg',
    fallbackIcon: '🟡',
    color: 'bg-yellow-500',
    downloadUrl: 'https://yoroi-wallet.com/',
    description: 'Emurgo\'s official wallet'
  },
  typhon: {
    name: 'Typhon',
    icon: '/wallets/typhon.svg',
    fallbackIcon: '🌪️',
    color: 'bg-purple-500',
    downloadUrl: 'https://typhonwallet.io/',
    description: 'Advanced Cardano wallet'
  },
  gerowallet: {
    name: 'GeroWallet',
    icon: '/wallets/gero.svg',
    fallbackIcon: '🟢',
    color: 'bg-green-500',
    downloadUrl: 'https://gerowallet.io/',
    description: 'Mobile-first Cardano wallet'
  },
  nufi: {
    name: 'NuFi',
    icon: '/wallets/nufi.svg',
    fallbackIcon: '🟣',
    color: 'bg-purple-600',
    downloadUrl: 'https://nufi.com/',
    description: 'Professional Cardano wallet'
  },
  lace: {
    name: 'Lace',
    icon: '/wallets/lace.svg',
    fallbackIcon: '💎',
    color: 'bg-indigo-500',
    downloadUrl: 'https://www.lace.io/',
    description: 'IOG\'s official wallet'
  }
}

export function CustomWalletConnect() {
  const { 
    isConnected, 
    address, 
    availableWallets, 
    isLoadingWalletData, 
    connectWallet, 
    disconnectWallet
  } = useWallet()

  const [isConnecting, setIsConnecting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleWalletConnect = async (walletName: string) => {
    if (!availableWallets.includes(walletName)) {
      const wallet = DESKTOP_WALLETS[walletName as keyof typeof DESKTOP_WALLETS]
      if (wallet) {
        toast({
          title: `${wallet.name} not detected`,
          description: `Please install ${wallet.name} first.`,
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(wallet.downloadUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          )
        })
      }
      return
    }

    setIsConnecting(true)
    try {
      await connectWallet(walletName)
      setIsDialogOpen(false)
      toast({
        title: "Wallet Connected",
        description: `${DESKTOP_WALLETS[walletName as keyof typeof DESKTOP_WALLETS]?.name} connected successfully!`,
      })
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsConnecting(false)
    }
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <div className="font-medium text-gray-200">Connected</div>
          <div className="text-gray-400 font-mono">
            {address.slice(0, 8)}...{address.slice(-8)}
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={disconnectWallet}
          disabled={isLoadingWalletData}
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
          disabled={isConnecting}
        >
          <Wallet className="h-5 w-5 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Connect Wallet</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose your preferred Cardano wallet to connect to LegionX
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Desktop Wallets Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="h-4 w-4 text-gray-400" />
              <h3 className="font-medium text-gray-200">Browser Wallets</h3>
              <Badge variant="secondary" className="bg-gray-700 text-gray-300">Desktop</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(DESKTOP_WALLETS).map(([walletId, wallet]) => {
                const isAvailable = availableWallets.includes(walletId)
                
                return (
                  <Button
                    key={walletId}
                    variant="outline"
                    className={`h-auto p-3 flex flex-col items-center gap-2 transition-all ${
                      isAvailable 
                        ? 'border-gray-600 hover:bg-gray-700 hover:border-gray-500' 
                        : 'border-gray-700 bg-gray-800 opacity-60'
                    }`}
                    onClick={() => handleWalletConnect(walletId)}
                    disabled={isConnecting}
                  >
                    <div className="w-8 h-8 flex items-center justify-center text-lg">
                      <img 
                        src={wallet.icon} 
                        alt={wallet.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <span className="hidden text-lg">{wallet.fallbackIcon}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-300">{wallet.name}</span>
                    {!isAvailable && (
                      <span className="text-xs text-gray-500">Not installed</span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Instructions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2 text-gray-200">
                <Wallet className="h-4 w-4" />
                How to Connect
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-400">
                1. Install a Cardano wallet extension (like Nami, Eternl, or Flint)<br/>
                2. Click on the wallet you have installed above<br/>
                3. Approve the connection in your wallet
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
