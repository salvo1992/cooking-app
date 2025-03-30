"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Save, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { authApi, userApi } from "@/lib/api"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [expiryAlerts, setExpiryAlerts] = useState(true)
  const [recipeSuggestions, setRecipeSuggestions] = useState(true)

  // Carica i dati dell'utente
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Verifica se l'utente è autenticato
        if (!authApi.isAuthenticated()) {
          router.push("/login")
          return
        }

        // Carica il profilo utente dal backend
        const userData = await userApi.getProfile()
        setUser(userData)
        setName(userData.name)
        setEmail(userData.email)

        // Imposta le preferenze se disponibili
        if (userData.preferences) {
          setNotifications(userData.preferences.notifications)
          setExpiryAlerts(userData.preferences.expiryAlerts)
          setRecipeSuggestions(userData.preferences.recipeSuggestions)
        }
      } catch (error) {
        console.error("Errore durante il recupero del profilo:", error)
        // Se c'è un errore di autenticazione, reindirizza al login
        router.push("/login")
      }
    }

    fetchUserProfile()
  }, [router])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Aggiorna le preferenze
      const preferences = {
        notifications,
        expiryAlerts,
        recipeSuggestions,
      }

      // Invia l'aggiornamento al backend
      const updatedUser = await userApi.updateProfile(name, email, preferences)

      // Aggiorna lo stato locale
      setUser(updatedUser)

      // Aggiorna i dati utente nel localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...authApi.getCurrentUser(),
          name,
          email,
          preferences,
        }),
      )

      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state aggiornate con successo",
      })
    } catch (error: any) {
      console.error("Errore durante l'aggiornamento del profilo:", error)
      toast({
        title: "Errore",
        description: error.response?.data?.error || "Si è verificato un errore durante l'aggiornamento del profilo",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validazione
      if (!currentPassword || !newPassword || !confirmPassword) {
        toast({
          title: "Errore",
          description: "Compila tutti i campi",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (newPassword !== confirmPassword) {
        toast({
          title: "Errore",
          description: "Le nuove password non corrispondono",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Invia l'aggiornamento al backend
      await userApi.updatePassword(currentPassword, newPassword)

      toast({
        title: "Password aggiornata",
        description: "La tua password è stata aggiornata con successo",
      })

      // Resetta i campi
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Errore durante l'aggiornamento della password:", error)
      toast({
        title: "Errore",
        description: error.response?.data?.error || "Si è verificato un errore durante l'aggiornamento della password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    authApi.logout()

    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo",
    })

    // Reindirizza alla home
    router.push("/")
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accesso richiesto</AlertTitle>
          <AlertDescription>Devi effettuare l'accesso per visualizzare questa pagina.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Profilo</h1>
          <p className="text-muted-foreground">Gestisci le tue informazioni personali e le impostazioni</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="md:w-1/3">
            <CardHeader>
              <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt={name} />
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">{name}</CardTitle>
                <CardDescription>{email}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="w-full">
                  Cambia Immagine
                </Button>
                <Button variant="destructive" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex-1">
            <Tabs defaultValue="account">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>

              <TabsContent value="account">
                <Card>
                  <CardHeader>
                    <CardTitle>Informazioni Account</CardTitle>
                    <CardDescription>Aggiorna le tue informazioni personali</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>

                        <Separator className="my-4" />

                        <div className="space-y-4">
                          <h3 className="text-lg font-medium">Preferenze</h3>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="notifications">Notifiche Email</Label>
                              <div className="text-sm text-muted-foreground">
                                Ricevi email per promemoria e aggiornamenti
                              </div>
                            </div>
                            <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="expiry-alerts">Avvisi di Scadenza</Label>
                              <div className="text-sm text-muted-foreground">
                                Ricevi notifiche per prodotti in scadenza
                              </div>
                            </div>
                            <Switch id="expiry-alerts" checked={expiryAlerts} onCheckedChange={setExpiryAlerts} />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="recipe-suggestions">Suggerimenti Ricette</Label>
                              <div className="text-sm text-muted-foreground">
                                Ricevi suggerimenti di ricette in base ai tuoi ingredienti
                              </div>
                            </div>
                            <Switch
                              id="recipe-suggestions"
                              checked={recipeSuggestions}
                              onCheckedChange={setRecipeSuggestions}
                            />
                          </div>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleProfileUpdate} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Salvataggio...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Salva Modifiche
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Cambia Password</CardTitle>
                    <CardDescription>Aggiorna la password del tuo account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Password Attuale</Label>
                          <Input
                            id="current-password"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password">Nuova Password</Label>
                          <Input
                            id="new-password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password">Conferma Nuova Password</Label>
                          <Input
                            id="confirm-new-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>
                    </form>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={handlePasswordUpdate}
                      disabled={isLoading || !currentPassword || !newPassword || newPassword !== confirmPassword}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Aggiornamento...
                        </>
                      ) : (
                        "Aggiorna Password"
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}

