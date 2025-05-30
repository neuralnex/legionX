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
        Wallet,
        PlusCircle,
        ShoppingCart,
        ArrowRight,
        Shield,
        Zap,
        Users,
        Globe,
        TrendingUp,
        Star,
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
                        price: "0.25 ETH",
                        image: "/placeholder.svg?height=400&width=400",
                        likes: 42,
                },
                {
                        id: "2",
                        title: "Data Sage",
                        creator: "Alex Kim",
                        price: "0.18 ETH",
                        image: "/placeholder.svg?height=400&width=400",
                        likes: 36,
                },
                {
                        id: "3",
                        title: "Text Genius",
                        creator: "Omar Hassan",
                        price: "0.15 ETH",
                        image: "/placeholder.svg?height=400&width=400",
                        likes: 28,
                },
                {
                        id: "4",
                        title: "Pixel Muse",
                        creator: "Lily Lane",
                        price: "0.22 ETH",
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
                        icon: <Wallet className="h-8 w-8 text-purple-400" />,
                        title: "Connect your wallet",
                        description:
                                "Connect your Cardano wallet to get started. Your wallet is your identity and payment method on the platform.",
                },
                {
                        icon: <PlusCircle className="h-8 w-8 text-purple-400" />,
                        title: "Create your AI agent",
                        description:
                                "Build your AI agent with our intuitive tools. Define its capabilities, personality, and set your price.",
                },
                {
                        icon: <ShoppingCart className="h-8 w-8 text-purple-400" />,
                        title: "Trade AI agents",
                        description:
                                "Buy and sell AI agents on our decentralized marketplace. All transactions are secured by the blockchain.",
                },
        ]

        const features = [
                {
                        icon: <Shield className="h-8 w-8 text-purple-400" />,
                        title: "Secure & Decentralized",
                        description: "Built on Cardano blockchain for maximum security and true ownership of your AI agents.",
                },
                {
                        icon: <Zap className="h-8 w-8 text-purple-400" />,
                        title: "Lightning Fast",
                        description: "Instant transactions and real-time AI agent interactions powered by cutting-edge technology.",
                },
                {
                        icon: <Users className="h-8 w-8 text-purple-400" />,
                        title: "Community Driven",
                        description: "Join thousands of creators and collectors in the world's first AI agent marketplace.",
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
                                                                        DECENTRALIZED AI MARKETPLACE
                                                                </span>
                                                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                                                                        Create, trade & collect
                                                                        <br />
                                                                        AI agents on Cardano.
                                                                </h1>
                                                                <p className="text-gray-300 mb-8 max-w-lg">
                                                                        The first decentralized marketplace for AI agents built on Cardano. Connect your wallet to start
                                                                        trading AI-powered solutions secured by blockchain technology.
                                                                </p>

                                                                <div className="flex flex-wrap gap-4 mb-8">
                                                                        {stats.map((stat, index) => (
                                                                                <div key={index} className="mr-8 last:mr-0">
                                                                                        <div className="text-3xl font-bold text-white">{stat.value}</div>
                                                                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                                                                </div>
                                                                        ))}
                                                                </div>

                                                                <div className="flex flex-col sm:flex-row gap-4">
                                                                        <Link href="/login">
                                                                                <motion.button
                                                                                        whileHover={{ scale: 1.05 }}
                                                                                        whileTap={{ scale: 0.95 }}
                                                                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-medium flex items-center justify-center text-lg"
                                                                                >
                                                                                        <Wallet className="h-5 w-5 mr-2" />
                                                                                        Get Started
                                                                                </motion.button>
                                                                        </Link>

                                                                        <button
                                                                                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                                                                                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-medium flex items-center justify-center border border-gray-700 text-lg"
                                                                        >
                                                                                Learn More
                                                                                <ArrowRight className="h-5 w-5 ml-2" />
                                                                        </button>
                                                                </div>
                                                        </motion.div>

                                                        <motion.div
                                                                className="md:w-1/2 grid grid-cols-2 gap-4"
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ duration: 0.5, delay: 0.2 }}
                                                        >
                                                                <div className="space-y-4">
                                                                        <div className="rounded-lg overflow-hidden h-40 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
                                                                                <Image
                                                                                        src="/placeholder.svg?height=200&width=200"
                                                                                        alt="AI Agent"
                                                                                        width={100}
                                                                                        height={100}
                                                                                        className="rounded-lg"
                                                                                />
                                                                        </div>
                                                                        <div className="rounded-lg overflow-hidden h-32 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
                                                                                <Image
                                                                                        src="/placeholder.svg?height=200&width=200"
                                                                                        alt="AI Agent"
                                                                                        width={80}
                                                                                        height={80}
                                                                                        className="rounded-lg"
                                                                                />
                                                                        </div>
                                                                </div>
                                                                <div className="space-y-4 mt-8">
                                                                        <div className="rounded-lg overflow-hidden h-32 bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-center">
                                                                                <Image
                                                                                        src="/placeholder.svg?height=200&width=200"
                                                                                        alt="AI Agent"
                                                                                        width={80}
                                                                                        height={80}
                                                                                        className="rounded-lg"
                                                                                />
                                                                        </div>
                                                                        <div className="rounded-lg overflow-hidden h-40 bg-gradient-to-br from-violet-900 to-purple-900 flex items-center justify-center">
                                                                                <Image
                                                                                        src="/placeholder.svg?height=200&width=200"
                                                                                        alt="AI Agent"
                                                                                        width={100}
                                                                                        height={100}
                                                                                        className="rounded-lg"
                                                                                />
                                                                        </div>
                                                                </div>
                                                        </motion.div>
                                                </div>
                                        </div>
                                </section>

                                {/* Features Section */}
                                <section id="features" className="py-16" ref={ref}>
                                        <div className="container mx-auto px-4">
                                                <motion.div
                                                        className="text-center mb-16"
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={inView ? { opacity: 1, y: 0 } : {}}
                                                        transition={{ duration: 0.5 }}
                                                >
                                                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose LegionX?</h2>
                                                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                                                                Experience the future of AI trading with our revolutionary decentralized marketplace
                                                        </p>
                                                </motion.div>

                                                <motion.div
                                                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                                                        variants={container}
                                                        initial="hidden"
                                                        animate={inView ? "show" : "hidden"}
                                                >
                                                        {features.map((feature, index) => (
                                                                <motion.div
                                                                        key={index}
                                                                        variants={item}
                                                                        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-colors"
                                                                >
                                                                        <div className="bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                                                                                {feature.icon}
                                                                        </div>
                                                                        <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                                                                        <p className="text-gray-400">{feature.description}</p>
                                                                </motion.div>
                                                        ))}
                                                </motion.div>
                                        </div>
                                </section>

                                {/* Categories Section */}
                                <section className="py-16">
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
                                <section id="creators" className="py-16">
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

                                {/* How It Works Section */}
                                <section id="how-it-works" className="py-16">
                                        <div className="container mx-auto px-4">
                                                <div className="text-center mb-16">
                                                        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
                                                        <p className="text-gray-400 text-lg">Get started in three simple steps</p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                        {steps.map((step, index) => (
                                                                <motion.div
                                                                        key={index}
                                                                        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center relative"
                                                                        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.3)" }}
                                                                        transition={{ duration: 0.2 }}
                                                                >
                                                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                                                                                {index + 1}
                                                                        </div>
                                                                        <div className="bg-gray-800/50 rounded-full w-16 h-16 flex items-center justify-center mb-6 mx-auto mt-4">
                                                                                {step.icon}
                                                                        </div>
                                                                        <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                                                                        <p className="text-gray-400">{step.description}</p>
                                                                </motion.div>
                                                        ))}
                                                </div>

                                                <div className="text-center mt-12">
                                                        <Link href="/login">
                                                                <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-medium text-lg"
                                                                >
                                                                        Start Trading Now
                                                                </motion.button>
                                                        </Link>
                                                </div>
                                        </div>
                                </section>

                                {/* CTA Section */}
                                <section className="py-16 bg-gradient-to-r from-purple-900/20 to-indigo-900/20">
                                        <div className="container mx-auto px-4 text-center">
                                                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Join the Revolution?</h2>
                                                <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                                                        Connect your Cardano wallet and start trading AI agents today. Be part of the future of decentralized AI.
                                                </p>
                                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                                        <Link href="/login">
                                                                <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-8 py-4 rounded-full font-medium text-lg flex items-center justify-center"
                                                                >
                                                                        <Wallet className="h-5 w-5 mr-2" />
                                                                        Connect Wallet
                                                                </motion.button>
                                                        </Link>
                                                </div>
                                        </div>
                                </section>
                        </div>
                </>
        )
}
