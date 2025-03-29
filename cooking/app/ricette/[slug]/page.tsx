"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, ChefHat, Heart, HeartOff, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Recipe } from "@/lib/api"

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([])

  // Carica la ricetta dal localStorage
  useEffect(() => {
    try {
      const savedRecipes = localStorage.getItem("recipes")
      if (!savedRecipes) {
        setLoading(false)
        return
      }

      const recipes = JSON.parse(savedRecipes)
      const recipeId = Number.parseInt(params.slug)
      const foundRecipe = recipes.find((r: Recipe) => r.id === recipeId)

      if (foundRecipe) {
        setRecipe(foundRecipe)
      }

      setLoading(false)
    } catch (error) {
      console.error("Errore durante il caricamento della ricetta:", error)
      setLoading(false)
    }
  }, [params.slug])

  // Gestione della selezione degli ingredienti
  const toggleIngredientSelection = (index: number) => {
    setSelectedIngredients((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      } else {
        return [...prev, index]
      }
    })
  }

  // Gestione dei preferiti
  const toggleFavorite = () => {
    if (!recipe) return

    try {
      // Recupera tutte le ricette
      const savedRecipes = localStorage.getItem("recipes")
      if (!savedRecipes) return

      const recipes = JSON.parse(savedRecipes)
      const recipeIndex = recipes.findIndex((r: Recipe) => r.id === recipe.id)

      if (recipeIndex === -1) return

      // Aggiorna lo stato preferito
      recipes[recipeIndex].favorite = !recipes[recipeIndex].favorite

      // Salva le ricette aggiornate
      localStorage.setItem("recipes", JSON.stringify(recipes))

      // Aggiorna lo stato locale
      setRecipe({
        ...recipe,
        favorite: !recipe.favorite,
      })

      toast({
        title: recipe.favorite ? "Rimosso dai preferiti" : "Aggiunto ai preferiti",
        description: recipe.favorite
          ? "Questa ricetta è stata rimossa dai preferiti"
          : "Questa ricetta è stata aggiunta ai preferiti",
      })
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error)
    }
  }

  // Aggiunta degli ingredienti alla lista della spesa
  const addToShoppingList = () => {
    if (!recipe || selectedIngredients.length === 0) {
      toast({
        title: "Nessun ingrediente selezionato",
        description: "Seleziona almeno un ingrediente per aggiungerlo alla lista della spesa",
        variant: "destructive",
      })
      return
    }

    try {
      // Recupera la lista della spesa esistente
      const savedItems = localStorage.getItem("shoppingItems")
      const shoppingItems = savedItems ? JSON.parse(savedItems) : []

      // Genera un nuovo ID di partenza
      let nextId = shoppingItems.length > 0 ? Math.max(...shoppingItems.map((item: any) => item.id)) + 1 : 1

      // Aggiungi gli ingredienti selezionati
      const selectedIngredientsData = selectedIngredients.map((index) => {
        const ingredient = recipe.ingredients[index]
        return {
          id: nextId++,
          name: ingredient.name,
          quantity: ingredient.quantity,
          checked: false,
          fromRecipe: recipe.title,
        }
      })

      // Aggiorna la lista della spesa
      const updatedShoppingList = [...shoppingItems, ...selectedIngredientsData]
      localStorage.setItem("shoppingItems", JSON.stringify(updatedShoppingList))

      // Resetta la selezione
      setSelectedIngredients([])

      toast({
        title: "Ingredienti aggiunti",
        description: `${selectedIngredientsData.length} ingredienti aggiunti alla lista della spesa`,
      })
    } catch (error) {
      console.error("Errore durante l'aggiunta degli ingredienti alla lista della spesa:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta degli ingredienti alla lista della spesa",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento ricetta...</p>
        </div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Ricetta non trovata</h2>
          <p className="text-muted-foreground mb-6">La ricetta che stai cercando non esiste o è stata rimossa.</p>
          <Button asChild>
            <Link href="/ricette">Torna alle ricette</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild className="mr-auto">
            <Link href="/ricette">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle ricette
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleFavorite} className="ml-auto">
            {recipe.favorite ? (
              <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            ) : (
              <HeartOff className="h-5 w-5" />
            )}
            <span className="sr-only">{recipe.favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative aspect-video rounded-lg overflow-hidden">
            <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
          </div>

          <div className="flex flex-col space-y-4">
            <h1 className="text-3xl font-bold">{recipe.title}</h1>

            <p className="text-muted-foreground">{recipe.description}</p>

            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {recipe.time}
              </div>
              <div className="flex items-center">
                <ChefHat className="h-4 w-4 mr-1" />
                {recipe.difficulty}
              </div>
              {recipe.personal && <Badge variant="outline">Ricetta Personale</Badge>}
            </div>

            <Separator />

            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Ingredienti</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addToShoppingList}
                  disabled={selectedIngredients.length === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Aggiungi alla lista
                </Button>
              </div>

              <div className="space-y-2 mt-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`ingredient-${index}`}
                      checked={selectedIngredients.includes(index)}
                      onCheckedChange={() => toggleIngredientSelection(index)}
                    />
                    <label
                      htmlFor={`ingredient-${index}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex justify-between w-full"
                    >
                      <span>{ingredient.name}</span>
                      <span className="text-muted-foreground">{ingredient.quantity}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="preparazione" className="mt-8">
          <TabsList>
            <TabsTrigger value="preparazione">Preparazione</TabsTrigger>
            <TabsTrigger value="note">Note</TabsTrigger>
          </TabsList>
          <TabsContent value="preparazione" className="space-y-4 mt-4">
            <h2 className="text-xl font-semibold">Procedimento</h2>
            <ol className="space-y-4 ml-6 list-decimal">
              {recipe.steps.map((step, index) => (
                <li key={index} className="text-base">
                  {step}
                </li>
              ))}
            </ol>
          </TabsContent>
          <TabsContent value="note" className="space-y-4 mt-4">
            <h2 className="text-xl font-semibold">Note e Consigli</h2>
            <div className="p-4 border rounded-lg">
              {recipe.notes ? (
                <p className="text-muted-foreground">{recipe.notes}</p>
              ) : (
                <p className="text-muted-foreground">Non ci sono note o consigli per questa ricetta.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

