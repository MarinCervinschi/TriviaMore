import { BookIcon } from "@solar-icons/react/linear/book";
import { Chart2Icon } from "@solar-icons/react/linear/chart-2";
import { CheckCircleIcon } from "@solar-icons/react/linear/check-circle";
import { StopwatchIcon } from "@solar-icons/react/linear/stopwatch";
import { TargetIcon } from "@solar-icons/react/linear/target";
import { UsersGroupRoundedIcon } from "@solar-icons/react/linear/users-group-rounded";

import type { Icon } from "@/components/icons";
import { GithubIcon } from "@/components/icons";

export interface FeatureCard {
	icon: Icon;
	title: string;
	description: string;
	iconColor: string;
	iconBg: string;
}

export interface BenefitItem {
	title: string;
	description: string;
}

export interface CTACardProps {
	title: string;
	description: string;
	buttonText: string;
	buttonHref: string;
	secondaryButtonText?: string;
	secondaryButtonHref?: string;
	disclaimer?: string;
}

export interface FooterSection {
	title: string;
	links: { href: string; label: string }[];
}

export interface ShowcaseFeature {
	id: string;
	icon: Icon;
	title: string;
	description: string;
	highlights: string[];
	iconColor: string;
	iconBg: string;
}

export interface HeroContent {
	title: string;
	subtitle: string;
	primaryCTA: { text: string; href: string };
	secondaryCTA: { text: string; href: string };
}

export const heroContent: HeroContent = {
	title:
		"Il successo agli esami UNIMORE è una questione di pratica. Inizia con Trivia More.",
	subtitle:
		"Il catalogo completo dei tuoi insegnamenti UniMore — dipartimenti, corsi, classi e sezioni — con quiz, simulazioni d'esame, flashcard e dashboard personale. Curato dalla community, gratis e open source.",
	primaryCTA: {
		text: "Inizia subito a studiare",
		href: "/auth/register",
	},
	secondaryCTA: {
		text: "Esplora i contenuti",
		href: "/browse",
	},
};

export const features: FeatureCard[] = [
	{
		icon: BookIcon,
		title: "Materiale collaborativo",
		description:
			"Quiz, domande e contenuti basati su appunti di studenti reali. Creato dalla community per la community.",
		iconColor: "text-blue-600",
		iconBg: "bg-blue-500/10",
	},
	{
		icon: TargetIcon,
		title: "Focus UNIMORE",
		description:
			"Nata per supportare la preparazione degli esami all'Università di Modena e Reggio Emilia, ma pensata per tutti gli studenti.",
		iconColor: "text-green-600",
		iconBg: "bg-green-500/10",
	},
	{
		icon: GithubIcon,
		title: "Open Source",
		description:
			"Codice e contenuti aperti, ospitati su GitHub. Chiunque può contribuire e migliorare la piattaforma.",
		iconColor: "text-purple-600",
		iconBg: "bg-purple-500/10",
	},
	{
		icon: UsersGroupRoundedIcon,
		title: "Per la community",
		description:
			"Un progetto creato per necessità reali, con l'obiettivo di aiutare altri studenti ad affrontare esami universitari con più sicurezza.",
		iconColor: "text-orange-600",
		iconBg: "bg-orange-500/10",
	},
];

export const benefits: BenefitItem[] = [
	{
		title: "Preparazione che funziona",
		description:
			"Domande scritte da chi ha già superato gli esami, non estratte da manuali generici. Studi quello che conta davvero.",
	},
	{
		title: "Trova subito il tuo corso",
		description:
			"Contenuti organizzati per dipartimento, corso e sezione — esattamente come il tuo piano di studi UNIMORE.",
	},
	{
		title: "Studia come preferisci",
		description:
			"Quiz con timer per simulare l'esame, modalità studio per ripassare con calma, flashcard per memorizzare i concetti chiave.",
	},
	{
		title: "Zero costi, zero pubblicità",
		description:
			"Nessun paywall, nessun abbonamento. Tutto il materiale è accessibile subito, gratis, per sempre.",
	},
];

export const ctaCardContent: CTACardProps = {
	title: "Comincia dal tuo insegnamento",
	description:
		"Il catalogo si consulta senza account: registrarsi serve a salvare i progressi e i segnalibri. Se il tuo corso non c'è ancora, puoi proporlo.",
	buttonText: "Crea un account",
	buttonHref: "/auth/register",
	secondaryButtonText: "Contribuisci su GitHub",
	secondaryButtonHref: "https://github.com/MarinCervinschi/TriviaMore",
	disclaimer: "Gratuito e senza pubblicità • Codice e contenuti aperti su GitHub",
};

export const showcaseFeatures: ShowcaseFeature[] = [
	{
		id: "quiz",
		icon: StopwatchIcon,
		title: "Quiz interattivi con timer",
		description:
			"Metti alla prova le tue conoscenze con quiz cronometrati che simulano l'esperienza d'esame reale.",
		highlights: [
			"Modalità studio e simulazione esame",
			"Timer configurabile con avvisi",
			"Feedback istantaneo con spiegazioni",
			"Navigazione rapida tra domande",
		],
		iconColor: "text-blue-600",
		iconBg: "bg-blue-500/10",
	},
	{
		id: "dashboard",
		icon: Chart2Icon,
		title: "Dashboard personale",
		description:
			"Tieni sotto controllo la tua preparazione con statistiche dettagliate e attività recenti.",
		highlights: [
			"Statistiche quiz e punteggi",
			"Insegnamenti visti di recente",
			"Panoramica progressi per materia",
			"Accesso rapido alle azioni frequenti",
		],
		iconColor: "text-green-600",
		iconBg: "bg-green-500/10",
	},
	{
		id: "progress",
		icon: CheckCircleIcon,
		title: "Tracciamento progressi",
		description:
			"Monitora i tuoi miglioramenti con grafici dettagliati e analisi personalizzate.",
		highlights: [
			"Grafici interattivi con Recharts",
			"Analisi per materia e periodo",
			"Trend di miglioramento nel tempo",
			"Dettaglio performance per quiz",
		],
		iconColor: "text-orange-600",
		iconBg: "bg-orange-500/10",
	},
];

export const footerSections: FooterSection[] = [
	{
		title: "Piattaforma",
		links: [
			{ href: "/browse", label: "Esplora contenuti" },
			{ href: "/news", label: "Novità" },
			{ href: "/about", label: "Che cosa è Trivia More" },
			{ href: "/contact", label: "Contattaci" },
		],
	},
	{
		title: "Community",
		links: [
			{
				href: "https://github.com/MarinCervinschi/TriviaMore",
				label: "GitHub",
			},
			{ href: "/contact", label: "Come contribuire" },
			{ href: "/contact", label: "Centro assistenza" },
		],
	},
	{
		title: "Legale",
		links: [
			{ href: "/legal/terms", label: "Termini e Condizioni" },
			{ href: "/legal/privacy", label: "Privacy Policy" },
			{ href: "/legal/cookies", label: "Cookie Policy" },
		],
	},
];
