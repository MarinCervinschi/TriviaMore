import { Link, createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Github,
	GraduationCap,
	Heart,
	Lightbulb,
	Target,
	Users,
} from "lucide-react";

import { OrbitingTechStack } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
	fadeInUp,
	staggerContainer,
	staggerItem,
	withReducedMotion,
} from "@/lib/motion";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/_app/about")({
	component: AboutPage,
	head: () =>
		seoHead({
			title: "Chi siamo",
			description:
				"Trivia More è una piattaforma open source creata da studenti per studenti dell'Università di Modena e Reggio Emilia.",
			path: "/about",
		}),
});

const values = [
	{
		icon: Heart,
		title: "Open Source",
		description:
			"Codice completamente aperto su GitHub. Trasparenza e collaborazione guidano ogni decisione.",
		detail:
			"Ogni riga di codice, ogni decisione di design, ogni contenuto è visibile e modificabile. Non crediamo nei muri — crediamo nella condivisione.",
		color: "text-red-500",
		bg: "bg-red-500/10",
		span: "sm:col-span-2" as const,
	},
	{
		icon: Users,
		title: "Community-Driven",
		description: "La community guida lo sviluppo.",
		detail:
			"Ogni funzionalità nasce da un'esigenza reale. Studenti che hanno affrontato gli stessi esami contribuiscono con domande, correzioni e idee.",
		color: "text-green-500",
		bg: "bg-green-500/10",
		span: "" as const,
	},
	{
		icon: GraduationCap,
		title: "Focalizzato su UNIMORE",
		description: "Contenuti mirati per l'Università di Modena e Reggio Emilia.",
		detail:
			"Non un quiz generico ma materiale organizzato per dipartimento, corso e sezione — esattamente come il tuo piano di studi.",
		color: "text-blue-500",
		bg: "bg-blue-500/10",
		span: "" as const,
	},
	{
		icon: Lightbulb,
		title: "Innovazione continua",
		description: "Tecnologie moderne per un'esperienza coinvolgente.",
		detail:
			"React 19, TanStack Start, Framer Motion, Drizzle ORM — scegliamo gli strumenti migliori per offrire un'esperienza fluida e veloce.",
		color: "text-yellow-500",
		bg: "bg-yellow-500/10",
		span: "sm:col-span-2" as const,
	},
];

