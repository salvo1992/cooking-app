"use client"

import type React from "react"

import { Heart, HeartOff, Clock, ChefHat } from "lucide-react"
import Image from "next/image"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface RecipeCardProps {
  id: string
  title: string
  description: string
  image: string
  time: string
  difficulty: string
  favorite: boolean
  personal: boolean
  onClick: () => void
  onToggleFavorite: () => void
}

export function RecipeCard({
  id,
  title,
  description,
  image,
  time,
  difficulty,
  favorite,
  personal,
  onClick,
  onToggleFavorite,
}: RecipeCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite()
  }

  return (
    <Card className="overflow-hidden cursor-pointer transition-all hover:shadow-md" onClick={onClick}>
      <div className="relative aspect-video">
      <Image src={image || "/placeholder.svg"} alt={title || "Immagine ricetta"} fill className="object-cover" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
          onClick={handleFavoriteClick}
        >
          {favorite ? <Heart className="h-5 w-5 fill-red-500 text-red-500" /> : <HeartOff className="h-5 w-5" />}
          <span className="sr-only">{favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}</span>
        </Button>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {time}
          </div>
          <div className="flex items-center">
            <ChefHat className="h-4 w-4 mr-1" />
            {difficulty}
          </div>
        </div>
      </CardContent>
      <CardFooter>{personal && <Badge variant="outline">Ricetta Personale</Badge>}</CardFooter>
    </Card>
  )
}

