import Link from "next/link"
import { ChevronLeft, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna alla home
            </Link>
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Contatti</h1>
          <p className="text-muted-foreground">Hai domande o suggerimenti? Contattaci!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informazioni di Contatto</CardTitle>
                <CardDescription>Ecco come puoi raggiungerci</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-sm text-muted-foreground">info@cucinaapp.com</p>
                    <p className="text-sm text-muted-foreground">supporto@cucinaapp.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Telefono</h3>
                    <p className="text-sm text-muted-foreground">+39 02 1234567</p>
                    <p className="text-sm text-muted-foreground">Lun-Ven: 9:00-18:00</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Indirizzo</h3>
                    <p className="text-sm text-muted-foreground">Via Roma 123</p>
                    <p className="text-sm text-muted-foreground">20100 Milano, Italia</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orari di Supporto</CardTitle>
                <CardDescription>Quando siamo disponibili per aiutarti</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Lunedì - Venerdì</span>
                    <span>9:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sabato</span>
                    <span>10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Domenica</span>
                    <span>Chiuso</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inviaci un Messaggio</CardTitle>
              <CardDescription>Compila il modulo e ti risponderemo al più presto</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Il tuo nome" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="La tua email" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Oggetto</Label>
                  <Input id="subject" placeholder="Oggetto del messaggio" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Messaggio</Label>
                  <Textarea id="message" placeholder="Il tuo messaggio" rows={6} />
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Invia Messaggio</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>FAQ - Domande Frequenti</CardTitle>
              <CardDescription>Risposte alle domande più comuni</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Come posso creare un account?</h3>
                <p className="text-sm text-muted-foreground">
                  Puoi creare un account cliccando sul pulsante "Accedi" nella barra di navigazione e poi selezionando
                  "Registrati". Dovrai fornire il tuo nome, email e una password.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Le mie ricette sono private?</h3>
                <p className="text-sm text-muted-foreground">
                  Sì, tutte le ricette che crei sono private per impostazione predefinita e visibili solo a te. In
                  futuro, potremmo aggiungere la possibilità di condividere le ricette con altri utenti.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Posso utilizzare l'app offline?</h3>
                <p className="text-sm text-muted-foreground">
                  Alcune funzionalità dell'app sono disponibili offline, ma per un'esperienza completa è necessaria una
                  connessione internet per sincronizzare i dati con il tuo account.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">I piani dietetici sono personalizzati?</h3>
                <p className="text-sm text-muted-foreground">
                  I piani dietetici sono generati in base alle informazioni che fornisci, ma non sostituiscono il
                  consiglio di un professionista. Consulta sempre un nutrizionista o un medico prima di seguire un nuovo
                  regime alimentare.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

