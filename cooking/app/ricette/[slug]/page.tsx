"use client"
import { use, useEffect, useState } from "react"



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
import { recipeApi, shoppingListApi, type Recipe } from "@/lib/api"
import { authApi } from "@/lib/api"

export default function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {

  const router = useRouter()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Carica la ricetta dal backend
  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Verifica se l'utente è autenticato
        if (!authApi.isAuthenticated()) {
          toast({
            title: "Accesso richiesto",
            description: "Devi effettuare l'accesso per visualizzare questa ricetta",
            variant: "destructive",
          })
          router.push("/login")
          return
        }

        const { slug: recipeId } = use(params)

        const loadedRecipe = await recipeApi.getById(recipeId)
        setRecipe(loadedRecipe)
        setLoading(false)
      } catch (error) {
        console.error("Errore durante il caricamento della ricetta:", error)
        setLoading(false)
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il caricamento della ricetta",
          variant: "destructive",
        })
      }
    }

    fetchRecipe()
  }, [params.slug, router])

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
  const toggleFavorite = async () => {
    if (!recipe) return
    setIsLoading(true)

    try {
      const recipeId = recipe._id || recipe.id || ""
      const updatedRecipe = await recipeApi.toggleFavorite(recipeId)

      // Aggiorna lo stato locale
      setRecipe(updatedRecipe)

      toast({
        title: updatedRecipe.favorite ? "Aggiunto ai preferiti" : "Rimosso dai preferiti",
        description: updatedRecipe.favorite
          ? "Questa ricetta è stata aggiunta ai preferiti"
          : "Questa ricetta è stata rimossa dai preferiti",
      })
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dei preferiti",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Aggiunta degli ingredienti alla lista della spesa
  const addToShoppingList = async () => {
    if (!recipe || selectedIngredients.length === 0) {
      toast({
        title: "Nessun ingrediente selezionato",
        description: "Seleziona almeno un ingrediente per aggiungerlo alla lista della spesa",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepara gli ingredienti selezionati
      const selectedIngredientsData = selectedIngredients.map((index) => recipe.ingredients[index])

      // Aggiungi gli ingredienti alla lista della spesa
      await shoppingListApi.addMany(selectedIngredientsData, recipe.title)

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
    } finally {
      setIsLoading(false)
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
          <Button variant="ghost" size="icon" onClick={toggleFavorite} className="ml-auto" disabled={isLoading}>
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
                  disabled={selectedIngredients.length === 0 || isLoading}
                >
                  {isLoading ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  ) : (
                    <ShoppingCart className="h-4 w-4 mr-2" />
                  )}
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

