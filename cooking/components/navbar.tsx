"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ChefHat, Sun, Moon, ShoppingBag, Calendar, Users, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { authApi } from "@/lib/api"

interface NavbarProps {
  isChatbotOpen: boolean
  setIsChatbotOpen: (isOpen: boolean) => void
}

export function Navbar({ isChatbotOpen, setIsChatbotOpen }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const user = authApi.getCurrentUser()

  // Definizione dei link di navigazione, incluse le nuove funzionalità
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/ricette", label: "Ricette" },
    { href: "/lista-spesa", label: "Lista della Spesa", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { href: "/dispensa", label: "Dispensa" },
    { href: "/dieta", label: "Dieta" },
    { href: "/pianificazione-pasti", label: "Pianificazione Pasti", icon: <Calendar className="h-4 w-4 mr-2" /> },
    { href: "/community", label: "Community", icon: <Users className="h-4 w-4 mr-2" /> },
    { href: "/cucina-con-amici", label: "Cucina con Amici", icon: <Users className="h-4 w-4 mr-2" /> },
    { href: "/note", label: "Note" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <ChefHat className="h-6 w-6 mr-2" />
            <span className="font-bold text-xl">CucinaApp</span>
          </Link>
        </div>

        {/* Navigazione desktop */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Cambia tema</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className="hidden md:flex"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="sr-only">Apri chatbot</span>
          </Button>

          {user ? (
            <Link href="/profilo">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Button asChild variant="default" size="sm" className="hidden md:flex">
              <Link href="/login">Accedi</Link>
            </Button>
          )}

          {/* Menu mobile */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Apri menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 py-4">
                <Link href="/" className="flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <ChefHat className="h-6 w-6 mr-2" />
                  <span className="font-bold text-xl">CucinaApp</span>
                </Link>
                <div className="flex flex-col space-y-3">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium transition-colors hover:text-primary flex items-center ${
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.icon}
                      {link.label}
                    </Link>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsChatbotOpen(!isChatbotOpen)
                    setIsMenuOpen(false)
                  }}
                >
                  <MessageSquare className="h-5 w-5" />
                  <span className="sr-only">Apri chatbot</span>
                </Button>
                <div className="flex items-center space-x-2 mt-4">
                  <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Cambia tema</span>
                  </Button>

                  {user ? (
                    <Link href="/profilo" onClick={() => setIsMenuOpen(false)}>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  ) : (
                    <Button asChild variant="default" size="sm" onClick={() => setIsMenuOpen(false)}>
                      <Link href="/login">Accedi</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
