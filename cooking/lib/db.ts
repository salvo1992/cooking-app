// Questo file simula un database utilizzando localStorage
// In un'applicazione reale, qui ci sarebbe la connessione a un database vero

// Funzione per ottenere dati dal localStorage
export function getData<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue

  const savedData = localStorage.getItem(key)
  if (savedData) {
    try {
      return JSON.parse(savedData) as T
    } catch (error) {
      console.error(`Errore nel parsing dei dati per ${key}:`, error)
      return defaultValue
    }
  }
  return defaultValue
}

// Funzione per salvare dati nel localStorage
export function saveData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Errore nel salvataggio dei dati per ${key}:`, error)
  }
}

// Funzione per generare un ID univoco
export function generateId(items: any[]): number {
  return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1
}

// Funzione per aggiornare un elemento in un array
export function updateItem<T extends { id: number }>(items: T[], updatedItem: T): T[] {
  return items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
}

// Funzione per eliminare un elemento da un array
export function deleteItem<T extends { id: number }>(items: T[], id: number): T[] {
  return items.filter((item) => item.id !== id)
}

// Funzione per aggiungere un elemento a un array
export function addItem<T extends { id: number }>(items: T[], newItem: Omit<T, "id"> & { id?: number }): T[] {
  const id = newItem.id || generateId(items)
  return [...items, { ...newItem, id } as T]
}

