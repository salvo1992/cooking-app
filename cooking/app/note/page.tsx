"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Edit, Trash2, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { noteApi, type Note } from "@/lib/api"

export default function NotePage() {
  const router = useRouter()

  // Stato per le note
  const [notes, setNotes] = useState<Note[]>([])

  // Stato per la ricerca
  const [searchQuery, setSearchQuery] = useState("")

  // Stato per la nota corrente
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({
    title: "",
    content: "",
    category: "generale",
  })

  // Stato per la modalità di modifica
  const [isEditing, setIsEditing] = useState(false)

  // Stato per il dialogo
  const [dialogOpen, setDialogOpen] = useState(false)

  // Carica le note dal localStorage all'avvio
  useEffect(() => {
    try {
      const loadedNotes = Array.isArray(noteApi.getAll()) ? noteApi.getAll() : []
      setNotes(loadedNotes)
      
    } catch (error) {
      console.error("Errore durante il caricamento delle note:", error)
    }
  }, [])

  // Filtra le note in base alla ricerca
  const filteredNotes = notes.filter(
    (note) =>
      (note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  )
  

  // Categorie di note
  const categories = [
    { value: "generale", label: "Generale" },
    { value: "ricette", label: "Ricette" },
    { value: "dieta", label: "Dieta" },
    { value: "spesa", label: "Lista della spesa" },
    { value: "altro", label: "Altro" },
  ]

  // Gestione del cambio di input
  const handleInputChange = (field: keyof Note, value: string) => {
    setCurrentNote((prev) => ({ ...prev, [field]: value }))
  }

  // Apertura del dialogo per una nuova nota
  const handleNewNote = () => {
    setCurrentNote({
      title: "",
      content: "",
      category: "generale",
    })
    setIsEditing(false)
    setDialogOpen(true)
  }

  // Apertura del dialogo per modificare una nota
  const handleEditNote = (note: Note) => {
    setCurrentNote(note)
    setIsEditing(true)
    setDialogOpen(true)
  }

  // Salvataggio della nota
  const handleSaveNote = () => {
    try {
      if (!currentNote.title || !currentNote.content) {
        toast({
          title: "Errore",
          description: "Titolo e contenuto sono obbligatori",
          variant: "destructive",
        })
        return
      }

      if (isEditing && currentNote.id) {
        // Aggiorna la nota esistente
        const updatedNote = noteApi.update(currentNote.id, currentNote)

        if (updatedNote) {
          setNotes(notes.map((note) => (note.id === currentNote.id ? updatedNote : note)))

          toast({
            title: "Nota aggiornata",
            description: "La nota è stata aggiornata con successo",
          })
        }
      } else {
        // Crea una nuova nota
        const newNote = noteApi.add({
          title: currentNote.title || "",
          content: currentNote.content || "",
          date: new Date().toISOString(),
          category: currentNote.category,
        })

        setNotes([...notes, newNote])

        toast({
          title: "Nota creata",
          description: "La nota è stata creata con successo",
        })
      }

      // Chiudi il dialogo
      setDialogOpen(false)
    } catch (error) {
      console.error("Errore durante il salvataggio della nota:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della nota",
        variant: "destructive",
      })
    }
  }

  // Eliminazione di una nota
  const handleDeleteNote = (id: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questa nota?")) {
      try {
        const success = noteApi.delete(id)

        if (success) {
          setNotes(notes.filter((note) => note.id !== id))

          toast({
            title: "Nota eliminata",
            description: "La nota è stata eliminata con successo",
          })
        }
      } catch (error) {
        console.error("Errore durante l'eliminazione della nota:", error)
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione della nota",
          variant: "destructive",
        })
      }
    }
  }

  // Formatta la data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Ottieni il colore del badge in base alla categoria
  const getCategoryColor = (category?: string) => {
    switch (category) {
      case "ricette":
        return "bg-green-500"
      case "dieta":
        return "bg-blue-500"
      case "spesa":
        return "bg-yellow-500"
      case "altro":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Note</h1>
          <p className="text-muted-foreground">Prendi appunti, salva idee e organizza i tuoi pensieri</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cerca note..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="shrink-0" onClick={handleNewNote}>
            <Plus className="h-4 w-4 mr-2" />
            Nuova Nota
          </Button>
        </div>

        <Tabs defaultValue="tutte">
          <TabsList>
            <TabsTrigger value="tutte">Tutte</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="tutte" className="mt-6">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessuna nota trovata</h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? `Nessun risultato per "${searchQuery}"` : "Non hai ancora creato nessuna nota"}
                </p>
                <Button onClick={handleNewNote}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crea una nota
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                        <Badge className={getCategoryColor(note.category)}>
                          {categories.find((c) => c.value === note.category)?.label || "Generale"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(note.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm line-clamp-4">{note.content}</p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Elimina</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifica</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category.value} value={category.value} className="mt-6">
              {filteredNotes.filter((note) => note.category === category.value).length === 0 ? (
                <div className="text-center py-12">
                  <h2 className="text-xl font-semibold mb-2">Nessuna nota in questa categoria</h2>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? `Nessun risultato per "${searchQuery}"`
                      : `Non hai ancora creato note nella categoria "${category.label}"`}
                  </p>
                  <Button onClick={handleNewNote}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crea una nota
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredNotes
                    .filter((note) => note.category === category.value)
                    .map((note) => (
                      <Card key={note.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="line-clamp-1">{note.title}</CardTitle>
                            <Badge className={getCategoryColor(note.category)}>
                              {categories.find((c) => c.value === note.category)?.label || "Generale"}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(note.date)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pb-2">
                          <p className="text-sm line-clamp-4">{note.content}</p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteNote(note.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Elimina</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEditNote(note)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Modifica</span>
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifica Nota" : "Nuova Nota"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifica i dettagli della nota" : "Crea una nuova nota"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={currentNote.title || ""}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Titolo della nota"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={currentNote.category || "generale"}
                onValueChange={(value) => handleInputChange("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Seleziona una categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenuto</Label>
              <Textarea
                id="content"
                value={currentNote.content || ""}
                onChange={(e) => handleInputChange("content", e.target.value)}
                placeholder="Contenuto della nota"
                rows={8}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annulla
            </Button>
            <Button onClick={handleSaveNote}>{isEditing ? "Aggiorna" : "Salva"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

