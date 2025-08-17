"use client";

import Link from "next/link";

import { Bug, Github, Heart, Lightbulb, Mail, MessageSquare } from "lucide-react";

import { LandingFooter, footerSections } from "@/components/LandingPage";
import { ContactForm } from "@/components/forms/ContactForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPageContent() {
	async function handleContactSubmit(data: any) {
		const res = await fetch("/api/contact", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data),
		});

		if (!res.ok) {
			throw new Error("Errore durante l'invio del messaggio");
		}
	}
	return (
		<>
			<div className="container mx-auto max-w-4xl px-4 py-8">
				{/* Hero Section */}
				<div className="mb-12 text-center">
					<h1 className="mb-4 text-4xl font-bold">Contattaci</h1>
					<p className="mx-auto max-w-2xl text-xl text-muted-foreground">
						Hai domande, suggerimenti o vuoi contribuire al progetto? Siamo qui per
						ascoltarti!
					</p>
				</div>

				<div className="grid gap-8 lg:grid-cols-2">
					{/* Contact Form */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MessageSquare className="h-6 w-6 text-blue-600" />
								Invia un Messaggio
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ContactForm onSubmit={handleContactSubmit} />
						</CardContent>
					</Card>

					{/* Contact Methods */}
					<div className="space-y-6">
						{/* GitHub */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Github className="h-6 w-6" />
									GitHub
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="mb-4 text-muted-foreground">
									Il modo migliore per contribuire al progetto, segnalare bug o proporre
									nuove funzionalità.
								</p>
								<Button variant="outline" asChild className="w-full bg-transparent">
									<Link
										href="https://github.com/MarinCervinschi/TriviaMore"
										target="_blank"
										rel="noopener noreferrer"
									>
										Visita il Repository
									</Link>
								</Button>
							</CardContent>
						</Card>

						{/* Contact Types */}
						<div className="grid gap-4">
							<Card>
								<CardContent className="pt-6">
									<div className="mb-2 flex items-center gap-3">
										<Bug className="h-5 w-5 text-red-500" />
										<h3 className="font-semibold">Segnala un Bug</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Hai trovato un problema? Apri una issue su GitHub per aiutarci a
										risolverlo.
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="pt-6">
									<div className="mb-2 flex items-center gap-3">
										<Lightbulb className="h-5 w-5 text-yellow-500" />
										<h3 className="font-semibold">Proponi una Funzionalità</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Hai un&#39;idea per migliorare Trivia More? Condividila con la
										community!
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="pt-6">
									<div className="mb-2 flex items-center gap-3">
										<Heart className="h-5 w-5 text-pink-500" />
										<h3 className="font-semibold">Contribuisci</h3>
									</div>
									<p className="text-sm text-muted-foreground">
										Sviluppatore, designer o semplicemente appassionato? Il tuo aiuto è
										prezioso!
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
								<ul className="space-y-2 text-sm text-muted-foreground">
									<li>• Sii rispettoso e costruttivo nelle comunicazioni</li>
									<li>• Fornisci dettagli chiari quando segnali problemi</li>
									<li>• Cerca nelle issue esistenti prima di crearne una nuova</li>
									<li>• Contribuisci seguendo le linee guida del progetto</li>
								</ul>
							</CardContent>
						</Card>
					</div>
				</div>

				{/* FAQ Section */}
				<Card className="mt-8">
					<CardHeader>
						<CardTitle>Domande Frequenti</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div>
								<h4 className="mb-2 font-semibold">
									Come posso contribuire al progetto?
								</h4>
								<p className="text-sm text-muted-foreground">
									Puoi contribuire in molti modi: sviluppando nuove funzionalità,
									migliorando il design, aggiungendo contenuti per i corsi, o
									semplicemente segnalando bug e suggerimenti.
								</p>
							</div>

							<div>
								<h4 className="mb-2 font-semibold">Trivia More è davvero gratuito?</h4>
								<p className="text-sm text-muted-foreground">
									Sì, completamente! Trivia More è un progetto open source gratuito e
									sempre lo sarà. È fatto da studenti per studenti.
								</p>
							</div>

							<div>
								<h4 className="mb-2 font-semibold">
									Posso aggiungere contenuti per il mio corso?
								</h4>
								<p className="text-sm text-muted-foreground">
									Assolutamente! Incoraggiamo gli studenti ad aggiungere quiz e
									flashcard per i loro corsi. Contattaci per sapere come contribuire con
									i contenuti.
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
			<LandingFooter sections={footerSections} />
		</>
	);
}
