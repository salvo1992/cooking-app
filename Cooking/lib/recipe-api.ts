import axios from "axios"

// Utilizziamo l'API di Spoonacular come esempio
// In un'implementazione reale, dovresti registrarti per ottenere una chiave API
const API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY || "demo-key"
const BASE_URL = "https://api.spoonacular.com"

export interface SpoonacularRecipe {
  id: number
  title: string
  image: string
  readyInMinutes: number
  servings: number
  sourceUrl: string
  summary: string
  instructions: string
  extendedIngredients: {
    id: number
    name: string
    amount: number
    unit: string
    original: string
  }[]
}

export const recipeApiService = {
  // Cerca ricette per query
  searchRecipes: async (query: string, cuisine?: string, diet?: string, intolerances?: string) => {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEY,
        query,
        number: "10",
      })

      if (cuisine) params.append("cuisine", cuisine)
      if (diet) params.append("diet", diet)
      if (intolerances) params.append("intolerances", intolerances)

      const response = await axios.get(`${BASE_URL}/recipes/complexSearch?${params.toString()}`)
      return response.data.results
    } catch (error) {
      console.error("Errore durante la ricerca delle ricette:", error)
      throw error
    }
  },

  // Ottieni informazioni dettagliate su una ricetta
  getRecipeInformation: async (id: number) => {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEY,
        includeNutrition: "false",
      })

      const response = await axios.get(`${BASE_URL}/recipes/${id}/information?${params.toString()}`)
      return response.data as SpoonacularRecipe
    } catch (error) {
      console.error("Errore durante il recupero delle informazioni sulla ricetta:", error)
      throw error
    }
  },

  // Ottieni ricette casuali
  getRandomRecipes: async (tags?: string, number = 10) => {
    try {
      const params = new URLSearchParams({
        apiKey: API_KEY,
        number: number.toString(),
      })

      if (tags) params.append("tags", tags)

      const response = await axios.get(`${BASE_URL}/recipes/random?${params.toString()}`)
      return response.data.recipes
    } catch (error) {
      console.error("Errore durante il recupero delle ricette casuali:", error)
      throw error
    }
  },

  // Converti una ricetta da API esterna al formato dell'app
  convertToAppRecipe: (recipe: SpoonacularRecipe) => {
    return {
      title: recipe.title,
      description: recipe.summary.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
      image: recipe.image || "/placeholder.svg?height=300&width=400",
      time: `${recipe.readyInMinutes} min`,
      difficulty: recipe.readyInMinutes < 30 ? "Facile" : recipe.readyInMinutes < 60 ? "Media" : "Difficile",
      ingredients: recipe.extendedIngredients.map((ing) => ({
        name: ing.name,
        quantity: `${ing.amount} ${ing.unit}`,
      })),
      steps: recipe.instructions
        ? recipe.instructions
            .replace(/<[^>]*>/g, "")
            .split(".")
            .filter((step) => step.trim().length > 0)
            .map((step) => step.trim() + ".")
        : ["Istruzioni non disponibili."],
      notes: `Ricetta importata da API esterna. Porzioni: ${recipe.servings}`,
      favorite: false,
      personal: false,
    }
  },
}

