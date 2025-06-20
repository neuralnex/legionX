"use client"
import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { useConnectWallet, type EnabledWallet } from "@newm.io/cardano-dapp-wallet-connector"

type WalletContextType = {
  wallet: EnabledWallet | null
  address: string | undefined
  balance: any
  rewardAddresses: any[] | undefined
  unusedAddresses: any[] | undefined
  isConnected: boolean
  availableWallets: string[]
  isLoadingWalletData: boolean
  connectWallet: (walletName: string, walletApi?: any) => Promise<void>
  disconnectWallet: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const {
    wallet,
    getAddress,
    ...walletConnector
  } = useConnectWallet()
  
  // Extract connect and disconnect functions safely
  const connectWalletLib = (walletConnector as any).connectWallet
  const disconnectWalletLib = (walletConnector as any).disconnectWallet
  
  const [address, setAddress] = useState<string>()
  const [balance, setBalance] = useState<any>()
  const [rewardAddresses, setRewardAddresses] = useState<any>()
  const [unusedAddresses, setUnusedAddresses] = useState<any>()
  const [availableWallets, setAvailableWallets] = useState<string[]>([])
  const [customWallet, setCustomWallet] = useState<any>(null)
  const [isLoadingWalletData, setIsLoadingWalletData] = useState(false)

  // Check for available wallets on mount
  useEffect(() => {
    const checkAvailableWallets = () => {
      const wallets = []

      // Check for common Cardano wallets
      if (window.cardano?.nami) wallets.push("nami")
      if (window.cardano?.eternl) wallets.push("eternl")
      if (window.cardano?.flint) wallets.push("flint")
      if (window.cardano?.yoroi) wallets.push("yoroi")
      if (window.cardano?.typhon) wallets.push("typhon")
      if (window.cardano?.gerowallet) wallets.push("gerowallet")
      if (window.cardano?.nufi) wallets.push("nufi")
      if (window.cardano?.lace) wallets.push("lace")

      setAvailableWallets(wallets)
    }

    // Check immediately and after a short delay for wallets to load
    checkAvailableWallets()
    const timer = setTimeout(checkAvailableWallets, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Use custom wallet if available, otherwise use library wallet
  const activeWallet = customWallet || wallet

  useEffect(() => {
    if (activeWallet) {
      console.log("🔄 Active wallet detected, extracting data...")
      setIsLoadingWalletData(true)

      // Get wallet address
      if (customWallet) {
        // Handle custom wallet
        console.log("🔧 Handling custom wallet data...")
        handleCustomWalletData(customWallet)
      } else {
        // Handle library wallet
        console.log("📚 Handling library wallet data...")

        // Get reward addresses first (priority for authentication)
        ;(async () => {
          try {
            console.log("🎁 Getting reward addresses (for authentication)...")
            const rewardAddresses = await activeWallet.getRewardAddresses()
            console.log("🎁 Reward addresses result:", rewardAddresses)

            if (rewardAddresses && rewardAddresses.length > 0) {
              setRewardAddresses(rewardAddresses[0])
              console.log("✅ Reward address set for authentication:", rewardAddresses[0])

              // Use reward address as the primary address for authentication
              setAddress(rewardAddresses[0])
              console.log("✅ Using reward address as primary address for auth")
            }
          } catch (error) {
            console.error("❌ Error getting reward addresses:", error)
          }

          try {
            console.log("💰 Getting balance...")
            const walletBalance = activeWallet.getBalance()
            console.log("💰 Balance result:", walletBalance)
            setBalance(walletBalance)
          } catch (error) {
            console.error("❌ Error getting balance:", error)
          }

          try {
            console.log("📭 Getting unused addresses...")
            const unusedAddresses = await activeWallet.getUnusedAddresses()
            console.log("📭 Unused addresses result:", unusedAddresses)
            setUnusedAddresses(unusedAddresses[0])
          } catch (error) {
            console.error("❌ Error getting unused addresses:", error)
          }

          // Only try to get regular address if reward address failed
          if (!rewardAddresses || rewardAddresses.length === 0) {
            console.log("⚠️ No reward address found, trying regular address methods...")

            try {
              console.log("📍 Trying getUsedAddresses as fallback...")
              const usedAddresses = await activeWallet.getUsedAddresses()
              console.log("📍 Used addresses:", usedAddresses)
              if (usedAddresses && usedAddresses.length > 0) {
                console.log("✅ Setting address from getUsedAddresses:", usedAddresses[0])
                setAddress(usedAddresses[0])
              }
            } catch (error) {
              console.error("❌ getUsedAddresses failed:", error)
            }

            if (!address) {
              try {
                console.log("📍 Trying getChangeAddress as final fallback...")
                const changeAddress = await activeWallet.getChangeAddress()
                console.log("📍 Change address:", changeAddress)
                if (changeAddress) {
                  console.log("✅ Setting address from getChangeAddress:", changeAddress)
                  setAddress(changeAddress)
                }
              } catch (error) {
                console.error("❌ getChangeAddress failed:", error)
              }
            }
          }

          setIsLoadingWalletData(false)
        })()
      }
    } else {
      // Only reset state if we actually had a wallet before
      if (address || balance || rewardAddresses || unusedAddresses) {
        console.log("❌ No active wallet, resetting state...")
        setAddress(undefined)
        setBalance(undefined)
        setRewardAddresses(undefined)
        setUnusedAddresses(undefined)
        setIsLoadingWalletData(false)
      }
    }
  }, [activeWallet, customWallet])

  const handleCustomWalletData = async (walletApi: any) => {
    try {
      console.log("🔍 Extracting wallet data from custom wallet API...")

      // Get payment addresses first (priority for authentication)
      let walletAddress = null

      try {
        console.log("📍 Getting used addresses (payment addresses for authentication)...")
        const usedAddresses = await walletApi.getUsedAddresses()
        console.log("📍 Used addresses:", usedAddresses)

        if (usedAddresses && usedAddresses.length > 0) {
          walletAddress = usedAddresses[0]
          console.log("✅ Using payment address for authentication:", walletAddress)
        }
      } catch (error) {
        console.error("❌ Error getting used addresses:", error)
      }

      // Only try reward addresses if payment addresses failed
      if (!walletAddress) {
        console.log("⚠️ No payment address found, trying reward addresses...")

        try {
          console.log("🎁 Getting reward addresses...")
          const rewardAddresses = await walletApi.getRewardAddresses()
          console.log("🎁 Reward addresses:", rewardAddresses)

          if (rewardAddresses && rewardAddresses.length > 0) {
            setRewardAddresses(rewardAddresses[0])
            walletAddress = rewardAddresses[0]
            console.log("✅ Using reward address as fallback:", walletAddress)
          }
        } catch (error) {
          console.log("⚠️ getRewardAddresses failed:", error)
          try {
            console.log("📍 Trying getChangeAddress...")
            const changeAddress = await walletApi.getChangeAddress()
            console.log("📍 Change address:", changeAddress)
            walletAddress = changeAddress
          } catch (error2) {
            console.log("⚠️ getChangeAddress failed:", error2)
          }
        }
      }

      if (walletAddress) {
        console.log("✅ Final wallet address for authentication:", walletAddress)
        setAddress(walletAddress)
      } else {
        console.error("❌ Could not extract any wallet address")
      }

      // Get balance
      try {
        console.log("💰 Getting wallet balance...")
        const balance = await walletApi.getBalance()
        console.log("💰 Balance:", balance)
        setBalance(balance)
      } catch (error) {
        console.error("❌ Error getting balance:", error)
      }

      // Get unused addresses
      try {
        console.log("📭 Getting unused addresses...")
        const unusedAddresses = await walletApi.getUnusedAddresses()
        console.log("📭 Unused addresses:", unusedAddresses)
        if (unusedAddresses && unusedAddresses.length > 0) {
          setUnusedAddresses(unusedAddresses[0])
        }
      } catch (error) {
        console.error("❌ Error getting unused addresses:", error)
      }

      console.log("✅ Custom wallet data extraction completed")
    } catch (error) {
      console.error("❌ Error handling custom wallet data:", error)
    } finally {
      setIsLoadingWalletData(false)
    }
  }

  const handleConnectWallet = async (walletName: string, walletApi?: any) => {
    try {
      console.log(`🔗 Connecting to ${walletName}...`)

      if (walletApi) {
        // Custom wallet connection
        console.log("🔧 Setting custom wallet...")
        setCustomWallet(walletApi)
        console.log(`✅ Custom wallet ${walletName} connected successfully`)
      } else {
        // Library wallet connection
        console.log("📚 Using library wallet connection...")
        await connectWalletLib(walletName)
      }
    } catch (error) {
      console.error(`❌ Error connecting to ${walletName}:`, error)
      throw error
    }
  }

  const handleDisconnectWallet = () => {
    console.log("🔌 Disconnecting wallet...")

    // Clear custom wallet first
    if (customWallet) {
      setCustomWallet(null)
    }

    // Try to disconnect library wallet safely
    try {
      if (disconnectWalletLib && typeof disconnectWalletLib === "function") {
        disconnectWalletLib()
      }
    } catch (error) {
      console.warn("⚠️ Library wallet disconnect failed:", error)
    }

    // Always reset all state regardless of library disconnect success
    setAddress(undefined)
    setBalance(undefined)
    setRewardAddresses(undefined)
    setUnusedAddresses(undefined)
    setIsLoadingWalletData(false)

    console.log("✅ Wallet state cleared")
  }

  const value = {
    wallet: activeWallet,
    address,
    balance,
    rewardAddresses,
    unusedAddresses,
    isConnected: !!activeWallet,
    availableWallets,
    isLoadingWalletData,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnectWallet,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
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
