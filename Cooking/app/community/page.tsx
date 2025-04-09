"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart, MessageCircle, Share2, Filter, Search, Plus, Trophy, Calendar, Users } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { recipeApi, type Recipe } from "@/lib/api"

interface CommunityPost {
  id: string
  userId: string
  userName: string
  userAvatar: string
  recipeId: string
  recipeName: string
  recipeImage: string
  content: string
  images: string[]
  likes: number
  comments: number
  createdAt: Date
  isLiked: boolean
}

interface Challenge {
  id: string
  title: string
  description: string
  image: string
  startDate: Date
  endDate: Date
  participants: number
  isParticipating: boolean
  entries: CommunityPost[]
}

export default function CommunityPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<CommunityPost[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showChallengeDialog, setShowChallengeDialog] = useState(false)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [showPostDialog, setShowPostDialog] = useState(false)
  const [postContent, setPostContent] = useState("")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  // Carica i dati della community
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // In un'implementazione reale, qui caricheresti i post e le sfide dal backend
        // Per ora, usiamo dati di esempio

        // Carica le ricette per la selezione
        const loadedRecipes = await recipeApi.getAll()
        setRecipes(loadedRecipes)

        // Crea post di esempio
        const examplePosts: CommunityPost[] = [
          {
            id: "post-1",
            userId: "user-1",
            userName: "Marco Rossi",
            userAvatar: "/placeholder.svg?height=40&width=40",
            recipeId: loadedRecipes[0]?.id || "",
            recipeName: loadedRecipes[0]?.title || "Pasta al Pomodoro",
            recipeImage: loadedRecipes[0]?.image || "/placeholder.svg?height=300&width=400",
            content:
              "Ho provato questa ricetta ieri sera ed è stata un successo! La mia famiglia l'ha adorata. Ho aggiunto un po' di basilico fresco alla fine.",
            images: ["/placeholder.svg?height=400&width=600"],
            likes: 24,
            comments: 5,
            createdAt: new Date(Date.now() - 86400000), // 1 giorno fa
            isLiked: false,
          },
          {
            id: "post-2",
            userId: "user-2",
            userName: "Giulia Bianchi",
            userAvatar: "/placeholder.svg?height=40&width=40",
            recipeId: loadedRecipes[1]?.id || "",
            recipeName: loadedRecipes[1]?.title || "Tiramisù",
            recipeImage: loadedRecipes[1]?.image || "/placeholder.svg?height=300&width=400",
            content:
              "Prima volta che preparo il tiramisù e devo dire che è venuto benissimo! Ho seguito la ricetta alla lettera e il risultato è stato perfetto.",
            images: ["/placeholder.svg?height=400&width=600", "/placeholder.svg?height=400&width=600"],
            likes: 42,
            comments: 8,
            createdAt: new Date(Date.now() - 172800000), // 2 giorni fa
            isLiked: true,
          },
          {
            id: "post-3",
            userId: "user-3",
            userName: "Alessandro Verdi",
            userAvatar: "/placeholder.svg?height=40&width=40",
            recipeId: loadedRecipes[2]?.id || "",
            recipeName: loadedRecipes[2]?.title || "Risotto ai Funghi",
            recipeImage: loadedRecipes[2]?.image || "/placeholder.svg?height=300&width=400",
            content:
              "Ho partecipato alla sfida settimanale con questo risotto ai funghi. Ho usato funghi porcini freschi che ho raccolto io stesso nel weekend!",
            images: ["/placeholder.svg?height=400&width=600"],
            likes: 36,
            comments: 12,
            createdAt: new Date(Date.now() - 259200000), // 3 giorni fa
            isLiked: false,
          },
        ]

        // Crea sfide di esempio
        const exampleChallenges: Challenge[] = [
          {
            id: "challenge-1",
            title: "Sfida Settimanale: Piatti Autunnali",
            description:
              "Prepara un piatto che celebra i sapori dell'autunno. Usa ingredienti di stagione come zucca, funghi, castagne o mele.",
            image: "/placeholder.svg?height=300&width=500",
            startDate: new Date(Date.now() - 604800000), // 7 giorni fa
            endDate: new Date(Date.now() + 604800000), // 7 giorni nel futuro
            participants: 28,
            isParticipating: false,
            entries: examplePosts.filter((post) => post.id === "post-3"),
          },
          {
            id: "challenge-2",
            title: "Sfida Mensile: Cucina Regionale",
            description:
              "Prepara un piatto tipico della tua regione o di una regione italiana che ami particolarmente. Racconta la storia dietro la ricetta!",
            image: "/placeholder.svg?height=300&width=500",
            startDate: new Date(Date.now() - 1209600000), // 14 giorni fa
            endDate: new Date(Date.now() + 1209600000), // 14 giorni nel futuro
            participants: 42,
            isParticipating: true,
            entries: [],
          },
          {
            id: "challenge-3",
            title: "Sfida Speciale: Dolci delle Feste",
            description:
              "Prepara un dolce tradizionale delle feste. Può essere un dolce natalizio, pasquale o di qualsiasi altra festività.",
            image: "/placeholder.svg?height=300&width=500",
            startDate: new Date(Date.now()),
            endDate: new Date(Date.now() + 2592000000), // 30 giorni nel futuro
            participants: 12,
            isParticipating: false,
            entries: [],
          },
        ]

        setPosts(examplePosts)
        setChallenges(exampleChallenges)
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

  // Filtra i post in base alla ricerca
  const filteredPosts = posts.filter(
    (post) =>
      post.recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.userName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Gestisce il like di un post
  const handleLikePost = (postId: string) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked
          return {
            ...post,
            isLiked,
            likes: isLiked ? post.likes + 1 : post.likes - 1,
          }
        }
        return post
      }),
    )
  }

  // Gestisce la partecipazione a una sfida
  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(
      challenges.map((challenge) => {
        if (challenge.id === challengeId) {
          const isParticipating = !challenge.isParticipating
          return {
            ...challenge,
            isParticipating,
            participants: isParticipating ? challenge.participants + 1 : challenge.participants - 1,
          }
        }
        return challenge
      }),
    )

    toast({
      title: "Partecipazione aggiornata",
      description: "La tua partecipazione alla sfida è stata aggiornata",
    })
  }

  // Gestisce la condivisione di un post
  const handleSharePost = (post: CommunityPost) => {
    setShowShareDialog(true)
    // In un'implementazione reale, qui prepareresti i dati per la condivisione
  }

  // Gestisce la creazione di un nuovo post
  const handleCreatePost = () => {
    if (!postContent || !selectedRecipe) {
      toast({
        title: "Dati mancanti",
        description: "Per favore, inserisci un contenuto e seleziona una ricetta",
        variant: "destructive",
      })
      return
    }

    // In un'implementazione reale, qui invieresti i dati al backend
    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      userId: "current-user",
      userName: "Tu",
      userAvatar: "/placeholder.svg?height=40&width=40",
      recipeId: selectedRecipe.id || "",
      recipeName: selectedRecipe.title,
      recipeImage: selectedRecipe.image,
      content: postContent,
      images: [],
      likes: 0,
      comments: 0,
      createdAt: new Date(),
      isLiked: false,
    }

    setPosts([newPost, ...posts])
    setPostContent("")
    setSelectedRecipe(null)
    setShowPostDialog(false)

    toast({
      title: "Post creato",
      description: "Il tuo post è stato pubblicato con successo",
    })
  }

  // Visualizza i dettagli di una sfida
  const viewChallengeDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge)
    setShowChallengeDialog(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Community</h1>
            <p className="text-muted-foreground">Condividi le tue creazioni e partecipa alle sfide</p>
          </div>
          <Button onClick={() => setShowPostDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Post
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cerca post, ricette o utenti..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filtra</span>
          </Button>
        </div>

        <Tabs defaultValue="feed">
          <TabsList>
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="challenges">Sfide</TabsTrigger>
            <TabsTrigger value="friends">Amici</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="mt-6">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((skeleton) => (
                  <Card key={skeleton} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-muted"></div>
                        <div className="ml-3 space-y-1">
                          <div className="h-4 w-24 bg-muted rounded"></div>
                          <div className="h-3 w-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="h-4 w-full bg-muted rounded mb-2"></div>
                      <div className="h-4 w-3/4 bg-muted rounded"></div>
                      <div className="h-48 bg-muted rounded-md mt-4"></div>
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-between w-full">
                        <div className="h-8 w-20 bg-muted rounded"></div>
                        <div className="h-8 w-20 bg-muted rounded"></div>
                        <div className="h-8 w-20 bg-muted rounded"></div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessun post trovato</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Non ci sono post disponibili"}
                </p>
                <Button onClick={() => setShowPostDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea il primo post
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card key={post.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.userAvatar} alt={post.userName} />
                          <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <h3 className="font-medium">{post.userName}</h3>
                          <p className="text-xs text-muted-foreground">
                            {post.createdAt.toLocaleDateString("it-IT", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="mb-4">{post.content}</p>
                      <div className="flex items-center p-3 bg-muted rounded-lg mb-4">
                        <img
                          src={post.recipeImage || "/placeholder.svg"}
                          alt={post.recipeName}
                          className="w-16 h-16 object-cover rounded-md mr-3"
                        />
                        <div>
                          <h4 className="font-medium">{post.recipeName}</h4>
                          <Button
                            variant="link"
                            className="p-0 h-auto text-sm text-muted-foreground"
                            onClick={() => router.push(`/ricette/${post.recipeId}`)}
                          >
                            Vedi ricetta
                          </Button>
                        </div>
                      </div>
                      {post.images.length > 0 && (
                        <div className={`grid ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"} gap-2`}>
                          {post.images.map((image, index) => (
                            <img
                              key={index}
                              src={image || "/placeholder.svg"}
                              alt={`Immagine ${index + 1}`}
                              className="w-full h-auto rounded-lg object-cover aspect-video"
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <div className="flex justify-between w-full">
                        <Button
                          variant="ghost"
                          size="sm"
                          className={post.isLiked ? "text-red-500" : ""}
                          onClick={() => handleLikePost(post.id)}
                        >
                          <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleSharePost(post)}>
                          <Share2 className="h-4 w-4 mr-1" />
                          Condividi
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="challenges" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <Card key={challenge.id} className="overflow-hidden">
                  <div className="relative aspect-video">
                    <img
                      src={challenge.image || "/placeholder.svg"}
                      alt={challenge.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="flex items-center">
                        <Trophy className="h-3 w-3 mr-1" />
                        {challenge.participants} partecipanti
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle>{challenge.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {challenge.startDate.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} -{" "}
                        {challenge.endDate.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm line-clamp-3">{challenge.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => viewChallengeDetails(challenge)}>
                      Dettagli
                    </Button>
                    <Button
                      variant={challenge.isParticipating ? "default" : "secondary"}
                      onClick={() => handleJoinChallenge(challenge.id)}
                    >
                      {challenge.isParticipating ? "Partecipando" : "Partecipa"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="friends" className="mt-6">
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connettiti con gli amici</h2>
              <p className="text-muted-foreground mb-6">
                Invita i tuoi amici a unirsi a CucinaApp per condividere ricette e cucinare insieme
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invita Amici
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog per la condivisione */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condividi questo post</DialogTitle>
            <DialogDescription>Condividi questo post con i tuoi amici sui social media</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-4 py-4">
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-600"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </Button>
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-400"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </Button>
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-pink-500"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </Button>
            <Button variant="outline" size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-blue-700"
              >
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </Button>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="share-link">Link diretto</Label>
            <div className="flex gap-2">
              <Input id="share-link" value="https://cucinaapp.com/post/123456" readOnly />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText("https://cucinaapp.com/post/123456")
                  toast({
                    title: "Link copiato",
                    description: "Il link è stato copiato negli appunti",
                  })
                }}
              >
                Copia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog per i dettagli della sfida */}
      <Dialog open={showChallengeDialog} onOpenChange={setShowChallengeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedChallenge?.title}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center text-xs mt-1">
                <Calendar className="h-3 w-3 mr-1" />
                {selectedChallenge?.startDate.toLocaleDateString("it-IT", { day: "numeric", month: "short" })} -{" "}
                {selectedChallenge?.endDate.toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <img
              src={selectedChallenge?.image || "/placeholder.svg"}
              alt={selectedChallenge?.title}
              className="w-full h-auto rounded-lg object-cover aspect-video"
            />

            <div>
              <h3 className="font-medium mb-2">Descrizione</h3>
              <p>{selectedChallenge?.description}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Partecipanti</h3>
              <Badge variant="secondary" className="flex items-center w-fit">
                <Users className="h-3 w-3 mr-1" />
                {selectedChallenge?.participants} partecipanti
              </Badge>
            </div>

            <div>
              <h3 className="font-medium mb-2">Post della sfida</h3>
              {selectedChallenge?.entries.length === 0 ? (
                <p className="text-muted-foreground">Nessun post ancora. Sii il primo a partecipare!</p>
              ) : (
                <div className="space-y-4">
                  {selectedChallenge?.entries.map((post) => (
                    <Card key={post.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={post.userAvatar} alt={post.userName} />
                            <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <h4 className="font-medium text-sm">{post.userName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {post.createdAt.toLocaleDateString("it-IT", {
                                day: "numeric",
                                month: "short",
                              })}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">{post.content}</p>
                        {post.images.length > 0 && (
                          <img
                            src={post.images[0] || "/placeholder.svg"}
                            alt="Immagine del post"
                            className="w-full h-auto rounded-lg object-cover aspect-video mt-2"
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChallengeDialog(false)}>
              Chiudi
            </Button>
            <Button
              variant={selectedChallenge?.isParticipating ? "default" : "secondary"}
              onClick={() => {
                if (selectedChallenge) handleJoinChallenge(selectedChallenge.id)
                setShowChallengeDialog(false)
              }}
            >
              {selectedChallenge?.isParticipating ? "Stai partecipando" : "Partecipa alla sfida"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per creare un nuovo post */}
      <Dialog open={showPostDialog} onOpenChange={setShowPostDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crea un nuovo post</DialogTitle>
            <DialogDescription>Condividi la tua esperienza con una ricetta</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="recipe">Seleziona una ricetta</Label>
              <Select
                onValueChange={(value) => {
                  const recipe = recipes.find((r) => r.id === value)
                  if (recipe) setSelectedRecipe(recipe)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona una ricetta" />
                </SelectTrigger>
                <SelectContent>
                  {recipes.map((recipe) => (
                    <SelectItem key={recipe.id} value={recipe.id || ""}>
                      {recipe.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Il tuo post</Label>
              <Textarea
                id="content"
                placeholder="Racconta la tua esperienza con questa ricetta..."
                rows={4}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Aggiungi foto</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Plus className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Trascina qui le tue foto o clicca per selezionarle</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Seleziona foto
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPostDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleCreatePost}>Pubblica</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
