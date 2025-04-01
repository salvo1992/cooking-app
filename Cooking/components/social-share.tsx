"use client"

import { useState } from "react"
import { Facebook, Twitter, Linkedin, Mail, Share2, ChefHat } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { authApi } from "@/lib/api"
import { useRouter } from "next/navigation"

export function SocialShare() {
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const appUrl = typeof window !== "undefined" ? window.location.origin : "https://cucinaapp.com"

  const shareText =
    "Ho scoperto CucinaApp, un'app fantastica per gestire ricette, lista della spesa e piani alimentari! Provalo anche tu!"

  const router = useRouter()

  const handleShare = (platform: string) => {
    let shareUrl = ""

    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(shareText)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(appUrl)}`
        break
      case "email":
        shareUrl = `mailto:?subject=${encodeURIComponent("Scopri CucinaApp!")}&body=${encodeURIComponent(`${shareText}\n\n${appUrl}`)}`
        break
      default:
        if (navigator.share) {
          navigator.share({
            title: "CucinaApp",
            text: shareText,
            url: appUrl,
          })
          return
        }
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer")
    }

    setShowShareDialog(false)
  }

  const handleSubmitFeedback = () => {
    if (rating === 0) {
      toast({
        title: "Valutazione richiesta",
        description: "Per favore, seleziona una valutazione prima di inviare il feedback",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Simuliamo l'invio del feedback
    setTimeout(() => {
      setIsSubmitting(false)
      setShowFeedbackDialog(false)

      // Salva il feedback nel localStorage
      const newFeedback = {
        id: Date.now().toString(),
        name: name || "Utente Anonimo",
        rating,
        comment: feedback,
        date: new Date().toISOString().split("T")[0],
        avatar: "/placeholder.svg?height=40&width=40",
      }

      // Ottieni i feedback esistenti
      const existingFeedbacks = JSON.parse(localStorage.getItem("userFeedbacks") || "[]")

      // Aggiungi il nuovo feedback
      const updatedFeedbacks = [newFeedback, ...existingFeedbacks]

      // Salva nel localStorage
      localStorage.setItem("userFeedbacks", JSON.stringify(updatedFeedbacks))

      setRating(0)
      setFeedback("")

      toast({
        title: "Feedback inviato",
        description: "Grazie per il tuo feedback! Lo apprezziamo molto.",
      })

      // Reindirizza alla pagina dei feedback
      router.push("/feedback")
    }, 1000)
  }

  // Ottieni il nome dell'utente dal localStorage se disponibile
  useState(() => {
    const user = authApi.getCurrentUser()
    if (user) {
      setName(user.name)
    }
  })

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 bg-background shadow-md"
          onClick={() => setShowFeedbackDialog(true)}
        >
          <ChefHat className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full h-10 w-10 bg-background shadow-md"
          onClick={() => setShowShareDialog(true)}
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Condividi CucinaApp</DialogTitle>
            <DialogDescription>Condividi CucinaApp con i tuoi amici e familiari!</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-4 py-4">
            <Button variant="outline" size="icon" onClick={() => handleShare("facebook")}>
              <Facebook className="h-5 w-5 text-blue-600" />
              <span className="sr-only">Condividi su Facebook</span>
            </Button>

            <Button variant="outline" size="icon" onClick={() => handleShare("twitter")}>
              <Twitter className="h-5 w-5 text-blue-400" />
              <span className="sr-only">Condividi su Twitter</span>
            </Button>

            <Button variant="outline" size="icon" onClick={() => handleShare("linkedin")}>
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span className="sr-only">Condividi su LinkedIn</span>
            </Button>

            <Button variant="outline" size="icon" onClick={() => handleShare("email")}>
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="sr-only">Condividi via Email</span>
            </Button>
          </div>

          <div className="flex flex-col space-y-2">
            <Label htmlFor="share-link">Link diretto</Label>
            <div className="flex gap-2">
              <Input id="share-link" value={appUrl} readOnly />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(appUrl)
                  toast({
                    title: "Link copiato",
                    description: "Il link è stato copiato negli appunti",
                  })
                }}
              >
                Copia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lascia un Feedback</DialogTitle>
            <DialogDescription>Aiutaci a migliorare CucinaApp con il tuo feedback!</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>La tua valutazione</Label>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Button
                    key={value}
                    variant="ghost"
                    size="icon"
                    onClick={() => setRating(value)}
                    className={rating >= value ? "text-yellow-500" : "text-gray-300"}
                  >
                    <ChefHat className="h-8 w-8" fill={rating >= value ? "currentColor" : "none"} />
                  </Button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {rating === 1 && "Scarso"}
                {rating === 2 && "Sufficiente"}
                {rating === 3 && "Buono"}
                {rating === 4 && "Molto buono"}
                {rating === 5 && "Eccellente"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-name">Il tuo nome</Label>
              <Input
                id="feedback-name"
                placeholder="Il tuo nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback-text">Il tuo feedback</Label>
              <Textarea
                id="feedback-text"
                placeholder="Cosa ti è piaciuto? Cosa possiamo migliorare?"
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              Annulla
            </Button>
            <Button onClick={handleSubmitFeedback} disabled={isSubmitting}>
              {isSubmitting ? "Invio in corso..." : "Invia Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}


