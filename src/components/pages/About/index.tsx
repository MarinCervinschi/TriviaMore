import Link from "next/link";

import { BookOpen, Github, Heart, Lightbulb, Target, Users } from "lucide-react";

import { LandingFooter, footerSections } from "@/components/LandingPage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPageContent() {
	return (
		<>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				{/* Hero Section */}
				<div className="mb-12 text-center">
					<h1 className="mb-4 text-4xl font-bold">Chi Siamo</h1>
					<p className="mx-auto max-w-2xl text-xl text-muted-foreground">
						Trivia More è una piattaforma open source creata da studenti per studenti
						dell&#39;Università di Modena e Reggio Emilia
					</p>
				</div>

				{/* Mission Section */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Target className="h-6 w-6 text-blue-600" />
							La Nostra Missione
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-lg leading-relaxed">
							Crediamo che l&#39;apprendimento debba essere accessibile, collaborativo e
							divertente. La nostra missione è fornire agli studenti di UNIMORE uno
							strumento gratuito e open source per prepararsi efficacemente agli esami
							attraverso quiz interattivi e flashcard personalizzate.
						</p>
					</CardContent>
				</Card>

				{/* Values Grid */}
				<div className="mb-8 grid gap-6 md:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Heart className="h-5 w-5 text-red-500" />
								Open Source
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								Il nostro codice è completamente aperto e disponibile su GitHub.
								Crediamo nella trasparenza e nella collaborazione della community.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Users className="h-5 w-5 text-green-500" />
								Community-Driven
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								Ogni funzionalità nasce dalle esigenze reali degli studenti. La
								community guida lo sviluppo e contribuisce attivamente al progetto.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BookOpen className="h-5 w-5 text-blue-500" />
								Focalizzato su UNIMORE
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								Progettato specificamente per i corsi e gli esami dell&#39;Università di
								Modena e Reggio Emilia, con contenuti curati dagli studenti.
							</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Lightbulb className="h-5 w-5 text-yellow-500" />
								Innovazione Continua
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p>
								Utilizziamo le tecnologie più moderne per offrire un&#39;esperienza di
								apprendimento coinvolgente e sempre aggiornata.
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Technology Stack */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Stack Tecnologico</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="mb-4 flex flex-wrap gap-2">
							<Badge variant="secondary">Next.js</Badge>
							<Badge variant="secondary">TypeScript</Badge>
							<Badge variant="secondary">Tailwind CSS</Badge>
							<Badge variant="secondary">Prisma</Badge>
							<Badge variant="secondary">PostgreSQL</Badge>
							<Badge variant="secondary">Vercel</Badge>
						</div>
						<p className="text-muted-foreground">
							Utilizziamo tecnologie moderne e affidabili per garantire prestazioni
							ottimali e un&#39;esperienza utente eccellente.
						</p>
					</CardContent>
				</Card>

				{/* CTA Section */}
				<div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center dark:from-blue-950/20 dark:to-indigo-950/20">
					<h2 className="mb-4 text-2xl font-bold">Unisciti alla Community</h2>
					<p className="mx-auto mb-6 max-w-2xl text-muted-foreground">
						Trivia More è un progetto collaborativo. Che tu sia uno sviluppatore, un
						designer o semplicemente uno studente con idee, il tuo contributo è
						prezioso!
					</p>
					<div className="flex flex-col justify-center gap-4 sm:flex-row">
						<Button asChild size="lg">
							<Link
								href="https://github.com/MarinCervinschi/TriviaMore"
								target="_blank"
								rel="noopener noreferrer"
							>
								<Github className="mr-2 h-5 w-5" />
								Contribuisci su GitHub
							</Link>
						</Button>
						<Button variant="outline" size="lg" asChild>
							<Link href="/contact">Contattaci</Link>
						</Button>
					</div>
				</div>
			</div>
			<LandingFooter sections={footerSections} />
		</>
	);
}
