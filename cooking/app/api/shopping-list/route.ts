import { NextResponse } from "next/server"

// Simulazione di un database per la lista della spesa
let shoppingItems = [
  { id: 1, name: "Pomodori", quantity: "500g", calories: 90, checked: false, fromRecipe: "Pasta al Pomodoro" },
  { id: 2, name: "Mozzarella", quantity: "250g", calories: 280, checked: false, fromRecipe: "Pizza Margherita" },
  { id: 3, name: "Pasta", quantity: "500g", calories: 1750, checked: false },
]

export async function GET(request: Request) {
  // Estrai i parametri di query dall'URL
  const { searchParams } = new URL(request.url)
  const fromRecipe = searchParams.get("fromRecipe")
  const checked = searchParams.get("checked")

  let filteredItems = [...shoppingItems]

  // Filtra per ricetta
  if (fromRecipe === "true") {
    filteredItems = filteredItems.filter((item) => item.fromRecipe)
  } else if (fromRecipe === "false") {
    filteredItems = filteredItems.filter((item) => !item.fromRecipe)
  }

  // Filtra per stato (selezionato/non selezionato)
  if (checked === "true") {
    filteredItems = filteredItems.filter((item) => item.checked)
  } else if (checked === "false") {
    filteredItems = filteredItems.filter((item) => !item.checked)
  }

  return NextResponse.json(filteredItems)
}

export async function POST(request: Request) {
  try {
    const item = await request.json()

    // Validazione dei dati
    if (!item.name) {
      return NextResponse.json({ error: "Nome del prodotto obbligatorio" }, { status: 400 })
    }

    // Genera un nuovo ID
    const newId = shoppingItems.length > 0 ? Math.max(...shoppingItems.map((i) => i.id)) + 1 : 1

    // Crea il nuovo elemento
    const newItem = {
      id: newId,
      name: item.name,
      quantity: item.quantity || "1",
      calories: item.calories || 0,
      checked: false,
      fromRecipe: item.fromRecipe || null,
    }

    // Aggiungi al database
    shoppingItems.push(newItem)

    return NextResponse.json(newItem, { status: 201 })
  } catch (error) {
    console.error("Errore durante l'aggiunta dell'elemento alla lista della spesa:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, checked } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID non specificato" }, { status: 400 })
    }

    // Trova l'elemento da aggiornare
    const itemIndex = shoppingItems.findIndex((item) => item.id === id)

    if (itemIndex === -1) {
      return NextResponse.json({ error: "Elemento non trovato" }, { status: 404 })
    }

    // Aggiorna lo stato dell'elemento
    shoppingItems[itemIndex] = {
      ...shoppingItems[itemIndex],
      checked: checked !== undefined ? checked : shoppingItems[itemIndex].checked,
    }

    return NextResponse.json(shoppingItems[itemIndex])
  } catch (error) {
    console.error("Errore durante l'aggiornamento dell'elemento nella lista della spesa:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const moveToDispensa = searchParams.get("moveToDispensa")

    if (!id) {
      return NextResponse.json({ error: "ID non specificato" }, { status: 400 })
    }

    const idNumber = Number.parseInt(id)

    // Se moveToDispensa è true, sposta l'elemento alla dispensa prima di rimuoverlo
    if (moveToDispensa === "true") {
      // Qui implementeremmo la logica per spostare l'elemento alla dispensa
      // In un'app reale, chiameremmo l'API della dispensa
      console.log(`Elemento ${idNumber} spostato alla dispensa`)
    }

    const initialLength = shoppingItems.length

    // Rimuovi l'elemento dal database
    shoppingItems = shoppingItems.filter((item) => item.id !== idNumber)

    if (shoppingItems.length === initialLength) {
      return NextResponse.json({ error: "Elemento non trovato" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'elemento dalla lista della spesa:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