function AboutPage() {
	const prefersReduced = useReducedMotion();

	const { ref: heroRef, isVisible: heroVisible } = useScrollReveal();
	const { ref: missionRef, isVisible: missionVisible } = useScrollReveal();
	const { ref: valuesRef, isVisible: valuesVisible } = useScrollReveal();

	const fadeUp = withReducedMotion(fadeInUp, prefersReduced);
	const container = withReducedMotion(staggerContainer, prefersReduced);
	const item = withReducedMotion(staggerItem, prefersReduced);

	return (
		<div className="relative">
			{/* Hero */}
			<section className="relative py-16 sm:py-24">
				<motion.div
					ref={heroRef}
					className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
					variants={container}
					initial="hidden"
					animate={heroVisible ? "visible" : "hidden"}
				>
					<div className="mx-auto max-w-3xl text-center">
						<motion.p
							className="text-primary mb-4 text-sm font-semibold tracking-widest uppercase"
							variants={item}
						>
							Chi siamo
						</motion.p>
						<motion.h1
							className="font-display mb-6 text-4xl leading-[1.1] font-normal tracking-tight sm:text-5xl lg:text-6xl"
							variants={item}
						>
							Studiare insieme, <span className="gradient-text">crescere insieme</span>
						</motion.h1>
						<motion.p
							className="text-muted-foreground text-lg leading-relaxed sm:text-xl"
							variants={item}
						>
							TriviaMore è una piattaforma open source creata da studenti per studenti
							dell&apos;Università di Modena e Reggio Emilia. Nata da un&apos;esigenza
							reale, cresciuta con la community.
						</motion.p>
					</div>
				</motion.div>
			</section>

			{/* Mission — full-width accent band */}
			<section className="full-bleed-band bg-muted/30 relative border-y">
				<div className="dot-pattern absolute inset-0 opacity-40" />
				<motion.div
					ref={missionRef}
					className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
					variants={fadeUp}
					initial="hidden"
					animate={missionVisible ? "visible" : "hidden"}
				>
					<div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
						<div>
							<div className="mb-4 inline-flex rounded-2xl bg-blue-500/10 p-4">
								<Target className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
							</div>
							<h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
								La nostra missione
							</h2>
							<p className="text-muted-foreground text-lg leading-relaxed">
								Crediamo che l&apos;apprendimento debba essere accessibile,
								collaborativo e divertente. Forniamo agli studenti di UNIMORE uno
								strumento gratuito e open source per prepararsi efficacemente agli esami
								attraverso quiz interattivi e flashcard personalizzate.
							</p>
						</div>
						<div className="grid grid-cols-2 gap-4">
							{[
								{ value: "100%", label: "Gratuito" },
								{ value: "Open", label: "Source" },
								{ value: "UNIMORE", label: "Focalizzato" },
								{ value: "Community", label: "Driven" },
							].map(stat => (
								<div
									key={stat.label}
									className="bg-card rounded-2xl border p-4 text-center sm:p-6"
								>
									<p className="text-primary text-2xl font-bold sm:text-3xl">
										{stat.value}
									</p>
									<p className="text-muted-foreground mt-1 text-sm">{stat.label}</p>
								</div>
							))}
						</div>
					</div>
				</motion.div>
			</section>

			{/* Values — Bento grid */}
			<section className="py-16 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-12 text-center sm:mb-16">
						<p className="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
							I nostri valori
						</p>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Cosa ci guida
						</h2>
					</div>

					<motion.div
						ref={valuesRef}
						className="grid grid-cols-1 gap-5 sm:grid-cols-2"
						variants={container}
						initial="hidden"
						animate={valuesVisible ? "visible" : "hidden"}
					>
						{values.map(value => {
							const Icon = value.icon;
							return (
								<motion.div
									key={value.title}
									className={`bg-card relative overflow-hidden rounded-2xl border ${value.span}`}
									variants={item}
								>
									<div
										className={`relative flex flex-col gap-4 p-6 sm:p-8 ${value.span ? "sm:flex-row sm:items-start sm:gap-6" : ""}`}
									>
										<div
											className={`inline-flex shrink-0 rounded-2xl p-3 sm:p-4 ${value.bg}`}
										>
											<Icon
												className={`h-6 w-6 sm:h-7 sm:w-7 ${value.color}`}
												strokeWidth={1.5}
												aria-hidden
											/>
										</div>

										<div className="min-w-0">
											<h3 className="mb-1.5 text-lg font-semibold tracking-tight">
												{value.title}
											</h3>
											<p className="text-muted-foreground text-sm font-medium">
												{value.description}
											</p>
											<p className="text-muted-foreground mt-3 leading-relaxed">
												{value.detail}
											</p>
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</section>

			{/* Tech Stack — Orbiting animation */}
			<section className="full-bleed-band bg-muted/20 border-y py-16 sm:py-24">
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="mb-10 text-center">
						<p className="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
							Stack tecnologico
						</p>
						<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
							Costruito con tecnologie moderne
						</h2>
					</div>
					<OrbitingTechStack />
				</div>
			</section>

			{/* CTA — gradient card full-width */}
			<section className="relative py-16 sm:py-24">
				<div className="pointer-events-none absolute inset-0 -z-10">
					<div className="bg-primary/8 absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full blur-[100px]" />
					<div className="absolute top-0 right-1/4 h-[250px] w-[250px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
				</div>

				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="border-primary/20 from-primary/5 via-card to-card relative overflow-hidden rounded-3xl border bg-gradient-to-br p-8 text-center sm:p-16">
						<div className="bg-primary/10 pointer-events-none absolute -top-20 -left-20 h-60 w-60 rounded-full blur-[80px]" />
						<div className="pointer-events-none absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-orange-300/10 blur-[80px]" />

						<h2 className="relative mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
							Unisciti alla community
						</h2>
						<p className="text-muted-foreground relative mx-auto mb-8 max-w-2xl text-lg">
							Che tu sia uno sviluppatore, un designer o semplicemente uno studente con
							idee, il tuo contributo è prezioso!
						</p>
						<div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
							<Button size="lg" className="shadow-primary/25 shadow-lg" asChild>
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
								<Link to="/contact">
									Contattaci
									<ArrowRight className="ml-2 h-4 w-4" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
