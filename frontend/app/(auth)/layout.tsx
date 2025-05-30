import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Providers } from "@/components/Providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LegionX - Connect Your Wallet",
  description: "Connect your Cardano wallet to access the AI agent marketplace",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a14] text-white min-h-screen`}>
        <Providers>
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  )
}
