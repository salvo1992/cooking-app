"use client"

import { useState, useEffect } from "react"
import { Filter, X, Check, Search, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { pantryApi } from "@/lib/api"

interface FiltriAvanzatiProps {
  onApplyFilters: (filters: RecipeFilters) => void
}

export interface RecipeFilters {
  diets: string[]
  cuisines: string[]
  intolerances: string[]
  maxReadyTime: number
  includeIngredients: string[]
  excludeIngredients: string[]
  difficulty: string[]
  useOnlyPantryItems: boolean
}

export function FiltriAvanzati({ onApplyFilters }: FiltriAvanzatiProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [filters, setFilters] = useState<RecipeFilters>({
    diets: [],
    cuisines: [],
    intolerances: [],
    maxReadyTime: 60,
    includeIngredients: [],
    excludeIngredients: [],
    difficulty: [],
    useOnlyPantryItems: false,
  })
  const [pantryItems, setPantryItems] = useState<string[]>([])
  const [searchIngredient, setSearchIngredient] = useState("")

  // Carica gli elementi della dispensa
  useEffect(() => {
    const fetchPantryItems = async () => {
      try {
        const items = await pantryApi.getAll()
        setPantryItems(items.map((item) => item.name))
      } catch (error) {
        console.error("Errore durante il caricamento degli elementi della dispensa:", error)
      }
    }

    fetchPantryItems()
  }, [])

  // Opzioni predefinite
  const dietOptions = [
    { value: "vegetarian", label: "Vegetariana" },
    { value: "vegan", label: "Vegana" },
    { value: "gluten-free", label: "Senza glutine" },
    { value: "ketogenic", label: "Chetogenica" },
    { value: "paleo", label: "Paleo" },
    { value: "pescetarian", label: "Pescetariana" },
  ]

  const cuisineOptions = [
    { value: "italian", label: "Italiana" },
    { value: "mediterranean", label: "Mediterranea" },
    { value: "french", label: "Francese" },
    { value: "spanish", label: "Spagnola" },
    { value: "greek", label: "Greca" },
    { value: "asian", label: "Asiatica" },
    { value: "mexican", label: "Messicana" },
    { value: "indian", label: "Indiana" },
  ]

  const intoleranceOptions = [
    { value: "dairy", label: "Latticini" },
    { value: "egg", label: "Uova" },
    { value: "gluten", label: "Glutine" },
    { value: "grain", label: "Cereali" },
    { value: "peanut", label: "Arachidi" },
    { value: "seafood", label: "Frutti di mare" },
    { value: "sesame", label: "Sesamo" },
    { value: "shellfish", label: "Crostacei" },
    { value: "soy", label: "Soia" },
    { value: "sulfite", label: "Solfiti" },
    { value: "tree-nut", label: "Frutta a guscio" },
    { value: "wheat", label: "Frumento" },
  ]

  const difficultyOptions = [
    { value: "easy", label: "Facile" },
    { value: "medium", label: "Media" },
    { value: "hard", label: "Difficile" },
  ]

  // Gestisce il toggle di un'opzione
  const toggleOption = (category: keyof RecipeFilters, value: string) => {
    setFilters((prev) => {
      const currentValues = prev[category] as string[]
      return {
        ...prev,
        [category]: currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value],
      }
    })
  }

  // Gestisce l'aggiunta di un ingrediente
  const addIngredient = (ingredient: string, category: "includeIngredients" | "excludeIngredients") => {
    if (!ingredient.trim()) return

    setFilters((prev) => {
      const currentValues = prev[category] as string[]
      if (!currentValues.includes(ingredient)) {
        return {
          ...prev,
          [category]: [...currentValues, ingredient],
        }
      }
      return prev
    })

    setSearchIngredient("")
  }

  // Gestisce la rimozione di un ingrediente
  const removeIngredient = (ingredient: string, category: "includeIngredients" | "excludeIngredients") => {
    setFilters((prev) => {
      const currentValues = prev[category] as string[]
      return {
        ...prev,
        [category]: currentValues.filter((v) => v !== ingredient),
      }
    })
  }

  // Applica i filtri
  const applyFilters = () => {
    onApplyFilters(filters)
    setShowDialog(false)
  }

  // Resetta i filtri
  const resetFilters = () => {
    setFilters({
      diets: [],
      cuisines: [],
      intolerances: [],
      maxReadyTime: 60,
      includeIngredients: [],
      excludeIngredients: [],
      difficulty: [],
      useOnlyPantryItems: false,
    })
  }

  // Conta il numero di filtri attivi
  const countActiveFilters = () => {
    let count = 0
    count += filters.diets.length
    count += filters.cuisines.length
    count += filters.intolerances.length
    count += filters.includeIngredients.length
    count += filters.excludeIngredients.length
    count += filters.difficulty.length
    if (filters.maxReadyTime < 60) count++
    if (filters.useOnlyPantryItems) count++
    return count
  }

  return (
    <>
      <Button variant="outline" size="sm" className="relative" onClick={() => setShowDialog(true)}>
        <Filter className="h-4 w-4 mr-2" />
        Filtri Avanzati
        {countActiveFilters() > 0 && (
          <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
            {countActiveFilters()}
          </Badge>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Filtri Avanzati</DialogTitle>
            <DialogDescription>Personalizza la tua ricerca di ricette con filtri avanzati</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Diete</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dietOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`diet-${option.value}`}
                        checked={filters.diets.includes(option.value)}
                        onCheckedChange={() => toggleOption("diets", option.value)}
                      />
                      <Label htmlFor={`diet-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Cucine</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cuisineOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`cuisine-${option.value}`}
                        checked={filters.cuisines.includes(option.value)}
                        onCheckedChange={() => toggleOption("cuisines", option.value)}
                      />
                      <Label htmlFor={`cuisine-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Intolleranze</h3>
                <ScrollArea className="h-[150px] border rounded-md p-2">
                  <div className="grid grid-cols-2 gap-2">
                    {intoleranceOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`intolerance-${option.value}`}
                          checked={filters.intolerances.includes(option.value)}
                          onCheckedChange={() => toggleOption("intolerances", option.value)}
                        />
                        <Label htmlFor={`intolerance-${option.value}`}>{option.label}</Label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div>
                <h3 className="font-medium mb-2">Difficoltà</h3>
                <div className="flex space-x-4">
                  {difficultyOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`difficulty-${option.value}`}
                        checked={filters.difficulty.includes(option.value)}
                        onCheckedChange={() => toggleOption("difficulty", option.value)}
                      />
                      <Label htmlFor={`difficulty-${option.value}`}>{option.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Tempo di preparazione</h3>
                  <span className="text-sm">{filters.maxReadyTime} minuti</span>
                </div>
                <Slider
                  value={[filters.maxReadyTime]}
                  min={10}
                  max={120}
                  step={5}
                  onValueChange={(value) => setFilters({ ...filters, maxReadyTime: value[0] })}
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">Ingredienti da includere</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Cerca ingredienti..."
                        className="w-full pl-8 pr-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={searchIngredient}
                        onChange={(e) => setSearchIngredient(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addIngredient(searchIngredient, "includeIngredients")
                          }
                        }}
                      />
                      {searchIngredient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-10 px-3"
                          onClick={() => addIngredient(searchIngredient, "includeIngredients")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filters.includeIngredients.map((ingredient) => (
                      <Badge key={ingredient} variant="secondary" className="flex items-center gap-1">
                        {ingredient}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeIngredient(ingredient, "includeIngredients")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Ingredienti da escludere</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Cerca ingredienti..."
                        className="w-full pl-8 pr-10 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        value={searchIngredient}
                        onChange={(e) => setSearchIngredient(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            addIngredient(searchIngredient, "excludeIngredients")
                          }
                        }}
                      />
                      {searchIngredient && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-10 px-3"
                          onClick={() => addIngredient(searchIngredient, "excludeIngredients")}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {filters.excludeIngredients.map((ingredient) => (
                      <Badge key={ingredient} variant="outline" className="flex items-center gap-1">
                        {ingredient}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeIngredient(ingredient, "excludeIngredients")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-pantry"
                  checked={filters.useOnlyPantryItems}
                  onCheckedChange={(checked) => setFilters({ ...filters, useOnlyPantryItems: !!checked })}
                />
                <Label htmlFor="use-pantry">Usa solo ingredienti nella dispensa</Label>
              </div>

              {filters.useOnlyPantryItems && pantryItems.length > 0 && (
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-medium mb-2">Ingredienti disponibili nella dispensa:</p>
                  <div className="flex flex-wrap gap-2">
                    {pantryItems.map((item) => (
                      <Badge key={item} variant="secondary">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={resetFilters}>
              Resetta filtri
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annulla
              </Button>
              <Button onClick={applyFilters}>
                <Check className="mr-2 h-4 w-4" />
                Applica filtri
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
