"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, X, AlertCircle, CheckCircle2, Smartphone, QrCode, ExternalLink, Download } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import QRCode from 'qrcode'

// Wallet configurations with proper logos and download URLs
const WALLET_CONFIGS = {
  nami: {
    name: 'Nami',
    icon: '/wallets/nami.svg',
    fallbackIcon: '🔵',
    color: 'bg-blue-600',
    downloadUrl: 'https://namiwallet.io/',
    mobileUrl: 'https://namiwallet.io/',
    description: 'Lightweight Cardano wallet'
  },
  eternl: {
    name: 'Eternl',
    icon: '/wallets/eternl.svg',
    fallbackIcon: '🔷',
    color: 'bg-blue-500',
    downloadUrl: 'https://eternl.io/',
    mobileUrl: 'https://eternl.io/',
    description: 'Feature-rich Cardano wallet'
  },
  flint: {
    name: 'Flint',
    icon: '/wallets/flint.svg',
    fallbackIcon: '🔥',
    color: 'bg-orange-500',
    downloadUrl: 'https://flint-wallet.com/',
    mobileUrl: 'https://flint-wallet.com/',
    description: 'Cross-platform Cardano wallet'
  },
  yoroi: {
    name: 'Yoroi',
    icon: '/wallets/yoroi.svg',
    fallbackIcon: '🟡',
    color: 'bg-yellow-500',
    downloadUrl: 'https://yoroi-wallet.com/',
    mobileUrl: 'https://yoroi-wallet.com/',
    description: 'Emurgo\'s official wallet'
  },
  typhon: {
    name: 'Typhon',
    icon: '/wallets/typhon.svg',
    fallbackIcon: '🌪️',
    color: 'bg-purple-500',
    downloadUrl: 'https://typhonwallet.io/',
    mobileUrl: 'https://typhonwallet.io/',
    description: 'Advanced Cardano wallet'
  },
  gerowallet: {
    name: 'GeroWallet',
    icon: '/wallets/gero.svg',
    fallbackIcon: '🟢',
    color: 'bg-green-500',
    downloadUrl: 'https://gerowallet.io/',
    mobileUrl: 'https://gerowallet.io/',
    description: 'Mobile-first Cardano wallet'
  },
  nufi: {
    name: 'NuFi',
    icon: '/wallets/nufi.svg',
    fallbackIcon: '🟣',
    color: 'bg-purple-600',
    downloadUrl: 'https://nufi.com/',
    mobileUrl: 'https://nufi.com/',
    description: 'Professional Cardano wallet'
  },
  lace: {
    name: 'Lace',
    icon: '/wallets/lace.svg',
    fallbackIcon: '💎',
    color: 'bg-indigo-500',
    downloadUrl: 'https://www.lace.io/',
    mobileUrl: 'https://www.lace.io/',
    description: 'IOG\'s official wallet'
  }
}

// Desktop wallets (browser extensions)
const DESKTOP_WALLETS = ['nami', 'eternl', 'flint', 'yoroi', 'typhon', 'gerowallet', 'nufi', 'lace']

// Mobile wallets (mobile apps)
const MOBILE_WALLETS = ['eternl', 'yoroi', 'flint', 'nami', 'typhon', 'gerowallet']

