"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, Plus, Globe } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecipeCard } from "@/components/recipe-card"
import { recipeApi, type Recipe } from "@/lib/api"
import { recipeApiService } from "@/lib/recipe-api"
import { toast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RecipePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [onlineRecipes, setOnlineRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [onlineLoading, setOnlineLoading] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [cuisine, setCuisine] = useState("")
  const [diet, setDiet] = useState("")
  const [intolerances, setIntolerances] = useState("")

  // Load recipes from backend
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        // Check if user is authenticated
        if (!authApi.isAuthenticated()) {
          // If not authenticated, show message and redirect to login
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

        // Also load some random online recipes
        fetchOnlineRecipes()
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

  // Fetch online recipes
  const fetchOnlineRecipes = async (query?: string) => {
    setOnlineLoading(true)
    try {
      let results
      if (query) {
        results = await recipeApiService.searchRecipes(query, cuisine, diet, intolerances)
      } else {
        results = await recipeApiService.getRandomRecipes()
      }
      setOnlineRecipes(results)
    } catch (error) {
      console.error("Errore durante il caricamento delle ricette online:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento delle ricette online",
        variant: "destructive",
      })
    } finally {
      setOnlineLoading(false)
    }
  }

  // Filter recipes based on search query
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Get personal recipes
  const personalRecipes = filteredRecipes.filter((recipe) => recipe.personal)

  // Get favorite recipes
  const favoriteRecipes = filteredRecipes.filter((recipe) => recipe.favorite)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Also search online
    fetchOnlineRecipes(searchQuery)
  }

  const handleNewRecipe = () => {
    router.push("/ricette/nuova")
  }

  const handleRecipeClick = (id: string) => {
    router.push(`/ricette/${id}`)
  }

  const handleOnlineRecipeClick = async (id: number) => {
    try {
      setLoading(true)
      const recipeDetails = await recipeApiService.getRecipeInformation(id)
      const convertedRecipe = recipeApiService.convertToAppRecipe(recipeDetails)

      // Save recipe to local database
      const savedRecipe = await recipeApi.add(convertedRecipe)

      toast({
        title: "Ricetta importata",
        description: "La ricetta online è stata importata con successo",
      })

      // Redirect to recipe page
      router.push(`/ricette/${savedRecipe.id}`)
    } catch (error) {
      console.error("Errore durante l'importazione della ricetta:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'importazione della ricetta",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const updatedRecipe = await recipeApi.toggleFavorite(id)

      // Update local state
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

  const handleApplyFilters = () => {
    fetchOnlineRecipes(searchQuery)
    setShowFilterDialog(false)
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
          <Button variant="outline" size="icon" className="shrink-0" onClick={() => setShowFilterDialog(true)}>
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
            <TabsTrigger value="online">Online</TabsTrigger>
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
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe._id || recipe.id)}
                    onToggleFavorite={() => handleToggleFavorite(recipe._id || recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="personali" className="mt-6">
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
            ) : personalRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna ricetta personale</h2>
                <p className="text-muted-foreground mb-6">
                  Aggiungi le tue ricette personali per visualizzarle qui
                </p>
                <Button onClick={handleNewRecipe}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi una ricetta personale
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {personalRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id || recipe.id}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe._id || recipe.id)}
                    onToggleFavorite={() => handleToggleFavorite(recipe._id || recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="preferite" className="mt-6">
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
            ) : favoriteRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna ricetta preferita</h2>
                <p className="text-muted-foreground mb-6">
                  Aggiungi delle ricette ai preferiti per visualizzarle qui
                </p>
                <Button onClick={handleNewRecipe}>
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi una ricetta ai preferiti
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe._id || recipe.id}
                    recipe={recipe}
                    onClick={() => handleRecipeClick(recipe._id || recipe.id)}
                    onToggleFavorite={() => handleToggleFavorite(recipe._id || recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          <TabsContent value="online" className="mt-6">
            {onlineLoading ? (
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
            ) : onlineRecipes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna ricetta online trovata</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? `Nessun risultato online per "${searchQuery}"`
                    : "Non ci sono ricette online disponibili"}
                </p>
                <Button onClick={() => fetchOnlineRecipes()}>
                  <Globe className="h-4 w-4 mr-2" />
                  Carica ricette online casuali
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {onlineRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={{
                      id: recipe.id.toString(),
                      title: recipe.title,
                      image: recipe.image,
                      sourceName: recipe.sourceName,
                    }}
                    onClick={() => handleOnlineRecipeClick(recipe.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Filter Dialog */}
      <Dialog isOpen={showFilterDialog} onClose={() => setShowFilterDialog(false)}>
        <DialogTitle>Filtra Ricette</DialogTitle>
        <DialogContent>
          <div className="flex flex-col space-y-4">
            <div>
              <Label htmlFor="cuisine">Cucina</Label>
              <Select id="cuisine" value={cuisine} onChange={(e) => setCuisine(e.target.value)}>
                <SelectTrigger>
                  <SelectValue>{cuisine || "Seleziona una cucina"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte le cucine</SelectItem>
                  <SelectItem value="italian">Italiana</SelectItem>
                  <SelectItem value="indian">Indiana</SelectItem>
                  <SelectItem value="mexican">Messicana</SelectItem>
                  <SelectItem value="chinese">Cinese</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="diet">Dieta</Label>
              <Select id="diet" value={diet} onChange={(e) => setDiet(e.target.value)}>
                <SelectTrigger>
                  <SelectValue>{diet || "Seleziona una dieta"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tutte le diete</SelectItem>
                  <SelectItem value="vegetarian">Vegetariana</SelectItem>
                  <SelectItem value="vegan">Vegana</SelectItem>
                  <SelectItem value="glutenfree">Senza glutine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="intolerances">Intolleranze</Label>
              <Input
                id="intolerances"
                type="text"
                placeholder="Es. lattosio, uova"
                value={intolerances}
                onChange={(e) => setIntolerances(e.target.value)}
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
            Annulla
          </Button>
          <Button onClick={handleApplyFilters}>Applica</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
