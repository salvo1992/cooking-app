import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Termini di Servizio</h1>
          <p className="text-muted-foreground">Ultimo aggiornamento: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p>
            Benvenuto su CucinaApp. I seguenti Termini di Servizio ("Termini") regolano l'utilizzo della nostra
            applicazione, inclusi tutti i contenuti, le funzionalità e i servizi offerti. Utilizzando la nostra app,
            accetti di essere vincolato da questi Termini.
          </p>

          <h2>1. Accettazione dei Termini</h2>
          <p>
            Utilizzando CucinaApp, accetti questi Termini e la nostra Informativa sulla Privacy. Se non accetti questi
            Termini, ti preghiamo di non utilizzare l'app.
          </p>

          <h2>2. Modifiche ai Termini</h2>
          <p>
            Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche saranno effettive
            immediatamente dopo la pubblicazione dei Termini aggiornati. L'uso continuato dell'app dopo tali modifiche
            costituisce l'accettazione dei nuovi Termini.
          </p>

          <h2>3. Account Utente</h2>
          <p>
            Per utilizzare alcune funzionalità dell'app, potrebbe essere necessario creare un account. Sei responsabile
            di mantenere la riservatezza delle tue credenziali e di tutte le attività che si verificano sotto il tuo
            account.
          </p>

          <h2>4. Contenuti dell'Utente</h2>
          <p>
            L'app consente di pubblicare, archiviare e condividere contenuti come ricette, liste della spesa e note
            ("Contenuti dell'Utente"). Mantieni la proprietà dei tuoi Contenuti dell'Utente, ma ci concedi una licenza
            mondiale, non esclusiva, gratuita per utilizzare, riprodurre, modificare, adattare, pubblicare, tradurre e
            distribuire tali contenuti in qualsiasi media.
          </p>

          <h2>5. Condotta dell'Utente</h2>
          <p>Accetti di non utilizzare l'app per:</p>
          <ul>
            <li>Violare leggi o regolamenti.</li>
            <li>Pubblicare contenuti illegali, offensivi, diffamatori o dannosi.</li>
            <li>Impersonare altre persone o entità.</li>
            <li>Raccogliere informazioni personali di altri utenti senza il loro consenso.</li>
            <li>Interferire con il funzionamento dell'app o dei server.</li>
          </ul>

          <h2>6. Proprietà Intellettuale</h2>
          <p>
            L'app e i suoi contenuti originali, funzionalità e funzionalità sono di proprietà di CucinaApp e sono
            protetti da copyright, marchi e altre leggi sulla proprietà intellettuale.
          </p>

          <h2>7. Limitazione di Responsabilità</h2>
          <p>
            <strong>L'APP È FORNITA "COSÌ COM'È" E "COME DISPONIBILE" SENZA GARANZIE DI ALCUN TIPO.</strong>
          </p>
          <p>
            In nessun caso CucinaApp, i suoi direttori, dipendenti, partner o agenti saranno responsabili per danni
            indiretti, incidentali, speciali, consequenziali o punitivi, inclusi, senza limitazione, perdita di
            profitti, dati, uso, avviamento o altre perdite intangibili, derivanti da:
          </p>
          <ul>
            <li>L'uso o l'impossibilità di utilizzare l'app.</li>
            <li>Qualsiasi contenuto ottenuto dall'app.</li>
            <li>Accesso non autorizzato o alterazione dei tuoi dati.</li>
          </ul>

          <h2>8. Disclaimer Medico e Nutrizionale</h2>
          <p>
            <strong>
              IMPORTANTE: Le informazioni fornite nell'app, inclusi piani dietetici, consigli nutrizionali e ricette,
              sono solo a scopo informativo e non costituiscono consulenza medica o nutrizionale professionale.
            </strong>
          </p>
          <p>
            CucinaApp non è responsabile per decisioni prese sulla base delle informazioni fornite nell'app. Prima di
            iniziare qualsiasi programma dietetico o apportare modifiche significative alla tua alimentazione, consulta
            un medico o un nutrizionista qualificato.
          </p>
          <p>
            L'app non garantisce l'accuratezza, la completezza o l'utilità di qualsiasi informazione nutrizionale o
            dietetica e non sarà responsabile per eventuali conseguenze derivanti dall'utilizzo di tali informazioni.
          </p>

          <h2>9. Indennizzo</h2>
          <p>
            Accetti di difendere, indennizzare e tenere indenne CucinaApp e i suoi licenzianti e licenziatari, e i loro
            dipendenti, appaltatori, agenti, funzionari e direttori, da e contro qualsiasi reclamo, danno, obbligo,
            perdita, responsabilità, costo o debito, e spese (incluse, ma non limitate a, spese legali) derivanti da:
            (i) il tuo uso e accesso all'app; (ii) la tua violazione di qualsiasi termine dei presenti Termini; (iii) la
            tua violazione di qualsiasi diritto di terzi, inclusi, senza limitazione, qualsiasi diritto d'autore,
            proprietà o diritto alla privacy; o (iv) qualsiasi affermazione che i tuoi Contenuti dell'Utente abbiano
            causato danni a terzi.
          </p>

          <h2>10. Legge Applicabile</h2>
          <p>
            Questi Termini saranno regolati e interpretati in conformità con le leggi italiane, senza riguardo ai suoi
            conflitti di principi di legge.
          </p>

          <h2>11. Contattaci</h2>
          <p>Se hai domande sui nostri Termini di Servizio, contattaci all'indirizzo: termini@cucinaapp.com</p>
        </div>
      </div>
    </div>
  )
}

