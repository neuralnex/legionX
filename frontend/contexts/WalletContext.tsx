"use client"
import { useState, useEffect, createContext, useContext, type ReactNode, useCallback } from "react"
import { useConnectWallet, type EnabledWallet } from "@newm.io/cardano-dapp-wallet-connector"
import * as CSL from '@emurgo/cardano-serialization-lib-asmjs';
import { Buffer } from 'buffer';

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
  setAddress: (address: string) => void
  setIsConnected: (connected: boolean) => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const hexToBech32 = (hexAddress: string, networkId: number = 0): string | null => {
  try {
    const address = CSL.Address.from_bytes(Buffer.from(hexAddress, 'hex'));
    if (networkId === 0) { // Testnet
      const testnetAddress = CSL.BaseAddress.from_address(address);
      if(testnetAddress) {
        return testnetAddress.to_address().to_bech32("addr_test");
      }
    }
    return address.to_bech32();
  } catch (e) {
    console.error('Failed to convert hex to bech32:', e);
    return null;
  }
};

const WALLET_STORAGE_KEY = 'legionx_wallet_info';

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
  const [isConnected, setIsConnected] = useState(false)

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
        handleCustomWalletData(customWallet, "custom")
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

            if (unusedAddresses && unusedAddresses.length > 0) {
              const convertedAddresses = unusedAddresses.map((hex: string) => hexToBech32(hex, 0)).filter((a: string | null): a is string => !!a)
              setUnusedAddresses(convertedAddresses)
              console.log("✅ Unused addresses converted and set:", convertedAddresses)
            }
          } catch (error) {
            console.error("❌ Error getting unused addresses:", error)
          }

          setIsLoadingWalletData(false)
          setIsConnected(true)
          console.log("✅ Library wallet data extraction completed")
        })()
      }
    }
  }, [activeWallet, customWallet])

  const handleCustomWalletData = async (walletApi: any, walletName?: string) => {
    try {
      console.log('🔧 Starting custom wallet data extraction...')
      
      // Get network ID
      const networkId = await walletApi.getNetworkId()
      console.log('🌐 Network ID:', networkId)

      // Get reward addresses (priority for authentication)
      console.log('🎁 Getting reward addresses...')
      const rewardHexAddresses = await walletApi.getRewardAddresses()
      const rewardAddresses = rewardHexAddresses?.map((hex: string) => hexToBech32(hex, networkId)).filter((a: string | null): a is string => !!a)
      
      if (rewardAddresses && rewardAddresses.length > 0) {
        setRewardAddresses(rewardAddresses[0])
        console.log('🎁 Reward addresses:', rewardAddresses)

        // Use reward address as the primary address for authentication
        const authAddress = rewardAddresses[0]
        setAddress(authAddress)
        setIsConnected(true)
        if (walletName) persistWalletInfo(walletName, authAddress)
        console.log('✅ Final wallet address for authentication:', authAddress)
      }
      
      console.log('💰 Getting wallet balance...');
      const balance = await walletApi.getBalance();
      setBalance(balance);
      console.log('💰 Balance:', balance);

      console.log('📭 Getting unused addresses...');
      const unusedHexAddresses = await walletApi.getUnusedAddresses();
      const unusedAddresses = unusedHexAddresses?.map((hex: string) => hexToBech32(hex, networkId)).filter((a: string | null): a is string => !!a);
      setRewardAddresses(unusedAddresses?.[0]);
      console.log('📭 Unused addresses:', unusedAddresses);

      console.log('✅ Custom wallet data extraction completed');
    } catch (error) {
      console.error('❌ Error handling custom wallet data:', error);
    } finally {
      setIsLoadingWalletData(false);
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
        await handleCustomWalletData(walletApi, walletName)
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
    setIsConnected(false)

    console.log("✅ Wallet state cleared")
  }

  // Save wallet info to localStorage
  const persistWalletInfo = (walletName: string, address: string) => {
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify({ walletName, address }));
  };

  // Remove wallet info from localStorage
  const clearPersistedWalletInfo = () => {
    localStorage.removeItem(WALLET_STORAGE_KEY);
  };

  // Restore wallet info from localStorage on mount
  useEffect(() => {
    const restoreWallet = async () => {
      const isLoggedOut = localStorage.getItem('legionx_logout') === 'true';
      if (isLoggedOut) {
        // Do not auto-login if user has explicitly logged out
        setIsConnected(false);
        setAddress(undefined);
        return;
      }
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        try {
          const { walletName, address } = JSON.parse(stored);
          if (walletName && address) {
            setIsConnected(true);
            setAddress(address);
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    };
    restoreWallet();
  }, []);

  const value = {
    wallet: activeWallet,
    address,
    balance,
    rewardAddresses,
    unusedAddresses,
    isConnected,
    availableWallets,
    isLoadingWalletData,
    connectWallet: handleConnectWallet,
    disconnectWallet: handleDisconnectWallet,
    setAddress,
    setIsConnected,
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
