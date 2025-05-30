import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "../globals.css"
import { Providers } from "@/components/Providers"
import Navbar from "@/components/layout/Navbar"
import AuthGuard from "@/components/auth/AuthGuard"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LegionX - AI Agent Marketplace",
  description: "Create, sell or collect AI agents on the blockchain",
}

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-[#0a0a14] text-white min-h-screen`}>
        <Providers>
          <AuthGuard>
            <Navbar />
            <main className="container mx-auto px-4 pb-16">{children}</main>
          </AuthGuard>
        </Providers>
      </body>
    </html>
  )
}
