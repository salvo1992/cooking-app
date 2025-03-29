// Tipi di dati
export interface Recipe {
  id: number
  title: string
  description: string
  image: string
  time: string
  difficulty: string
  ingredients: Ingredient[]
  steps: string[]
  notes?: string
  favorite: boolean
  personal: boolean
}

export interface Ingredient {
  name: string
  quantity: string
  selected?: boolean
}

export interface ShoppingListItem {
  id: number
  name: string
  quantity: string
  checked: boolean
  recipe?: string
}

export interface PantryItem {
  id: number
  name: string
  quantity: string
  expirationDate: string
  category: string
}

export interface Note {
  id: number
  title: string
  content: string
  date: string
  category?: string
}

export interface DietPlan {
  id: number
  name: string
  date: string
  userData: {
    age: number
    gender: string
    weight: number
    height: number
    activityLevel: string
    goal: string
    preferences: string[]
    restrictions: string[]
  }
  results: {
    bmi: number
    bmiCategory: string
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  mealPlan: {
    day: number
    meals: {
      type: string
      name: string
      ingredients: string[]
      calories: number
      protein: number
      carbs: number
      fat: number
    }[]
  }[]
  tips: string[]
}

// API per le ricette
export const recipeApi = {
  getAll: (): Recipe[] => {
    try {
      const recipes = localStorage.getItem("recipes")
      return recipes ? JSON.parse(recipes) : []
    } catch (error) {
      console.error("Errore durante il recupero delle ricette:", error)
      return []
    }
  },

  getById: (id: number): Recipe | null => {
    try {
      const recipes = recipeApi.getAll()
      return recipes.find((recipe) => recipe.id === id) || null
    } catch (error) {
      console.error("Errore durante il recupero della ricetta:", error)
      return null
    }
  },

  getBySlug: (slug: string): Recipe | null => {
    try {
      const recipes = recipeApi.getAll()
      return recipes.find((recipe) => recipe.title.toLowerCase().replace(/ /g, "-") === slug) || null
    } catch (error) {
      console.error("Errore durante il recupero della ricetta:", error)
      return null
    }
  },

  add: (recipe: Partial<Recipe>): Recipe => {
    try {
      const recipes = recipeApi.getAll()

      // Genera un nuovo ID
      const newId = recipes.length > 0 ? Math.max(...recipes.map((r) => r.id)) + 1 : 1

      // Crea la nuova ricetta
      const newRecipe: Recipe = {
        id: newId,
        title: recipe.title || "Nuova Ricetta",
        description: recipe.description || "",
        image: recipe.image || "/placeholder.svg?height=300&width=400",
        time: recipe.time || "N/A",
        difficulty: recipe.difficulty || "Media",
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        notes: recipe.notes || "",
        favorite: recipe.favorite || false,
        personal: recipe.personal !== undefined ? recipe.personal : true,
      }

      // Aggiungi la ricetta all'array e salva
      recipes.push(newRecipe)
      localStorage.setItem("recipes", JSON.stringify(recipes))

      return newRecipe
    } catch (error) {
      console.error("Errore durante l'aggiunta della ricetta:", error)
      throw error
    }
  },

  update: (id: number, updates: Partial<Recipe>): Recipe | null => {
    try {
      const recipes = recipeApi.getAll()
      const index = recipes.findIndex((recipe) => recipe.id === id)

      if (index === -1) return null

      // Aggiorna la ricetta
      recipes[index] = { ...recipes[index], ...updates }
      localStorage.setItem("recipes", JSON.stringify(recipes))

      return recipes[index]
    } catch (error) {
      console.error("Errore durante l'aggiornamento della ricetta:", error)
      return null
    }
  },

  delete: (id: number): boolean => {
    try {
      const recipes = recipeApi.getAll()
      const filteredRecipes = recipes.filter((recipe) => recipe.id !== id)

      if (filteredRecipes.length === recipes.length) return false

      localStorage.setItem("recipes", JSON.stringify(filteredRecipes))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione della ricetta:", error)
      return false
    }
  },

  toggleFavorite: (id: number): Recipe | null => {
    try {
      const recipe = recipeApi.getById(id)
      if (!recipe) return null

      return recipeApi.update(id, { favorite: !recipe.favorite })
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error)
      return null
    }
  },
}

