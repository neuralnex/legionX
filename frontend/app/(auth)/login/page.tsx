"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import useAuthStore from "@/store/useAuthStore"
import { useWallet } from "@/contexts/WalletContext"
import { Wallet, Loader2, CheckCircle2, AlertCircle, ArrowRight, Shield, Zap, Users } from "lucide-react"
import CustomWalletConnect from "@/components/wallet/CustomWalletConnect"

export default function Login() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const router = useRouter()
  const { loginWithWallet, registerWithWallet } = useAuthStore()
  const { wallet, address, rewardAddresses, isConnected, connectWallet, disconnectWallet, isLoadingWalletData } =
    useWallet()
  const [showCustomWalletModal, setShowCustomWalletModal] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Debug logging
  useEffect(() => {
    console.log("🔍 Login page state:", {
      isConnected,
      wallet: !!wallet,
      address,
      rewardAddresses,
      isLoadingWalletData,
      isLoading,
    })
  }, [isConnected, wallet, address, rewardAddresses, isLoadingWalletData, isLoading])

  // Handle wallet connection - now using address (which is set to reward address)
  useEffect(() => {
    console.log("🔄 Checking wallet connection state...")

    if (isLoadingWalletData) {
      setConnectionStatus("Extracting wallet data...")
      console.log("⏳ Wallet data is loading...")
      return
    }

    // Now address should be the reward address, so we can use it directly
    if (isConnected && wallet && address) {
      console.log("✅ Wallet fully connected with address (reward address), starting authentication...")
      console.log("🎯 Using address for auth:", address)
      setConnectionStatus("Authenticating with backend...")
      handleWalletAuth()
    } else if (isConnected && wallet && !address) {
      console.log("⚠️ Wallet connected but no address yet...")
      setConnectionStatus("Getting wallet address...")
    } else if (isConnected && !wallet) {
      console.log("⚠️ Connected but no wallet object...")
      setConnectionStatus("Initializing wallet...")
    } else {
      console.log("❌ Wallet not fully connected yet")
      setConnectionStatus("")
    }
  }, [isConnected, wallet, address, isLoadingWalletData])

  const handleWalletAuth = async () => {
    if (!wallet || !address) {
      console.log("❌ Cannot authenticate: missing wallet or address")
      return
    }

    try {
      console.log("🔐 Starting authentication process...")
      console.log("🎯 Authenticating with address:", address)
      console.log("🎁 Reward address for reference:", rewardAddresses)

      setIsLoading(true)
      setError(null)
      setConnectionStatus("Authenticating...")

      if (authMode === "login") {
        console.log("🔑 Attempting login with reward address...")
        setConnectionStatus("Logging in...")
        // Use address (which is now the reward address) for authentication
        await loginWithWallet(address, rewardAddresses)
        setSuccess("Successfully logged in with wallet!")
        console.log("✅ Login successful!")
      } else {
        console.log("📝 Attempting registration with reward address...")
        setConnectionStatus("Creating account...")
        // Use address (which is now the reward address) for authentication
        await registerWithWallet(address, rewardAddresses)
        setSuccess("Account created successfully!")
        console.log("✅ Registration successful!")
      }

      setConnectionStatus("Redirecting...")
      setTimeout(() => router.push("/marketplace"), 1500)
    } catch (error: any) {
      console.error("❌ Authentication error:", error)
      setConnectionStatus("")

      if (authMode === "login" && (error.message.includes("not found") || error.message.includes("User not found"))) {
        setError("Wallet not found. Please register first.")
        setAuthMode("register")
      } else if (authMode === "register" && error.message.includes("already exists")) {
        setError("Wallet already registered. Please login instead.")
        setAuthMode("login")
      } else {
        setError(error.message || `Failed to ${authMode} with wallet`)
      }
    } finally {
      setIsLoading(false)
      // Safely disconnect the current wallet to allow reconnection
      try {
        if (isConnected) {
          disconnectWallet()
        }
      } catch (disconnectError) {
        console.warn("⚠️ Wallet disconnect failed during cleanup:", disconnectError)
        // Continue anyway - the important thing is that we reset our local state
      }
    }
  }

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure & Decentralized",
      description: "Your wallet, your keys, your control. No passwords to remember or lose.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Instant Access",
      description: "Connect your wallet and start trading AI agents immediately.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Driven",
      description: "Join a decentralized marketplace powered by the Cardano blockchain.",
    },
  ]

  const resetConnectionState = () => {
    setError(null)
    setSuccess(null)
    setConnectionStatus("")
    setIsLoading(false)
    setIsConnecting(false)
    // Safely disconnect the current wallet to allow reconnection
    try {
      if (isConnected) {
        disconnectWallet()
      }
    } catch (disconnectError) {
      console.warn("⚠️ Wallet disconnect failed during reset:", disconnectError)
      // Continue anyway - the UI will still reset properly
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to <span className="text-purple-500">LegionX</span>
          </h1>
          <p className="text-xl text-gray-400 mb-8">Connect your Cardano wallet to access the AI agent marketplace</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Features */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold mb-6">Why Choose Wallet Authentication?</h2>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gray-900/30 rounded-xl border border-gray-800"
              >
                <div className="bg-purple-900/30 text-purple-400 p-3 rounded-full flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Right side - Wallet Connection */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-900/50 p-8 rounded-xl border border-gray-800"
          >
            <div className="text-center mb-6">
              <div className="bg-purple-900/30 text-purple-400 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Wallet className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {authMode === "login" ? "Connect Your Wallet" : "Create Your Account"}
              </h2>
              <p className="text-gray-400">
                {authMode === "login"
                  ? "Sign in to your existing account using your Cardano wallet"
                  : "Register a new account with your Cardano wallet"}
              </p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex border border-gray-700 rounded-lg p-1 mb-6">
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                  authMode === "login" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setAuthMode("login")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-4 rounded-md font-medium text-sm transition-all ${
                  authMode === "register" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                onClick={() => setAuthMode("register")}
              >
                Register
              </button>
            </div>

            {/* Status Messages */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-md text-sm mb-4">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="mb-3">{error}</p>
                    <button
                      onClick={resetConnectionState}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-900/30 border border-green-800 text-green-300 px-4 py-3 rounded-md text-sm flex items-center mb-4">
                <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0" />
                {success}
              </div>
            )}

            {/* Connection Status */}
            {connectionStatus && (
              <div className="bg-blue-900/30 border border-blue-800 text-blue-300 px-4 py-3 rounded-md text-sm flex items-center mb-4">
                <Loader2 className="h-4 w-4 mr-2 animate-spin flex-shrink-0" />
                {connectionStatus}
              </div>
            )}

            {/* Wallet Connection */}
            <div className="space-y-4">
              {isConnected && address ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-800 border border-gray-700 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-300">Connected Wallet</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-400">Authentication Address (Reward Address):</p>
                      <p className="text-sm font-mono text-gray-300">
                        {address.slice(0, 12)}...{address.slice(-8)}
                      </p>
                    </div>
                    {rewardAddresses && address !== rewardAddresses && (
                      <div>
                        <p className="text-xs text-gray-400">Original Reward Address:</p>
                        <p className="text-sm font-mono text-gray-300">
                          {rewardAddresses.toString().slice(0, 12)}...{rewardAddresses.toString().slice(-8)}
                        </p>
                      </div>
                    )}
                  </div>

                  {(isLoading || isLoadingWalletData) && (
                    <div className="mt-4 flex items-center justify-center text-purple-400">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-sm">
                        {isLoadingWalletData
                          ? "Loading wallet data..."
                          : authMode === "login"
                            ? "Signing in..."
                            : "Creating account..."}
                      </span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <>
                  <button
                    onClick={() => setShowCustomWalletModal(true)}
                    disabled={isConnecting || isLoadingWalletData}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
                  >
                    {isConnecting || isLoadingWalletData ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        {isLoadingWalletData ? "Loading wallet..." : "Connecting..."}
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5 mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </button>

                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-4">Choose from multiple Cardano wallets</p>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <span>Supported:</span>
                      <span className="bg-gray-800 px-2 py-1 rounded">Nami</span>
                      <span className="bg-gray-800 px-2 py-1 rounded">Eternl</span>
                      <span className="bg-gray-800 px-2 py-1 rounded">Flint</span>
                      <span className="bg-gray-800 px-2 py-1 rounded">Yoroi</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Custom Wallet Modal */}
            <CustomWalletConnect
              isOpen={showCustomWalletModal}
              onClose={() => setShowCustomWalletModal(false)}
              onConnect={async (walletName, walletApi) => {
                console.log(`🔗 Wallet selection: ${walletName}`)
                setShowCustomWalletModal(false)
                setIsConnecting(true)
                setConnectionStatus(`Connecting to ${walletName}...`)

                try {
                  // Connect the wallet through the context
                  await connectWallet(walletName, walletApi)
                  setSuccess(`${walletName} wallet connected successfully!`)
                  console.log(`✅ ${walletName} connected through context`)
                } catch (error) {
                  console.error("❌ Error in wallet connection:", error)
                  setError(`Failed to connect ${walletName}`)
                  setConnectionStatus("")
                } finally {
                  setIsConnecting(false)
                }
              }}
            />

            {/* Terms */}
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>By connecting your wallet, you agree to our</p>
              <p className="mt-1">
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-400 mb-4">New to Cardano? Learn how to set up a wallet</p>
          <a
            href="https://cardano.org/what-is-a-wallet/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-purple-400 hover:text-purple-300 font-medium"
          >
            Get Started with Cardano
            <ArrowRight className="h-4 w-4 ml-1" />
          </a>
        </motion.div>
      </div>
    </div>
  )
}
