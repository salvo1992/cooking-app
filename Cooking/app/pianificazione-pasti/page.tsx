"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { recipeApi, shoppingListApi, type Recipe } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"

interface MealPlan {
  id: string
  date: string
  meals: {
    id: string
    type: "colazione" | "pranzo" | "cena" | "spuntino"
    recipeId: string
    recipeName: string
    recipeImage: string
  }[]
}

export default function PianificazionePastiPage() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([])
  const [currentWeek, setCurrentWeek] = useState<Date[]>([])
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [showAddRecipeDialog, setShowAddRecipeDialog] = useState(false)
  const [selectedMealType, setSelectedMealType] = useState<"colazione" | "pranzo" | "cena" | "spuntino">("pranzo")
  const [loading, setLoading] = useState(true)
  const [shoppingList, setShoppingList] = useState<{ id: string; name: string; quantity: string; checked: boolean }[]>(
    [],
  )
  const [missingIngredients, setMissingIngredients] = useState<{ name: string; quantity: string; recipes: string[] }[]>(
    [],
  )
  const [showShoppingListDialog, setShowShoppingListDialog] = useState(false)

  // Inizializza la settimana corrente
  useEffect(() => {
    const today = new Date()
    const currentDay = today.getDay() // 0 = domenica, 1 = lunedì, ...
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)) // Inizia da lunedì

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }

    setCurrentWeek(weekDays)
    setSelectedDay(today)
  }, [])

  // Carica le ricette e i piani pasto
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const loadedRecipes = await recipeApi.getAll()
        setRecipes(loadedRecipes)

        // In un'implementazione reale, qui caricheresti i piani pasto dal backend
        // Per ora, usiamo dati di esempio
        const exampleMealPlans: MealPlan[] = []
        const today = new Date()

        // Crea piani pasto di esempio per la settimana corrente
        for (let i = -3; i <= 3; i++) {
          const date = new Date(today)
          date.setDate(today.getDate() + i)

          exampleMealPlans.push({
            id: `plan-${i + 3}`,
            date: date.toISOString().split("T")[0],
            meals:
              i === 0
                ? [
                    {
                      id: `meal-${i}-1`,
                      type: "colazione",
                      recipeId: loadedRecipes[0]?.id || "",
                      recipeName: loadedRecipes[0]?.title || "Colazione",
                      recipeImage: loadedRecipes[0]?.image || "/placeholder.svg?height=100&width=100",
                    },
                    {
                      id: `meal-${i}-2`,
                      type: "pranzo",
                      recipeId: loadedRecipes[1]?.id || "",
                      recipeName: loadedRecipes[1]?.title || "Pranzo",
                      recipeImage: loadedRecipes[1]?.image || "/placeholder.svg?height=100&width=100",
                    },
                  ]
                : [],
          })
        }

        setMealPlans(exampleMealPlans)

        // Carica la lista della spesa
        const loadedShoppingList = await shoppingListApi.getAll()
        setShoppingList(loadedShoppingList)

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

  // Calcola gli ingredienti mancanti in base ai piani pasto
  useEffect(() => {
    if (recipes.length === 0 || mealPlans.length === 0) return

    const allIngredients: { name: string; quantity: string; recipes: string[] }[] = []

    // Raccogli tutti gli ingredienti dalle ricette nei piani pasto
    mealPlans.forEach((plan) => {
      plan.meals.forEach((meal) => {
        const recipe = recipes.find((r) => r.id === meal.recipeId)
        if (recipe) {
          recipe.ingredients.forEach((ingredient) => {
            const existingIngredient = allIngredients.find(
              (i) => i.name.toLowerCase() === ingredient.name.toLowerCase(),
            )
            if (existingIngredient) {
              if (!existingIngredient.recipes.includes(recipe.title)) {
                existingIngredient.recipes.push(recipe.title)
              }
            } else {
              allIngredients.push({
                name: ingredient.name,
                quantity: ingredient.quantity,
                recipes: [recipe.title],
              })
            }
          })
        }
      })
    })

    // Filtra gli ingredienti che non sono già nella lista della spesa
    const missing = allIngredients.filter(
      (ingredient) => !shoppingList.some((item) => item.name.toLowerCase() === ingredient.name.toLowerCase()),
    )

    setMissingIngredients(missing)
  }, [recipes, mealPlans, shoppingList])

  // Cambia settimana
  const changeWeek = (direction: "prev" | "next") => {
    const newWeek = currentWeek.map((day) => {
      const newDay = new Date(day)
      newDay.setDate(day.getDate() + (direction === "next" ? 7 : -7))
      return newDay
    })
    setCurrentWeek(newWeek)
  }

  // Formatta la data
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("it-IT", { weekday: "short", day: "numeric", month: "short" })
  }

  // Verifica se una data è oggi
  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  // Verifica se una data è selezionata
  const isSelected = (date: Date) => {
    if (!selectedDay) return false
    return (
      date.getDate() === selectedDay.getDate() &&
      date.getMonth() === selectedDay.getMonth() &&
      date.getFullYear() === selectedDay.getFullYear()
    )
  }

  // Ottieni i pasti per un giorno specifico
  const getMealsForDay = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    const plan = mealPlans.find((p) => p.date === dateString)
    return plan ? plan.meals : []
  }

  // Aggiungi una ricetta al piano pasti
  const addRecipeToPlan = (recipe: Recipe) => {
    if (!selectedDay) return

    const dateString = selectedDay.toISOString().split("T")[0]
    const updatedPlans = [...mealPlans]
    const planIndex = updatedPlans.findIndex((p) => p.date === dateString)

    if (planIndex >= 0) {
      // Rimuovi eventuali pasti dello stesso tipo
      updatedPlans[planIndex].meals = updatedPlans[planIndex].meals.filter((m) => m.type !== selectedMealType)

      // Aggiungi il nuovo pasto
      updatedPlans[planIndex].meals.push({
        id: `meal-${Date.now()}`,
        type: selectedMealType,
        recipeId: recipe.id || "",
        recipeName: recipe.title,
        recipeImage: recipe.image,
      })
    } else {
      // Crea un nuovo piano pasto
      updatedPlans.push({
        id: `plan-${Date.now()}`,
        date: dateString,
        meals: [
          {
            id: `meal-${Date.now()}`,
            type: selectedMealType,
            recipeId: recipe.id || "",
            recipeName: recipe.title,
            recipeImage: recipe.image,
          },
        ],
      })
    }

    setMealPlans(updatedPlans)
    setShowAddRecipeDialog(false)

    toast({
      title: "Ricetta aggiunta",
      description: `${recipe.title} è stata aggiunta al piano pasti per ${formatDate(selectedDay)}`,
    })
  }

  // Rimuovi un pasto dal piano
  const removeMeal = (planId: string, mealId: string) => {
    const updatedPlans = [...mealPlans]
    const planIndex = updatedPlans.findIndex((p) => p.id === planId)

    if (planIndex >= 0) {
      updatedPlans[planIndex].meals = updatedPlans[planIndex].meals.filter((m) => m.id !== mealId)
      setMealPlans(updatedPlans)

      toast({
        title: "Pasto rimosso",
        description: "Il pasto è stato rimosso dal piano",
      })
    }
  }

  // Aggiungi ingredienti mancanti alla lista della spesa
  const addMissingIngredientsToShoppingList = async () => {
    try {
      for (const ingredient of missingIngredients) {
        await shoppingListApi.add({
          name: ingredient.name,
          quantity: ingredient.quantity,
          checked: false,
        })
      }

      // Aggiorna la lista della spesa
      const updatedShoppingList = await shoppingListApi.getAll()
      setShoppingList(updatedShoppingList)

      toast({
        title: "Ingredienti aggiunti",
        description: `${missingIngredients.length} ingredienti sono stati aggiunti alla lista della spesa`,
      })

      setShowShoppingListDialog(false)
    } catch (error) {
      console.error("Errore durante l'aggiunta degli ingredienti:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta degli ingredienti",
        variant: "destructive",
      })
    }
  }

  // Aggiorna lo stato di un elemento della lista della spesa
  const toggleShoppingItem = async (id: string, checked: boolean) => {
    try {
      const item = shoppingList.find((i) => i.id === id)
      if (item) {
        await shoppingListApi.update({
          ...item,
          checked,
        })

        // Aggiorna la lista locale
        setShoppingList(shoppingList.map((i) => (i.id === id ? { ...i, checked } : i)))
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'elemento:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento dell'elemento",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pianificazione Pasti</h1>
            <p className="text-muted-foreground">Organizza i tuoi pasti settimanali e genera la lista della spesa</p>
          </div>
          <Button onClick={() => setShowShoppingListDialog(true)} disabled={missingIngredients.length === 0}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ingredienti Mancanti ({missingIngredients.length})
          </Button>
        </div>

        {/* Selettore settimana */}
        <div className="flex items-center justify-between bg-muted p-2 rounded-lg">
          <Button variant="ghost" size="icon" onClick={() => changeWeek("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center font-medium">
            {currentWeek.length > 0 && (
              <>
                {currentWeek[0].toLocaleDateString("it-IT", { day: "numeric", month: "short" })} -{" "}
                {currentWeek[6].toLocaleDateString("it-IT", { day: "numeric", month: "short" })}
              </>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => changeWeek("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Giorni della settimana */}
        <div className="grid grid-cols-7 gap-2">
          {currentWeek.map((day, index) => (
            <Button
              key={index}
              variant={isSelected(day) ? "default" : "outline"}
              className={`flex flex-col h-auto py-2 ${isToday(day) ? "border-primary" : ""}`}
              onClick={() => setSelectedDay(day)}
            >
              <span className="text-xs">{day.toLocaleDateString("it-IT", { weekday: "short" })}</span>
              <span className="text-lg font-bold">{day.getDate()}</span>
              <span className="text-xs">{day.toLocaleDateString("it-IT", { month: "short" })}</span>
              {getMealsForDay(day).length > 0 && (
                <Badge variant="secondary" className="mt-1">
                  {getMealsForDay(day).length} pasti
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Pasti del giorno selezionato */}
        {selectedDay && (
          <Card>
            <CardHeader>
              <CardTitle>Pasti per {formatDate(selectedDay)}</CardTitle>
              <CardDescription>Gestisci i pasti per questa giornata</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="colazione">
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="colazione" onClick={() => setSelectedMealType("colazione")}>
                    Colazione
                  </TabsTrigger>
                  <TabsTrigger value="pranzo" onClick={() => setSelectedMealType("pranzo")}>
                    Pranzo
                  </TabsTrigger>
                  <TabsTrigger value="cena" onClick={() => setSelectedMealType("cena")}>
                    Cena
                  </TabsTrigger>
                  <TabsTrigger value="spuntino" onClick={() => setSelectedMealType("spuntino")}>
                    Spuntini
                  </TabsTrigger>
                </TabsList>

                {["colazione", "pranzo", "cena", "spuntino"].map((mealType) => (
                  <TabsContent key={mealType} value={mealType} className="space-y-4">
                    {getMealsForDay(selectedDay)
                      .filter((meal) => meal.type === mealType)
                      .map((meal) => (
                        <div key={meal.id} className="flex items-center justify-between border p-3 rounded-lg">
                          <div className="flex items-center">
                            <img
                              src={meal.recipeImage || "/placeholder.svg"}
                              alt={meal.recipeName}
                              className="w-16 h-16 object-cover rounded-md mr-3"
                            />
                            <div>
                              <h3 className="font-medium">{meal.recipeName}</h3>
                              <Button
                                variant="link"
                                className="p-0 h-auto text-sm text-muted-foreground"
                                onClick={() => router.push(`/ricette/${meal.recipeId}`)}
                              >
                                Vedi ricetta
                              </Button>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const plan = mealPlans.find((p) => p.date === selectedDay.toISOString().split("T")[0])
                              if (plan) removeMeal(plan.id, meal.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedMealType(mealType as any)
                        setShowAddRecipeDialog(true)
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Aggiungi{" "}
                      {mealType === "colazione"
                        ? "colazione"
                        : mealType === "pranzo"
                          ? "pranzo"
                          : mealType === "cena"
                            ? "cena"
                            : "spuntino"}
                    </Button>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/lista-spesa">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Vai alla lista della spesa
                </Link>
              </Button>
              <Button onClick={() => setShowShoppingListDialog(true)} disabled={missingIngredients.length === 0}>
                Ingredienti Mancanti ({missingIngredients.length})
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Dialog per aggiungere una ricetta */}
      <Dialog open={showAddRecipeDialog} onOpenChange={setShowAddRecipeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Aggiungi una ricetta</DialogTitle>
            <DialogDescription>
              Seleziona una ricetta da aggiungere al piano pasti per {selectedDay && formatDate(selectedDay)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-1">
              {recipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => addRecipeToPlan(recipe)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={recipe.image || "/placeholder.svg"}
                      alt={recipe.title}
                      className="object-cover w-full h-full rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium line-clamp-1">{recipe.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{recipe.description}</p>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="mr-3">{recipe.time}</span>
                      <span>{recipe.difficulty}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRecipeDialog(false)}>
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog per ingredienti mancanti */}
      <Dialog open={showShoppingListDialog} onOpenChange={setShowShoppingListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ingredienti Mancanti</DialogTitle>
            <DialogDescription>
              Questi ingredienti sono necessari per le ricette pianificate ma non sono nella tua lista della spesa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {missingIngredients.length === 0 ? (
              <p className="text-center text-muted-foreground">Non ci sono ingredienti mancanti</p>
            ) : (
              <div className="space-y-2">
                {missingIngredients.map((ingredient, index) => (
                  <div key={index} className="flex items-start justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{ingredient.name}</p>
                      <p className="text-sm text-muted-foreground">{ingredient.quantity}</p>
                      <p className="text-xs text-muted-foreground">Per: {ingredient.recipes.join(", ")}</p>
                    </div>
                    <Checkbox />
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowShoppingListDialog(false)}>
              Annulla
            </Button>
            <Button onClick={addMissingIngredientsToShoppingList} disabled={missingIngredients.length === 0}>
              Aggiungi alla lista della spesa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
