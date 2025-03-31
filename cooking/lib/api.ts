import axios from "axios"

// Configurazione di base per axios
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Funzione per ottenere il token JWT dal localStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token")
  }
  return null
}

// Configurazione di axios con intercettori per aggiungere il token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Aggiungi il token a ogni richiesta
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Tipi di dati
export interface User {
  id: string
  name: string
  email: string
  preferences?: {
    notifications: boolean
    expiryAlerts: boolean
    recipeSuggestions: boolean
  }
}

export interface AuthResponse {
  token: string
  user: User
}

export interface Recipe {
  _id?: string
  id?: string
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

export interface ShoppingItem {
  _id?: string
  id?: string
  name: string
  quantity: string
  checked: boolean
  fromRecipe?: string
}

export interface PantryItem {
  _id?: string
  id?: string
  name: string
  quantity: string
  category: string
  expiryDate: string
  isExpired: boolean
  isExpiringSoon: boolean
}

export interface Note {
  _id?: string
  id?: string
  title: string
  content: string
  category?: string
  createdAt?: string
}

export interface DietPlanUserData {
  age: number
  gender: string
  weight: number
  height: number
  activityLevel: string
  goal: string
  preferences: string[]
  restrictions: string[]
}

export interface DietPlanResults {
  bmi: number
  bmiCategory: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DietPlanMeal {
  type: string
  name: string
  ingredients: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

export interface DietPlanDay {
  day: number
  meals: DietPlanMeal[]
}

export interface DietPlan {
  _id?: string
  id?: string
  name: string
  userData: DietPlanUserData
  results: DietPlanResults
  mealPlan: DietPlanDay[]
  tips: string[]
  createdAt?: string
}

// API per l'autenticazione
export const authApi = {
  register: async  (name: string, email: string, password: string): Promise<AuthResponse> => {
    console.log("Sto inviando:", { name, email, password }); // aggiungi questa linea
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, { name, email, password })
      return response.data
    } catch (error) {
      console.error("Errore durante la registrazione:", error)
      throw error
    }
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, { email, password })
      return response.data
    } catch (error) {
      console.error("Errore durante il login:", error)
      throw error
    }
  },

  logout: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window !== "undefined") {
      const userJson = localStorage.getItem("user")
      return userJson ? JSON.parse(userJson) : null
    }
    return null
  },

  isAuthenticated: (): boolean => {
    return !!getToken()
  },
}

// API per il profilo utente
export const userApi = {
  getProfile: async (): Promise<User> => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`)
      return response.data
    } catch (error) {
      console.error("Errore durante il recupero del profilo:", error)
      throw error
    }
  },

  updateProfile: async (name: string, email: string, preferences?: any): Promise<User> => {
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, { name, email, preferences })
      return response.data
    } catch (error) {
      console.error("Errore durante l'aggiornamento del profilo:", error)
      throw error
    }
  },

  updatePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      await api.put(`${process.env.NEXT_PUBLIC_API_URL}/api/user/password`, { currentPassword, newPassword })
    } catch (error) {
      console.error("Errore durante l'aggiornamento della password:", error)
      throw error
    }
  },
}

// API per le ricette
export const recipeApi = {
  getAll: async (query?: string, favorite?: boolean, personal?: boolean): Promise<Recipe[]> => {
    try {
      const params: any = {}
      if (query) params.query = query
      if (favorite !== undefined) params.favorite = favorite.toString()
      if (personal !== undefined) params.personal = personal.toString()

      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes`, { params })
      return response.data.map((recipe: any) => ({
        ...recipe,
        id: recipe._id,
      }))
    } catch (error) {
      console.error("Errore durante il recupero delle ricette:", error)
      throw error
    }
  },

  getById: async (id: string): Promise<Recipe> => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}`)
      return {
        ...response.data,
        id: response.data._id,
      }
    } catch (error) {
      console.error("Errore durante il recupero della ricetta:", error)
      throw error
    }
  },

  add: async (recipe: Omit<Recipe, "_id" | "id">): Promise<Recipe> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes`, recipe)
      return {
        ...response.data,
        id: response.data._id,
      }
    } catch (error) {
      console.error("Errore durante l'aggiunta della ricetta:", error)
      throw error
    }
  },

  update: async (id: string, recipe: Partial<Recipe>): Promise<Recipe> => {
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}`, recipe)
      return {
        ...response.data,
        id: response.data._id,
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento della ricetta:", error)
      throw error
    }
  },

  toggleFavorite: async (id: string): Promise<Recipe> => {
    try {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}/favorite`)
      return {
        ...response.data,
        id: response.data._id,
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dei preferiti:", error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/recipes/${id}`)
    } catch (error) {
      console.error("Errore durante l'eliminazione della ricetta:", error)
      throw error
    }
  },
}

