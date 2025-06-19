"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAgentDetail } from "@/hooks/useMarketplace"
import { Wallet, CheckCircle2, XCircle, ArrowLeft, Loader2, AlertCircle, ChevronRight } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { ConnectWallet } from "@newm.io/cardano-dapp-wallet-connector"

type PurchaseStep = "connect-wallet" | "confirmation" | "success" | "error"

export default function PurchasePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: agent, isLoading, isError } = useAgentDetail(params.id)
  const [currentStep, setCurrentStep] = useState<PurchaseStep>("connect-wallet")
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  const { isConnected, address, rewardAddresses } = useWallet()

  const handlePayment = async () => {
    if (!isConnected || !address) {
      return
    }

    setIsProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Generate transaction hash
      setTransactionHash("0x" + Math.random().toString(16).substring(2, 42))

      // In a real implementation, you would send the transaction using the reward address
      console.log("Using reward address for transaction:", rewardAddresses)

      setCurrentStep("confirmation")
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setCurrentStep("success")
    } catch (error) {
      setCurrentStep("error")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGoBack = () => {
    router.push(`/agents/${params.id}`)
  }

  const handleRetry = () => {
    setCurrentStep("connect-wallet")
    setTransactionHash(null)
  }

  const handleFinish = () => {
    router.push("/marketplace")
  }

  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    )
  }

  if (isError || !agent) {
    return (
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-6 py-4 rounded-xl">
            <p>Error loading agent details. Please try again later.</p>
            <Link href="/marketplace" className="text-red-300 underline mt-2 inline-block">
              Return to marketplace
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center mb-8">
            <button onClick={handleGoBack} className="text-gray-400 hover:text-white mr-4" aria-label="Go back">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold">Purchase AI Agent</h1>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "connect-wallet"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  <Wallet className="h-4 w-4" />
                </div>
                <span className="text-xs mt-2 text-gray-400">Connect Wallet</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-gray-800"></div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "confirmation"
                      ? "bg-purple-600 text-white"
                      : currentStep === "success" || currentStep === "error"
                        ? "bg-gray-800 text-gray-400 border border-gray-700"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  2
                </div>
                <span className="text-xs mt-2 text-gray-400">Confirmation</span>
              </div>
              <div className="flex-1 h-0.5 mx-2 bg-gray-800"></div>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep === "success"
                      ? "bg-green-600 text-white"
                      : currentStep === "error"
                        ? "bg-red-600 text-white"
                        : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
                >
                  {currentStep === "success" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : currentStep === "error" ? (
                    <XCircle className="h-5 w-5" />
                  ) : (
                    3
                  )}
                </div>
                <span className="text-xs mt-2 text-gray-400">Complete</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
            {/* Agent Summary - Always visible */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-center">
                <div className="relative w-16 h-16 mr-4 rounded-lg overflow-hidden">
                  <Image
                    src={agent.image || "/placeholder.svg"}
                    alt={agent.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{agent.title}</h2>
                  <p className="text-gray-400 text-sm">Created by {agent.creator.name || agent.creator.email || 'Unknown Creator'}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xl font-bold text-purple-400">{agent.price}</span>
                </div>
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {currentStep === "connect-wallet" && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Connect Your Wallet to Purchase</h3>

                  <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    {isConnected && address ? (
                      <div>
                        <p className="text-gray-300 mb-4">Wallet connected! Click below to complete the purchase.</p>
                        <div className="bg-gray-900 rounded-lg p-4 mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-gray-300">Connected Wallet</span>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs text-gray-400">Wallet Address:</p>
                              <p className="text-sm font-mono text-gray-300">
                                {address.slice(0, 12)}...{address.slice(-8)}
                              </p>
                            </div>
                            {rewardAddresses && (
                              <div>
                                <p className="text-xs text-gray-400">Reward Address:</p>
                                <p className="text-sm font-mono text-gray-300">
                                  {rewardAddresses.toString().slice(0, 12)}...{rewardAddresses.toString().slice(-8)}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        <motion.button
                          onClick={handlePayment}
                          disabled={isProcessing}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center disabled:opacity-70"
                        >
                          {isProcessing ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <>
                              Purchase for {agent.price}
                              <ChevronRight className="h-5 w-5 ml-2" />
                            </>
                          )}
                        </motion.button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-300 mb-4">
                          Connect your Cardano wallet to complete the purchase. You will be asked to sign a transaction.
                        </p>
                        <ConnectWallet />

                        <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                          <p className="text-blue-300 text-sm">
                            💡 Make sure you have enough ADA in your wallet to cover the purchase price and transaction
                            fees.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === "confirmation" && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 text-purple-500 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Processing Your Purchase</h3>
                  <p className="text-gray-400 mb-4">Please wait while we confirm your transaction on the blockchain.</p>
                  {transactionHash && (
                    <div className="bg-gray-800 rounded-lg p-3 max-w-md mx-auto">
                      <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
                      <p className="text-sm font-mono break-all">{transactionHash}</p>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "success" && (
                <div className="text-center py-8">
                  <div className="bg-green-900/20 text-green-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Purchase Successful!</h3>
                  <p className="text-gray-400 mb-6">
                    You now have access to {agent.title}. The AI agent has been added to your collection.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <motion.button
                      onClick={handleFinish}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium"
                    >
                      Go to Marketplace
                    </motion.button>
                    <Link href="/profile/collection">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gray-800 text-white py-3 px-6 rounded-xl font-medium"
                      >
                        View My Collection
                      </motion.button>
                    </Link>
                  </div>
                </div>
              )}

              {currentStep === "error" && (
                <div className="text-center py-8">
                  <div className="bg-red-900/20 text-red-500 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <AlertCircle className="h-12 w-12" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Transaction Failed</h3>
                  <p className="text-gray-400 mb-6">There was an error processing your payment. Please try again.</p>
                  <motion.button
                    onClick={handleRetry}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium"
                  >
                    Try Again
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
