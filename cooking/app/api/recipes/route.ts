import { NextResponse } from "next/server"

// Simulazione di un database di ricette
const recipes = [
  {
    id: 1,
    title: "Pasta alla Carbonara",
    description: "La classica pasta alla carbonara romana con uova, guanciale, pecorino e pepe nero.",
    image: "/placeholder.svg?height=300&width=400",
    time: "30 min",
    difficulty: "Media",
    ingredients: [
      { name: "Pasta", quantity: "320g" },
      { name: "Guanciale", quantity: "150g" },
      { name: "Uova", quantity: "4" },
      { name: "Pecorino Romano", quantity: "100g" },
      { name: "Pepe nero", quantity: "q.b." },
      { name: "Sale", quantity: "q.b." },
    ],
    steps: [
      "Tagliare il guanciale a listarelle e rosolarlo in padella a fuoco medio-basso fino a renderlo croccante.",
      "In una ciotola, sbattere le uova con il pecorino grattugiato e il pepe nero.",
      "Cuocere la pasta in abbondante acqua salata.",
      "Scolare la pasta al dente e versarla nella padella con il guanciale, mescolando bene.",
      "Togliere la padella dal fuoco e aggiungere il composto di uova e formaggio, mescolando velocemente.",
      "Servire immediatamente con una spolverata di pecorino e pepe nero.",
    ],
    favorite: true,
    personal: false,
  },
  {
    id: 2,
    title: "Risotto ai Funghi",
    description: "Cremoso risotto con funghi porcini, cipolla, vino bianco e parmigiano.",
    image: "/placeholder.svg?height=300&width=400",
    time: "45 min",
    difficulty: "Media",
    ingredients: [
      { name: "Riso Carnaroli", quantity: "320g" },
      { name: "Funghi porcini", quantity: "200g" },
      { name: "Cipolla", quantity: "1" },
      { name: "Vino bianco", quantity: "100ml" },
      { name: "Brodo vegetale", quantity: "1L" },
      { name: "Parmigiano Reggiano", quantity: "80g" },
      { name: "Burro", quantity: "50g" },
      { name: "Olio d'oliva", quantity: "2 cucchiai" },
      { name: "Sale", quantity: "q.b." },
      { name: "Pepe", quantity: "q.b." },
      { name: "Prezzemolo", quantity: "q.b." },
    ],
    steps: [
      "Preparare il brodo vegetale e tenerlo caldo.",
      "Tritare finemente la cipolla e farla appassire in una casseruola con un po' di olio.",
      "Pulire i funghi, tagliarli a fettine e aggiungerli alla cipolla. Cuocere per qualche minuto.",
      "Aggiungere il riso e tostarlo per un paio di minuti, mescolando continuamente.",
      "Sfumare con il vino bianco e lasciare evaporare.",
      "Aggiungere il brodo caldo un mestolo alla volta, aspettando che venga assorbito prima di aggiungerne altro.",
      "Continuare fino a cottura del riso (circa 18 minuti).",
      "A fuoco spento, mantecare con burro e parmigiano. Aggiustare di sale e pepe.",
      "Servire con una spolverata di prezzemolo fresco tritato.",
    ],
    favorite: false,
    personal: false,
  },
]

export async function GET(request: Request) {
  // Estrai i parametri di query dall'URL
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const favorite = searchParams.get("favorite")
  const personal = searchParams.get("personal")

  let filteredRecipes = [...recipes]

  // Filtra per query di ricerca
  if (query) {
    filteredRecipes = filteredRecipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(query.toLowerCase()) ||
        recipe.description.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Filtra per preferiti
  if (favorite === "true") {
    filteredRecipes = filteredRecipes.filter((recipe) => recipe.favorite)
  }

  // Filtra per ricette personali
  if (personal === "true") {
    filteredRecipes = filteredRecipes.filter((recipe) => recipe.personal)
  }

  return NextResponse.json(filteredRecipes)
}

export async function POST(request: Request) {
  try {
    const recipe = await request.json()

    // Validazione dei dati
    if (!recipe.title || !recipe.description) {
      return NextResponse.json({ error: "Titolo e descrizione sono obbligatori" }, { status: 400 })
    }

    // Genera un nuovo ID
    const newId = recipes.length > 0 ? Math.max(...recipes.map((r) => r.id)) + 1 : 1

    // Crea la nuova ricetta
    const newRecipe = {
      id: newId,
      ...recipe,
      favorite: false,
      personal: true,
    }

    // Aggiungi al database
    recipes.push(newRecipe)

    return NextResponse.json(newRecipe, { status: 201 })
  } catch (error) {
    console.error("Errore durante la creazione della ricetta:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

