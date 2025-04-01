"use client"

import { useEffect } from "react"
import type { DietPlan } from "@/lib/api"

interface PrintDietPlanProps {
  plan: DietPlan
}

export function PrintDietPlan({ plan }: PrintDietPlanProps) {
  useEffect(() => {
    // Avvia la stampa automaticamente quando il componente è montato
    window.print()
  }, [])

  if (!plan) return null

  return (
    <div className="print-container p-8">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            font-family: 'Inter', sans-serif;
            color: #000;
          }
          .print-container {
            width: 100%;
            max-width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Piano Alimentare Personalizzato</h1>
        <p className="text-lg mt-2">Generato il: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Informazioni Personali</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Età:</strong> {plan.userData.age} anni
            </p>
            <p>
              <strong>Genere:</strong> {plan.userData.gender === "male" ? "Maschile" : "Femminile"}
            </p>
          </div>
          <div>
            <p>
              <strong>Peso:</strong> {plan.userData.weight} kg
            </p>
            <p>
              <strong>Altezza:</strong> {plan.userData.height} cm
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Risultati</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p>
              <strong>BMI:</strong> {plan.results.bmi} ({plan.results.bmiCategory})
            </p>
            <p>
              <strong>Fabbisogno calorico:</strong> {plan.results.calories} kcal
            </p>
          </div>
          <div>
            <p>
              <strong>Proteine:</strong> {plan.results.protein}g (
              {Math.round(((plan.results.protein * 4) / plan.results.calories) * 100)}%)
            </p>
            <p>
              <strong>Carboidrati:</strong> {plan.results.carbs}g (
              {Math.round(((plan.results.carbs * 4) / plan.results.calories) * 100)}%)
            </p>
            <p>
              <strong>Grassi:</strong> {plan.results.fat}g (
              {Math.round(((plan.results.fat * 9) / plan.results.calories) * 100)}%)
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Consigli Nutrizionali</h2>
        <ul className="list-disc pl-5">
          {plan.tips.map((tip, index) => (
            <li key={index} className="mb-2">
              {tip}
            </li>
          ))}
        </ul>
      </div>

      <div className="page-break"></div>

      <h2 className="text-2xl font-bold mb-6 text-center">Piano Alimentare di 21 Giorni</h2>

      {plan.mealPlan.map((day, dayIndex) => (
        <div key={dayIndex} className={dayIndex > 0 && dayIndex % 3 === 0 ? "page-break" : ""}>
          <div className="mb-8 border p-4 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Giorno {day.day}</h3>

            {day.meals.map((meal, mealIndex) => (
              <div key={mealIndex} className="mb-4 last:mb-0">
                <h4 className="font-bold">
                  {meal.type}: {meal.name}
                </h4>
                <p className="text-sm mb-1">
                  <strong>Ingredienti:</strong> {meal.ingredients.join(", ")}
                </p>
                <p className="text-sm">
                  <strong>Valori nutrizionali:</strong> {meal.calories} kcal | Proteine: {meal.protein}g | Carboidrati:{" "}
                  {meal.carbs}g | Grassi: {meal.fat}g
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-8 text-center text-sm">
        <p>© {new Date().getFullYear()} CucinaApp - Il Vikingo del Web</p>
        <p className="mt-1">
          Questo piano è stato generato automaticamente e dovrebbe essere valutato da un professionista prima di essere
          seguito.
        </p>
      </div>
    </div>
  )
}

