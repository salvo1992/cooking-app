import { NextResponse } from "next/server"

// Simulazione di un database per le note
let notes = [
  {
    id: 1,
    title: "Alimenti ricchi di proteine",
    content: "- Pollo\n- Pesce\n- Uova\n- Legumi\n- Tofu\n- Yogurt greco\n- Quinoa",
    date: "2024-03-10T14:30:00",
  },
  {
    id: 2,
    title: "Idee per colazione sana",
    content:
      "1. Porridge con frutta e frutta secca\n2. Yogurt greco con miele e noci\n3. Toast integrale con avocado e uova\n4. Frullato proteico con banana e spinaci",
    date: "2024-03-15T09:15:00",
  },
]

export async function GET() {
  return NextResponse.json(notes)
}

export async function POST(request: Request) {
  try {
    const note = await request.json()

    // Validazione dei dati
    if (!note.title || !note.content) {
      return NextResponse.json({ error: "Titolo e contenuto sono obbligatori" }, { status: 400 })
    }

    // Genera un nuovo ID
    const newId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1

    // Crea la nuova nota
    const newNote = {
      id: newId,
      title: note.title,
      content: note.content,
      date: new Date().toISOString(),
    }

    // Aggiungi al database
    notes.push(newNote)

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Errore durante la creazione della nota:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const note = await request.json()

    // Validazione dei dati
    if (!note.id || !note.title || !note.content) {
      return NextResponse.json({ error: "ID, titolo e contenuto sono obbligatori" }, { status: 400 })
    }

    // Trova la nota da aggiornare
    const noteIndex = notes.findIndex((n) => n.id === note.id)

    if (noteIndex === -1) {
      return NextResponse.json({ error: "Nota non trovata" }, { status: 404 })
    }

    // Aggiorna la nota
    notes[noteIndex] = {
      ...notes[noteIndex],
      title: note.title,
      content: note.content,
      date: new Date().toISOString(),
    }

    return NextResponse.json(notes[noteIndex])
  } catch (error) {
    console.error("Errore durante l'aggiornamento della nota:", error)
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
    const initialLength = notes.length

    // Rimuovi la nota dal database
    notes = notes.filter((note) => note.id !== idNumber)

    if (notes.length === initialLength) {
      return NextResponse.json({ error: "Nota non trovata" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Errore durante l'eliminazione della nota:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

