import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import {
  BookOpen,
  Github,
  Heart,
  Lightbulb,
  Target,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/_app/about")({
  component: AboutPage,
  head: () =>
    seoHead({
      title: "Chi Siamo",
      description:
        "Trivia More è una piattaforma open source creata da studenti per studenti dell'Università di Modena e Reggio Emilia.",
      path: "/about",
    }),
})

function AboutPage() {
  return (
      <div className="container max-w-4xl py-8 sm:py-12">
        {/* Hero */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Chi Siamo</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Trivia More è una piattaforma open source creata da studenti per
            studenti dell&apos;Università di Modena e Reggio Emilia
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-8 hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-blue-500/10 p-3">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              La Nostra Missione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg leading-relaxed">
              Crediamo che l&apos;apprendimento debba essere accessibile,
              collaborativo e divertente. La nostra missione è fornire agli
              studenti di UNIMORE uno strumento gratuito e open source per
              prepararsi efficacemente agli esami attraverso quiz interattivi e
              flashcard personalizzate.
            </p>
          </CardContent>
        </Card>

        {/* Values */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          <Card className="hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-red-500/10 p-2">
                  <Heart className="h-5 w-5 text-red-500" />
                </div>
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Il nostro codice è completamente aperto e disponibile su GitHub.
                Crediamo nella trasparenza e nella collaborazione della
                community.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-green-500/10 p-2">
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                Community-Driven
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Ogni funzionalità nasce dalle esigenze reali degli studenti. La
                community guida lo sviluppo e contribuisce attivamente al
                progetto.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-blue-500/10 p-2">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                </div>
                Focalizzato su UNIMORE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Progettato specificamente per i corsi e gli esami
                dell&apos;Università di Modena e Reggio Emilia, con contenuti
                curati dagli studenti.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:-translate-y-1 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-yellow-500/10 p-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                </div>
                Innovazione Continua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Utilizziamo le tecnologie più moderne per offrire
                un&apos;esperienza di apprendimento coinvolgente e sempre
                aggiornata.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tech Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Stack Tecnologico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="secondary">TanStack Start</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="secondary">Supabase</Badge>
              <Badge variant="secondary">PostgreSQL</Badge>
              <Badge variant="secondary">React Query</Badge>
            </div>
            <p className="text-muted-foreground">
              Utilizziamo tecnologie moderne e affidabili per garantire
              prestazioni ottimali e un&apos;esperienza utente eccellente.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-primary/10 p-8 text-center dark:from-primary/10 dark:to-primary/5 sm:p-12">
          <h2 className="mb-4 text-2xl font-bold tracking-tight">Unisciti alla Community</h2>
          <p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
            Trivia More è un progetto collaborativo. Che tu sia uno
            sviluppatore, un designer o semplicemente uno studente con idee, il
            tuo contributo è prezioso!
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a
                href="https://github.com/MarinCervinschi/TriviaMore"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 h-5 w-5" />
                Contribuisci su GitHub
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="/contact">Contattaci</a>
            </Button>
          </div>
        </div>
      </div>
  )
}