// API per la lista della spesa
export const shoppingListApi = {
  getAll: (): ShoppingListItem[] => {
    try {
      const items = localStorage.getItem("shoppingList")
      return items ? JSON.parse(items) : []
    } catch (error) {
      console.error("Errore durante il recupero della lista della spesa:", error)
      return []
    }
  },

  add: (item: Omit<ShoppingListItem, "id">): ShoppingListItem => {
    try {
      const items = shoppingListApi.getAll()

      // Genera un nuovo ID
      const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1

      // Crea il nuovo elemento
      const newItem: ShoppingListItem = {
        id: newId,
        name: item.name,
        quantity: item.quantity,
        checked: item.checked || false,
        recipe: item.recipe,
      }

      // Aggiungi l'elemento all'array e salva
      items.push(newItem)
      localStorage.setItem("shoppingList", JSON.stringify(items))

      return newItem
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'elemento alla lista della spesa:", error)
      throw error
    }
  },

  addMany: (ingredients: Ingredient[], recipeName?: string): ShoppingListItem[] => {
    try {
      const items = shoppingListApi.getAll()
      const newItems: ShoppingListItem[] = []

      // Genera un nuovo ID di partenza
      let nextId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1

      // Crea i nuovi elementi
      for (const ingredient of ingredients) {
        const newItem: ShoppingListItem = {
          id: nextId++,
          name: ingredient.name,
          quantity: ingredient.quantity,
          checked: false,
          recipe: recipeName,
        }

        newItems.push(newItem)
      }

      // Aggiungi gli elementi all'array e salva
      const updatedItems = [...items, ...newItems]
      localStorage.setItem("shoppingList", JSON.stringify(updatedItems))

      return newItems
    } catch (error) {
      console.error("Errore durante l'aggiunta degli ingredienti alla lista della spesa:", error)
      throw error
    }
  },

  update: (id: number, updates: Partial<ShoppingListItem>): ShoppingListItem | null => {
    try {
      const items = shoppingListApi.getAll()
      const index = items.findIndex((item) => item.id === id)

      if (index === -1) return null

      // Aggiorna l'elemento
      items[index] = { ...items[index], ...updates }
      localStorage.setItem("shoppingList", JSON.stringify(items))

      return items[index]
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'elemento della lista della spesa:", error)
      return null
    }
  },

  delete: (id: number): boolean => {
    try {
      const items = shoppingListApi.getAll()
      const filteredItems = items.filter((item) => item.id !== id)

      if (filteredItems.length === items.length) return false

      localStorage.setItem("shoppingList", JSON.stringify(filteredItems))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'elemento della lista della spesa:", error)
      return false
    }
  },

  deleteChecked: (): boolean => {
    try {
      const items = shoppingListApi.getAll()
      const filteredItems = items.filter((item) => !item.checked)

      if (filteredItems.length === items.length) return false

      localStorage.setItem("shoppingList", JSON.stringify(filteredItems))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione degli elementi selezionati:", error)
      return false
    }
  },

  deleteAll: (): boolean => {
    try {
      localStorage.setItem("shoppingList", JSON.stringify([]))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione di tutti gli elementi:", error)
      return false
    }
  },
}

// API per la dispensa
export const pantryApi = {
  getAll: (): PantryItem[] => {
    try {
      const items = localStorage.getItem("pantry")
      return items ? JSON.parse(items) : []
    } catch (error) {
      console.error("Errore durante il recupero della dispensa:", error)
      return []
    }
  },

  add: (item: Omit<PantryItem, "id">): PantryItem => {
    try {
      const items = pantryApi.getAll()

      // Genera un nuovo ID
      const newId = items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1

      // Crea il nuovo elemento
      const newItem: PantryItem = {
        id: newId,
        name: item.name,
        quantity: item.quantity,
        expirationDate: item.expirationDate,
        category: item.category,
      }

      // Aggiungi l'elemento all'array e salva
      items.push(newItem)
      localStorage.setItem("pantry", JSON.stringify(items))

      return newItem
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'elemento alla dispensa:", error)
      throw error
    }
  },

  update: (id: number, updates: Partial<PantryItem>): PantryItem | null => {
    try {
      const items = pantryApi.getAll()
      const index = items.findIndex((item) => item.id === id)

      if (index === -1) return null

      // Aggiorna l'elemento
      items[index] = { ...items[index], ...updates }
      localStorage.setItem("pantry", JSON.stringify(items))

      return items[index]
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'elemento della dispensa:", error)
      return null
    }
  },

  delete: (id: number): boolean => {
    try {
      const items = pantryApi.getAll()
      const filteredItems = items.filter((item) => item.id !== id)

      if (filteredItems.length === items.length) return false

      localStorage.setItem("pantry", JSON.stringify(filteredItems))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'elemento della dispensa:", error)
      return false
    }
  },
}

