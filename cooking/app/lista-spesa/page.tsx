"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Trash2, Check, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import { shoppingListApi } from "@/lib/api"

interface ShoppingItem {
  id: string
  name: string
  quantity: string
  calories?: number
  checked: boolean
  fromRecipe?: string
}

export default function ShoppingListPage() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState("")
  const [newQuantity, setNewQuantity] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedItems = await shoppingListApi.getAll()
      setItems(fetchedItems)
    } catch (error) {
      console.error("Errore caricamento lista:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const addItem = async () => {
    if (!newItem.trim()) return
    try {
      await shoppingListApi.add({ name: newItem, quantity: newQuantity || "1" })
      await fetchItems()
      setNewItem("")
      setNewQuantity("")
      toast({ title: "Prodotto aggiunto", description: `${newItem} aggiunto alla lista.` })
    } catch (error) {
      console.error("Errore aggiunta prodotto:", error)
    }
  }

  const toggleItem = async (id: string, checked: boolean) => {
    try {
      await shoppingListApi.update(id, checked)
      await fetchItems()
    } catch (error) {
      console.error("Errore aggiornamento:", error)
    }
  }

  const deleteItem = async (id: string) => {
    try {
      await shoppingListApi.delete(id)
      await fetchItems()
      toast({ title: "Prodotto eliminato", description: "Elemento eliminato dalla lista." })
    } catch (error) {
      console.error("Errore eliminazione:", error)
    }
  }

  const moveToDispensa = async () => {
    const checkedItems = items.filter((item) => item.checked)
    if (!checkedItems.length) {
      toast({
        title: "Nessun prodotto selezionato",
        description: "Seleziona almeno un prodotto.",
        variant: "destructive",
      })
      return
    }

    try {
      const pantryItems = JSON.parse(localStorage.getItem("pantryItems") || "[]")
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + 1)

      checkedItems.forEach((item) => {
        pantryItems.push({
          id: Date.now() + Math.random(),
          name: item.name,
          quantity: item.quantity,
          category: "Altro",
          expiryDate: expiryDate.toISOString(),
          isExpired: false,
          isExpiringSoon: false,
        })
      })

      localStorage.setItem("pantryItems", JSON.stringify(pantryItems))

      await Promise.all(checkedItems.map((item) => shoppingListApi.delete(item.id)))
      await fetchItems()

      toast({
        title: "Prodotti spostati",
        description: `${checkedItems.length} prodotti spostati nella dispensa.`,
      })
    } catch (error) {
      console.error("Errore spostamento dispensa:", error)
    }
  }

  if (loading) return <div className="text-center py-8">Caricamento lista...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Lista della Spesa</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Aggiungi Prodotto</CardTitle>
          <CardDescription>Inserisci un nuovo prodotto alla lista</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              addItem()
            }}
            className="flex gap-4"
          >
            <Input placeholder="Nome prodotto" value={newItem} onChange={(e) => setNewItem(e.target.value)} />
            <Input placeholder="Quantità" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} />
            <Button type="submit">
              <Plus className="mr-2" /> Aggiungi
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs defaultValue="tutti">
        <div className="flex justify-between mb-4">
          <TabsList>
            <TabsTrigger value="tutti">Tutti</TabsTrigger>
            <TabsTrigger value="da-ricette">Da Ricette</TabsTrigger>
            <TabsTrigger value="personali">Personali</TabsTrigger>
          </TabsList>
          <Button onClick={moveToDispensa}>
            <Check className="mr-2" /> Sposta in Dispensa
          </Button>
        </div>

        {["tutti", "da-ricette", "personali"].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {items.filter(
              (item) =>
                tab === "tutti" ||
                (tab === "da-ricette" && item.fromRecipe) ||
                (tab === "personali" && !item.fromRecipe),
            ).length ? (
              items
                .filter(
                  (item) =>
                    tab === "tutti" ||
                    (tab === "da-ricette" && item.fromRecipe) ||
                    (tab === "personali" && !item.fromRecipe),
                )
                .map((item) => (
                  <div key={item.id} className="flex justify-between p-4 border rounded-lg">
                    <div className="flex gap-2">
                      <Checkbox checked={item.checked} onCheckedChange={() => toggleItem(item.id, !item.checked)} />
                      <p className={item.checked ? "line-through text-muted-foreground" : ""}>
                        {item.name} ({item.quantity})
                        {item.fromRecipe && <Badge className="ml-2">Da: {item.fromRecipe}</Badge>}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem(item.id)}>
                      <Trash2 />
                    </Button>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">Nessun elemento nella lista.</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
