"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeCard } from "@/components/recipe-card"
import { recipeApi, type Recipe } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"

export default function RecipePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  // Carica le ricette dal backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Verifica se l'utente è autenticato
        if (!authApi.isAuthenticated()) {
          // Se non è autenticato, mostra un messaggio e reindirizza al login
          toast({
            title: "Accesso richiesto",
            description: "Devi effettuare l'accesso per visualizzare le ricette",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        const loadedRecipes = await recipeApi.getAll()
        setRecipes(loadedRecipes)
        setLoading(false)
      } catch (error) {
        console.error("Errore durante il caricamento delle ricette:", error)
        setLoading(false)
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento delle ricette",
          variant: "destructive",
        })
      }
    }

    fetchRecipes()
  }, [router])

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

  const handleRecipeClick = (id: string) => {
    router.push(`/ricette/${id}`)
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const updatedRecipe = await recipeApi.toggleFavorite(id)

      // Aggiorna lo stato locale
      setRecipes(recipes.map((recipe) => (recipe._id === id || recipe.id === id ? updatedRecipe : recipe)))

      toast({
        title: updatedRecipe.favorite ? "Aggiunto ai preferiti" : "Rimosso dai preferiti",
        description: updatedRecipe.favorite ? "Ricetta aggiunta ai preferiti" : "Ricetta rimossa dai preferiti",
      })
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dei preferiti",
        variant: "destructive",
      })
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
                    key={recipe._id || recipe.id}
                    id={recipe._id || recipe.id || ""}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    favorite={recipe.favorite}
                    personal={recipe.personal}
                    onClick={() => handleRecipeClick(recipe._id || recipe.id || "")}
                    onToggleFavorite={() => handleToggleFavorite(recipe._id || recipe.id || "")}
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
                    key={recipe._id || recipe.id}
                    id={recipe._id || recipe.id || ""}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    favorite={recipe.favorite}
                    personal={recipe.personal}
                    onClick={() => handleRecipeClick(recipe._id || recipe.id || "")}
                    onToggleFavorite={() => handleToggleFavorite(recipe._id || recipe.id || "")}
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
                    key={recipe._id || recipe.id}
                    id={recipe._id || recipe.id || ""}
                    title={recipe.title}
                    description={recipe.description}
                    image={recipe.image}
                    time={recipe.time}
                    difficulty={recipe.difficulty}
                    favorite={recipe.favorite}
                    personal={recipe.personal}
                    onClick={() => handleRecipeClick(recipe._id || recipe.id || "")}
                    onToggleFavorite={() => handleToggleFavorite(recipe._id || recipe.id || "")}
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

