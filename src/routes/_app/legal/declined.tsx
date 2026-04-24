import { Link, createFileRoute } from "@tanstack/react-router"
import { LogIn, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { seoHead } from "@/lib/seo"

export const Route = createFileRoute("/_app/legal/declined")({
  head: () =>
    seoHead({
      title: "Accesso non completato",
      noindex: true,
    }),
  component: DeclinedPage,
})

const DELETION_REQUEST_MAILTO = `mailto:privacy@triviamore.it?subject=${encodeURIComponent(
  "Richiesta di eliminazione account TriviaMore",
)}&body=${encodeURIComponent(
  "Richiedo l'eliminazione del mio account TriviaMore associato all'email:\n\n[indica qui la tua email]\n\nHo letto la sezione 10 dei Termini e Condizioni e comprendo che l'eliminazione avverrà tramite anonimizzazione.",
)}`

function DeclinedPage() {
  return (
    <div className="container flex max-w-2xl items-center justify-center py-12 sm:py-20">
      <div className="w-full space-y-6 rounded-3xl border bg-card p-6 shadow-sm sm:p-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Hai rifiutato i documenti aggiornati
          </h1>
          <p className="text-sm text-muted-foreground">
            Sei stato disconnesso. Per poter utilizzare nuovamente
            TriviaMore è necessario accettare i Termini e Condizioni e
            l'Informativa sulla Privacy aggiornati. Il tuo account e i
            tuoi dati sono stati preservati e sono disponibili al
            prossimo accesso.
          </p>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Non desideri più utilizzare il Servizio?
          </p>
          <p className="mt-1">
            Puoi chiedere l'eliminazione del tuo account scrivendo al
            Titolare. La richiesta verrà valutata manualmente e
            l'eliminazione avverrà tramite anonimizzazione, come descritto
            nei Termini e Condizioni.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button asChild variant="outline">
            <a href={DELETION_REQUEST_MAILTO}>
              <Mail className="mr-2 h-4 w-4" />
              Richiedi eliminazione account
            </a>
          </Button>
          <Button asChild>
            <Link to="/auth/login">
              <LogIn className="mr-2 h-4 w-4" />
              Torna al login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
