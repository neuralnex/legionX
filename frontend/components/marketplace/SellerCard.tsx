"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface SellerCardProps {
  id: string
  name: string
  sales: string
  avatar: string
}

const SellerCard = ({ id, name, sales, avatar }: SellerCardProps) => {
  return (
    <Link href={`/creators/${id}`}>
      <motion.div
        className="flex items-center p-4 rounded-xl"
        whileHover={{
          backgroundColor: "rgba(124, 58, 237, 0.1)",
          scale: 1.02,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative w-10 h-10 mr-3">
          <Image
            src={avatar || "/placeholder.svg"}
            alt={name}
            fill
            className="rounded-full object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <h3 className="font-medium text-sm">{name}</h3>
          <p className="text-gray-400 text-xs">{sales}</p>
        </div>
      </motion.div>
    </Link>
  )
}

export default SellerCard
