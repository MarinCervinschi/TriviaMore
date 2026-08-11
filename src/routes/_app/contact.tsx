import { useState } from "react";

import { AltArrowDownIcon } from "@solar-icons/react/linear/alt-arrow-down";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { BugIcon } from "@solar-icons/react/linear/bug";
import { HeartIcon } from "@solar-icons/react/linear/heart";
import { LightbulbMinimalisticIcon } from "@solar-icons/react/linear/lightbulb-minimalistic";
import { Plane2Icon } from "@solar-icons/react/linear/plane-2";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";

import { ContactForm } from "@/components/contact/contact-form";
import { GithubIcon } from "@/components/icons";
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
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/contact")({
	component: ContactPage,
	head: () =>
		seoHead({
			title: "Contatti",
			description:
				"Hai domande, suggerimenti o vuoi contribuire al progetto? Contattaci!",
			path: "/contact",
		}),
});

const quickLinks = [
	{
		icon: BugIcon,
		title: "Segnala un bug",
		description: "Hai trovato un problema? Apri una issue su GitHub.",
		color: "text-red-500",
		bg: "bg-red-500/10",
		href: "https://github.com/MarinCervinschi/TriviaMore/issues/new?template=bug_report.md",
	},
	{
		icon: LightbulbMinimalisticIcon,
		title: "Proponi una funzionalità",
		description: "Hai un'idea per migliorare TriviaMore?",
		color: "text-amber-500",
		bg: "bg-amber-500/10",
		href: "https://github.com/MarinCervinschi/TriviaMore/issues/new?template=feature_request.md",
	},
	{
		icon: HeartIcon,
		title: "Contribuisci",
		description: "Sviluppatore, designer o appassionato? Aiutaci!",
		color: "text-pink-500",
		bg: "bg-pink-500/10",
		href: "https://github.com/MarinCervinschi/TriviaMore",
	},
];

const faqs = [
	{
		q: "Come posso contribuire al progetto?",
		a: "Puoi contribuire in molti modi: sviluppando nuove funzionalità, migliorando il design, aggiungendo contenuti per i corsi, o semplicemente segnalando bug e suggerimenti.",
	},
	{
		q: "TriviaMore è davvero gratuito?",
		a: "Sì, completamente! TriviaMore è un progetto open source gratuito e sempre lo sarà. È fatto da studenti per studenti.",
	},
	{
		q: "Posso aggiungere contenuti per il mio corso?",
		a: "Assolutamente! Incoraggiamo gli studenti ad aggiungere quiz e flashcard per i loro corsi. Contattaci per sapere come contribuire con i contenuti.",
	},
];

function FAQItem({ q, a }: { q: string; a: string }) {
	const [open, setOpen] = useState(false);
	return (
		<div className="border-border/50 border-b last:border-0">
			<button
				onClick={() => setOpen(!open)}
				className="hover:text-brand flex w-full items-center justify-between py-5 text-left transition-colors"
			>
				<span className="pr-4 font-semibold">{q}</span>
				<AltArrowDownIcon
					className={cn(
						"text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-200",
						open && "rotate-180"
					)}
				/>
			</button>
			<div
				className={cn(
					"grid transition-all duration-200",
					open ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
				)}
			>
				<div className="overflow-hidden">
					<p className="text-muted-foreground leading-relaxed">{a}</p>
				</div>
			</div>
		</div>
	);
}

