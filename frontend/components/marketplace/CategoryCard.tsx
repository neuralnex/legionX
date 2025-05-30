"use client"

import type React from "react"

import Link from "next/link"
import { motion } from "framer-motion"

interface CategoryCardProps {
  icon: React.ReactNode
  name: string
  href: string
}

const CategoryCard = ({ icon, name, href }: CategoryCardProps) => {
  return (
    <Link href={href}>
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center h-32"
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.3)",
          borderColor: "#9333ea",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-gray-800/50 rounded-full w-12 h-12 flex items-center justify-center mb-3">{icon}</div>
        <span className="font-medium">{name}</span>
      </motion.div>
    </Link>
  )
}

export default CategoryCard
