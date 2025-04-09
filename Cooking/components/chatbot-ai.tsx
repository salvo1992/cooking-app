"use client"

import { useState } from "react"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { toast } from "@/components/ui/use-toast"

// Interfaccia per il contesto del chatbot
export interface ChatbotContext {
  pantryItems: string[]
  recentRecipes: string[]
  dietaryPreferences: string[]
  userProfile: {
    name: string
    preferences: string[]
  }
}

// Funzione per generare risposte con AI
export async function generateChatbotResponse(
  message: string,
  context: ChatbotContext,
  previousMessages: { role: "user" | "assistant"; content: string }[],
) {
  try {
    // Costruisci il prompt con il contesto
    const systemPrompt = `
      Sei Cuocco, un assistente di cucina italiano esperto e amichevole. 
      Aiuti gli utenti a trovare ricette, gestire la loro dispensa, creare liste della spesa e fornire consigli di cucina.
      
      Informazioni sull'utente:
      - Nome: ${context.userProfile.name || "Utente"}
      - Preferenze: ${context.userProfile.preferences.join(", ") || "Nessuna preferenza specificata"}
      - Preferenze dietetiche: ${context.dietaryPreferences.join(", ") || "Nessuna preferenza dietetica specificata"}
      
      Dispensa dell'utente:
      ${context.pantryItems.length > 0 ? context.pantryItems.join(", ") : "La dispensa è vuota"}
      
      Ricette recenti:
      ${context.recentRecipes.length > 0 ? context.recentRecipes.join(", ") : "Nessuna ricetta recente"}
      
      Rispondi in modo conversazionale, amichevole e in italiano. Fornisci risposte brevi ma utili.
      Se l'utente chiede ricette, suggerisci piatti che può preparare con gli ingredienti nella sua dispensa.
      Se l'utente chiede consigli di cucina, fornisci suggerimenti pratici e utili.
      Se l'utente vuole aggiungere elementi alla lista della spesa o alla dispensa, conferma l'azione.
      Se l'utente chiede di navigare nell'app, guidalo alla sezione appropriata.
    `

    // Aggiungi i messaggi precedenti per mantenere il contesto della conversazione
    const allMessages = [...previousMessages, { role: "user" as const, content: message }]

    // Genera la risposta usando l'AI SDK
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 300,
    })

    return text
  } catch (error) {
    console.error("Errore durante la generazione della risposta:", error)
    return "Mi dispiace, si è verificato un errore. Puoi riprovare?"
  }
}

// Hook per utilizzare il chatbot AI
export function useChatbotAI(initialContext: ChatbotContext) {
  const [context, setContext] = useState<ChatbotContext>(initialContext)
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Aggiorna il contesto
  const updateContext = (newContext: Partial<ChatbotContext>) => {
    setContext((prev) => ({ ...prev, ...newContext }))
  }

  // Invia un messaggio e ottieni una risposta
  const sendMessage = async (message: string) => {
    try {
      setIsGenerating(true)

      // Aggiungi il messaggio dell'utente
      const updatedMessages = [...messages, { role: "user", content: message }]
      setMessages(updatedMessages)

      // Genera la risposta
      const response = await generateChatbotResponse(message, context, messages)

      // Aggiungi la risposta dell'assistente
      setMessages([...updatedMessages, { role: "assistant", content: response }])

      return response
    } catch (error) {
      console.error("Errore durante l'invio del messaggio:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la generazione della risposta",
        variant: "destructive",
      })
      return "Mi dispiace, si è verificato un errore. Puoi riprovare?"
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    context,
    updateContext,
    messages,
    sendMessage,
    isGenerating,
  }
}
