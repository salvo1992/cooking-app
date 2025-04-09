"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Users, Calendar, Plus, ShoppingBag, Share2, Trash2, Edit, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { recipeApi, type Recipe } from "@/lib/api"

interface Friend {
  id: string
  name: string
  avatar: string
  email: string
}

interface CookingEvent {
  id: string
  title: string
  description: string
  date: Date
  location: string
  organizer: Friend
  participants: Friend[]
  recipes: {
    id: string
    title: string
    image: string
  }[]
  shoppingList: {
    id: string
    name: string
    quantity: string
    assignedTo: Friend | null
    checked: boolean
  }[]
  notes: string
}

export default function CucinaConAmiciPage() {
  const router = useRouter()
  const [events, setEvents] = useState<CookingEvent[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewEventDialog, setShowNewEventDialog] = useState(false)
  const [showInviteFriendDialog, setShowInviteFriendDialog] = useState(false)
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState(false)
  const [showSharedListDialog, setShowSharedListDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CookingEvent | null>(null)
  const [newEventData, setNewEventData] = useState({
    title: "",
    description: "",
    date: new Date(),
    location: "",
    selectedFriends: [] as string[],
    selectedRecipes: [] as string[],
  })
  const [friendEmail, setFriendEmail] = useState("")

  // Carica i dati
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // In un'implementazione reale, qui caricheresti gli eventi, gli amici e le ricette dal backend
        // Per ora, usiamo dati di esempio

        // Carica le ricette
        const loadedRecipes = await recipeApi.getAll()
        setRecipes(loadedRecipes)

        // Crea amici di esempio
        const exampleFriends: Friend[] = [
          {
            id: "friend-1",
            name: "Marco Rossi",
            avatar: "/placeholder.svg?height=40&width=40",
            email: "marco.rossi@example.com",
          },
          {
            id: "friend-2",
            name: "Giulia Bianchi",
            avatar: "/placeholder.svg?height=40&width=40",
            email: "giulia.bianchi@example.com",
          },
          {
            id: "friend-3",
            name: "Alessandro Verdi",
            avatar: "/placeholder.svg?height=40&width=40",
            email: "alessandro.verdi@example.com",
          },
          {
            id: "friend-4",
            name: "Francesca Neri",
            avatar: "/placeholder.svg?height=40&width=40",
            email: "francesca.neri@example.com",
          },
        ]

        // Crea eventi di esempio
        const exampleEvents: CookingEvent[] = [
          {
            id: "event-1",
            title: "Cena Italiana",
            description: "Prepariamo insieme alcune specialità italiane per festeggiare il compleanno di Marco!",
            date: new Date(Date.now() + 604800000), // 7 giorni nel futuro
            location: "Casa mia, Via Roma 123",
            organizer: exampleFriends[0],
            participants: [exampleFriends[0], exampleFriends[1], exampleFriends[2]],
            recipes: [
              {
                id: loadedRecipes[0]?.id || "recipe-1",
                title: loadedRecipes[0]?.title || "Pasta al Pomodoro",
                image: loadedRecipes[0]?.image || "/placeholder.svg?height=100&width=100",
              },
              {
                id: loadedRecipes[1]?.id || "recipe-2",
                title: loadedRecipes[1]?.title || "Tiramisù",
                image: loadedRecipes[1]?.image || "/placeholder.svg?height=100&width=100",
              },
            ],
            shoppingList: [
              {
                id: "item-1",
                name: "Pomodori",
                quantity: "500g",
                assignedTo: exampleFriends[0],
                checked: false,
              },
              {
                id: "item-2",
                name: "Pasta",
                quantity: "1kg",
                assignedTo: exampleFriends[1],
                checked: true,
              },
              {
                id: "item-3",
                name: "Mascarpone",
                quantity: "250g",
                assignedTo: exampleFriends[2],
                checked: false,
              },
            ],
            notes: "Ricordatevi di portare un po' di vino! Iniziamo a cucinare alle 18:00.",
          },
          {
            id: "event-2",
            title: "Brunch Domenicale",
            description: "Un brunch rilassante con amici per provare nuove ricette.",
            date: new Date(Date.now() + 1209600000), // 14 giorni nel futuro
            location: "Casa di Giulia, Viale Garibaldi 45",
            organizer: exampleFriends[1],
            participants: [exampleFriends[0], exampleFriends[1], exampleFriends[3]],
            recipes: [
              {
                id: loadedRecipes[2]?.id || "recipe-3",
                title: loadedRecipes[2]?.title || "Pancakes",
                image: loadedRecipes[2]?.image || "/placeholder.svg?height=100&width=100",
              },
            ],
            shoppingList: [
              {
                id: "item-4",
                name: "Uova",
                quantity: "12",
                assignedTo: exampleFriends[1],
                checked: false,
              },
              {
                id: "item-5",
                name: "Farina",
                quantity: "500g",
                assignedTo: null,
                checked: false,
              },
            ],
            notes: "Porterò anche della frutta fresca. Chi può portare il succo d'arancia?",
          },
        ]

        setFriends(exampleFriends)
        setEvents(exampleEvents)
        setLoading(false)
      } catch (error) {
        console.error("Errore durante il caricamento dei dati:", error)
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento dei dati",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Gestisce la creazione di un nuovo evento
  const handleCreateEvent = () => {
    if (!newEventData.title || !newEventData.date || !newEventData.location) {
      toast({
        title: "Dati mancanti",
        description: "Per favore, compila tutti i campi obbligatori",
        variant: "destructive",
      })
      return
    }

    // In un'implementazione reale, qui invieresti i dati al backend
    const selectedFriendObjects = friends.filter((friend) => newEventData.selectedFriends.includes(friend.id))
    const selectedRecipeObjects = recipes
      .filter((recipe) => newEventData.selectedRecipes.includes(recipe.id || ""))
      .map((recipe) => ({
        id: recipe.id || "",
        title: recipe.title,
        image: recipe.image,
      }))

    const newEvent: CookingEvent = {
      id: `event-${Date.now()}`,
      title: newEventData.title,
      description: newEventData.description,
      date: newEventData.date,
      location: newEventData.location,
      organizer: {
        id: "current-user",
        name: "Tu",
        avatar: "/placeholder.svg?height=40&width=40",
        email: "tu@example.com",
      },
      participants: [
        {
          id: "current-user",
          name: "Tu",
          avatar: "/placeholder.svg?height=40&width=40",
          email: "tu@example.com",
        },
        ...selectedFriendObjects,
      ],
      recipes: selectedRecipeObjects,
      shoppingList: [],
      notes: "",
    }

    setEvents([...events, newEvent])
    setNewEventData({
      title: "",
      description: "",
      date: new Date(),
      location: "",
      selectedFriends: [],
      selectedRecipes: [],
    })
    setShowNewEventDialog(false)

    toast({
      title: "Evento creato",
      description: "Il tuo evento è stato creato con successo",
    })
  }

  // Gestisce l'invito di un amico
  const handleInviteFriend = () => {
    if (!friendEmail) {
      toast({
        title: "Email mancante",
        description: "Per favore, inserisci l'email del tuo amico",
        variant: "destructive",
      })
      return
    }

    // In un'implementazione reale, qui invieresti l'invito al backend
    toast({
      title: "Invito inviato",
      description: `Un invito è stato inviato a ${friendEmail}`,
    })

    setFriendEmail("")
    setShowInviteFriendDialog(false)
  }

  // Visualizza i dettagli di un evento
  const viewEventDetails = (event: CookingEvent) => {
    setSelectedEvent(event)
    setShowEventDetailsDialog(true)
  }

  // Visualizza la lista della spesa condivisa
  const viewSharedShoppingList = (event: CookingEvent) => {
    setSelectedEvent(event)
    setShowSharedListDialog(true)
  }

  // Aggiorna lo stato di un elemento della lista della spesa
  const toggleShoppingItem = (itemId: string) => {
    if (!selectedEvent) return

    const updatedEvent = { ...selectedEvent }
    const itemIndex = updatedEvent.shoppingList.findIndex((item) => item.id === itemId)

    if (itemIndex >= 0) {
      updatedEvent.shoppingList[itemIndex].checked = !updatedEvent.shoppingList[itemIndex].checked
      setSelectedEvent(updatedEvent)

      // Aggiorna anche l'evento nella lista
      setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
    }
  }

  // Assegna un elemento della lista della spesa a un amico
  const assignShoppingItem = (itemId: string, friendId: string | null) => {
    if (!selectedEvent) return

    const updatedEvent = { ...selectedEvent }
    const itemIndex = updatedEvent.shoppingList.findIndex((item) => item.id === itemId)

    if (itemIndex >= 0) {
      const friend = friendId ? selectedEvent.participants.find((p) => p.id === friendId) || null : null
      updatedEvent.shoppingList[itemIndex].assignedTo = friend
      setSelectedEvent(updatedEvent)

      // Aggiorna anche l'evento nella lista
      setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cucina con gli Amici</h1>
            <p className="text-muted-foreground">Organizza eventi di cucina e condividi la lista della spesa</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowInviteFriendDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Invita Amici
            </Button>
            <Button onClick={() => setShowNewEventDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nuovo Evento
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">Prossimi Eventi</TabsTrigger>
            <TabsTrigger value="past">Eventi Passati</TabsTrigger>
            <TabsTrigger value="friends">I Miei Amici</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((skeleton) => (
                  <Card key={skeleton} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                        <div className="h-4 w-1/2 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 w-full bg-muted rounded"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : events.filter(event => event.date > new Date()).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nessun evento in programma</h2>
                <p className="text-muted-foreground mb-6">
                  Organizza un evento di cucina con i tuoi amici
                </p>
                <Button onClick={() => setShowNewEventDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea Evento
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter(event => event.date > new Date())
                  .sort((a, b) => a.date.getTime() - b.date.getTime())
                  .map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center text-xs mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {event.date.toLocaleDateString('it-IT', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{event.description}</p>
                        <div className="flex items-center mb-4">
                          <Badge variant="outline" className="mr-2">
                            {event.recipes.length} ricette
                          </Badge>
                          <Badge variant="outline">
                            {event.participants.length} partecipanti
                          </Badge>
                        </div>
                        <div className="flex -space-x-2">
                          {event.participants.slice(0, 4).map((participant, index) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={participant.avatar} alt={participant.name} />
                              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {event.participants.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{event.participants.length - 4}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={() => viewSharedShoppingList(event)}>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Lista Spesa
                        </Button>
                        <Button onClick={() => viewEventDetails(event)}>
                          Dettagli
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((skeleton) => (
                  <Card key={skeleton} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded"></div>
                        <div className="h-4 w-3/4 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="h-9 w-full bg-muted rounded"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : events.filter(event => event.date <= new Date()).length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nessun evento passato</h2>
                <p className="text-muted-foreground">
                  Gli eventi passati appariranno qui
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events
                  .filter(event => event.date <= new Date())
                  .sort((a, b) => b.date.getTime() - a.date.getTime())
                  .map((event) => (
                    <Card key={event.id} className="opacity-80">
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center text-xs mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            {event.date.toLocaleDateString('it-IT', { 
                              weekday: 'long', 
                              day: 'numeric', 
                              month: 'long'
                            })}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm mb-4">{event.description}</p>
                        <div className="flex -space-x-2">
                          {event.participants.slice(0, 4).map((participant, index) => (
                            <Avatar key={index} className="h-8 w-8 border-2 border-background">
                              <AvatarImage src={participant.avatar} alt={participant.name} />
                              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {event.participants.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                              +{event.participants.length - 4}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="outline" className="w-full" onClick={() => viewEventDetails(event)}>
                          Visualizza Ricordi
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="friends" className="mt-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-muted"></div>
                      <div className="ml-3 space-y-1">
                        <div className="h-4 w-24 bg-muted rounded"></div>
                        <div className="h-3 w-32 bg-muted rounded"></div>
                      </div>
                    </div>
                    <div className="h-9 w-24 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Nessun amico ancora</h2>
                <p className="text-muted-foreground mb-6">
                  Invita i tuoi amici a unirsi a CucinaApp
                </p>
                <Button onClick={() => setShowInviteFriendDialog(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invita Amici
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={friend.avatar} alt={friend.name} />
                        <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-3">
                        <h3 className="font-medium">{friend.name}</h3>
                        <p className="text-xs text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Invia Messaggio
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog per creare un nuovo evento */}
      <Dialog open={showNewEventDialog} onOpenChange={setShowNewEventDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crea un nuovo evento</DialogTitle>
            <DialogDescription>
              Organizza un evento di cucina con i tuoi amici
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo dell'evento *</Label>
                <Input 
                  id="title" 
                  placeholder="Es. Cena Italiana" 
                  value={newEventData.title}
                  onChange={(e) => setNewEventData({...newEventData, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea 
                  id="description" 
                  placeholder="Descrivi l'evento..." 
                  rows={3}
                  value={newEventData.description}
                  onChange={(e) => setNewEventData({...newEventData, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Data e ora *</Label>
                <DatePicker 
                  date={newEventData.date} 
                  setDate={(date) => setNewEventData({...newEventData, date: date || new Date()})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Luogo *</Label>
                <Input 
                  id="location" 
                  placeholder="Es. Casa mia, Via Roma 123" 
                  value={newEventData.location}
                  onChange={(e) => setNewEventData({...newEventData, location: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Invita amici</Label>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {friends.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Non hai ancora amici. Invita qualcuno!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {friends.map((friend) => (
                        <div key={friend.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`friend-${friend.id}`} 
                            checked={newEventData.selectedFriends.includes(friend.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewEventData({
                                  ...newEventData, 
                                  selectedFriends: [...newEventData.selectedFriends, friend.id]
                                })
                              } else {
                                setNewEventData({
                                  ...newEventData, 
                                  selectedFriends: newEventData.selectedFriends.filter(id => id !== friend.id)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={`friend-${friend.id}`} className="flex items-center cursor-pointer">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={friend.avatar} alt={friend.name} />
                              <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {friend.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="space-y-2">
                <Label>Seleziona ricette</Label>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  {recipes.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Non hai ancora ricette. Aggiungine qualcuna!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {recipes.map((recipe) => (
                        <div key={recipe.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`recipe-${recipe.id}`} 
                            checked={newEventData.selectedRecipes.includes(recipe.id || "")}
                            onCheckedChange={(checked) => {
                              if (checked && recipe.id) {
                                setNewEventData({
                                  ...newEventData, 
                                  selectedRecipes: [...newEventData.selectedRecipes, recipe.id]
                                })
                              } else if (recipe.id) {
                                setNewEventData({
                                  ...newEventData, 
                                  selectedRecipes: newEventData.selectedRecipes.filter(id => id !== recipe.id)
                                })
                              }
                            }}
                          />
                          <Label htmlFor={`recipe-${recipe.id}`} className="flex items-center cursor-pointer">
                            <img 
                              src={recipe.image || "/placeholder.svg"} 
                              alt={recipe.title} 
                              className="w-6 h-6 object-cover rounded-md mr-2"
                            />
                            {recipe.title}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEventDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreateEvent}>
              Crea Evento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per invitare un amico */}
      <Dialog open={showInviteFriendDialog} onOpenChange={setShowInviteFriendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invita un amico</DialogTitle>
            <DialogDescription>
              Invita i tuoi amici a unirsi a CucinaApp
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email del tuo amico</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="amico@example.com" 
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm">
                Il tuo amico riceverà un'email con un link per registrarsi a CucinaApp e connettersi con te.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteFriendDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleInviteFriend}>
              Invia Invito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per i dettagli dell'evento */}
      <Dialog open={showEventDetailsDialog} onOpenChange={setShowEventDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center text-xs mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedEvent?.date.toLocaleDateString('it-IT', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Descrizione</h3>
                <p className="text-sm">{selectedEvent?.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Luogo</h3>
                <p className="text-sm">{selectedEvent?.location}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Organizzatore</h3>
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={selectedEvent?.organizer.avatar} alt={selectedEvent?.organizer.name} />
                    <AvatarFallback>{selectedEvent?.organizer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{selectedEvent?.organizer.name}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Partecipanti ({selectedEvent?.participants.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedEvent?.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center bg-muted px-2 py-1 rounded-full">
                      <Avatar className="h-6 w-6 mr-1">
                        <AvatarImage src={participant.avatar} alt={participant.name} />
                        <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{participant.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Note</h3>
                <p className="text-sm">{selectedEvent?.notes || "Nessuna nota"}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Ricette ({selectedEvent?.recipes.length})</h3>
                <div className="space-y-2">
                  {selectedEvent?.recipes.map((recipe) => (
                    <div key={recipe.id} className="flex items-center border p-2 rounded-lg">
                      <img 
                        src={recipe.image || "/placeholder.svg"} 
                        alt={recipe.title} 
                        className="w-12 h-12 object-cover rounded-md mr-3"
                      />
                      <div>
                        <h4 className="font-medium">{recipe.title}</h4>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-sm text-muted-foreground"
                          onClick={() => {
                            setShowEventDetailsDialog(false)
                            router.push(`/ricette/${recipe.id}`)
                          }}
                        >
                          Vedi ricetta
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Lista della spesa ({selectedEvent?.shoppingList.length})</h3>
                  <Button variant="link" size="sm" className="h-auto p-0" onClick={() => {
                    setShowEventDetailsDialog(false)
                    viewSharedShoppingList(selectedEvent!)
                  }}>
                    Visualizza completa
                  </Button>
                </div>
                <div className="space-y-2">
                  {selectedEvent?.shoppingList.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center justify-between border p-2 rounded-lg">
                      <div className="flex items-center">
                        <Checkbox checked={item.checked} className="mr-2" />
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}</p>
                        </div>
                      </div>
                      {item.assignedTo && (
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.assignedTo.avatar} alt={item.assignedTo.name} />
                          <AvatarFallback>{item.assignedTo.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  {(selectedEvent?.shoppingList.length || 0) > 3 && (
                    <Button variant="outline" size="sm" className="w-full" onClick={() => {
                      setShowEventDetailsDialog(false)
                      viewSharedShoppingList(selectedEvent!)
                    }}>
                      Vedi tutti gli elementi ({selectedEvent?.shoppingList.length})
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <div className="flex justify-between w-full">
              <div>
                <Button variant="outline" size="sm" className="mr-2">
                  <Share2 className="h-4 w-4 mr-1" />
                  Condividi
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Modifica
                </Button>
              </div>
              <Button variant="default" onClick={() => setShowEventDetailsDialog(false)}>
                Chiudi
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  ;<Dialog open={showSharedListDialog} onOpenChange={setShowSharedListDialog}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Lista della spesa condivisa</DialogTitle>
        <DialogDescription>
          {selectedEvent?.title} -{" "}
          {selectedEvent?.date.toLocaleDateString("it-IT", {
            day: "numeric",
            month: "short",
          })}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {(selectedEvent?.shoppingList.length || 0) === 0 ? (
          <div className="text-center py-4">
            <ShoppingBag className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Nessun elemento nella lista della spesa</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Aggiungi elemento
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedEvent?.shoppingList.map((item) => (
              <div key={item.id} className="flex items-center justify-between border p-3 rounded-lg">
                <div className="flex items-center">
                  <Checkbox
                    checked={item.checked}
                    onCheckedChange={() => toggleShoppingItem(item.id)}
                    className="mr-3"
                  />
                  <div>
                    <p className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}>
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Select
                    value={item.assignedTo?.id || "none"}
                    onValueChange={(value) => assignShoppingItem(item.id, value === "none" ? null : value)}
                  >
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue placeholder="Assegna a..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nessuno</SelectItem>
                      {selectedEvent?.participants.map((participant) => (
                        <SelectItem key={participant.id} value={participant.id}>
                          {participant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={() => setShowSharedListDialog(false)}>
          Chiudi
        </Button>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Aggiungi Elemento
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
  </div>
  )
}