export function CustomWalletConnect() {
  const { 
    isConnected, 
    address, 
    availableWallets, 
    isLoadingWalletData, 
    connectWallet, 
    connectMobileWallet,
    disconnectWallet,
    isMobile,
    setAddress,
    setIsConnected
  } = useWallet()

  const [isConnecting, setIsConnecting] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualAddress, setManualAddress] = useState('')

  const handleWalletConnect = async (walletName: string) => {
    if (!availableWallets.includes(walletName)) {
      const wallet = WALLET_CONFIGS[walletName as keyof typeof WALLET_CONFIGS]
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
        description: `${WALLET_CONFIGS[walletName as keyof typeof WALLET_CONFIGS]?.name} connected successfully!`,
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

  const handleMobileWalletConnect = async (walletName: string) => {
    try {
      const connectionData = await connectMobileWallet(walletName)
      setSelectedWallet(walletName)
      
      // Generate QR code
      const qrData = generateQRCodeData(walletName)
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      
      setQrCodeDataUrl(qrDataUrl)
      setShowQRCode(true)
      
      // Store the connection data for the QR code dialog
      setSelectedWallet(connectionData.walletName)
    } catch (error) {
      console.error('Failed to prepare mobile wallet connection:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to prepare mobile wallet connection. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleMobileRedirect = (walletName: string) => {
    const wallet = WALLET_CONFIGS[walletName as keyof typeof WALLET_CONFIGS]
    if (wallet) {
      // Get the stored connection data
      const stored = localStorage.getItem('mobile_wallet_connection')
      if (stored) {
        try {
          const data = JSON.parse(stored)
          if (data.connectionUrl) {
            // For mobile devices, try to open the wallet with the connection URL
            if (isMobile) {
              // Try to open the wallet app with the connection URL
              window.location.href = data.connectionUrl
            } else {
              // For desktop, show instructions to scan QR code
              toast({
                title: "Mobile Wallet Required",
                description: "Please scan the QR code with your mobile wallet app.",
              })
            }
          } else {
            // Fallback to the wallet's website
            window.open(wallet.mobileUrl, '_blank')
          }
        } catch (error) {
          console.error('Error parsing stored connection data:', error)
          window.open(wallet.mobileUrl, '_blank')
        }
      } else {
        window.open(wallet.mobileUrl, '_blank')
      }
    }
  }

  const generateQRCodeData = (walletName: string) => {
    const stored = localStorage.getItem('mobile_wallet_connection')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        return data.connectionUrl || `${data.config?.deepLink}connect?name=LegionX&url=${window.location.origin}`
      } catch (error) {
        console.error('Error parsing stored connection data:', error)
      }
    }
    
    // Fallback
    const wallet = WALLET_CONFIGS[walletName as keyof typeof WALLET_CONFIGS]
    return wallet ? `${wallet.downloadUrl}?name=LegionX&url=${window.location.origin}` : ''
  };

  const handleManualAddressSubmit = async () => {
    if (!manualAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your wallet address.",
        variant: "destructive"
      })
      return
    }

    try {
      // Validate the address format (basic Cardano address validation)
      if (!manualAddress.startsWith('addr') && !manualAddress.startsWith('addr_test')) {
        toast({
          title: "Invalid Address",
          description: "Please enter a valid Cardano address.",
          variant: "destructive"
        })
        return
      }

      // Set the address manually
      setAddress(manualAddress)
      setIsConnected(true)
      setShowManualInput(false)
      setShowQRCode(false)
      
      toast({
        title: "Wallet Connected",
        description: "Manual wallet connection successful!",
      })
    } catch (error) {
      console.error('Error with manual address:', error)
      toast({
        title: "Connection Failed",
        description: "Failed to connect with manual address. Please try again.",
        variant: "destructive"
      })
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
    <>
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
            {/* Mobile Wallets Section */}
            {isMobile && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-gray-400" />
                  <h3 className="font-medium text-gray-200">Mobile Wallets</h3>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">Mobile</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MOBILE_WALLETS.map((walletId) => {
                    const wallet = WALLET_CONFIGS[walletId as keyof typeof WALLET_CONFIGS]
                    if (!wallet) return null
                    
                    return (
                      <Button
                        key={walletId}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center gap-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500"
                        onClick={() => handleMobileWalletConnect(walletId)}
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
                      </Button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Desktop Wallets Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="h-4 w-4 text-gray-400" />
                <h3 className="font-medium text-gray-200">Desktop Wallets</h3>
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">Browser</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {DESKTOP_WALLETS.map((walletId) => {
                  const wallet = WALLET_CONFIGS[walletId as keyof typeof WALLET_CONFIGS]
                  if (!wallet) return null
                  
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

            {/* Mobile Connection Instructions */}
            {isMobile && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2 text-gray-200">
                    <Smartphone className="h-4 w-4" />
                    Mobile Connection
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-400">
                    Tap a mobile wallet above to open it directly. If the wallet isn't installed, 
                    you'll be redirected to download it.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog for Mobile */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-100">
              Connect {selectedWallet && WALLET_CONFIGS[selectedWallet as keyof typeof WALLET_CONFIGS]?.name}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Scan the QR code with your mobile wallet or open the wallet directly
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg flex items-center justify-center">
              <div className="text-center">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Wallet Connection QR Code" 
                    className="w-64 h-64 mx-auto"
                  />
                ) : (
                  <>
                    <QrCode className="h-32 w-32 mx-auto text-gray-400" />
                    <p className="text-sm text-gray-500 mt-2">Generating QR Code...</p>
                  </>
                )}
              </div>
            </div>
            
            {selectedWallet && (
              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  onClick={() => handleMobileRedirect(selectedWallet)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open {WALLET_CONFIGS[selectedWallet as keyof typeof WALLET_CONFIGS]?.name}
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowManualInput(true)}
                >
                  Manual Input
                </Button>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => setShowQRCode(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Manual Address Input */}
            {showManualInput && (
              <div className="space-y-4 mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h3 className="text-sm font-medium text-gray-200">Manual Wallet Connection</h3>
                <p className="text-xs text-gray-400">
                  Enter your Cardano wallet address manually if the QR code connection doesn't work.
                </p>
                <input
                  type="text"
                  placeholder="addr1... or addr_test..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm"
                    onClick={handleManualAddressSubmit}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    Connect
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline" 
                    onClick={() => setShowManualInput(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
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
