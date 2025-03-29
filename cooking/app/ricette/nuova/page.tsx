"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface Ingredient {
  name: string
  quantity: string
}

interface Step {
  description: string
}

export default function NewRecipePage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [time, setTime] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", quantity: "" }])
  const [steps, setSteps] = useState<Step[]>([{ description: "" }])
  const [notes, setNotes] = useState("")

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }])
  }

  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return
    const newIngredients = [...ingredients]
    newIngredients.splice(index, 1)
    setIngredients(newIngredients)
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index][field] = value
    setIngredients(newIngredients)
  }

  const addStep = () => {
    setSteps([...steps, { description: "" }])
  }

  const removeStep = (index: number) => {
    if (steps.length === 1) return
    const newSteps = [...steps]
    newSteps.splice(index, 1)
    setSteps(newSteps)
  }

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index].description = value
    setSteps(newSteps)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validazione
    if (!title || !description || !time || !difficulty) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive",
      })
      return
    }

    if (ingredients.some((ing) => !ing.name || !ing.quantity)) {
      toast({
        title: "Errore",
        description: "Compila tutti gli ingredienti o rimuovi quelli vuoti",
        variant: "destructive",
      })
      return
    }

    if (steps.some((step) => !step.description)) {
      toast({
        title: "Errore",
        description: "Compila tutti i passaggi o rimuovi quelli vuoti",
        variant: "destructive",
      })
      return
    }

    // Preparazione dei dati
    const recipeData = {
      title,
      description,
      image: "/placeholder.svg?height=300&width=400", // Immagine di default
      time,
      difficulty,
      ingredients,
      steps: steps.map((step) => step.description),
      notes,
      favorite: false,
      personal: true,
    }

    // Salva la ricetta nel localStorage
    try {
      // Recupera le ricette esistenti
      const existingRecipesJSON = localStorage.getItem("recipes")
      const existingRecipes = existingRecipesJSON ? JSON.parse(existingRecipesJSON) : []

      // Genera un nuovo ID
      const newId = existingRecipes.length > 0 ? Math.max(...existingRecipes.map((r: any) => r.id)) + 1 : 1

      // Crea la nuova ricetta con ID
      const newRecipe = {
        id: newId,
        ...recipeData,
      }

      // Aggiungi la nuova ricetta all'array e salva
      existingRecipes.push(newRecipe)
      localStorage.setItem("recipes", JSON.stringify(existingRecipes))

      toast({
        title: "Ricetta salvata",
        description: "La tua ricetta è stata salvata con successo",
      })

      // Reindirizzamento alla pagina delle ricette
      setTimeout(() => {
        router.push("/ricette")
      }, 1500)
    } catch (error) {
      console.error("Errore durante il salvataggio della ricetta:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della ricetta",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/ricette">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle ricette
            </Link>
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Nuova Ricetta</h1>
          <p className="text-muted-foreground">Crea e salva una nuova ricetta personale</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Generali</CardTitle>
              <CardDescription>Inserisci le informazioni di base della tua ricetta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titolo</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. Pasta alla Carbonara"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrizione</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Breve descrizione della ricetta"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Tempo di Preparazione</Label>
                  <Input
                    id="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="Es. 30 min"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficoltà</Label>
                  <Select value={difficulty} onValueChange={setDifficulty} required>
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Seleziona difficoltà" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Facile">Facile</SelectItem>
                      <SelectItem value="Media">Media</SelectItem>
                      <SelectItem value="Difficile">Difficile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ingredienti</CardTitle>
              <CardDescription>Aggiungi tutti gli ingredienti necessari per la tua ricetta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, "name", e.target.value)}
                      placeholder="Nome ingrediente"
                    />
                  </div>
                  <div className="w-1/3">
                    <Input
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                      placeholder="Quantità"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Rimuovi ingrediente</span>
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addIngredient} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Ingrediente
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Procedimento</CardTitle>
              <CardDescription>Descrivi i passaggi per preparare la tua ricetta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="mt-2 flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder={`Passaggio ${index + 1}`}
                      rows={2}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Rimuovi passaggio</span>
                  </Button>
                </div>
              ))}

              <Button type="button" variant="outline" onClick={addStep} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Aggiungi Passaggio
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Note e Consigli</CardTitle>
              <CardDescription>Aggiungi note o consigli opzionali per la tua ricetta</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Consigli, varianti o note aggiuntive"
                rows={4}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.push("/ricette")}>
                Annulla
              </Button>
              <Button type="submit">Salva Ricetta</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}

