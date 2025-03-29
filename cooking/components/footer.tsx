import Link from "next/link"
import { ChefHat } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CucinaApp. Tutti i diritti riservati di propieta' di The viking of the web.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/termini" className="hover:underline">
            Termini
          </Link>
          <Link href="/contatti" className="hover:underline">
            Contatti
          </Link>
        </div>
      </div>
    </footer>
  )
}

