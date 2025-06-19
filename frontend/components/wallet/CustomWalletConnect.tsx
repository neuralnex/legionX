"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Wallet, X, AlertCircle, CheckCircle2 } from "lucide-react"

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

export default function CustomWalletConnect({ onConnect, onClose, isOpen = true }: CustomWalletConnectProps) {
  const [wallets, setWallets] = useState<WalletOption[]>([])
  const [connecting, setConnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkWallets = () => {
      const walletOptions: WalletOption[] = [
        {
          id: "nami",
          name: "Nami",
          icon: "🦎",
          isInstalled: !!window.cardano?.nami,
        },
        {
          id: "eternl",
          name: "Eternl",
          icon: "♾️",
          isInstalled: !!window.cardano?.eternl,
        },
        {
          id: "flint",
          name: "Flint",
          icon: "🔥",
          isInstalled: !!window.cardano?.flint,
        },
        {
          id: "yoroi",
          name: "Yoroi",
          icon: "🌸",
          isInstalled: !!window.cardano?.yoroi,
        },
        {
          id: "typhon",
          name: "Typhon",
          icon: "🌊",
          isInstalled: !!window.cardano?.typhon,
        },
        {
          id: "gerowallet",
          name: "Gero Wallet",
          icon: "🦅",
          isInstalled: !!window.cardano?.gerowallet,
        },
        {
          id: "nufi",
          name: "NuFi",
          icon: "🔮",
          isInstalled: !!window.cardano?.nufi,
        },
        {
          id: "lace",
          name: "Lace",
          icon: "🎭",
          isInstalled: !!window.cardano?.lace,
        },
      ]

      setWallets(walletOptions)
    }

    checkWallets()
    // Check again after a delay for wallets that load slowly
    const timer = setTimeout(checkWallets, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleConnect = async (walletId: string) => {
    setConnecting(walletId)
    setError(null)

    try {
      // Type-safe access to wallet API
      const walletApi = walletId in (window.cardano || {}) ? window.cardano?.[walletId as keyof typeof window.cardano] : undefined
      if (!walletApi) {
        throw new Error(`${walletId} wallet not found`)
      }

      // Enable the wallet
      const api = await walletApi.enable()
      console.log(`Connected to ${walletId}:`, api)

      // Call the onConnect callback with the wallet API instead of just the name
      onConnect?.(walletId, api)
    } catch (err: any) {
      console.error(`Error connecting to ${walletId}:`, err)
      setError(err.message || `Failed to connect to ${walletId}`)
    } finally {
      setConnecting(null)
    }
  }

  const installedWallets = wallets.filter((w) => w.isInstalled)
  const notInstalledWallets = wallets.filter((w) => !w.isInstalled)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Connect Wallet</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm flex items-center mb-4">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            {installedWallets.length > 0 ? (
              <>
                <h3 className="text-sm font-medium text-gray-300 mb-3">Available Wallets</h3>
                {installedWallets.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    disabled={connecting === wallet.id}
                    className="w-full flex items-center justify-between p-4 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors disabled:opacity-50"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{wallet.icon}</span>
                      <span className="font-medium text-white">{wallet.name}</span>
                    </div>
                    {connecting === wallet.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    )}
                  </button>
                ))}
              </>
            ) : (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No Cardano wallets detected</p>
                <p className="text-sm text-gray-500">Please install a Cardano wallet to continue</p>
              </div>
            )}

            {notInstalledWallets.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-gray-400 mb-3 mt-6">Install a Wallet</h3>
                <div className="grid grid-cols-2 gap-2">
                  {notInstalledWallets.slice(0, 4).map((wallet) => (
                    <a
                      key={wallet.id}
                      href={getWalletDownloadUrl(wallet.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors text-sm"
                    >
                      <span className="text-lg">{wallet.icon}</span>
                      <span className="text-gray-300">{wallet.name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>By connecting your wallet, you agree to our</p>
            <p className="mt-1">
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </a>
              {" and "}
              <a href="#" className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </a>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
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
