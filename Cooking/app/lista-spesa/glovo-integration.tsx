"use client"

import { useState } from "react"
import { ShoppingBag, ExternalLink } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface GlovoIntegrationProps {
  shoppingItems: {
    id: string
    name: string
    quantity: string
    checked: boolean
  }[]
}

export function GlovoIntegration({ shoppingItems }: GlovoIntegrationProps) {
  const [showDialog, setShowDialog] = useState(false)
  const [address, setAddress] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isOrdering, setIsOrdering] = useState(false)

  // Seleziona/deseleziona tutti gli elementi
  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(shoppingItems.filter((item) => !item.checked).map((item) => item.id))
    } else {
      setSelectedItems([])
    }
  }

  // Gestisce la selezione di un singolo elemento
  const toggleSelectItem = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter((id) => id !== itemId))
    }
  }

  // Simula l'ordine su Glovo
  const handleOrder = () => {
    if (!address) {
      toast({
        title: "Indirizzo mancante",
        description: "Per favore, inserisci un indirizzo di consegna",
        variant: "destructive",
      })
      return
    }

    if (selectedItems.length === 0) {
      toast({
        title: "Nessun elemento selezionato",
        description: "Per favore, seleziona almeno un elemento da ordinare",
        variant: "destructive",
      })
      return
    }

    setIsOrdering(true)

    // Simula una richiesta API
    setTimeout(() => {
      setIsOrdering(false)
      setShowDialog(false)

      toast({
        title: "Ordine inviato a Glovo",
        description: `${selectedItems.length} elementi saranno consegnati a ${address}`,
      })

      // Resetta lo stato
      setSelectedItems([])
      setAddress("")
    }, 2000)
  }

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center"
        onClick={() => setShowDialog(true)}
        disabled={shoppingItems.filter((item) => !item.checked).length === 0}
      >
        <ShoppingBag className="mr-2 h-4 w-4" />
        Ordina su Glovo
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ordina su Glovo</DialogTitle>
            <DialogDescription>Seleziona gli elementi della lista della spesa da ordinare su Glovo</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Indirizzo di consegna</Label>
              <Input
                id="address"
                placeholder="Via Roma 123, Milano"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="border rounded-md p-3">
              <div className="flex items-center pb-3 mb-3 border-b">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedItems.length === shoppingItems.filter((item) => !item.checked).length &&
                    selectedItems.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                <Label htmlFor="select-all" className="ml-2 font-medium">
                  Seleziona tutti ({shoppingItems.filter((item) => !item.checked).length})
                </Label>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                {shoppingItems.filter((item) => !item.checked).length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-2">Non ci sono elementi da ordinare</p>
                ) : (
                  shoppingItems
                    .filter((item) => !item.checked)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Checkbox
                            id={`item-${item.id}`}
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked) => toggleSelectItem(item.id, !!checked)}
                          />
                          <Label htmlFor={`item-${item.id}`} className="ml-2">
                            {item.name}
                          </Label>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.quantity}</span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="bg-muted p-3 rounded-md flex items-center">
              <ExternalLink className="h-4 w-4 mr-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Verrai reindirizzato al sito di Glovo per completare l'ordine
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleOrder} disabled={isOrdering || selectedItems.length === 0}>
              {isOrdering ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Ordinando...
                </>
              ) : (
                <>Ordina ({selectedItems.length})</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
