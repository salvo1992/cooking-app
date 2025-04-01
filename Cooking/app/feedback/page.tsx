"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Star, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Feedback finti pre-caricati
const initialFeedbacks = [
  {
    id: "1",
    name: "Marco Rossi",
    rating: 5,
    comment:
      "Questa app ha rivoluzionato il modo in cui organizzo i pasti settimanali. Il chatbot Cuocco è incredibilmente utile e mi ha aiutato a scoprire nuove ricette!",
    date: "2023-12-15",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Giulia Bianchi",
    rating: 5,
    comment:
      "Finalmente un'app che combina ricette, lista della spesa e gestione della dispensa in un unico posto. La funzione di stampa del piano dietetico è fantastica!",
    date: "2024-01-03",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Alessandro Verdi",
    rating: 4,
    comment:
      "App molto intuitiva e ben progettata. La funzione di ricerca di ricette online è utilissima. Suggerirei solo di aggiungere più opzioni di filtro per le intolleranze alimentari.",
    date: "2024-01-20",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Francesca Neri",
    rating: 5,
    comment:
      "Uso questa app ogni giorno! Mi ha aiutato a ridurre gli sprechi alimentari tenendo traccia di ciò che ho in dispensa. Il chatbot è sorprendentemente intelligente e utile.",
    date: "2024-02-05",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Luca Marino",
    rating: 5,
    comment:
      "La migliore app di cucina che abbia mai provato. L'integrazione con le API di ricette online è perfetta e la possibilità di personalizzare il piano dietetico è esattamente ciò di cui avevo bisogno.",
    date: "2024-02-18",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks)
  const [filteredFeedbacks, setFilteredFeedbacks] = useState(initialFeedbacks)
  const [activeTab, setActiveTab] = useState("all")

  // Filtra i feedback in base al tab attivo
  useEffect(() => {
    if (activeTab === "all") {
      setFilteredFeedbacks(feedbacks)
    } else if (activeTab === "positive") {
      setFilteredFeedbacks(feedbacks.filter((feedback) => feedback.rating >= 4))
    } else if (activeTab === "suggestions") {
      setFilteredFeedbacks(feedbacks.filter((feedback) => feedback.rating < 4))
    }
  }, [activeTab, feedbacks])

  // Calcola le statistiche dei feedback
  const averageRating = feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length
  const fiveStarCount = feedbacks.filter((f) => f.rating === 5).length
  const fourStarCount = feedbacks.filter((f) => f.rating === 4).length
  const threeStarCount = feedbacks.filter((f) => f.rating === 3).length
  const twoStarCount = feedbacks.filter((f) => f.rating === 2).length
  const oneStarCount = feedbacks.filter((f) => f.rating === 1).length

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna alla home
            </Link>
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Feedback degli Utenti</h1>
          <p className="text-muted-foreground">Scopri cosa pensano gli utenti di CucinaApp</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Valutazione Media</CardTitle>
              <CardDescription>Basata su {feedbacks.length} recensioni</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-4xl font-bold">{averageRating.toFixed(1)}</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(averageRating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Distribuzione Stelle</CardTitle>
              <CardDescription>Numero di recensioni per valutazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="w-16">5 stelle</span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(fiveStarCount / feedbacks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{fiveStarCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16">4 stelle</span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(fourStarCount / feedbacks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{fourStarCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16">3 stelle</span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(threeStarCount / feedbacks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{threeStarCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16">2 stelle</span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(twoStarCount / feedbacks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{twoStarCount}</span>
                </div>
                <div className="flex items-center">
                  <span className="w-16">1 stella</span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(oneStarCount / feedbacks.length) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right">{oneStarCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Statistiche</CardTitle>
              <CardDescription>Dati sui feedback ricevuti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Feedback totali:</span>
                  <span className="font-bold">{feedbacks.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Feedback positivi:</span>
                  <span className="font-bold">{feedbacks.filter((f) => f.rating >= 4).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Suggerimenti:</span>
                  <span className="font-bold">{feedbacks.filter((f) => f.rating < 4).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Ultimo feedback:</span>
                  <span className="font-bold">
                    {new Date(Math.max(...feedbacks.map((f) => new Date(f.date).getTime()))).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tutti</TabsTrigger>
            <TabsTrigger value="positive">Positivi</TabsTrigger>
            <TabsTrigger value="suggestions">Suggerimenti</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="positive" className="mt-6">
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="suggestions" className="mt-6">
            <div className="space-y-4">
              {filteredFeedbacks.map((feedback) => (
                <FeedbackCard key={feedback.id} feedback={feedback} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface FeedbackCardProps {
  feedback: {
    id: string
    name: string
    rating: number
    comment: string
    date: string
    avatar: string
  }
}

function FeedbackCard({ feedback }: FeedbackCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={feedback.avatar} alt={feedback.name} />
            <AvatarFallback>{feedback.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{feedback.name}</h3>
              <span className="text-sm text-muted-foreground">{new Date(feedback.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center my-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${star <= feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                />
              ))}
            </div>
            <p className="text-sm mt-2">{feedback.comment}</p>
            <div className="flex items-center mt-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <ThumbsUp className="h-4 w-4 mr-1" />
                Utile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

