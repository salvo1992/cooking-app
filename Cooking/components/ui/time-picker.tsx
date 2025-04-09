"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface TimePickerProps {
  date: Date
  setDate: (date: Date) => void
}

export function TimePickerDemo({ date, setDate }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  // Ottieni ore e minuti dalla data
  const hours = date.getHours()
  const minutes = date.getMinutes()

  // Formatta ore e minuti con zero iniziale se necessario
  const formattedHours = hours.toString().padStart(2, "0")
  const formattedMinutes = minutes.toString().padStart(2, "0")

  // Gestisce il cambio di ore
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHours = Number.parseInt(e.target.value, 10)
    if (isNaN(newHours) || newHours < 0 || newHours > 23) return

    const newDate = new Date(date)
    newDate.setHours(newHours)
    setDate(newDate)

    // Passa al campo dei minuti dopo aver inserito due cifre
    if (e.target.value.length === 2) {
      minuteRef.current?.focus()
    }
  }

  // Gestisce il cambio di minuti
  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinutes = Number.parseInt(e.target.value, 10)
    if (isNaN(newMinutes) || newMinutes < 0 || newMinutes > 59) return

    const newDate = new Date(date)
    newDate.setMinutes(newMinutes)
    setDate(newDate)
  }

  return (
    <div className="flex items-end gap-2">
      <div className="grid gap-1 text-center">
        <Label htmlFor="hours" className="text-xs">
          Ore
        </Label>
        <Input
          ref={hourRef}
          id="hours"
          className="w-16 text-center"
          value={formattedHours}
          onChange={handleHoursChange}
          maxLength={2}
        />
      </div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minutes" className="text-xs">
          Minuti
        </Label>
        <Input
          ref={minuteRef}
          id="minutes"
          className="w-16 text-center"
          value={formattedMinutes}
          onChange={handleMinutesChange}
          maxLength={2}
        />
      </div>
      <div className="flex h-10 items-center">
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}
