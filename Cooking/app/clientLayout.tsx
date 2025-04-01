"use client"

import { useState } from "react"
import type React from "react"
import { Inter } from "next/font/google"

import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Chatbot } from "@/components/chatbot"
import { SocialShare } from "@/components/social-share"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)

  return (
    <html lang="it" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex min-h-screen flex-col">
            <Navbar isChatbotOpen={isChatbotOpen} setIsChatbotOpen={setIsChatbotOpen} />
            <main className="flex-1">{children}</main>
            <Footer />
            <Chatbot isOpen={isChatbotOpen} setIsOpen={setIsChatbotOpen} />
            <SocialShare />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

