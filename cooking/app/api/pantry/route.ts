import { NextResponse } from "next/server"

// Simulazione di un database per la dispensa
let pantryItems = [
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
]

export async function GET(request: Request) {
  // Estrai i parametri di query dall'URL
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("category")
  const expired = searchParams.get("expired")
  const expiringSoon = searchParams.get("expiringSoon")

  let filteredItems = [...pantryItems]

  // Filtra per categoria
  if (category) {
    filteredItems = filteredItems.filter((item) => item.category.toLowerCase() === category.toLowerCase())
  }

  // Filtra per scaduti
  if (expired === "true") {
    filteredItems = filteredItems.filter((item) => item.isExpired)
  }

  // Filtra per in scadenza
  if (expiringSoon === "true") {
    filteredItems = filteredItems.filter((item) => item.isExpiringSoon)
  }

  return NextResponse.json(filteredItems)
}

export async function POST(request: Request) {
  try {
    const item = await request.json()

    // Validazione dei dati
    if (!item.name || !item.category || !item.expiryDate) {
      return NextResponse.json({ error: "Nome, categoria e data di scadenza sono obbligatori" }, { status: 400 })
    }

    // Genera un nuovo ID
    const newId = pantryItems.length > 0 ? Math.max(...pantryItems.map((i) => i.id)) + 1 : 1

    // Calcola se il prodotto è scaduto o sta per scadere
    const expiryDate = new Date(item.expiryDate)
    const today = new Date()
    const isExpired = expiryDate < today

    // Considera "in scadenza" se mancano meno di 7 giorni
    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)
    const isExpiringSoon = !isExpired && expiryDate < sevenDaysFromNow

    // Crea il nuovo elemento
    const newItem = {
      id: newId,
      ...item,
      expiryDate: expiryDate.toISOString(),
      isExpired,
      isExpiringSoon,
    }

    // Aggiungi al database
    pantryItems.push(newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Errore durante l'aggiunta dell'elemento alla dispensa:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID non specificato" }, { status: 400 })
    }

    const idNumber = Number.parseInt(id)
    const initialLength = pantryItems.length

    // Rimuovi l'elemento dal database
    pantryItems = pantryItems.filter((item) => item.id !== idNumber)

    if (pantryItems.length === initialLength) {
      return NextResponse.json({ error: "Elemento non trovato" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'elemento dalla dispensa:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

