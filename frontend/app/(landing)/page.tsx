"use client"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import AgentCard from "@/components/agents/AgentCard"
import CategoryCard from "@/components/marketplace/CategoryCard"
import SellerCard from "@/components/marketplace/SellerCard"
import CollectionCard from "@/components/marketplace/CollectionCard"
import {
  Brain,
  Code,
  FileText,
  MessageSquare,
  BarChart3,
  ImageIcon,
  Coins,
  PlusCircle,
  ShoppingCart,
  ArrowRight,
  Shield,
  Zap,
  Users,
  Globe,
  TrendingUp,
  Star,
  CreditCard,
  Mail,
  Lock,
} from "lucide-react"

export default function LandingPage() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const stats = [
    { value: "94,215", label: "Transactions" },
    { value: "27k", label: "Creators" },
    { value: "4k", label: "per day" },
  ]

  const categories = [
    { icon: <Brain className="h-6 w-6" />, name: "Knowledge", href: "#" },
    { icon: <Code className="h-6 w-6" />, name: "Coding", href: "#" },
    { icon: <FileText className="h-6 w-6" />, name: "Content", href: "#" },
    { icon: <MessageSquare className="h-6 w-6" />, name: "Conversation", href: "#" },
    { icon: <BarChart3 className="h-6 w-6" />, name: "Data Analysis", href: "#" },
    { icon: <ImageIcon className="h-6 w-6" />, name: "Visual", href: "#" },
  ]

  const newAgents = [
    {
      id: "1",
      title: "CodeCraft Pro",
      creator: "Ella Smith",
      price: "$25.00",
      image: "/placeholder.svg?height=400&width=400",
      likes: 42,
    },
    {
      id: "2",
      title: "Data Sage",
      creator: "Alex Kim",
      price: "$18.00",
      image: "/placeholder.svg?height=400&width=400",
      likes: 36,
    },
    {
      id: "3",
      title: "Text Genius",
      creator: "Omar Hassan",
      price: "$15.00",
      image: "/placeholder.svg?height=400&width=400",
      likes: 28,
    },
    {
      id: "4",
      title: "Pixel Muse",
      creator: "Lily Lane",
      price: "$22.00",
      image: "/placeholder.svg?height=400&width=400",
      likes: 38,
    },
  ]

  const topSellers = [
    { id: "1", name: "Sophia Lewis", sales: "$12.4k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "2", name: "Ethan Hart", sales: "$10.1k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "3", name: "Taylor Reese", sales: "$9.6k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "4", name: "Jamie Wright", sales: "$8.7k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "5", name: "Skyler Bennett", sales: "$7.9k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "6", name: "Casey Banks", sales: "$7.2k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "7", name: "Morgan Garcia", sales: "$6.8k", avatar: "/placeholder.svg?height=50&width=50" },
    { id: "8", name: "Riley Evans", sales: "$6.2k", avatar: "/placeholder.svg?height=50&width=50" },
  ]

  const collections = [
    { id: "1", name: "Creativity", count: "50+ AI", image: "/placeholder.svg?height=300&width=300" },
    { id: "2", name: "Productivity", count: "35+ AI", image: "/placeholder.svg?height=300&width=300" },
    { id: "3", name: "Education", count: "40+ AI", image: "/placeholder.svg?height=300&width=300" },
    { id: "4", name: "Research", count: "25+ AI", image: "/placeholder.svg?height=300&width=300" },
  ]

  const steps = [
    {
      icon: <Coins className="h-8 w-8 text-purple-400" />,
      title: "Buy listing points",
      description:
        "Purchase listing points at $1 each. Each point allows you to list one AI agent or model on the marketplace.",
    },
    {
      icon: <PlusCircle className="h-8 w-8 text-purple-400" />,
      title: "List your AI agent",
      description:
        "Use your points to list your pre-built AI agent. Set its capabilities, personality, and your desired price in USD.",
    },
    {
      icon: <ShoppingCart className="h-8 w-8 text-purple-400" />,
      title: "Trade AI agents",
      description:
        "Buy and sell AI agents with secure fiat payments. All transactions are processed instantly via Flutterwave.",
    },
  ]

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-purple-400" />,
      title: "Secure & Reliable",
      description: "Built with enterprise-grade security and reliable payment processing for safe transactions.",
    },
    {
      icon: <Zap className="h-8 w-8 text-purple-400" />,
      title: "Lightning Fast",
      description: "Instant transactions and real-time AI agent interactions powered by cutting-edge technology.",
    },
    {
      icon: <Users className="h-8 w-8 text-purple-400" />,
      title: "Community Driven",
      description: "Join thousands of creators and collectors in the world's premier AI agent marketplace.",
    },
    {
      icon: <Globe className="h-8 w-8 text-purple-400" />,
      title: "Global Access",
      description: "Access AI agents from creators worldwide, no geographical restrictions or barriers.",
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-400" />,
      title: "Proven ROI",
      description: "Track your investments and see real returns from your AI agent portfolio.",
    },
    {
      icon: <Star className="h-8 w-8 text-purple-400" />,
      title: "Premium Quality",
      description: "All AI agents are verified and tested to ensure the highest quality and performance.",
    },
  ]

  const authFeatures = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Simple Email Login",
      description: "Sign in with your email and password - no wallet required to get started.",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Fiat Payments",
      description: "Pay with your credit card or bank account. Secure, instant transactions.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Platform",
      description: "Enterprise-grade security with reliable payment processing for safe transactions.",
    },
  ]

  return (
    <>
      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <motion.div
                className="md:w-1/2 mb-10 md:mb-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-block bg-purple-900/30 text-purple-400 px-4 py-1 rounded-full text-sm font-medium mb-6">
                  AI AGENT MARKETPLACE
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Create, trade & collect
                  <br />
                  AI agents with ease.
                </h1>
                <p className="text-gray-300 mb-8 max-w-lg">
                  The premier marketplace for AI agents with simple fiat payments. 
                  Start with email login, pay with your card, and access powerful AI solutions instantly.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  {stats.map((stat, index) => (
                    <div key={index} className="mr-8 last:mr-0">
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-gray-400 text-sm">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/marketplace">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-medium flex items-center"
                    >
                      Explore Marketplace
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.button>
                  </Link>
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="border border-gray-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800"
                    >
                      Get Started
                    </motion.button>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                className="md:w-1/2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl"></div>
                    <Image
                    src="/placeholder.svg?height=600&width=600"
                    alt="AI Agent Marketplace"
                    width={600}
                    height={600}
                    className="relative z-10 rounded-2xl"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Authentication Features Section */}
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Authentication</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Start with familiar email login and secure fiat payments
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {authFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="bg-purple-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Points System Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Points System</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Our innovative points system makes listing and trading AI agents effortless
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-yellow-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="h-8 w-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Buy Points</h3>
                <p className="text-gray-400">Purchase listing points at $1 each. Each point allows you to list one AI agent.</p>
              </div>

              <div className="text-center">
                <div className="bg-green-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">List Agents</h3>
                <p className="text-gray-400">Use your points to list AI agents with your desired price in USD.</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Get Paid</h3>
                <p className="text-gray-400">Receive payments instantly via secure fiat transactions when your agents sell.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
            <motion.div
                  key={index}
                  className="text-center"
              initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="bg-gray-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LegionX</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                The most advanced AI agent marketplace with the best user experience
              </p>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={item}
                  className="bg-gray-800/50 p-6 rounded-xl"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Explore Categories</h2>
              <p className="text-gray-400">Discover AI agents across different categories</p>
            </div>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              variants={container}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
            >
              {categories.map((category, index) => (
                <motion.div key={index} variants={item}>
                  <CategoryCard icon={category.icon} name={category.name} href={category.href} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* New Agents Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Featured Agents</h2>
              <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  title={agent.title}
                  creator={agent.creator}
                  price={agent.price}
                  image={agent.image}
                  likes={agent.likes}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Top Sellers Section */}
        <section id="creators" className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Top Creators</h2>
              <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {topSellers.map((seller) => (
                <SellerCard
                  key={seller.id}
                  id={seller.id}
                  name={seller.name}
                  sales={seller.sales}
                  avatar={seller.avatar}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Hot Collections Section */}
        <section id="collections" className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Popular Collections</h2>
              <Link href="/login" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  id={collection.id}
                  name={collection.name}
                  count={collection.count}
                  image={collection.image}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
