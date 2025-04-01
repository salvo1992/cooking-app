"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, Send, X, ChevronDown } from "lucide-react"
import { ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { shoppingListApi, pantryApi, recipeApi } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatbotProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

// Stato della conversazione per mantenere il contesto
interface ConversationState {
  context: "general" | "recipe" | "shopping" | "pantry" | "diet" | "notes"
  pendingAction: string | null
  pendingData: any
  awaitingResponse: boolean
}

export function Chatbot({ isOpen, setIsOpen }: ChatbotProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPantryDialog, setShowPantryDialog] = useState(false)
  const [selectedPantryItem, setSelectedPantryItem] = useState<any>(null)
  const [removeQuantity, setRemoveQuantity] = useState(1)
  const [conversationState, setConversationState] = useState<ConversationState>({
    context: "general",
    pendingAction: null,
    pendingData: null,
    awaitingResponse: false,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const voiceSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Inizializza il chatbot con un messaggio di benvenuto quando viene aperto
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Ciao! Sono Cuocco, il tuo assistente di cucina. Posso aiutarti a navigare nel sito, trovare ricette, gestire la tua lista della spesa e molto altro. Cosa posso fare per te oggi?",
      )
    }
  }, [isOpen, messages.length])

  // Mostra un messaggio casuale ogni tanto
  useEffect(() => {
    if (!isOpen) return

    const randomTips = [
      "Hai bisogno di aiuto con le ricette? Chiedimi pure!",
      "Posso aiutarti a organizzare la tua lista della spesa, basta chiedere!",
      "Vuoi un consiglio per la cena di stasera? Sono qui per aiutarti!",
      "Sapevi che conservare le erbe aromatiche in un bicchiere d'acqua le mantiene fresche più a lungo?",
      "Un trucco da chef: aggiungi un pizzico di sale all'acqua quando cuoci le verdure per mantenere il colore vivace!",
      "Hai bisogno di aiuto con il tuo piano dietetico? Chiedimi pure!",
    ]

    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const randomTip = randomTips[Math.floor(Math.random() * randomTips.length)]
        addBotMessage(randomTip)
      }
    }, 300000) // Ogni 5 minuti

    return () => clearInterval(interval)
  }, [isOpen])

  // Scroll automatico ai messaggi più recenti
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Carica le voci disponibili per la sintesi vocale
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      // Inizializza l'utterance una sola volta
      if (!voiceSynthesisRef.current) {
        voiceSynthesisRef.current = new SpeechSynthesisUtterance()

        // Configura le proprietà di base
        voiceSynthesisRef.current.lang = "it-IT"
        voiceSynthesisRef.current.rate = 0.9 // Leggermente più lento
        voiceSynthesisRef.current.pitch = 1.1 // Tono leggermente più alto

        // Funzione per trovare la voce migliore
        const setOptimalVoice = () => {
          const voices = window.speechSynthesis.getVoices()

          // Cerca prima una voce italiana di alta qualità
          const italianVoice = voices.find((voice) => voice.lang.includes("it") && voice.localService === false)

          // Se non c'è una voce italiana di alta qualità, cerca una voce italiana qualsiasi
          const anyItalianVoice = voices.find((voice) => voice.lang.includes("it"))

          // Se c'è una voce italiana, usala
          if (italianVoice) {
            voiceSynthesisRef.current!.voice = italianVoice
          } else if (anyItalianVoice) {
            voiceSynthesisRef.current!.voice = anyItalianVoice
          }

          // Altrimenti usa la voce predefinita
        }

        // Le voci potrebbero non essere disponibili immediatamente
        if (window.speechSynthesis.getVoices().length > 0) {
          setOptimalVoice()
        } else {
          window.speechSynthesis.onvoiceschanged = setOptimalVoice
        }
      }
    }

    return () => {
      // Ferma la sintesi vocale quando il componente viene smontato
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  // Aggiunge un messaggio del bot
  const addBotMessage = (content: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        content,
        sender: "bot",
        timestamp: new Date(),
      },
    ])

    // Leggi il messaggio ad alta voce con una voce più naturale
    if ("speechSynthesis" in window && voiceSynthesisRef.current) {
      // Ferma qualsiasi sintesi vocale in corso
      window.speechSynthesis.cancel()

      // Imposta il nuovo testo
      voiceSynthesisRef.current.text = content

      // Avvia la sintesi vocale
      window.speechSynthesis.speak(voiceSynthesisRef.current)
    }
  }

  // Gestisce l'invio di un messaggio
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Aggiungi il messaggio dell'utente
    const userMessage = {
      id: Date.now().toString(),
      content: input,
      sender: "user" as const,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Analizza il messaggio dell'utente
      await processUserMessage(input)
    } catch (error) {
      console.error("Errore durante l'elaborazione del messaggio:", error)
      addBotMessage("Mi dispiace, si è verificato un errore. Puoi riprovare?")
    } finally {
      setIsLoading(false)
    }
  }

  // Gestisce la creazione di una ricetta
  const handleRecipeCreation = async (recipeName: string, ingredients?: string, instructions?: string) => {
    // Se siamo in attesa di ingredienti o istruzioni, aggiorniamo i dati in sospeso
    if (conversationState.pendingAction === "waiting_recipe_ingredients") {
      setConversationState((prev) => ({
        ...prev,
        pendingData: {
          ...prev.pendingData,
          ingredients: ingredients || input,
        },
        pendingAction: "waiting_recipe_instructions",
        awaitingResponse: true,
      }))

      addBotMessage(
        `Ottimo! Ho registrato gli ingredienti per la ricetta "${conversationState.pendingData.name}". Ora, puoi dirmi come si prepara?`,
      )
      return
    }

    if (conversationState.pendingAction === "waiting_recipe_instructions") {
      setConversationState((prev) => ({
        ...prev,
        pendingData: {
          ...prev.pendingData,
          instructions: instructions || input,
        },
        pendingAction: null,
        awaitingResponse: false,
      }))

      // Ora abbiamo tutti i dati per creare la ricetta
      try {
        const recipeData = {
          title: conversationState.pendingData.name,
          description: `Ricetta per ${conversationState.pendingData.name}`,
          image: "/placeholder.svg?height=300&width=400",
          time: "30 min",
          difficulty: "Media",
          ingredients: conversationState.pendingData.ingredients.split(",").map((ing: string) => ({
            name: ing.trim(),
            quantity: "q.b.",
          })),
          steps: conversationState.pendingData.instructions
            .split(".")
            .filter((step: string) => step.trim().length > 0)
            .map((step: string) => step.trim() + "."),
          notes: "Ricetta creata tramite chatbot",
          favorite: false,
          personal: true,
        }

        await recipeApi.add(recipeData)

        addBotMessage(`Ho creato la ricetta "${conversationState.pendingData.name}" con successo! Vuoi vederla?`)

        // Resetta lo stato della conversazione
        setConversationState({
          context: "recipe",
          pendingAction: null,
          pendingData: null,
          awaitingResponse: false,
        })

        // Dopo un breve ritardo, porta l'utente alla pagina delle ricette
        setTimeout(() => router.push("/ricette"), 2000)
      } catch (error) {
        console.error("Errore durante la creazione della ricetta:", error)
        addBotMessage("Mi dispiace, si è verificato un errore durante la creazione della ricetta. Puoi riprovare?")
      }

      return
    }

    // Inizia il processo di creazione della ricetta
    setConversationState({
      context: "recipe",
      pendingAction: "waiting_recipe_ingredients",
      pendingData: { name: recipeName },
      awaitingResponse: true,
    })

    addBotMessage(
      `Sto creando una nuova ricetta chiamata "${recipeName}". Quali ingredienti servono? (separali con virgole)`,
    )
  }

  // Gestisce l'aggiunta di un elemento alla lista della spesa
  const handleAddToShoppingList = async (item: string, quantity?: string) => {
    try {
      await shoppingListApi.add({
        name: item.trim(),
        quantity: quantity || "1",
        checked: false,
      })

      addBotMessage(`Ho aggiunto "${item.trim()}" alla tua lista della spesa!`)

      toast({
        title: "Prodotto aggiunto",
        description: `${item.trim()} è stato aggiunto alla lista della spesa`,
      })
    } catch (error) {
      console.error("Errore durante l'aggiunta alla lista della spesa:", error)
      addBotMessage("Mi dispiace, non sono riuscito ad aggiungere l'elemento alla lista della spesa.")
    }
  }

  // Gestisce la rimozione di un elemento dalla lista della spesa
  const handleRemoveFromShoppingList = async (item: string) => {
    try {
      // Cerca l'elemento nella lista della spesa
      const shoppingList = await shoppingListApi.getAll()
      const itemToRemove = shoppingList.find((i) => i.name.toLowerCase().includes(item.toLowerCase()))

      if (itemToRemove) {
        await shoppingListApi.remove(itemToRemove.id)
        addBotMessage(`Ho rimosso "${itemToRemove.name}" dalla tua lista della spesa!`)

        toast({
          title: "Prodotto rimosso",
          description: `${itemToRemove.name} è stato rimosso dalla lista della spesa`,
        })
      } else {
        addBotMessage(`Non ho trovato "${item}" nella tua lista della spesa. Vuoi che lo cerchi con un altro nome?`)
      }
    } catch (error) {
      console.error("Errore durante la rimozione dalla lista della spesa:", error)
      addBotMessage("Mi dispiace, non sono riuscito a rimuovere l'elemento dalla lista della spesa.")
    }
  }

  // Gestisce l'aggiunta di un elemento alla dispensa
  const handleAddToPantry = async (item: string, quantity?: string, category?: string, expiryDate?: string) => {
    if (conversationState.pendingAction === "waiting_pantry_quantity") {
      // Aggiorna i dati in sospeso con la quantità
      setConversationState((prev) => ({
        ...prev,
        pendingData: {
          ...prev.pendingData,
          quantity: quantity || input,
        },
        pendingAction: "waiting_pantry_category",
        awaitingResponse: true,
      }))

      addBotMessage(
        `Ottimo! Ora, in quale categoria vuoi inserire "${conversationState.pendingData.name}"? (es. Frutta, Verdura, Carne, Pesce, Latticini, Altro)`,
      )
      return
    }

    if (conversationState.pendingAction === "waiting_pantry_category") {
      // Aggiorna i dati in sospeso con la categoria
      setConversationState((prev) => ({
        ...prev,
        pendingData: {
          ...prev.pendingData,
          category: category || input,
        },
        pendingAction: "waiting_pantry_expiry",
        awaitingResponse: true,
      }))

      addBotMessage(
        `Perfetto! Infine, qual è la data di scadenza per "${conversationState.pendingData.name}"? (formato: YYYY-MM-DD o "nessuna" se non applicabile)`,
      )
      return
    }

    if (conversationState.pendingAction === "waiting_pantry_expiry") {
      // Aggiorna i dati in sospeso con la data di scadenza
      let expiryDateValue = expiryDate || input

      // Se l'utente ha scritto "nessuna" o simili, imposta la data a null
      if (["nessuna", "nessuno", "non applicabile", "na", "n/a"].includes(expiryDateValue.toLowerCase())) {
        expiryDateValue = null
      }

      setConversationState((prev) => ({
        ...prev,
        pendingData: {
          ...prev.pendingData,
          expiryDate: expiryDateValue,
        },
        pendingAction: null,
        awaitingResponse: false,
      }))

      // Ora abbiamo tutti i dati per aggiungere l'elemento alla dispensa
      try {
        await pantryApi.add({
          name: conversationState.pendingData.name,
          quantity: conversationState.pendingData.quantity,
          category: conversationState.pendingData.category,
          expiryDate: conversationState.pendingData.expiryDate,
        })

        addBotMessage(`Ho aggiunto "${conversationState.pendingData.name}" alla tua dispensa!`)

        toast({
          title: "Prodotto aggiunto",
          description: `${conversationState.pendingData.name} è stato aggiunto alla dispensa`,
        })

        // Resetta lo stato della conversazione
        setConversationState({
          context: "pantry",
          pendingAction: null,
          pendingData: null,
          awaitingResponse: false,
        })
      } catch (error) {
        console.error("Errore durante l'aggiunta alla dispensa:", error)
        addBotMessage("Mi dispiace, non sono riuscito ad aggiungere l'elemento alla dispensa.")
      }

      return
    }

    // Inizia il processo di aggiunta alla dispensa
    setConversationState({
      context: "pantry",
      pendingAction: "waiting_pantry_quantity",
      pendingData: { name: item },
      awaitingResponse: true,
    })

    addBotMessage(`Sto aggiungendo "${item}" alla tua dispensa. Quale quantità vuoi aggiungere?`)
  }

  // Gestisce la rimozione di un elemento dalla dispensa
  const handleRemoveFromPantry = async (item: string) => {
    try {
      // Cerca l'elemento nella dispensa
      const pantryItems = await pantryApi.getAll()
      const itemToRemove = pantryItems.find((i) => i.name.toLowerCase().includes(item.toLowerCase()))

      if (itemToRemove) {
        // Mostra il dialog per selezionare la quantità
        setSelectedPantryItem(itemToRemove)
        setRemoveQuantity(1)
        setShowPantryDialog(true)
      } else {
        addBotMessage(`Non ho trovato "${item}" nella tua dispensa. Vuoi che lo cerchi con un altro nome?`)
      }
    } catch (error) {
      console.error("Errore durante la rimozione dalla dispensa:", error)
      addBotMessage("Mi dispiace, non sono riuscito a trovare l'elemento nella dispensa.")
    }
  }

  // Conferma la rimozione di un elemento dalla dispensa
  const confirmRemoveFromPantry = async () => {
    try {
      if (!selectedPantryItem) return

      // Se la quantità da rimuovere è uguale o maggiore della quantità disponibile, rimuovi l'elemento
      if (removeQuantity >= Number.parseFloat(selectedPantryItem.quantity)) {
        await pantryApi.remove(selectedPantryItem.id)

        addBotMessage(`Ho rimosso completamente "${selectedPantryItem.name}" dalla tua dispensa!`)

        toast({
          title: "Prodotto rimosso",
          description: `${selectedPantryItem.name} è stato rimosso dalla dispensa`,
        })
      } else {
        // Altrimenti, aggiorna la quantità
        const updatedQuantity = (Number.parseFloat(selectedPantryItem.quantity) - removeQuantity).toString()

        await pantryApi.update({
          ...selectedPantryItem,
          quantity: updatedQuantity,
        })

        addBotMessage(
          `Ho rimosso ${removeQuantity} ${selectedPantryItem.name} dalla tua dispensa. Ne rimangono ${updatedQuantity}.`,
        )

        toast({
          title: "Prodotto aggiornato",
          description: `La quantità di ${selectedPantryItem.name} è stata aggiornata`,
        })
      }

      setShowPantryDialog(false)
      setSelectedPantryItem(null)
    } catch (error) {
      console.error("Errore durante la rimozione dalla dispensa:", error)
      addBotMessage("Mi dispiace, non sono riuscito a rimuovere l'elemento dalla dispensa.")
      setShowPantryDialog(false)
      setSelectedPantryItem(null)
    }
  }

  // Gestisce l'aggiunta di una nota
  const handleAddNote = async (noteContent: string) => {
    addBotMessage(`Sto aggiungendo una nuova nota con il contenuto: "${noteContent}". Ti porto alla pagina delle note.`)

    // Salva temporaneamente il contenuto della nota
    sessionStorage.setItem("newNoteContent", noteContent)

    // Naviga alla pagina delle note
    setTimeout(() => router.push("/note"), 1500)
  }

  // Elabora il messaggio dell'utente
  const processUserMessage = async (message: string) => {
    // Se siamo in attesa di una risposta specifica, gestiamo il contesto
    if (conversationState.awaitingResponse) {
      if (conversationState.context === "recipe") {
        if (conversationState.pendingAction === "waiting_recipe_ingredients") {
          await handleRecipeCreation("", message)
          return
        } else if (conversationState.pendingAction === "waiting_recipe_instructions") {
          await handleRecipeCreation("", "", message)
          return
        }
      } else if (conversationState.context === "pantry") {
        if (conversationState.pendingAction === "waiting_pantry_quantity") {
          await handleAddToPantry("", message)
          return
        } else if (conversationState.pendingAction === "waiting_pantry_category") {
          await handleAddToPantry("", "", message)
          return
        } else if (conversationState.pendingAction === "waiting_pantry_expiry") {
          await handleAddToPantry("", "", "", message)
          return
        }
      }
    }

    const lowerMessage = message.toLowerCase()

    // Pattern matching più flessibile per i comandi

    // Navigazione
    if (
      lowerMessage.includes("home") ||
      lowerMessage.includes("pagina principale") ||
      lowerMessage.includes("torna indietro") ||
      lowerMessage.includes("pagina iniziale")
    ) {
      addBotMessage("Ti porto alla home page!")
      setTimeout(() => router.push("/"), 1000)
      return
    }

    // Gestione ricette
    if (
      lowerMessage.includes("ricett") ||
      lowerMessage.includes("piatt") ||
      lowerMessage.includes("cucinare") ||
      lowerMessage.includes("preparare")
    ) {
      // Creazione ricetta
      if (
        lowerMessage.includes("nuova") ||
        lowerMessage.includes("crea") ||
        lowerMessage.includes("aggiungi") ||
        lowerMessage.includes("inserisci") ||
        lowerMessage.includes("scrivi")
      ) {
        // Cerca il nome della ricetta con pattern matching più flessibile
        const recipeNamePatterns = [
          /crea(?:\s+una)?\s+(?:nuova\s+)?ricetta\s+(?:chiamata\s+|per\s+|di\s+)?["']?([^"']+)["']?/i,
          /nuova\s+ricetta\s+(?:chiamata\s+|per\s+|di\s+)?["']?([^"']+)["']?/i,
          /aggiungi\s+(?:una\s+)?ricetta\s+(?:chiamata\s+|per\s+|di\s+)?["']?([^"']+)["']?/i,
          /inserisci\s+(?:una\s+)?ricetta\s+(?:chiamata\s+|per\s+|di\s+)?["']?([^"']+)["']?/i,
          /scrivi\s+(?:una\s+)?ricetta\s+(?:chiamata\s+|per\s+|di\s+)?["']?([^"']+)["']?/i,
          /ricetta\s+(?:per\s+|di\s+)?["']?([^"']+)["']?/i,
        ]

        let recipeName = null
        for (const pattern of recipeNamePatterns) {
          const match = lowerMessage.match(pattern)
          if (match && match[1]) {
            recipeName = match[1].trim()
            break
          }
        }

        if (recipeName) {
          await handleRecipeCreation(recipeName)
        } else {
          addBotMessage("Vorrei aiutarti a creare una nuova ricetta. Come si chiama la ricetta che vuoi creare?")
          setConversationState({
            context: "recipe",
            pendingAction: "waiting_recipe_name",
            pendingData: null,
            awaitingResponse: true,
          })
        }
      } else {
        addBotMessage("Ti porto alla pagina delle ricette!")
        setTimeout(() => router.push("/ricette"), 1000)
      }
      return
    }

    // Gestione lista della spesa
    if (
      lowerMessage.includes("lista") ||
      lowerMessage.includes("spesa") ||
      lowerMessage.includes("comprare") ||
      lowerMessage.includes("acquistare")
    ) {
      // Aggiunta alla lista della spesa
      if (
        lowerMessage.includes("aggiungi") ||
        lowerMessage.includes("inserisci") ||
        lowerMessage.includes("metti") ||
        lowerMessage.includes("compra") ||
        lowerMessage.includes("acquista")
      ) {
        // Pattern matching più flessibile per l'aggiunta alla lista della spesa
        const itemPatterns = [
          /aggiungi\s+(.+?)(?:\s+alla|\s+al)?\s+(?:lista|spesa)/i,
          /inserisci\s+(.+?)(?:\s+nella|\s+nel)?\s+(?:lista|spesa)/i,
          /metti\s+(.+?)(?:\s+nella|\s+nel)?\s+(?:lista|spesa)/i,
          /compra\s+(.+?)(?:\s+per\s+la)?\s+(?:spesa)?/i,
          /acquista\s+(.+?)(?:\s+per\s+la)?\s+(?:spesa)?/i,
        ]

        let itemToAdd = null
        for (const pattern of itemPatterns) {
          const match = lowerMessage.match(pattern)
          if (match && match[1]) {
            itemToAdd = match[1].trim()
            break
          }
        }

        if (itemToAdd) {
          // Cerca anche la quantità
          const quantityMatch = itemToAdd.match(/(\d+(?:\.\d+)?)\s+(.+)/i)
          if (quantityMatch) {
            const quantity = quantityMatch[1]
            const item = quantityMatch[2]
            await handleAddToShoppingList(item, quantity)
          } else {
            await handleAddToShoppingList(itemToAdd)
          }
        } else {
          addBotMessage("Cosa vorresti aggiungere alla lista della spesa?")
        }
        return
      }
      // Rimozione dalla lista della spesa
      else if (
        lowerMessage.includes("rimuovi") ||
        lowerMessage.includes("elimina") ||
        lowerMessage.includes("togli") ||
        lowerMessage.includes("cancella") ||
        lowerMessage.includes("rimuovere") ||
        lowerMessage.includes("eliminare") ||
        lowerMessage.includes("togliere") ||
        lowerMessage.includes("cancellare")
      ) {
        // Pattern matching più flessibile per la rimozione dalla lista della spesa
        const itemPatterns = [
          /(?:rimuovi|elimina|togli|cancella)\s+(.+?)(?:\s+dalla|\s+dal)?\s+(?:lista|spesa)/i,
          /(?:rimuovere|eliminare|togliere|cancellare)\s+(.+?)(?:\s+dalla|\s+dal)?\s+(?:lista|spesa)/i,
        ]

        let itemToRemove = null
        for (const pattern of itemPatterns) {
          const match = lowerMessage.match(pattern)
          if (match && match[1]) {
            itemToRemove = match[1].trim()
            break
          }
        }

        if (itemToRemove) {
          await handleRemoveFromShoppingList(itemToRemove)
        } else {
          addBotMessage("Cosa vorresti rimuovere dalla lista della spesa?")
        }
        return
      }

      // Navigazione alla lista della spesa
      addBotMessage("Ti porto alla lista della spesa!")
      setTimeout(() => router.push("/lista-spesa"), 1000)
      return
    }

    // Gestione dispensa
    if (
      lowerMessage.includes("dispensa") ||
      lowerMessage.includes("conserv") ||
      lowerMessage.includes("magazzino") ||
      lowerMessage.includes("cibo") ||
      lowerMessage.includes("alimenti")
    ) {
      // Aggiunta alla dispensa
      if (
        lowerMessage.includes("aggiungi") ||
        lowerMessage.includes("inserisci") ||
        lowerMessage.includes("metti") ||
        lowerMessage.includes("registra") ||
        lowerMessage.includes("salva")
      ) {
        // Pattern matching più flessibile per l'aggiunta alla dispensa
        const itemPatterns = [
          /aggiungi\s+(.+?)(?:\s+alla|\s+al)?\s+(?:dispensa|conserva)/i,
          /inserisci\s+(.+?)(?:\s+nella|\s+nel)?\s+(?:dispensa|conserva)/i,
          /metti\s+(.+?)(?:\s+nella|\s+nel)?\s+(?:dispensa|conserva)/i,
          /registra\s+(.+?)(?:\s+nella|\s+nel)?\s+(?:dispensa|conserva)/i,
          /salva\s+(.+?)(?:\s+nella|\s+nel)?\s+(?:dispensa|conserva)/i,
        ]

        let itemToAdd = null
        for (const pattern of itemPatterns) {
          const match = lowerMessage.match(pattern)
          if (match && match[1]) {
            itemToAdd = match[1].trim()
            break
          }
        }

        if (itemToAdd) {
          await handleAddToPantry(itemToAdd)
        } else {
          addBotMessage("Cosa vorresti aggiungere alla dispensa?")
        }
        return
      }
      // Rimozione dalla dispensa
      else if (
        lowerMessage.includes("rimuovi") ||
        lowerMessage.includes("elimina") ||
        lowerMessage.includes("togli") ||
        lowerMessage.includes("cancella") ||
        lowerMessage.includes("usa") ||
        lowerMessage.includes("consuma") ||
        lowerMessage.includes("prendi")
      ) {
        // Pattern matching più flessibile per la rimozione dalla dispensa
        const itemPatterns = [
          /(?:rimuovi|elimina|togli|cancella|usa|consuma|prendi)\s+(.+?)(?:\s+dalla|\s+dal)?\s+(?:dispensa|conserva)/i,
          /(?:rimuovere|eliminare|togliere|cancellare|usare|consumare|prendere)\s+(.+?)(?:\s+dalla|\s+dal)?\s+(?:dispensa|conserva)/i,
          /ho\s+(?:usato|consumato|preso)\s+(.+?)(?:\s+dalla|\s+dal)?\s+(?:dispensa|conserva)/i,
        ]

        let itemToRemove = null
        for (const pattern of itemPatterns) {
          const match = lowerMessage.match(pattern)
          if (match && match[1]) {
            itemToRemove = match[1].trim()
            break
          }
        }

        if (itemToRemove) {
          await handleRemoveFromPantry(itemToRemove)
        } else {
          addBotMessage("Cosa vorresti rimuovere dalla dispensa?")
        }
        return
      }

      // Navigazione alla dispensa
      addBotMessage("Ti porto alla dispensa!")
      setTimeout(() => router.push("/dispensa"), 1000)
      return
    }

    // Gestione note
    if (
      lowerMessage.includes("note") ||
      lowerMessage.includes("appunti") ||
      lowerMessage.includes("promemoria") ||
      lowerMessage.includes("memo")
    ) {
      // Aggiunta di note
      if (
        lowerMessage.includes("aggiungi") ||
        lowerMessage.includes("crea") ||
        lowerMessage.includes("nuova") ||
        lowerMessage.includes("scrivi") ||
        lowerMessage.includes("inserisci")
      ) {
        // Pattern matching più flessibile per l'aggiunta di note
        const notePatterns = [
          /(?:aggiungi|crea|nuova)\s+nota\s+(?:con\s+(?:contenuto|testo))?\s*["']?([^"']+)["']?/i,
          /(?:scrivi|inserisci)\s+(?:una\s+)?nota\s+(?:con\s+(?:contenuto|testo))?\s*["']?([^"']+)["']?/i,
          /nota\s+(?:con\s+(?:contenuto|testo))?\s*["']?([^"']+)["']?/i,
        ]

        let noteContent = null
        for (const pattern of notePatterns) {
          const match = lowerMessage.match(pattern)
          if (match && match[1]) {
            noteContent = match[1].trim()
            break
          }
        }

        if (noteContent) {
          await handleAddNote(noteContent)
        } else {
          addBotMessage("Che nota vorresti aggiungere?")
        }
        return
      }

      // Navigazione alle note
      addBotMessage("Ti porto alle tue note!")
      setTimeout(() => router.push("/note"), 1000)
      return
    }

    // Gestione dieta
    if (
      lowerMessage.includes("dieta") ||
      lowerMessage.includes("alimentazione") ||
      lowerMessage.includes("nutrizione") ||
      lowerMessage.includes("piano alimentare") ||
      lowerMessage.includes("calorie")
    ) {
      addBotMessage("Ti porto alla pagina della dieta personalizzata!")
      setTimeout(() => router.push("/dieta"), 1000)
      return
    }

    // Gestione profilo
    if (
      lowerMessage.includes("profilo") ||
      lowerMessage.includes("account") ||
      lowerMessage.includes("utente") ||
      lowerMessage.includes("impostazioni") ||
      lowerMessage.includes("preferenze")
    ) {
      addBotMessage("Ti porto al tuo profilo!")
      setTimeout(() => router.push("/profilo"), 1000)
      return
    }

    // Consigli di cucina
    if (
      lowerMessage.includes("consiglio") ||
      lowerMessage.includes("suggerimento") ||
      lowerMessage.includes("idea") ||
      lowerMessage.includes("trucco") ||
      lowerMessage.includes("tip") ||
      lowerMessage.includes("aiuto")
    ) {
      const cookingTips = [
        "Per mantenere fresche le erbe aromatiche, avvolgile in un tovagliolo di carta umido e conservale in frigorifero.",
        "Aggiungi un pizzico di sale all'acqua quando cuoci le verdure per mantenere il colore vivace.",
        "Per evitare che le patate germoglino, conservale con una mela.",
        "Scalda il piatto prima di servire il cibo caldo, manterrà la temperatura più a lungo.",
        "Per un risotto cremoso, aggiungi il brodo poco alla volta e mantieni sempre in movimento.",
        "Lascia riposare la carne dopo la cottura per permettere ai succhi di ridistribuirsi.",
        "Per tagliare facilmente le cipolle senza lacrimare, mettile in freezer per 10-15 minuti prima.",
        "Usa il ghiaccio per rimuovere il grasso in eccesso dalle zuppe e dai brodi.",
        "Per una pasta al dente perfetta, scolala un minuto prima di quanto indicato sulla confezione e finisci la cottura nel sugo.",
        "Conserva il pane in un sacchetto di carta, non di plastica, per mantenerlo fresco più a lungo.",
        "Quando prepari l'impasto per la pizza, usa acqua tiepida per attivare il lievito più velocemente.",
        "Per ottenere più succo da un limone, riscaldalo nel microonde per 10-15 secondi prima di spremerlo.",
        "Aggiungi un cucchiaino di bicarbonato all'acqua di cottura dei legumi per renderli più digeribili.",
        "Per evitare che il riso si attacchi, sciacqualo prima della cottura per rimuovere l'amido in eccesso.",
        "Quando prepari la pasta, aggiungi il sale solo quando l'acqua bolle, altrimenti potrebbe danneggiare la pentola.",
      ]

      const randomTip = cookingTips[Math.floor(Math.random() * cookingTips.length)]
      addBotMessage(randomTip)
      return
    }

    // Informazioni sul sito
    if (
      lowerMessage.includes("cosa puoi fare") ||
      lowerMessage.includes("come funziona") ||
      lowerMessage.includes("aiuto") ||
      lowerMessage.includes("funzionalità") ||
      lowerMessage.includes("capacità") ||
      lowerMessage.includes("chi sei")
    ) {
      addBotMessage(
        "Sono Cuocco, il tuo assistente di cucina personale! Posso aiutarti a navigare nel sito, trovare e creare ricette, gestire la tua lista della spesa e dispensa, e darti consigli di cucina. Puoi chiedermi di portarti a una pagina specifica, aggiungere elementi alla lista della spesa o alla dispensa, creare nuove ricette o semplicemente chiedermi un consiglio di cucina. Sono qui per rendere la tua esperienza in cucina più semplice e piacevole!",
      )
      return
    }

    // Saluti e conversazione generale
    if (
      lowerMessage.includes("ciao") ||
      lowerMessage.includes("salve") ||
      lowerMessage.includes("buongiorno") ||
      lowerMessage.includes("buonasera") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("ehi")
    ) {
      const greetings = [
        "Ciao! Come posso aiutarti oggi in cucina?",
        "Salve! Sono Cuocco, il tuo assistente di cucina. Cosa ti serve?",
        "Buongiorno! Hai fame? Posso aiutarti a trovare o creare una ricetta!",
        "Ciao! Hai bisogno di aiuto con la lista della spesa, la dispensa o le ricette?",
        "Ehi! Sono qui per aiutarti con tutto ciò che riguarda la cucina. Cosa posso fare per te?",
      ]

      const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)]
      addBotMessage(randomGreeting)
      return
    }

    // Ringraziamenti
    if (
      lowerMessage.includes("grazie") ||
      lowerMessage.includes("thank") ||
      lowerMessage.includes("thx") ||
      lowerMessage.includes("apprezzato")
    ) {
      const thanks = [
        "Prego! Sono felice di poterti aiutare.",
        "Di niente! Sono qui per questo.",
        "Figurati! C'è altro in cui posso esserti utile?",
        "È un piacere! Fammi sapere se hai bisogno di altro.",
        "Non c'è di che! Buon appetito!",
      ]

      const randomThanks = thanks[Math.floor(Math.random() * thanks.length)]
      addBotMessage(randomThanks)
      return
    }

    // Risposta generica
    const genericResponses = [
      "Non sono sicuro di aver capito. Posso aiutarti con ricette, lista della spesa, dispensa o consigli di cucina. Come posso esserti utile?",
      "Mmm, non ho capito bene. Vuoi che ti aiuti con ricette, lista della spesa o dispensa?",
      "Scusa, non ho compreso completamente. Posso aiutarti a navigare nel sito, trovare ricette o gestire la tua lista della spesa. Cosa preferisci?",
      "Non ho afferrato bene la tua richiesta. Posso darti consigli di cucina, aiutarti con le ricette o con la gestione della dispensa. Di cosa hai bisogno?",
      "Non sono sicuro di cosa intendi. Prova a chiedermi di aiutarti con ricette, lista della spesa, dispensa o consigli di cucina in modo più specifico.",
    ]

    const randomResponse = genericResponses[Math.floor(Math.random() * genericResponses.length)]
    addBotMessage(randomResponse)
  }

  // Gestisce la registrazione vocale
  const handleVoiceRecording = () => {
    if (!isRecording) {
      startRecording()
    } else {
      stopRecording()
    }
  }

  // Avvia la registrazione
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)

      const audioChunks: BlobPart[] = []

      mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data)
      })

      mediaRecorderRef.current.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" })
        await processAudioInput(audioBlob)
      })

      mediaRecorderRef.current.start()
      setIsRecording(true)
      toast({
        title: "Registrazione avviata",
        description: "Sto ascoltando...",
      })
    } catch (error) {
      console.error("Errore durante l'avvio della registrazione:", error)
      toast({
        title: "Errore",
        description: "Non è stato possibile avviare la registrazione audio.",
        variant: "destructive",
      })
    }
  }

  // Ferma la registrazione
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Ferma tutti i track dello stream
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())

      toast({
        title: "Registrazione completata",
        description: "Sto elaborando il tuo messaggio...",
      })
    }
  }

  // Elabora l'input audio (simulato)
  const processAudioInput = async (audioBlob: Blob) => {
    setIsLoading(true)

    try {
      // In un'implementazione reale, qui invieresti l'audio a un servizio di riconoscimento vocale
      // Per questa demo, simuliamo il riconoscimento con un ritardo
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simula alcuni comandi vocali riconosciuti più realistici e vari
      const recognizedCommands = [
        "Voglio creare una ricetta per la pasta al pomodoro",
        "Aggiungi pomodori, mozzarella e basilico alla lista della spesa",
        "Dammi un consiglio per cucinare il pesce",
        "Ho usato due uova dalla dispensa",
        "Aggiungi una nota: ricordati di comprare il sale",
        "Portami alla pagina delle ricette",
        "Voglio vedere la mia dispensa",
        "Aggiungi farina alla dispensa",
        "Quali sono le ricette più popolari?",
        "Come posso preparare una torta al cioccolato?",
      ]

      const randomCommand = recognizedCommands[Math.floor(Math.random() * recognizedCommands.length)]

      // Aggiungi il comando riconosciuto come messaggio dell'utente
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: randomCommand,
          sender: "user",
          timestamp: new Date(),
        },
      ])

      // Elabora il comando
      await processUserMessage(randomCommand)
    } catch (error) {
      console.error("Errore durante l'elaborazione dell'audio:", error)
      addBotMessage(
        "Mi dispiace, non sono riuscito a capire il tuo messaggio vocale. Puoi riprovare o scrivere il tuo messaggio?",
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 h-14 w-14 bg-primary hover:bg-primary/90"
      >
        <div className="relative">
          <ChefHat className="h-8 w-8 text-primary-foreground" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1">
            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
          </div>
        </div>
      </Button>
    )
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        {isMinimized ? (
          <Button
            onClick={() => setIsMinimized(false)}
            className="rounded-full p-3 h-14 w-14 bg-primary hover:bg-primary/90"
          >
            <div className="relative">
              <ChefHat className="h-8 w-8 text-primary-foreground" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1">
                <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></div>
              </div>
            </div>
          </Button>
        ) : (
          <Card className="w-80 sm:w-96 shadow-lg border-primary/20">
            <CardHeader className="bg-primary text-primary-foreground p-3 flex flex-row items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Cuocco" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <div className="relative">
                      <ChefHat className="h-5 w-5" />
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex space-x-1">
                        <div className="w-1 h-1 bg-primary-foreground rounded-full"></div>
                        <div className="w-1 h-1 bg-primary-foreground rounded-full"></div>
                      </div>
                    </div>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-sm">Cuocco</h3>
                  <p className="text-xs opacity-90">Il tuo assistente di cucina</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-3 h-80 overflow-y-auto">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            <CardFooter className="p-3 pt-0">
              <div className="flex w-full items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className={isRecording ? "bg-red-100 text-red-500 animate-pulse" : ""}
                        onClick={handleVoiceRecording}
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isRecording ? "Ferma registrazione" : "Registra messaggio vocale"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Input
                  placeholder="Scrivi un messaggio..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                />

                <Button variant="default" size="icon" onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>

      {/* Dialog per la rimozione dalla dispensa con selezione della quantità */}
      <Dialog open={showPantryDialog} onOpenChange={setShowPantryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rimuovi dalla dispensa</DialogTitle>
            <DialogDescription>
              Seleziona la quantità di "{selectedPantryItem?.name}" da rimuovere dalla dispensa
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center">
              <span>Quantità disponibile:</span>
              <span className="font-medium">{selectedPantryItem?.quantity}</span>
            </div>

            <div className="space-y-2">
              <Label>Quantità da rimuovere: {removeQuantity}</Label>
              <Slider
                value={[removeQuantity]}
                min={0.1}
                max={selectedPantryItem ? Number.parseFloat(selectedPantryItem.quantity) : 10}
                step={0.1}
                onValueChange={(value) => setRemoveQuantity(value[0])}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPantryDialog(false)}>
              Annulla
            </Button>
            <Button onClick={confirmRemoveFromPantry}>Conferma</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}







