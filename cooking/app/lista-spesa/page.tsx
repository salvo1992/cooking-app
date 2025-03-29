"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, Check, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"

// Tipo per gli elementi della lista della spesa
interface ShoppingItem {
  id: number
  name: string
  quantity: string
  calories: number
  checked: boolean
  fromRecipe?: string
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [loading, setLoading] = useState(true)

  // Carica gli elementi dal localStorage all'avvio
  useEffect(() => {
    const savedItems = localStorage.getItem("shoppingItems")
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    } else {
      // Dati di esempio se non ci sono elementi salvati
      const initialItems: ShoppingItem[] = [
        { id: 1, name: "Pomodori", quantity: "500g", calories: 90, checked: false, fromRecipe: "Pasta al Pomodoro" },
        { id: 2, name: "Mozzarella", quantity: "250g", calories: 280, checked: false, fromRecipe: "Pizza Margherita" },
        { id: 3, name: "Pasta", quantity: "500g", calories: 1750, checked: false },
        { id: 4, name: "Parmigiano", quantity: "100g", calories: 431, checked: false },
        { id: 5, name: "Basilico", quantity: "1 mazzo", calories: 22, checked: false, fromRecipe: "Pizza Margherita" },
      ]
      setItems(initialItems)
      localStorage.setItem("shoppingItems", JSON.stringify(initialItems))
    }
    setLoading(false)
  }, [])

  // Salva gli elementi nel localStorage quando cambiano
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("shoppingItems", JSON.stringify(items))
    }
  }, [items, loading])

  const addItem = () => {
    if (newItem.trim() === "") return

    const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1

    const newItems = [
      ...items,
      {
        id: newId,
        name: newItem,
        quantity: newQuantity || "1",
        calories: 0, // Valore predefinito
        checked: false,
      },
    ]

    setItems(newItems)
    localStorage.setItem("shoppingItems", JSON.stringify(newItems))

    setNewItem("")
    setNewQuantity("")

    toast({
      title: "Prodotto aggiunto",
      description: `${newItem} è stato aggiunto alla lista della spesa`,
    })
  }

  const toggleItem = (id: number) => {
    const updatedItems = items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    setItems(updatedItems)
    localStorage.setItem("shoppingItems", JSON.stringify(updatedItems))
  }

  const deleteItem = (id: number) => {
    const itemToDelete = items.find((item) => item.id === id)
    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)
    localStorage.setItem("shoppingItems", JSON.stringify(updatedItems))

    toast({
      title: "Prodotto rimosso",
      description: `${itemToDelete?.name} è stato rimosso dalla lista della spesa`,
    })
  }

  const moveToDispensa = () => {
    const checkedItems = items.filter((item) => item.checked)

    if (checkedItems.length === 0) {
      toast({
        title: "Nessun prodotto selezionato",
        description: "Seleziona almeno un prodotto per spostarlo nella dispensa",
        variant: "destructive",
      })
      return
    }

    // Recupera gli elementi della dispensa dal localStorage
    const savedPantryItems = localStorage.getItem("pantryItems")
    const pantryItems = savedPantryItems ? JSON.parse(savedPantryItems) : []

    // Aggiungi gli elementi selezionati alla dispensa
    const today = new Date()
    const oneMonthLater = new Date()
    oneMonthLater.setMonth(today.getMonth() + 1)

    checkedItems.forEach((item) => {
      const newId = pantryItems.length > 0 ? Math.max(...pantryItems.map((item: any) => item.id)) + 1 : 1

      pantryItems.push({
        id: newId,
        name: item.name,
        quantity: item.quantity,
        category: "Altro", // Categoria predefinita
        expiryDate: oneMonthLater.toISOString(),
        isExpired: false,
        isExpiringSoon: false,
      })
    })

    // Salva la dispensa aggiornata
    localStorage.setItem("pantryItems", JSON.stringify(pantryItems))

    // Rimuovi gli elementi selezionati dalla lista della spesa
    const updatedItems = items.filter((item) => !item.checked)
    setItems(updatedItems)
    localStorage.setItem("shoppingItems", JSON.stringify(updatedItems))

    toast({
      title: "Prodotti spostati",
      description: `${checkedItems.length} prodotti spostati nella dispensa`,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento lista della spesa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Lista della Spesa</h1>
          <p className="text-muted-foreground">Gestisci la tua lista della spesa e tieni traccia delle calorie</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aggiungi Prodotto</CardTitle>
            <CardDescription>Inserisci un nuovo prodotto alla tua lista della spesa</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addItem()
              }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Input
                placeholder="Nome prodotto"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Quantità (es. 500g)"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="sm:w-1/4"
              />
              <Button type="submit" className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi
              </Button>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="tutti">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="tutti">Tutti</TabsTrigger>
              <TabsTrigger value="da-ricette">Da Ricette</TabsTrigger>
              <TabsTrigger value="personali">Personali</TabsTrigger>
            </TabsList>

            <Button variant="outline" onClick={moveToDispensa} disabled={!items.some((item) => item.checked)}>
              <Check className="h-4 w-4 mr-2" />
              Sposta in Dispensa
            </Button>
          </div>

          <TabsContent value="tutti">
            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">La tua lista della spesa è vuota</div>
              ) : (
                items.map((item) => (
                  <ShoppingItem
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(item.id)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="da-ricette">
            <div className="space-y-4">
              {items.filter((item) => item.fromRecipe).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Non ci sono prodotti da ricette nella tua lista
                </div>
              ) : (
                items
                  .filter((item) => item.fromRecipe)
                  .map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggle={() => toggleItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="personali">
            <div className="space-y-4">
              {items.filter((item) => !item.fromRecipe).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Non ci sono prodotti personali nella tua lista
                </div>
              ) : (
                items
                  .filter((item) => !item.fromRecipe)
                  .map((item) => (
                    <ShoppingItem
                      key={item.id}
                      item={item}
                      onToggle={() => toggleItem(item.id)}
                      onDelete={() => deleteItem(item.id)}
                    />
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface ShoppingItemProps {
  item: {
    id: number
    name: string
    quantity: string
    calories: number
    checked: boolean
    fromRecipe?: string
  }
  onToggle: () => void
  onDelete: () => void
}

function ShoppingItem({ item, onToggle, onDelete }: ShoppingItemProps) {
  return (
    <TooltipProvider>
      <div className={`flex items-center justify-between p-4 border rounded-lg ${item.checked ? "bg-muted/50" : ""}`}>
        <div className="flex items-center gap-3">
          <Checkbox id={`item-${item.id}`} checked={item.checked} onCheckedChange={onToggle} />
          <div className="grid gap-1">
            <label
              htmlFor={`item-${item.id}`}
              className={`font-medium ${item.checked ? "line-through text-muted-foreground" : ""}`}
            >
              {item.name}
            </label>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{item.quantity}</span>
              {item.calories > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center cursor-help">
                      <Info className="h-3 w-3 mr-1" />
                      {item.calories} kcal
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Calorie per {item.quantity}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {item.fromRecipe && (
                <Badge variant="outline" className="ml-2">
                  Da: {item.fromRecipe}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Elimina</span>
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}

