"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeCard } from "@/components/recipe-card"
import type { Recipe } from "@/lib/api"

export default function RecipePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  // Carica le ricette dal localStorage all'avvio
  useEffect(() => {
    try {
      const savedRecipes = localStorage.getItem("recipes")
      const loadedRecipes = savedRecipes ? JSON.parse(savedRecipes) : []

      // Se non ci sono ricette salvate, carica alcuni esempi
      if (loadedRecipes.length === 0) {
        const exampleRecipes: Recipe[] = [
          {
            id: 1,
            title: "Pasta alla Carbonara",
            description: "La classica pasta alla carbonara romana con uova, guanciale, pecorino e pepe nero.",
            image: "/placeholder.svg?height=300&width=400",
            time: "30 min",
            difficulty: "Media",
            ingredients: [
              { name: "Pasta", quantity: "320g" },
              { name: "Guanciale", quantity: "150g" },
              { name: "Uova", quantity: "4" },
              { name: "Pecorino Romano", quantity: "100g" },
              { name: "Pepe nero", quantity: "q.b." },
              { name: "Sale", quantity: "q.b." },
            ],
            steps: [
              "Tagliare il guanciale a listarelle e rosolarlo in padella a fuoco medio-basso fino a renderlo croccante.",
              "In una ciotola, sbattere le uova con il pecorino grattugiato e il pepe nero.",
              "Cuocere la pasta in abbondante acqua salata.",
              "Scolare la pasta al dente e versarla nella padella con il guanciale, mescolando bene.",
              "Togliere la padella dal fuoco e aggiungere il composto di uova e formaggio, mescolando velocemente.",
              "Servire immediatamente con una spolverata di pecorino e pepe nero.",
            ],
            favorite: true,
            personal: false,
          },
          {
            id: 2,
            title: "Risotto ai Funghi",
            description: "Cremoso risotto con funghi porcini, cipolla, vino bianco e parmigiano.",
            image: "/placeholder.svg?height=300&width=400",
            time: "45 min",
            difficulty: "Media",
            ingredients: [
              { name: "Riso Carnaroli", quantity: "320g" },
              { name: "Funghi porcini", quantity: "200g" },
              { name: "Cipolla", quantity: "1" },
              { name: "Vino bianco", quantity: "100ml" },
              { name: "Brodo vegetale", quantity: "1L" },
              { name: "Parmigiano Reggiano", quantity: "80g" },
              { name: "Burro", quantity: "50g" },
              { name: "Olio d'oliva", quantity: "2 cucchiai" },
              { name: "Sale", quantity: "q.b." },
              { name: "Pepe", quantity: "q.b." },
              { name: "Prezzemolo", quantity: "q.b." },
            ],
            steps: [
              "Preparare il brodo vegetale e tenerlo caldo.",
              "Tritare finemente la cipolla e farla appassire in una casseruola con un po' di olio.",
              "Pulire i funghi, tagliarli a fettine e aggiungerli alla cipolla. Cuocere per qualche minuto.",
              "Aggiungere il riso e tostarlo per un paio di minuti, mescolando continuamente.",
              "Sfumare con il vino bianco e lasciare evaporare.",
              "Aggiungere il brodo caldo un mestolo alla volta, aspettando che venga assorbito prima di aggiungerne altro.",
              "Continuare fino a cottura del riso (circa 18 minuti).",
              "A fuoco spento, mantecare con burro e parmigiano. Aggiustare di sale e pepe.",
              "Servire con una spolverata di prezzemolo fresco tritato.",
            ],
            favorite: false,
            personal: false,
          },
          {
            id: 3,
            title: "Insalata Caprese",
            description: "Fresca insalata con pomodori, mozzarella di bufala, basilico e olio d'oliva.",
            image: "/placeholder.svg?height=300&width=400",
            time: "10 min",
            difficulty: "Facile",
            ingredients: [
              { name: "Pomodori maturi", quantity: "3" },
              { name: "Mozzarella di bufala", quantity: "250g" },
              { name: "Basilico fresco", quantity: "q.b." },
              { name: "Olio extravergine d'oliva", quantity: "q.b." },
              { name: "Sale", quantity: "q.b." },
              { name: "Pepe nero", quantity: "q.b." },
            ],
            steps: [
              "Lavare e affettare i pomodori.",
              "Affettare la mozzarella.",
              "Disporre alternando fette di pomodoro e mozzarella su un piatto.",
              "Aggiungere le foglie di basilico.",
              "Condire con olio extravergine d'oliva, sale e pepe.",
              "Servire a temperatura ambiente.",
            ],
            favorite: true,
            personal: false,
          },
        ]

        // Salva le ricette di esempio
        localStorage.setItem("recipes", JSON.stringify(exampleRecipes))
        setRecipes(exampleRecipes)
      } else {
        setRecipes(loadedRecipes)
      }

      setLoading(false)
    } catch (error) {
      console.error("Errore durante il caricamento delle ricette:", error)
      setLoading(false)
    }
  }, [])

  // Filtra le ricette in base alla ricerca
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Ottieni le ricette personali
  const personalRecipes = filteredRecipes.filter((recipe) => recipe.personal)

  // Ottieni le ricette preferite
  const favoriteRecipes = filteredRecipes.filter((recipe) => recipe.favorite)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // La ricerca è già gestita dal filtro sopra
  }

  const handleNewRecipe = () => {
    router.push("/ricette/nuova")
  }

  const handleRecipeClick = (id: number) => {
    router.push(`/ricette/${id}`)
  }

  const handleToggleFavorite = (id: number) => {
    try {
      // Trova la ricetta da aggiornare
      const recipeIndex = recipes.findIndex((recipe) => recipe.id === id)
      if (recipeIndex === -1) return

      // Crea una copia dell'array delle ricette
      const updatedRecipes = [...recipes]

      // Aggiorna lo stato preferito
      updatedRecipes[recipeIndex] = {
        ...updatedRecipes[recipeIndex],
        favorite: !updatedRecipes[recipeIndex].favorite,
      }

      // Aggiorna lo stato e salva nel localStorage
      setRecipes(updatedRecipes)
      localStorage.setItem("recipes", JSON.stringify(updatedRecipes))
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Ricette</h1>
          <p className="text-muted-foreground">Scopri nuove ricette o aggiungi le tue personali</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cerca ricette..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filtra</span>
          </Button>
          <Button className="shrink-0" onClick={handleNewRecipe}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova Ricetta
          </Button>
        </div>

        <Tabs defaultValue="tutte">
          <TabsList>
            <TabsTrigger value="tutte">Tutte</TabsTrigger>
            <TabsTrigger value="personali">Personali</TabsTrigger>
            <TabsTrigger value="preferite">Preferite</TabsTrigger>
          </TabsList>
          <TabsContent value="tutte" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((skeleton) => (
                  <div key={skeleton} className="rounded-lg border p-4 space-y-4 animate-pulse">
                    <div className="h-48 bg-muted rounded-md"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna ricetta trovata</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Non ci sono ricette disponibili"}
                </p>
                <Button onClick={handleNewRecipe}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi una ricetta
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    favorite={recipe.favorite}
                    personal={recipe.personal}
                    onClick={() => handleRecipeClick(recipe.id)}
                    onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="personali" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2].map((skeleton) => (
                  <div key={skeleton} className="rounded-lg border p-4 space-y-4 animate-pulse">
                    <div className="h-48 bg-muted rounded-md"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : personalRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna ricetta personale</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Non hai ancora aggiunto ricette personali"}
                </p>
                <Button onClick={handleNewRecipe}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi una ricetta
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    favorite={recipe.favorite}
                    personal={recipe.personal}
                    onClick={() => handleRecipeClick(recipe.id)}
                    onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="preferite" className="mt-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4].map((skeleton) => (
                  <div key={skeleton} className="rounded-lg border p-4 space-y-4 animate-pulse">
                    <div className="h-48 bg-muted rounded-md"></div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : favoriteRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna ricetta preferita</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `Nessun risultato per "${searchQuery}"`
                    : "Non hai ancora aggiunto ricette ai preferiti"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    favorite={recipe.favorite}
                    personal={recipe.personal}
                    onClick={() => handleRecipeClick(recipe.id)}
                    onToggleFavorite={() => handleToggleFavorite(recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

