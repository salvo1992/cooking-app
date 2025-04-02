"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calculator, ChevronDown, ChevronUp, FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { dietApi, type DietPlan } from "@/lib/api"
import { jsPDF } from "jspdf"

// Tipi di dati
interface UserData {
  age: number
  gender: string
  weight: number
  height: number
  activityLevel: string
  goal: string
  preferences: string[]
  restrictions: string[]
}

interface Results {
  bmi: number
  bmiCategory: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Meal {
  type: string
  name: string
  ingredients: string[]
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface DayPlan {
  day: number
  meals: Meal[]
}

export default function DietPage() {
  const router = useRouter()

  // Stato per i dati dell'utente
  const [userData, setUserData] = useState<UserData>({
    age: 30,
    gender: "male",
    weight: 70,
    height: 170,
    activityLevel: "moderate",
    goal: "maintain",
    preferences: [],
    restrictions: [],
  })

  // Stato per i risultati del calcolo
  const [results, setResults] = useState<Results | null>(null)

  // Stato per il piano alimentare
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([])

  // Stato per i consigli
  const [tips, setTips] = useState<string[]>([])

  // Stato per il caricamento
  const [loading, setLoading] = useState(false)

  // Stato per la visualizzazione dei dettagli del giorno
  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  // Stato per i piani dietetici salvati
  const [savedPlans, setSavedPlans] = useState<DietPlan[]>([])

  // Stato per il piano selezionato
  const [selectedPlan, setSelectedPlan] = useState<DietPlan | null>(null)

  // Carica i piani dietetici salvati
  useEffect(() => {
    const loadedPlans = Array.isArray(dietApi.getAll()) ? dietApi.getAll() : []

    setSavedPlans(loadedPlans)

    // Se c'è almeno un piano, seleziona il più recente
    if (loadedPlans.length > 0) {
      const mostRecent = loadedPlans.reduce((prev, current) => {
        return new Date(prev.date) > new Date(current.date) ? prev : current
      })
      setSelectedPlan(mostRecent)

      // Imposta i dati del piano selezionato
      setUserData(mostRecent.userData)
      setResults(mostRecent.results)
      setMealPlan(mostRecent.mealPlan)
      setTips(mostRecent.tips)
    }
  }, [])

  // Opzioni per le preferenze alimentari
  const foodPreferences = [
    { id: "vegetarian", label: "Vegetariano" },
    { id: "vegan", label: "Vegano" },
    { id: "pescatarian", label: "Pescetariano" },
    { id: "mediterranean", label: "Mediterraneo" },
    { id: "lowCarb", label: "Basso contenuto di carboidrati" },
    { id: "highProtein", label: "Alto contenuto proteico" },
  ]

  // Opzioni per le restrizioni alimentari
  const dietaryRestrictions = [
    { id: "gluten", label: "Senza glutine" },
    { id: "lactose", label: "Senza lattosio" },
    { id: "nuts", label: "Senza frutta secca" },
    { id: "eggs", label: "Senza uova" },
    { id: "soy", label: "Senza soia" },
    { id: "shellfish", label: "Senza crostacei" },
  ]

  // Gestione del cambio di input
  const handleInputChange = (field: keyof UserData, value: any) => {
    if (field === "age" || field === "weight" || field === "height") {
      // Assicurati che i valori numerici siano sempre validi
      const numValue = typeof value === "string" ? Number.parseFloat(value) : value
      // Se il valore non è un numero valido, usa il valore precedente
      if (isNaN(numValue)) return
      setUserData((prev) => ({ ...prev, [field]: numValue }))
    } else {
      setUserData((prev) => ({ ...prev, [field]: value }))
    }
  }

  // Gestione delle preferenze alimentari
  const handlePreferenceChange = (preference: string, checked: boolean) => {
    setUserData((prev) => {
      if (checked) {
        return { ...prev, preferences: [...prev.preferences, preference] }
      } else {
        return { ...prev, preferences: prev.preferences.filter((p) => p !== preference) }
      }
    })
  }

  // Gestione delle restrizioni alimentari
  const handleRestrictionChange = (restriction: string, checked: boolean) => {
    setUserData((prev) => {
      if (checked) {
        return { ...prev, restrictions: [...prev.restrictions, restriction] }
      } else {
        return { ...prev, restrictions: prev.restrictions.filter((r) => r !== restriction) }
      }
    })
  }

  // Calcolo del BMI
  const calculateBMI = (weight: number, height: number): number => {
    // Altezza in metri
    const heightInMeters = height / 100
    return Number.parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1))
  }

