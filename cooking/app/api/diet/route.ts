import { NextResponse } from "next/server"

// Funzione per calcolare il BMR (Metabolismo Basale)
function calculateBMR(gender: string, age: number, height: number, weight: number): number {
  if (gender === "male") {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  } else {
    return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age
  }
}

// Funzione per calcolare il TDEE (Fabbisogno Energetico Totale Giornaliero)
function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    "very-active": 1.9,
  }

  return Math.round(bmr * (activityMultipliers[activityLevel] || 1))
}

// Funzione per calcolare le calorie giornaliere in base all'obiettivo
function calculateCalories(tdee: number, goal: string): number {
  const goalAdjustments: Record<string, number> = {
    lose: -500,
    maintain: 0,
    gain: 500,
  }

  return Math.round(tdee + (goalAdjustments[goal] || 0))
}

// Funzione per calcolare la distribuzione dei macronutrienti
function calculateMacros(calories: number, goal: string) {
  let proteinPercentage, carbPercentage, fatPercentage

  if (goal === "lose") {
    proteinPercentage = 25
    carbPercentage = 40
    fatPercentage = 35
  } else if (goal === "gain") {
    proteinPercentage = 30
    carbPercentage = 50
    fatPercentage = 20
  } else {
    // maintain
    proteinPercentage = 25
    carbPercentage = 50
    fatPercentage = 25
  }

  const proteinCalories = Math.round((calories * proteinPercentage) / 100)
  const carbCalories = Math.round((calories * carbPercentage) / 100)
  const fatCalories = Math.round((calories * fatPercentage) / 100)

  const proteinGrams = Math.round(proteinCalories / 4) // 4 calorie per grammo
  const carbGrams = Math.round(carbCalories / 4) // 4 calorie per grammo
  const fatGrams = Math.round(fatCalories / 9) // 9 calorie per grammo

  return {
    protein: {
      percentage: proteinPercentage,
      calories: proteinCalories,
      grams: proteinGrams,
    },
    carbs: {
      percentage: carbPercentage,
      calories: carbCalories,
      grams: carbGrams,
    },
    fat: {
      percentage: fatPercentage,
      calories: fatCalories,
      grams: fatGrams,
    },
  }
}

// Funzione per calcolare il BMI (Indice di Massa Corporea)
function calculateBMI(weight: number, height: number): number {
  return weight / Math.pow(height / 100, 2)
}

// Funzione per determinare la categoria del BMI
function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return "Sottopeso"
  if (bmi < 25) return "Peso normale"
  if (bmi < 30) return "Sovrappeso"
  return "Obesità"
}

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validazione dei dati
    if (!data.gender || !data.age || !data.height || !data.weight || !data.activityLevel || !data.goal) {
      return NextResponse.json({ error: "Tutti i campi sono obbligatori" }, { status: 400 })
    }

    const { gender, age, height, weight, activityLevel, goal } = data

    // Calcola il BMR
    const bmr = calculateBMR(gender, Number.parseInt(age), Number.parseInt(height), Number.parseInt(weight))

    // Calcola il TDEE
    const tdee = calculateTDEE(bmr, activityLevel)

    // Calcola le calorie giornaliere in base all'obiettivo
    const dailyCalories = calculateCalories(tdee, goal)

    // Calcola la distribuzione dei macronutrienti
    const macros = calculateMacros(dailyCalories, goal)

    // Calcola il BMI
    const bmi = calculateBMI(Number.parseInt(weight), Number.parseInt(height))
    const bmiCategory = getBMICategory(bmi)

    // Crea un piano alimentare di esempio
    const mealPlan = [
      {
        name: "Colazione",
        time: "7:00 - 9:00",
        calories: Math.round(dailyCalories * 0.25),
        description: "Cereali integrali con latte o yogurt, frutta fresca e frutta secca.",
      },
      {
        name: "Spuntino Mattutino",
        time: "10:30 - 11:00",
        calories: Math.round(dailyCalories * 0.1),
        description: "Frutta fresca o uno yogurt magro.",
      },
      {
        name: "Pranzo",
        time: "13:00 - 14:00",
        calories: Math.round(dailyCalories * 0.3),
        description:
          "Proteine magre (pesce, pollo, legumi), verdure e carboidrati complessi (riso integrale, pasta integrale).",
      },
      {
        name: "Spuntino Pomeridiano",
        time: "16:30 - 17:00",
        calories: Math.round(dailyCalories * 0.1),
        description: "Frutta secca o uno yogurt con frutta.",
      },
      {
        name: "Cena",
        time: "19:30 - 20:30",
        calories: Math.round(dailyCalories * 0.25),
        description: "Proteine magre, abbondanti verdure e una piccola porzione di carboidrati.",
      },
    ]

    // Restituisci i risultati
    return NextResponse.json({
      bmr: Math.round(bmr),
      tdee,
      dailyCalories,
      macros,
      bmi: bmi.toFixed(1),
      bmiCategory,
      mealPlan,
    })
  } catch (error) {
    console.error("Errore durante il calcolo della dieta:", error)
    return NextResponse.json({ error: "Errore del server" }, { status: 500 })
  }
}

