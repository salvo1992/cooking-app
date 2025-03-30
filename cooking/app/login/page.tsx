"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChefHat } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"

export default function LoginPage() {
  const router = useRouter()
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validazione
      if (!loginEmail || !loginPassword) {
        toast({
          title: "Errore",
          description: "Inserisci email e password",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Effettua il login
      const response = await authApi.login(loginEmail, loginPassword)

      // Salva il token e i dati utente
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      toast({
        title: "Accesso effettuato",
        description: `Benvenuto, ${response.user.name}!`,
      })

      // Reindirizza alla home
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      console.error("Errore durante il login:", error)
      toast({
        title: "Errore",
        description: error.response?.data?.error || "Si è verificato un errore durante l'accesso",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validazione
      if (!registerName || !registerEmail || !registerPassword || !registerConfirmPassword) {
        toast({
          title: "Errore",
          description: "Compila tutti i campi",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (registerPassword !== registerConfirmPassword) {
        toast({
          title: "Errore",
          description: "Le password non corrispondono",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Effettua la registrazione
      const response = await authApi.register(registerName, registerEmail, registerPassword)

      // Salva il token e i dati utente
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      toast({
        title: "Registrazione completata",
        description: "Il tuo account è stato creato con successo",
      })

      // Reindirizza alla home
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      console.error("Errore durante la registrazione:", error)
      toast({
        title: "Errore",
        description: error.response?.data?.error || "Si è verificato un errore durante la registrazione",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <ChefHat className="h-10 w-10" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">CucinaApp</h1>
          <p className="text-sm text-muted-foreground">
            Accedi o registrati per gestire le tue ricette e la tua alimentazione
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Accedi</TabsTrigger>
            <TabsTrigger value="register">Registrati</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Accedi</CardTitle>
                <CardDescription>Inserisci le tue credenziali per accedere al tuo account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nome@esempio.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                          href="/reset-password"
                          className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                          Password dimenticata?
                        </Link>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Accesso in corso...
                        </>
                      ) : (
                        "Accedi"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Registrati</CardTitle>
                <CardDescription>Crea un nuovo account per iniziare a usare CucinaApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        placeholder="Il tuo nome"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nome@esempio.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Conferma Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Registrazione in corso...
                        </>
                      ) : (
                        "Registrati"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Registrandoti, accetti i nostri{" "}
                <Link href="/termini" className="underline underline-offset-4 hover:text-primary">
                  Termini di Servizio
                </Link>{" "}
                e la{" "}
                <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