function ContactPage() {
	const prefersReduced = useReducedMotion();

	const { ref: heroRef, isVisible: heroVisible } = useScrollReveal();
	const { ref: linksRef, isVisible: linksVisible } = useScrollReveal();
	const { ref: formRef, isVisible: formVisible } = useScrollReveal();
	const { ref: faqRef, isVisible: faqVisible } = useScrollReveal();

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
						<motion.p className="text-brand eyebrow-lg mb-4" variants={item}>
							Contatti
						</motion.p>
						<motion.h1
							className="font-display mb-6 text-4xl leading-[1.1] font-normal tracking-tight sm:text-5xl lg:text-6xl"
							variants={item}
						>
							Parliamo del <span className="gradient-text">tuo progetto</span>
						</motion.h1>
						<motion.p
							className="text-muted-foreground text-lg leading-relaxed sm:text-xl"
							variants={item}
						>
							Hai domande, suggerimenti o vuoi contribuire? Siamo qui per ascoltarti.
						</motion.p>
					</div>
				</motion.div>
			</section>

			{/* Quick action links */}
			<section className="full-bleed-band bg-muted/20 border-y">
				<motion.div
					ref={linksRef}
					className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
					variants={container}
					initial="hidden"
					animate={linksVisible ? "visible" : "hidden"}
				>
					<div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
						{quickLinks.map(link => {
							const Icon = link.icon;
							return (
								<motion.a
									key={link.title}
									href={link.href}
									target="_blank"
									rel="noopener noreferrer"
									className="group hover:bg-muted/50 flex items-center gap-4 px-6 py-6 transition-colors"
									variants={item}
								>
									<div className={`shrink-0 rounded-xl p-3 ${link.bg}`}>
										<Icon className={`h-5 w-5 ${link.color}`} />
									</div>
									<div className="min-w-0 flex-1">
										<p className="font-semibold">{link.title}</p>
										<p className="text-muted-foreground text-sm">{link.description}</p>
									</div>
									<ArrowRightUpIcon className="text-muted-foreground h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
								</motion.a>
							);
						})}
					</div>
				</motion.div>
			</section>

			{/* Main content: Form + GitHub */}
			<section className="py-16 sm:py-24">
				<motion.div
					ref={formRef}
					className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
					variants={container}
					initial="hidden"
					animate={formVisible ? "visible" : "hidden"}
				>
					<div className="grid gap-12 lg:grid-cols-5">
						{/* Form — takes 3 cols */}
						<motion.div className="lg:col-span-3" variants={item}>
							<div className="bg-card relative overflow-hidden rounded-2xl border p-6 sm:p-8">
								<div className="from-primary/3 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />

								<div className="relative">
									<div className="mb-6 flex items-center gap-3">
										<div className="bg-primary/10 inline-flex rounded-xl p-3">
											<Plane2Icon className="text-brand h-5 w-5" />
										</div>
										<div>
											<h2 className="text-xl font-semibold tracking-tight">
												Invia un messaggio
											</h2>
											<p className="text-muted-foreground text-sm">
												Ti risponderemo il prima possibile
											</p>
										</div>
									</div>
									<ContactForm />
								</div>
							</div>
						</motion.div>

						{/* Sidebar — takes 2 cols */}
						<motion.div className="space-y-6 lg:col-span-2" variants={item}>
							{/* GitHub card */}
							<div className="bg-card relative overflow-hidden rounded-2xl border p-6 sm:p-8">
								<div className="bg-muted/50 pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-[40px]" />
								<div className="relative">
									<GithubIcon className="mb-4 h-10 w-10" />
									<h3 className="mb-2 text-lg font-semibold tracking-tight">
										Contribuisci su GitHub
									</h3>
									<p className="text-muted-foreground mb-6 text-sm leading-relaxed">
										Il modo migliore per contribuire al progetto, segnalare bug o
										proporre nuove funzionalità.
									</p>
									<Button variant="outline" className="w-full" asChild>
										<a
											href="https://github.com/MarinCervinschi/TriviaMore"
											target="_blank"
											rel="noopener noreferrer"
										>
											Visita il repository
											<ArrowRightUpIcon className="ml-2 h-4 w-4" />
										</a>
									</Button>
								</div>
							</div>

							{/* Guidelines */}
							<div className="bg-card rounded-2xl border p-6 sm:p-8">
								<h3 className="mb-4 text-lg font-semibold tracking-tight">
									Linee guida
								</h3>
								<div className="space-y-3">
									{[
										"Sii rispettoso e costruttivo",
										"Fornisci dettagli chiari nei report",
										"Cerca nelle issue esistenti prima",
										"Segui le linee guida del progetto",
									].map(rule => (
										<div key={rule} className="flex items-start gap-3">
											<div className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
											<p className="text-muted-foreground text-sm">{rule}</p>
										</div>
									))}
								</div>
							</div>
						</motion.div>
					</div>
				</motion.div>
			</section>

			{/* FAQ — accordion style */}
			<section className="full-bleed-band bg-muted/20 border-t py-16 sm:py-24">
				<motion.div
					ref={faqRef}
					className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
					variants={fadeUp}
					initial="hidden"
					animate={faqVisible ? "visible" : "hidden"}
				>
					<div className="mb-12 text-center">
						<p className="text-brand eyebrow-lg mb-3">FAQ</p>
						<h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
							Domande frequenti
						</h2>
					</div>

					<div className="bg-card rounded-2xl border p-6 sm:p-8">
						{faqs.map(faq => (
							<FAQItem key={faq.q} q={faq.q} a={faq.a} />
						))}
					</div>
				</motion.div>
			</section>
		</div>
	);
}
