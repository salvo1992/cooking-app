"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"

// Categorie di alimenti
const categories = [
  "Frutta e Verdura",
  "Latticini",
  "Carne e Pesce",
  "Cereali e Pasta",
  "Conserve",
  "Surgelati",
  "Bevande",
  "Altro",
]

// Tipo per gli elementi della dispensa
interface PantryItem {
  id: number
  name: string
  quantity: string
  category: string
  expiryDate: string
  isExpired: boolean
  isExpiringSoon: boolean
}

export default function PantryPage() {
  const [items, setItems] = useState<PantryItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newExpiryDate, setNewExpiryDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  // Carica gli elementi dal localStorage all'avvio
  useEffect(() => {
    const savedItems = localStorage.getItem("pantryItems")
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    } else {
      // Dati di esempio se non ci sono elementi salvati
      const initialItems: PantryItem[] = [
        {
          id: 1,
          name: "Latte",
          quantity: "1L",
          category: "Latticini",
          expiryDate: new Date(2024, 3, 15).toISOString(),
          isExpired: false,
          isExpiringSoon: true,
        },
        {
          id: 2,
          name: "Pasta",
          quantity: "500g",
          category: "Cereali e Pasta",
          expiryDate: new Date(2024, 11, 30).toISOString(),
          isExpired: false,
          isExpiringSoon: false,
        },
        {
          id: 3,
          name: "Pomodori pelati",
          quantity: "400g",
          category: "Conserve",
          expiryDate: new Date(2025, 5, 20).toISOString(),
          isExpired: false,
          isExpiringSoon: false,
        },
        {
          id: 4,
          name: "Yogurt",
          quantity: "4x125g",
          category: "Latticini",
          expiryDate: new Date(2024, 2, 28).toISOString(),
          isExpired: true,
          isExpiringSoon: false,
        },
        {
          id: 5,
          name: "Spinaci surgelati",
          quantity: "300g",
          category: "Surgelati",
          expiryDate: new Date(2024, 8, 15).toISOString(),
          isExpired: false,
          isExpiringSoon: false,
        },
      ]
      setItems(initialItems)
      localStorage.setItem("pantryItems", JSON.stringify(initialItems))
    }
    setLoading(false)
  }, [])

  // Aggiorna lo stato di scadenza degli elementi
  useEffect(() => {
    if (!loading) {
      const today = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const updatedItems = items.map((item) => {
        const expiryDate = new Date(item.expiryDate)
        const isExpired = expiryDate < today
        const isExpiringSoon = !isExpired && expiryDate < sevenDaysFromNow

        return {
          ...item,
          isExpired,
          isExpiringSoon,
        }
      })

      setItems(updatedItems)
      localStorage.setItem("pantryItems", JSON.stringify(updatedItems))
    }
  }, [loading])

  // Salva gli elementi nel localStorage quando cambiano
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("pantryItems", JSON.stringify(items))
    }
  }, [items, loading])

  const addItem = () => {
    if (newItem.trim() === "" || !newCategory || !newExpiryDate) return

    const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
    const today = new Date()

    // Calcola se il prodotto è scaduto o sta per scadere
    const isExpired = newExpiryDate < today

    // Considera "in scadenza" se mancano meno di 7 giorni
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)
    const isExpiringSoon = !isExpired && newExpiryDate < sevenDaysFromNow

    const newItems = [
      ...items,
      {
        id: newId,
        name: newItem,
        quantity: newQuantity || "1",
        category: newCategory,
        expiryDate: newExpiryDate.toISOString(),
        isExpired,
        isExpiringSoon,
      },
    ]

    setItems(newItems)
    localStorage.setItem("pantryItems", JSON.stringify(newItems))

    setNewItem("")
    setNewQuantity("")
    setNewCategory("")
    setNewExpiryDate(undefined)

    toast({
      title: "Prodotto aggiunto",
      description: `${newItem} è stato aggiunto alla dispensa`,
    })
  }

  const deleteItem = (id: number) => {
    const itemToDelete = items.find((item) => item.id === id)
    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)
    localStorage.setItem("pantryItems", JSON.stringify(updatedItems))

    toast({
      title: "Prodotto rimosso",
      description: `${itemToDelete?.name} è stato rimosso dalla dispensa`,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento dispensa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dispensa</h1>
          <p className="text-muted-foreground">
            Gestisci gli alimenti nella tua dispensa e tieni traccia delle scadenze
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Aggiungi Prodotto</CardTitle>
            <CardDescription>Inserisci un nuovo prodotto nella tua dispensa</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                addItem()
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
              <Input
                placeholder="Nome prodotto"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                className="lg:col-span-2"
              />
              <Input
                placeholder="Quantità (es. 500g)"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
              />
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !newExpiryDate && "text-muted-foreground"
                      }`}
                    >
                      {newExpiryDate ? format(newExpiryDate, "dd/MM/yyyy") : "Scadenza"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newExpiryDate}
                      onSelect={setNewExpiryDate}
                      initialFocus
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
                <Button type="submit">
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Aggiungi</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Tabs defaultValue="tutti">
          <TabsList>
            <TabsTrigger value="tutti">Tutti</TabsTrigger>
            <TabsTrigger value="scaduti">
              Scaduti
              {items.filter((item) => item.isExpired).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {items.filter((item) => item.isExpired).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in-scadenza">
              In Scadenza
              {items.filter((item) => item.isExpiringSoon).length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-yellow-500">
                  {items.filter((item) => item.isExpiringSoon).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tutti" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">La tua dispensa è vuota</div>
              ) : (
                items.map((item) => <PantryItem key={item.id} item={item} onDelete={() => deleteItem(item.id)} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="scaduti" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.filter((item) => item.isExpired).length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">Non ci sono prodotti scaduti</div>
              ) : (
                items
                  .filter((item) => item.isExpired)
                  .map((item) => <PantryItem key={item.id} item={item} onDelete={() => deleteItem(item.id)} />)
              )}
            </div>
          </TabsContent>

          <TabsContent value="in-scadenza" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.filter((item) => item.isExpiringSoon).length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  Non ci sono prodotti in scadenza
                </div>
              ) : (
                items
                  .filter((item) => item.isExpiringSoon)
                  .map((item) => <PantryItem key={item.id} item={item} onDelete={() => deleteItem(item.id)} />)
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

interface PantryItemProps {
  item: {
    id: number
    name: string
    quantity: string
    category: string
    expiryDate: string
    isExpired: boolean
    isExpiringSoon: boolean
  }
  onDelete: () => void
}

function PantryItem({ item, onDelete }: PantryItemProps) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [expiry, setExpiry] = useState(item.expiryDate.split("T")[0])
  
  const handleSave = () => {
    const updatedItems = JSON.parse(localStorage.getItem("pantryItems") || "[]").map((i: PantryItem) =>
      i.id === item.id ? { ...i, quantity, expiryDate: new Date(expiry).toISOString() } : i
    )
    localStorage.setItem("pantryItems", JSON.stringify(updatedItems))
    toast({
      title: "Prodotto aggiornato",
      description: `${item.name} aggiornato correttamente.`,
    })
  }
  return (
    <div
      className={`flex items-center justify-between p-4 border rounded-lg ${
        item.isExpired
          ? "border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900"
          : item.isExpiringSoon
            ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900"
            : ""
      }`}
    >
      <div className="grid gap-1">
        <div className="font-medium flex items-center gap-2">
          {item.name}
          {item.isExpired && (
            <Badge variant="destructive" className="ml-2 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Scaduto
            </Badge>
          )}
          {item.isExpiringSoon && !item.isExpired && (
            <Badge
              variant="outline"
              className="ml-2 border-yellow-500 text-yellow-700 dark:text-yellow-400 flex items-center gap-1"
            >
              <AlertTriangle className="h-3 w-3" />
              In scadenza
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span>{item.quantity}</span>
          <Badge variant="outline">{item.category}</Badge>
          <span>Scade: {format(new Date(item.expiryDate), "dd/MM/yyyy")}</span>
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Elimina</span>
      </Button>
    </div>
  )
}

