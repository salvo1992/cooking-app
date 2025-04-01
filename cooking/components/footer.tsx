import Link from "next/link"
import { ChefHat } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
        <div className="flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} CucinaApp. Tutti i diritti riservati.
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
          <Link href="/feedback" className="hover:underline">
            Feedback
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">Powered by</p>
          <div className="flex items-center">
            <span className="font-viking text-sm font-bold">Il Vikingo del Web</span>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="ml-1"
            >
              <path d="M12 2L15 5H9L12 2Z" fill="currentColor" />
              <path d="M7 6H17L16 10H8L7 6Z" fill="currentColor" />
              <path d="M9 11H15L14 16H10L9 11Z" fill="currentColor" />
              <path d="M10 17H14L13 21H11L10 17Z" fill="currentColor" />
              <path d="M5 7L3 12L5 17H7L6 12L7 7H5Z" fill="currentColor" />
              <path d="M19 7H17L18 12L17 17H19L21 12L19 7Z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </footer>
  )
}




