import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Torna alla home
            </Link>
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Informativa sulla Privacy</h1>
          <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            La presente Informativa sulla Privacy descrive le modalità con cui CucinaApp ("noi", "nostro" o "app")
            raccoglie, utilizza e condivide le informazioni personali degli utenti ("tu", "tuo") quando utilizzano la
            nostra applicazione.
          </p>

          <h2>Informazioni che raccogliamo</h2>
          <p>Raccogliamo le seguenti categorie di informazioni:</p>
          <ul>
            <li>
              <strong>Informazioni di registrazione:</strong> nome, indirizzo email e password quando crei un account.
            </li>
            <li>
              <strong>Dati di utilizzo:</strong> informazioni su come utilizzi l'app, quali funzionalità usi più
              frequentemente e come interagisci con i contenuti.
            </li>
            <li>
              <strong>Dati di profilo:</strong> età, genere, peso, altezza e preferenze alimentari che fornisci
              volontariamente per personalizzare la tua esperienza.
            </li>
            <li>
              <strong>Contenuti generati dall'utente:</strong> ricette, liste della spesa, note e altri contenuti che
              crei utilizzando l'app.
            </li>
          </ul>

          <h2>Come utilizziamo le tue informazioni</h2>
          <p>Utilizziamo le informazioni raccolte per:</p>
          <ul>
            <li>Fornire, mantenere e migliorare l'app e i suoi servizi.</li>
            <li>Personalizzare la tua esperienza e fornirti contenuti e funzionalità su misura.</li>
            <li>Comunicare con te, incluso l'invio di notifiche, aggiornamenti e informazioni relative al servizio.</li>
            <li>Monitorare e analizzare tendenze, utilizzo e attività in relazione alla nostra app.</li>
            <li>Rilevare, prevenire e affrontare problemi tecnici o di sicurezza.</li>
          </ul>

          <h2>Condivisione delle informazioni</h2>
          <p>
            Non vendiamo, affittiamo o condividiamo le tue informazioni personali con terze parti, tranne nei seguenti
            casi:
          </p>
          <ul>
            <li>Con il tuo consenso.</li>
            <li>
              Per rispettare obblighi legali, normativi o per proteggere i diritti e la sicurezza nostra e degli altri.
            </li>
            <li>Con fornitori di servizi che ci aiutano a gestire l'app (es. hosting, analisi).</li>
          </ul>

          <h2>Sicurezza dei dati</h2>
          <p>
            Adottiamo misure di sicurezza ragionevoli per proteggere le tue informazioni personali da perdita, uso
            improprio e accesso non autorizzato. Tuttavia, nessun sistema è completamente sicuro, e non possiamo
            garantire la sicurezza assoluta dei tuoi dati.
          </p>

          <h2>I tuoi diritti</h2>
          <p>Hai il diritto di:</p>
          <ul>
            <li>Accedere alle tue informazioni personali.</li>
            <li>Correggere dati inaccurati o incompleti.</li>
            <li>Richiedere la cancellazione dei tuoi dati.</li>
            <li>Opporti al trattamento dei tuoi dati.</li>
            <li>Richiedere la limitazione del trattamento.</li>
            <li>Richiedere la portabilità dei dati.</li>
          </ul>

          <h2>Cookie e tecnologie simili</h2>
          <p>
            Utilizziamo cookie e tecnologie simili per raccogliere informazioni sul tuo utilizzo dell'app e per
            migliorare la tua esperienza. Puoi gestire le tue preferenze sui cookie attraverso le impostazioni del tuo
            browser.
          </p>

          <h2>Modifiche alla presente Informativa</h2>
          <p>
            Possiamo aggiornare questa Informativa sulla Privacy di tanto in tanto. Ti informeremo di eventuali
            modifiche pubblicando la nuova Informativa sulla Privacy in questa pagina e, se le modifiche sono
            significative, ti invieremo una notifica.
          </p>

          <h2>Contattaci</h2>
          <p>
            Se hai domande o dubbi sulla nostra Informativa sulla Privacy, contattaci all'indirizzo:
            privacy@cucinaapp.com
          </p>
        </div>
      </div>
    </div>
  )
}

