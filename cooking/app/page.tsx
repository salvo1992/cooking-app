import type React from "react"
import Link from "next/link"
import { ChefHat, ShoppingCart, Package, Utensils, Notebook, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">CucinaApp</h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          La tua app completa per la gestione di ricette, lista della spesa, dispensa e dieta personalizzata.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          <FeatureCard
            icon={<ChefHat className="h-8 w-8" />}
            title="Ricette"
            description="Scopri nuove ricette o aggiungi le tue personali"
            href="/ricette"
          />

          <FeatureCard
            icon={<ShoppingCart className="h-8 w-8" />}
            title="Lista della Spesa"
            description="Gestisci la tua lista della spesa con informazioni nutrizionali"
            href="/lista-spesa"
          />

          <FeatureCard
            icon={<Package className="h-8 w-8" />}
            title="Dispensa"
            description="Tieni traccia degli alimenti nella tua dispensa con date di scadenza"
            href="/dispensa"
          />

          <FeatureCard
            icon={<Utensils className="h-8 w-8" />}
            title="Dieta Personalizzata"
            description="Ottieni una dieta su misura in base al tuo fabbisogno calorico"
            href="/dieta"
          />

          <FeatureCard
            icon={<Notebook className="h-8 w-8" />}
            title="Note"
            description="Prendi appunti su alimentazione e ricette"
            href="/note"
          />

          <FeatureCard
            icon={<User className="h-8 w-8" />}
            title="Profilo"
            description="Gestisci il tuo account e le tue preferenze"
            href="/profilo"
          />
        </div>

        <div className="mt-8">
          <Button asChild size="lg">
            <Link href="/login">Accedi o Registrati</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Card className="flex flex-col items-center text-center">
      <CardHeader>
        <div className="p-2 bg-primary/10 rounded-full mb-2">{icon}</div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href={href}>Vai</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