  // Determinazione della categoria BMI
  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Sottopeso"
    if (bmi < 25) return "Normopeso"
    if (bmi < 30) return "Sovrappeso"
    return "Obesità"
  }

  // Calcolo del fabbisogno calorico
  const calculateCalories = (userData: UserData): number => {
    const { age, gender, weight, height, activityLevel, goal } = userData

    // Formula di Harris-Benedict
    let bmr = 0
    if (gender === "male") {
      bmr = 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
    } else {
      bmr = 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
    }

    // Fattore di attività
    let activityFactor = 1.2 // sedentario
    if (activityLevel === "light") activityFactor = 1.375
    if (activityLevel === "moderate") activityFactor = 1.55
    if (activityLevel === "active") activityFactor = 1.725
    if (activityLevel === "veryActive") activityFactor = 1.9

    // Calcolo TDEE (Total Daily Energy Expenditure)
    let tdee = bmr * activityFactor

    // Aggiustamento in base all'obiettivo
    if (goal === "lose") tdee -= 500 // Deficit calorico per perdere peso
    if (goal === "gain") tdee += 500 // Surplus calorico per aumentare di peso

    return Math.round(tdee)
  }

  // Calcolo dei macronutrienti
  const calculateMacros = (calories: number, userData: UserData): { protein: number; carbs: number; fat: number } => {
    const { goal } = userData

    let proteinPercentage = 0.3 // 30% delle calorie da proteine
    let fatPercentage = 0.3 // 30% delle calorie da grassi
    let carbsPercentage = 0.4 // 40% delle calorie da carboidrati

    // Aggiustamento in base all'obiettivo
    if (goal === "lose") {
      proteinPercentage = 0.4 // Più proteine per preservare la massa muscolare
      fatPercentage = 0.3
      carbsPercentage = 0.3 // Meno carboidrati per favorire la perdita di peso
    } else if (goal === "gain") {
      proteinPercentage = 0.3
      fatPercentage = 0.25
      carbsPercentage = 0.45 // Più carboidrati per fornire energia
    }

    // Calcolo dei grammi di macronutrienti
    const protein = Math.round((calories * proteinPercentage) / 4) // 4 calorie per grammo di proteine
    const carbs = Math.round((calories * carbsPercentage) / 4) // 4 calorie per grammo di carboidrati
    const fat = Math.round((calories * fatPercentage) / 9) // 9 calorie per grammo di grassi

    return { protein, carbs, fat }
  }

  // Generazione di un piano alimentare di 21 giorni
  const generateMealPlan = (
    userData: UserData,
    calories: number,
    macros: { protein: number; carbs: number; fat: number },
  ): DayPlan[] => {
    const { preferences, restrictions } = userData
    const mealPlan: DayPlan[] = []

    // Esempio di pasti per colazione
    const breakfastOptions = [
      {
        name: "Porridge di avena con frutta",
        ingredients: ["50g di fiocchi d'avena", "200ml di latte", "1 banana", "1 cucchiaio di miele", "cannella"],
        calories: 350,
        protein: 12,
        carbs: 60,
        fat: 7,
      },
      {
        name: "Yogurt greco con frutta e granola",
        ingredients: ["150g di yogurt greco", "30g di granola", "100g di frutti di bosco", "1 cucchiaio di miele"],
        calories: 320,
        protein: 15,
        carbs: 45,
        fat: 10,
      },
      {
        name: "Toast con avocado e uova",
        ingredients: ["2 fette di pane integrale", "1/2 avocado", "2 uova", "pomodorini", "sale e pepe"],
        calories: 400,
        protein: 20,
        carbs: 30,
        fat: 22,
      },
      {
        name: "Frullato proteico",
        ingredients: [
          "1 scoop di proteine in polvere",
          "1 banana",
          "200ml di latte",
          "1 cucchiaio di burro di arachidi",
        ],
        calories: 380,
        protein: 25,
        carbs: 40,
        fat: 12,
      },
      {
        name: "Pancake proteici",
        ingredients: [
          "50g di farina d'avena",
          "1 scoop di proteine in polvere",
          "1 uovo",
          "100ml di latte",
          "1 cucchiaio di miele",
        ],
        calories: 420,
        protein: 30,
        carbs: 50,
        fat: 10,
      },
    ]

    // Esempio di pasti per pranzo
    const lunchOptions = [
      {
        name: "Insalata di quinoa con verdure",
        ingredients: ["100g di quinoa", "pomodorini", "cetrioli", "peperoni", "50g di feta", "olio d'oliva", "limone"],
        calories: 450,
        protein: 15,
        carbs: 55,
        fat: 20,
      },
      {
        name: "Bowl di riso integrale con pollo e verdure",
        ingredients: [
          "100g di riso integrale",
          "120g di petto di pollo",
          "broccoli",
          "carote",
          "zucchine",
          "salsa di soia",
        ],
        calories: 500,
        protein: 35,
        carbs: 60,
        fat: 10,
      },
      {
        name: "Wrap di tacchino con hummus",
        ingredients: ["1 tortilla integrale", "100g di tacchino", "hummus", "spinaci", "pomodoro", "avocado"],
        calories: 480,
        protein: 30,
        carbs: 45,
        fat: 18,
      },
      {
        name: "Pasta integrale al pesto",
        ingredients: ["80g di pasta integrale", "30g di pesto", "pomodorini", "10g di parmigiano"],
        calories: 520,
        protein: 18,
        carbs: 70,
        fat: 15,
      },
      {
        name: "Zuppa di lenticchie con pane integrale",
        ingredients: ["150g di lenticchie", "carote", "sedano", "cipolla", "1 fetta di pane integrale"],
        calories: 420,
        protein: 20,
        carbs: 65,
        fat: 5,
      },
    ]

    // Esempio di pasti per cena
    const dinnerOptions = [
      {
        name: "Salmone al forno con patate dolci e asparagi",
        ingredients: ["150g di salmone", "150g di patate dolci", "asparagi", "limone", "erbe aromatiche"],
        calories: 480,
        protein: 35,
        carbs: 40,
        fat: 18,
      },
      {
        name: "Petto di pollo con riso e broccoli",
        ingredients: ["150g di petto di pollo", "80g di riso", "broccoli", "olio d'oliva", "spezie"],
        calories: 450,
        protein: 40,
        carbs: 45,
        fat: 10,
      },
      {
        name: "Tofu saltato con verdure e noodles",
        ingredients: ["150g di tofu", "80g di noodles", "peperoni", "carote", "cipolla", "salsa di soia"],
        calories: 420,
        protein: 25,
        carbs: 50,
        fat: 15,
      },
      {
        name: "Frittata di verdure con insalata",
        ingredients: ["3 uova", "zucchine", "peperoni", "cipolla", "insalata mista", "olio d'oliva"],
        calories: 380,
        protein: 22,
        carbs: 10,
        fat: 28,
      },
      {
        name: "Burger di ceci con patate al forno",
        ingredients: ["150g di ceci", "cipolla", "aglio", "spezie", "150g di patate", "olio d'oliva"],
        calories: 450,
        protein: 18,
        carbs: 65,
        fat: 12,
      },
    ]

    // Esempio di spuntini
    const snackOptions = [
      {
        name: "Yogurt greco con miele",
        ingredients: ["150g di yogurt greco", "1 cucchiaio di miele"],
        calories: 150,
        protein: 15,
        carbs: 12,
        fat: 5,
      },
      {
        name: "Frutta fresca",
        ingredients: ["1 mela", "1 banana"],
        calories: 120,
        protein: 1,
        carbs: 30,
        fat: 0,
      },
      {
        name: "Mix di frutta secca",
        ingredients: ["30g di mix di frutta secca e semi"],
        calories: 180,
        protein: 6,
        carbs: 10,
        fat: 14,
      },
      {
        name: "Barretta proteica",
        ingredients: ["1 barretta proteica"],
        calories: 200,
        protein: 15,
        carbs: 20,
        fat: 8,
      },
      {
        name: "Hummus con carote",
        ingredients: ["50g di hummus", "100g di carote"],
        calories: 170,
        protein: 5,
        carbs: 15,
        fat: 10,
      },
    ]

    // Generazione del piano per 21 giorni
    for (let day = 1; day <= 21; day++) {
      // Seleziona casualmente i pasti per il giorno
      const breakfast = breakfastOptions[Math.floor(Math.random() * breakfastOptions.length)]
      const lunch = lunchOptions[Math.floor(Math.random() * lunchOptions.length)]
      const dinner = dinnerOptions[Math.floor(Math.random() * dinnerOptions.length)]
      const morningSnack = snackOptions[Math.floor(Math.random() * snackOptions.length)]
      const afternoonSnack = snackOptions[Math.floor(Math.random() * snackOptions.length)]

      // Aggiungi il giorno al piano
      mealPlan.push({
        day,
        meals: [
          { type: "Colazione", ...breakfast },
          { type: "Spuntino mattutino", ...morningSnack },
          { type: "Pranzo", ...lunch },
          { type: "Spuntino pomeridiano", ...afternoonSnack },
          { type: "Cena", ...dinner },
        ],
      })
    }

    return mealPlan
  }

  // Generazione di consigli nutrizionali
  const generateTips = (userData: UserData): string[] => {
    const { goal, preferences } = userData
    const tips: string[] = []

    // Consigli generali
    tips.push("Bevi almeno 2 litri di acqua al giorno.")
    tips.push("Cerca di mangiare lentamente e masticare bene il cibo.")
    tips.push("Evita di saltare i pasti, soprattutto la colazione.")

    // Consigli specifici in base all'obiettivo
    if (goal === "lose") {
      tips.push("Limita il consumo di zuccheri raffinati e carboidrati semplici.")
      tips.push("Aumenta il consumo di proteine per preservare la massa muscolare.")
      tips.push("Considera l'aggiunta di attività cardiovascolare alla tua routine di esercizio.")
    } else if (goal === "gain") {
      tips.push("Aumenta gradualmente l'apporto calorico per favorire l'aumento di peso sano.")
      tips.push("Concentrati su alimenti nutrienti e densi di calorie.")
      tips.push("Includi l'allenamento di forza nella tua routine di esercizio.")
    } else {
      tips.push("Mantieni un equilibrio tra i macronutrienti per sostenere il tuo peso attuale.")
      tips.push("Varia la tua dieta per assicurarti di ottenere tutti i nutrienti necessari.")
    }

    // Consigli in base alle preferenze
    if (preferences.includes("vegetarian") || preferences.includes("vegan")) {
      tips.push("Assicurati di ottenere abbastanza proteine da fonti vegetali come legumi, tofu e tempeh.")
      tips.push(
        "Considera l'integrazione di vitamina B12, che è principalmente presente negli alimenti di origine animale.",
      )
    }

    if (preferences.includes("lowCarb")) {
      tips.push("Scegli carboidrati complessi come verdure, legumi e cereali integrali.")
      tips.push("Aumenta il consumo di grassi sani come avocado, noci e olio d'oliva.")
    }

    if (preferences.includes("highProtein")) {
      tips.push("Distribuisci l'assunzione di proteine durante il giorno per ottimizzare la sintesi proteica.")
      tips.push("Includi una fonte di proteine ad ogni pasto e spuntino.")
    }

    return tips
  }

  // Calcolo del piano dietetico
  const calculateDiet = () => {
    setLoading(true)

    // Simula un ritardo per mostrare il caricamento
    setTimeout(() => {
      try {
        // Calcolo del BMI
        const bmi = calculateBMI(userData.weight, userData.height)
        const bmiCategory = getBMICategory(bmi)

        // Calcolo del fabbisogno calorico
        const calories = calculateCalories(userData)

        // Calcolo dei macronutrienti
        const macros = calculateMacros(calories, userData)

        // Imposta i risultati
        const newResults = {
          bmi,
          bmiCategory,
          calories,
          ...macros,
        }
        setResults(newResults)

        // Genera il piano alimentare
        const newMealPlan = generateMealPlan(userData, calories, macros)
        setMealPlan(newMealPlan)

        // Genera i consigli
        const newTips = generateTips(userData)
        setTips(newTips)

        // Salva il piano dietetico
        const currentDate = new Date().toISOString()
        const planName = `Piano del ${new Date().toLocaleDateString()}`

        const newPlan: Omit<DietPlan, "id"> = {
          name: planName,
          date: currentDate,
          userData,
          results: newResults,
          mealPlan: newMealPlan,
          tips: newTips,
        }

        const savedPlan = dietApi.add(newPlan)
        setSavedPlans([...savedPlans, savedPlan])
        setSelectedPlan(savedPlan)

        toast({
          title: "Piano dietetico calcolato",
          description: "Il tuo piano dietetico personalizzato è stato creato con successo.",
        })

        setLoading(false)
      } catch (error) {
        console.error("Errore durante il calcolo del piano dietetico:", error)
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante il calcolo del piano dietetico.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }, 1500)
  }

  // Gestione dell'espansione/compressione dei dettagli del giorno
  const toggleDayExpansion = (day: number) => {
    if (expandedDay === day) {
      setExpandedDay(null)
    } else {
      setExpandedDay(day)
    }
  }

  // Selezione di un piano dietetico salvato
  const handleSelectPlan = (id: number) => {
    const plan = dietApi.getById(id)
    if (plan) {
      setSelectedPlan(plan)
      setUserData(plan.userData)
      setResults(plan.results)
      setMealPlan(plan.mealPlan)
      setTips(plan.tips)

      toast({
        title: "Piano dietetico caricato",
        description: `Il piano "${plan.name}" è stato caricato con successo.`,
      })
    }
  }

  // Eliminazione di un piano dietetico
  const handleDeletePlan = (id: number) => {
    if (window.confirm("Sei sicuro di voler eliminare questo piano dietetico?")) {
      const success = dietApi.delete(id)
      if (success) {
        const updatedPlans = savedPlans.filter((plan) => plan.id !== id)
        setSavedPlans(updatedPlans)

        // Se il piano eliminato era quello selezionato, seleziona il più recente
        if (selectedPlan && selectedPlan.id === id) {
          if (updatedPlans.length > 0) {
            const mostRecent = updatedPlans.reduce((prev, current) => {
              return new Date(prev.date) > new Date(current.date) ? prev : current
            })
            setSelectedPlan(mostRecent)
            setUserData(mostRecent.userData)
            setResults(mostRecent.results)
            setMealPlan(mostRecent.mealPlan)
            setTips(mostRecent.tips)
          } else {
            setSelectedPlan(null)
            setResults(null)
            setMealPlan([])
            setTips([])
          }
        }

        toast({
          title: "Piano dietetico eliminato",
          description: "Il piano dietetico è stato eliminato con successo.",
        })
      }
    }
  }

  // Esportazione del piano alimentare in PDF
  const exportToPDF = () => {
    if (!results || !mealPlan.length) {
      toast({
        title: "Errore",
        description: "Non c'è un piano alimentare da esportare.",
        variant: "destructive",
      })
      return
    }

    try {
      // Crea un nuovo documento PDF
      const doc = new jsPDF()

      // Titolo
      doc.setFontSize(20)
      doc.text("Piano Alimentare Personalizzato", 105, 20, { align: "center" })
      doc.setFontSize(12)
      doc.text(`Generato il: ${new Date().toLocaleDateString()}`, 105, 30, { align: "center" })

      // Informazioni utente
      doc.setFontSize(16)
      doc.text("Informazioni Personali", 20, 45)
      doc.setFontSize(10)
      doc.text(`Età: ${userData.age} anni`, 20, 55)
      doc.text(`Genere: ${userData.gender === "male" ? "Maschile" : "Femminile"}`, 20, 60)
      doc.text(`Peso: ${userData.weight} kg`, 20, 65)
      doc.text(`Altezza: ${userData.height} cm`, 20, 70)

      // Risultati
      doc.setFontSize(16)
      doc.text("Risultati", 20, 85)
      doc.setFontSize(10)
      doc.text(`BMI: ${results.bmi} (${results.bmiCategory})`, 20, 95)
      doc.text(`Fabbisogno calorico giornaliero: ${results.calories} kcal`, 20, 100)
      doc.text(
        `Proteine: ${results.protein}g (${Math.round(((results.protein * 4) / results.calories) * 100)}%)`,
        20,
        105,
      )
      doc.text(
        `Carboidrati: ${results.carbs}g (${Math.round(((results.carbs * 4) / results.calories) * 100)}%)`,
        20,
        110,
      )
      doc.text(`Grassi: ${results.fat}g (${Math.round(((results.fat * 9) / results.calories) * 100)}%)`, 20, 115)

      // Consigli
      doc.setFontSize(16)
      doc.text("Consigli Nutrizionali", 20, 130)
      doc.setFontSize(10)
      let tipY = 140
      tips.forEach((tip) => {
        doc.text(`• ${tip}`, 20, tipY)
        tipY += 5
      })

      // Piano alimentare
      doc.setFontSize(16)
      doc.text("Piano Alimentare di 21 Giorni", 105, tipY + 10, { align: "center" })

      // Aggiungi ogni giorno al PDF
      let currentY = tipY + 20
      let currentPage = 1

      mealPlan.forEach((day, index) => {
        // Controlla se è necessario aggiungere una nuova pagina
        if (currentY > 270) {
          doc.addPage()
          currentPage++
          currentY = 20
        }

        doc.setFontSize(14)
        doc.text(`Giorno ${day.day}`, 20, currentY)
        currentY += 10

        doc.setFontSize(10)
        day.meals.forEach((meal) => {
          // Controlla se è necessario aggiungere una nuova pagina
          if (currentY > 270) {
            doc.addPage()
            currentPage++
            currentY = 20
          }

          doc.setFont(undefined, "bold")
          doc.text(`${meal.type}: ${meal.name}`, 20, currentY)
          doc.setFont(undefined, "normal")
          currentY += 5

          doc.text(`Ingredienti: ${meal.ingredients.join(", ")}`, 25, currentY)
          currentY += 5

          doc.text(
            `Calorie: ${meal.calories} kcal | Proteine: ${meal.protein}g | Carboidrati: ${meal.carbs}g | Grassi: ${meal.fat}g`,
            25,
            currentY,
          )
          currentY += 10
        })

        currentY += 5
      })

      // Salva il PDF
      doc.save("piano_alimentare.pdf")

      toast({
        title: "PDF esportato",
        description: "Il piano alimentare è stato esportato in PDF con successo.",
      })
    } catch (error) {
      console.error("Errore durante l'esportazione del PDF:", error)
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'esportazione del PDF.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dieta Personalizzata</h1>
          <p className="text-muted-foreground">
            Calcola il tuo fabbisogno calorico e crea un piano alimentare personalizzato
          </p>
        </div>

        <Tabs defaultValue={savedPlans.length > 0 ? "saved" : "calculator"}>
          <TabsList>
            <TabsTrigger value="calculator">Calcolatore</TabsTrigger>
            <TabsTrigger value="saved">Piani Salvati ({savedPlans.length})</TabsTrigger>
            {results && <TabsTrigger value="results">Risultati</TabsTrigger>}
            {mealPlan.length > 0 && <TabsTrigger value="plan">Piano Alimentare</TabsTrigger>}
          </TabsList>

          <TabsContent value="calculator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Personali</CardTitle>
                <CardDescription>Inserisci i tuoi dati per calcolare il fabbisogno calorico</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Età</Label>
                    <Input
                      id="age"
                      type="number"
                      value={userData.age.toString()}
                      onChange={(e) => handleInputChange("age", Number.parseInt(e.target.value))}
                      min={18}
                      max={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Genere</Label>
                    <RadioGroup
                      value={userData.gender}
                      onValueChange={(value) => handleInputChange("gender", value)}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Maschile</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Femminile</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={userData.weight.toString()}
                      onChange={(e) => handleInputChange("weight", Number.parseFloat(e.target.value))}
                      min={40}
                      max={200}
                      step={0.1}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Altezza (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={userData.height.toString()}
                      onChange={(e) => handleInputChange("height", Number.parseFloat(e.target.value))}
                      min={140}
                      max={220}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activity">Livello di Attività</Label>
                  <Select
                    value={userData.activityLevel}
                    onValueChange={(value) => handleInputChange("activityLevel", value)}
                  >
                    <SelectTrigger id="activity">
                      <SelectValue placeholder="Seleziona il livello di attività" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentario (poco o nessun esercizio)</SelectItem>
                      <SelectItem value="light">Leggermente attivo (esercizio leggero 1-3 giorni/settimana)</SelectItem>
                      <SelectItem value="moderate">
                        Moderatamente attivo (esercizio moderato 3-5 giorni/settimana)
                      </SelectItem>
                      <SelectItem value="active">Molto attivo (esercizio intenso 6-7 giorni/settimana)</SelectItem>
                      <SelectItem value="veryActive">
                        Estremamente attivo (esercizio molto intenso, lavoro fisico)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Obiettivo</Label>
                  <Select value={userData.goal} onValueChange={(value) => handleInputChange("goal", value)}>
                    <SelectTrigger id="goal">
                      <SelectValue placeholder="Seleziona il tuo obiettivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lose">Perdere peso</SelectItem>
                      <SelectItem value="maintain">Mantenere il peso</SelectItem>
                      <SelectItem value="gain">Aumentare di peso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferenze Alimentari</CardTitle>
                <CardDescription>Seleziona le tue preferenze alimentari per personalizzare il piano</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Stile Alimentare</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {foodPreferences.map((preference) => (
                      <div key={preference.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={preference.id}
                          checked={userData.preferences.includes(preference.id)}
                          onCheckedChange={(checked) => handlePreferenceChange(preference.id, checked === true)}
                        />
                        <Label htmlFor={preference.id}>{preference.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Restrizioni Alimentari</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {dietaryRestrictions.map((restriction) => (
                      <div key={restriction.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={restriction.id}
                          checked={userData.restrictions.includes(restriction.id)}
                          onCheckedChange={(checked) => handleRestrictionChange(restriction.id, checked === true)}
                        />
                        <Label htmlFor={restriction.id}>{restriction.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={calculateDiet} disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Calcolo in corso...
                    </>
                  ) : (
                    <>
                      <Calculator className="mr-2 h-4 w-4" />
                      Calcola Piano Dietetico
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            {savedPlans.length === 0 ? (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Nessun piano dietetico salvato</h2>
                <p className="text-muted-foreground mb-6">
                  Non hai ancora creato nessun piano dietetico personalizzato.
                </p>
                <Button onClick={() => document.querySelector('[data-value="calculator"]')?.click()}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Crea un Piano Dietetico
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlans.map((plan) => (
                  <Card key={plan.id} className={selectedPlan?.id === plan.id ? "border-primary" : ""}>
                    <CardHeader className="pb-2">
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>Creato il {new Date(plan.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>BMI:</span>
                          <span className="font-medium">
                          {plan.results ? `${plan.results.bmi} (${plan.results.bmiCategory})` : "N/A"}
                         </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Calorie:</span>
                          <span className="font-medium">
                           {plan.results ? `${plan.results.calories} kcal` : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Obiettivo:</span>
                          <span className="font-medium">
                          {plan.userData
                          ? plan.userData.goal === "lose"
                          ? "Perdere peso"
                          : plan.userData.goal === "maintain"
                           ? "Mantenere il peso"
                          : "Aumentare di peso"
                          : "N/A"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={() => handleDeletePlan(plan.id)}>
                        Elimina
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={selectedPlan?.id === plan.id}
                      >
                        {selectedPlan?.id === plan.id ? "Selezionato" : "Visualizza"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {results && (
            <TabsContent value="results" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risultati</CardTitle>
                  <CardDescription>I risultati del calcolo del tuo fabbisogno calorico</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Indice di Massa Corporea (BMI)</h3>
                        <div className="flex items-center space-x-4">
                          <div className="text-4xl font-bold">{results.bmi}</div>
                          <Badge
                            className={
                              results.bmiCategory === "Sottopeso"
                                ? "bg-blue-500"
                                : results.bmiCategory === "Normopeso"
                                  ? "bg-green-500"
                                  : results.bmiCategory === "Sovrappeso"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }
                          >
                            {results.bmiCategory}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {results.bmiCategory === "Sottopeso"
                            ? "Il tuo BMI indica che sei sottopeso. Considera di aumentare l'apporto calorico."
                            : results.bmiCategory === "Normopeso"
                              ? "Il tuo BMI è nella norma. Continua a mantenere uno stile di vita sano."
                              : results.bmiCategory === "Sovrappeso"
                                ? "Il tuo BMI indica che sei leggermente in sovrappeso. Considera di ridurre l'apporto calorico."
                                : "Il tuo BMI indica obesità. Ti consigliamo di consultare un professionista della salute."}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-2">Fabbisogno Calorico Giornaliero</h3>
                        <div className="text-4xl font-bold">
                          {results.calories} <span className="text-lg font-normal">kcal</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Questo è il numero di calorie che dovresti consumare ogni giorno per{" "}
                          {userData.goal === "lose"
                            ? "perdere"
                            : userData.goal === "maintain"
                              ? "mantenere"
                              : "aumentare"}{" "}
                          peso.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-2">Distribuzione dei Macronutrienti</h3>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Proteine</span>
                            <span>
                              {results.protein}g ({Math.round(((results.protein * 4) / (results.calories || 1)) * 100)}
                              %)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.round(((results.protein * 4) / (results.calories || 1)) * 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Carboidrati</span>
                            <span>
                              {results.carbs}g ({Math.round(((results.carbs * 4) / (results.calories || 1)) * 100)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${Math.round(((results.carbs * 4) / (results.calories || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span>Grassi</span>
                            <span>
                              {results.fat}g ({Math.round(((results.fat * 9) / (results.calories || 1)) * 100)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500 rounded-full"
                              style={{ width: `${Math.round(((results.fat * 9) / (results.calories || 1)) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <p className="text-sm text-muted-foreground">
                          La distribuzione dei macronutrienti è stata calcolata in base al tuo obiettivo di{" "}
                          {userData.goal === "lose"
                            ? "perdita di peso"
                            : userData.goal === "maintain"
                              ? "mantenimento del peso"
                              : "aumento di peso"}
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => document.querySelector('[data-value="calculator"]')?.click()}
                  >
                    Modifica Dati
                  </Button>
                  <Button
                    onClick={() => document.querySelector('[data-value="plan"]')?.click()}
                    disabled={!mealPlan.length}
                  >
                    Visualizza Piano Alimentare
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Consigli Nutrizionali</CardTitle>
                  <CardDescription>Consigli personalizzati in base ai tuoi dati e obiettivi</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {mealPlan.length > 0 && (
            <TabsContent value="plan" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Piano Alimentare di 21 Giorni</h2>
                <Button variant="outline" onClick={exportToPDF}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Esporta PDF
                </Button>
              </div>

              <div className="space-y-4">
                {mealPlan.map((day) => (
                  <Card key={day.day}>
                    <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleDayExpansion(day.day)}>
                      <div className="flex justify-between items-center">
                        <CardTitle>Giorno {day.day}</CardTitle>
                        <Button variant="ghost" size="sm">
                          {expandedDay === day.day ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                    {expandedDay === day.day && (
                      <CardContent>
                        <div className="space-y-6">
                          {day.meals.map((meal, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center">
                                <h3 className="text-lg font-semibold">{meal.type}</h3>
                                <Badge variant="outline" className="ml-2">
                                  {meal.calories} kcal
                                </Badge>
                              </div>

                              <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">{meal.name}</h4>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm font-medium">Ingredienti:</span>
                                    <ul className="text-sm ml-4 mt-1 space-y-1">
                                      {meal.ingredients.map((ingredient, i) => (
                                        <li key={i} className="list-disc">
                                          {ingredient}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <Badge variant="secondary">Proteine: {meal.protein}g</Badge>
                                    <Badge variant="secondary">Carboidrati: {meal.carbs}g</Badge>
                                    <Badge variant="secondary">Grassi: {meal.fat}g</Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