// API per la lista della spesa
export const shoppingListApi = {
  getAll: async (fromRecipe?: boolean, checked?: boolean): Promise<ShoppingItem[]> => {
    try {
      const params: any = {}
      if (fromRecipe !== undefined) params.fromRecipe = fromRecipe.toString()
      if (checked !== undefined) params.checked = checked.toString()

      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list`, { params })
      return response.data.map((item: any) => ({
        ...item,
        id: item._id,
      }))
    } catch (error) {
      console.error("Errore durante il recupero della lista della spesa:", error)
      throw error
    }
  },

  add: async (item: Omit<ShoppingItem, "_id" | "id">): Promise<ShoppingItem> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list`, item)
      return {
        ...response.data,
        id: response.data._id,
      }
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'elemento alla lista della spesa:", error)
      throw error
    }
  },

  addMany: async (items: Ingredient[], fromRecipe?: string): Promise<ShoppingItem[]> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list/batch`, { items, fromRecipe })
      return response.data.map((item: any) => ({
        ...item,
        id: item._id,
      }))
    } catch (error) {
      console.error("Errore durante l'aggiunta degli elementi alla lista della spesa:", error)
      throw error
    }
  },

  update: async (id: string, checked: boolean): Promise<ShoppingItem> => {
    try {
      const response = await api.patch(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list/${id}`, { checked })
      return {
        ...response.data,
        id: response.data._id,
      }
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'elemento della lista della spesa:", error)
      throw error
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list/${id}`)
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'elemento della lista della spesa:", error)
      throw error
    }
  },

  deleteChecked: async (): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list`, { params: { checked: "true" } })
    } catch (error) {
      console.error("Errore durante l'eliminazione degli elementi selezionati:", error)
      throw error
    }
  },

  deleteAll: async (): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/shopping-list`)
    } catch (error) {
      console.error("Errore durante l'eliminazione di tutti gli elementi:", error)
      throw error
    }
  },
}

// API per la dispensa
export const pantryApi = {
  getAll: async (category?: string, expired?: boolean, expiringSoon?: boolean): Promise<PantryItem[]> => {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (expired !== undefined) params.expired = expired.toString();
      if (expiringSoon !== undefined) params.expiringSoon = expiringSoon.toString();

      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/pantry`, { params });
      return response.data.map((item: any) => ({
        ...item,
        id: item._id,
      }));
    } catch (error) {
      console.error("Errore durante il recupero della dispensa:", error);
      throw error;
    }
  },

  add: async (item: Omit<PantryItem, "_id" | "id">): Promise<PantryItem> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/pantry`, item);
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Errore durante l'aggiunta dell'elemento alla dispensa:", error);
      throw error;
    }
  },

  update: async (id: string, item: Partial<PantryItem>): Promise<PantryItem> => {
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/api/pantry/${id}`, item);
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Errore durante l'aggiornamento dell'elemento della dispensa:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/pantry/${id}`);
    } catch (error) {
      console.error("Errore durante l'eliminazione dell'elemento della dispensa:", error);
      throw error;
    }
  },
};


// API per le note
export const noteApi = {
  getAll: async (category?: string, query?: string): Promise<Note[]> => {
    try {
      const params: any = {};
      if (category) params.category = category;
      if (query) params.query = query;

      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, { params });
      return response.data.map((note: any) => ({
        ...note,
        id: note._id, // per compatibilità con frontend
      }));
    } catch (error) {
      console.error("Errore durante il recupero delle note:", error);
      throw error;
    }
  },

  add: async (note: Omit<Note, "_id" | "id" | "createdAt">): Promise<Note> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/notes`, note);
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Errore durante l'aggiunta della nota:", error);
      throw error;
    }
  },

  update: async (id: string, note: Partial<Note>): Promise<Note> => {
    try {
      const response = await api.put(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${id}`, note);
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Errore durante l'aggiornamento della nota:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/notes/${id}`);
    } catch (error) {
      console.error("Errore durante l'eliminazione della nota:", error);
      throw error;
    }
  },
};


// API per i piani dietetici
export const dietApi = {
  getAll: async (): Promise<DietPlan[]> => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/diet-plans`);
      return response.data.map((plan: any) => ({
        ...plan,
        id: plan._id, // Mantieni compatibilità con id
      }));
    } catch (error) {
      console.error("Errore durante il recupero dei piani dietetici:", error);
      throw error;
    }
  },

  getById: async (id: string): Promise<DietPlan> => {
    try {
      const response = await api.get(`${process.env.NEXT_PUBLIC_API_URL}/api/diet-plans/${id}`);
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Errore durante il recupero del piano dietetico:", error);
      throw error;
    }
  },

  add: async (plan: Omit<DietPlan, "_id" | "id" | "createdAt">): Promise<DietPlan> => {
    try {
      const response = await api.post(`${process.env.NEXT_PUBLIC_API_URL}/api/diet-plans`, plan);
      return {
        ...response.data,
        id: response.data._id,
      };
    } catch (error) {
      console.error("Errore durante l'aggiunta del piano dietetico:", error);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/diet-plans/${id}`);
    } catch (error) {
      console.error("Errore durante l'eliminazione del piano dietetico:", error);
      throw error;
    }
  },
};


export default api

