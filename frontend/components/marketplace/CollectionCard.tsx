"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface CollectionCardProps {
  id: string
  name: string
  count: string
  image: string
}

const CollectionCard = ({ id, name, count, image }: CollectionCardProps) => {
  return (
    <Link href={`/collections/${id}`}>
      <motion.div
        className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
        whileHover={{
          y: -5,
          boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.3)",
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative h-48">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-gray-300 text-sm">{count}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default CollectionCard