// API per le note
export const noteApi = {
  getAll: (): Note[] => {
    try {
      const notes = localStorage.getItem("notes")
      return notes ? JSON.parse(notes) : []
    } catch (error) {
      console.error("Errore durante il recupero delle note:", error)
      return []
    }
  },

  getById: (id: number): Note | null => {
    try {
      const notes = noteApi.getAll()
      return notes.find((note) => note.id === id) || null
    } catch (error) {
      console.error("Errore durante il recupero della nota:", error)
      return null
    }
  },

  add: (note: Omit<Note, "id">): Note => {
    try {
      const notes = noteApi.getAll()

      // Genera un nuovo ID
      const newId = notes.length > 0 ? Math.max(...notes.map((note) => note.id)) + 1 : 1

      // Crea la nuova nota
      const newNote: Note = {
        id: newId,
        title: note.title,
        content: note.content,
        date: note.date,
        category: note.category,
      }

      // Aggiungi la nota all'array e salva
      notes.push(newNote)
      localStorage.setItem("notes", JSON.stringify(notes))

      return newNote
    } catch (error) {
      console.error("Errore durante l'aggiunta della nota:", error)
      throw error
    }
  },

  update: (id: number, updates: Partial<Note>): Note | null => {
    try {
      const notes = noteApi.getAll()
      const index = notes.findIndex((note) => note.id === id)

      if (index === -1) return null

      // Aggiorna la nota
      notes[index] = { ...notes[index], ...updates }
      localStorage.setItem("notes", JSON.stringify(notes))

      return notes[index]
    } catch (error) {
      console.error("Errore durante l'aggiornamento della nota:", error)
      return null
    }
  },

  delete: (id: number): boolean => {
    try {
      const notes = noteApi.getAll()
      const filteredNotes = notes.filter((note) => note.id !== id)

      if (filteredNotes.length === notes.length) return false

      localStorage.setItem("notes", JSON.stringify(filteredNotes))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione della nota:", error)
      return false
    }
  },
}

// API per i piani dietetici
export const dietApi = {
  getAll: (): DietPlan[] => {
    try {
      const plans = localStorage.getItem("dietPlans")
      return plans ? JSON.parse(plans) : []
    } catch (error) {
      console.error("Errore durante il recupero dei piani dietetici:", error)
      return []
    }
  },

  getById: (id: number): DietPlan | null => {
    try {
      const plans = dietApi.getAll()
      return plans.find((plan) => plan.id === id) || null
    } catch (error) {
      console.error("Errore durante il recupero del piano dietetico:", error)
      return null
    }
  },

  add: (plan: Omit<DietPlan, "id">): DietPlan => {
    try {
      const plans = dietApi.getAll()

      // Genera un nuovo ID
      const newId = plans.length > 0 ? Math.max(...plans.map((plan) => plan.id)) + 1 : 1

      // Crea il nuovo piano
      const newPlan: DietPlan = {
        id: newId,
        name: plan.name,
        date: plan.date,
        userData: plan.userData,
        results: plan.results,
        mealPlan: plan.mealPlan,
        tips: plan.tips,
      }

      // Aggiungi il piano all'array e salva
      plans.push(newPlan)
      localStorage.setItem("dietPlans", JSON.stringify(plans))

      return newPlan
    } catch (error) {
      console.error("Errore durante l'aggiunta del piano dietetico:", error)
      throw error
    }
  },

  update: (id: number, updates: Partial<DietPlan>): DietPlan | null => {
    try {
      const plans = dietApi.getAll()
      const index = plans.findIndex((plan) => plan.id === id)

      if (index === -1) return null

      // Aggiorna il piano
      plans[index] = { ...plans[index], ...updates }
      localStorage.setItem("dietPlans", JSON.stringify(plans))

      return plans[index]
    } catch (error) {
      console.error("Errore durante l'aggiornamento del piano dietetico:", error)
      return null
    }
  },

  delete: (id: number): boolean => {
    try {
      const plans = dietApi.getAll()
      const filteredPlans = plans.filter((plan) => plan.id !== id)

      if (filteredPlans.length === plans.length) return false

      localStorage.setItem("dietPlans", JSON.stringify(filteredPlans))
      return true
    } catch (error) {
      console.error("Errore durante l'eliminazione del piano dietetico:", error)
      return false
    }
  },
}

