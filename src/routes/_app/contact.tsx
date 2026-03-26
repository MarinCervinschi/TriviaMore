import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Bug, Github, Heart, Lightbulb, MessageSquare } from "lucide-react"

import { ContactForm } from "@/components/contact/contact-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/_app/contact")({
  component: ContactPage,
  head: () =>
    seoHead({
      title: "Contatti",
      description:
        "Hai domande, suggerimenti o vuoi contribuire al progetto? Contattaci!",
      path: "/contact",
    }),
})

function ContactPage() {
  return (
      <div className="container max-w-4xl py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Contattaci</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Hai domande, suggerimenti o vuoi contribuire al progetto? Siamo qui
            per ascoltarti!
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-blue-500/10 p-3">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                Invia un Messaggio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ContactForm />
            </CardContent>
          </Card>

          {/* Contact Methods */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-6 w-6" />
                  GitHub
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-muted-foreground">
                  Il modo migliore per contribuire al progetto, segnalare bug o
                  proporre nuove funzionalità.
                </p>
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  asChild
                >
                  <a
                    href="https://github.com/MarinCervinschi/TriviaMore"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visita il Repository
                  </a>
                </Button>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="inline-flex rounded-lg bg-red-500/10 p-1.5">
                      <Bug className="h-4 w-4 text-red-500" />
                    </div>
                    <h3 className="font-semibold">Segnala un Bug</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hai trovato un problema? Apri una issue su GitHub per
                    aiutarci a risolverlo.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="inline-flex rounded-lg bg-yellow-500/10 p-1.5">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                    </div>
                    <h3 className="font-semibold">Proponi una Funzionalità</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hai un&apos;idea per migliorare Trivia More? Condividila con
                    la community!
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:-translate-y-0.5 hover:shadow-md">
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center gap-3">
                    <div className="inline-flex rounded-lg bg-pink-500/10 p-1.5">
                      <Heart className="h-4 w-4 text-pink-500" />
                    </div>
                    <h3 className="font-semibold">Contribuisci</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Sviluppatore, designer o semplicemente appassionato? Il tuo
                    aiuto è prezioso!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Community Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Linee Guida della Community</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
                  <li>Sii rispettoso e costruttivo nelle comunicazioni</li>
                  <li>Fornisci dettagli chiari quando segnali problemi</li>
                  <li>Cerca nelle issue esistenti prima di crearne una nuova</li>
                  <li>Contribuisci seguendo le linee guida del progetto</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Domande Frequenti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/50">
              <div className="pb-4">
                <h4 className="mb-2 font-semibold">
                  Come posso contribuire al progetto?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Puoi contribuire in molti modi: sviluppando nuove
                  funzionalità, migliorando il design, aggiungendo contenuti per
                  i corsi, o semplicemente segnalando bug e suggerimenti.
                </p>
              </div>
              <div className="py-4">
                <h4 className="mb-2 font-semibold">
                  Trivia More è davvero gratuito?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Sì, completamente! Trivia More è un progetto open source
                  gratuito e sempre lo sarà. È fatto da studenti per studenti.
                </p>
              </div>
              <div className="pt-4">
                <h4 className="mb-2 font-semibold">
                  Posso aggiungere contenuti per il mio corso?
                </h4>
                <p className="text-sm text-muted-foreground">
                  Assolutamente! Incoraggiamo gli studenti ad aggiungere quiz e
                  flashcard per i loro corsi. Contattaci per sapere come
                  contribuire con i contenuti.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
