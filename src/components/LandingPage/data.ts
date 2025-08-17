import { BookOpen, Github, Target, Users } from "lucide-react";

import type {
	BenefitItem,
	CTACardProps,
	FeatureCard,
	FooterSection,
	HeroSectionProps,
} from "./types";

export const heroContent: HeroSectionProps = {
	title:
		"Il successo agli esami UNIMORE è una questione di pratica. Inizia con Trivia More.",
	subtitle:
		"Creata da studenti, per studenti. Un unico spazio collaborativo per mettere alla prova le tue conoscenze e migliorare la tua preparazione agli esami universitari.",
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
		icon: BookOpen,
		title: "Materiale collaborativo",
		description:
			"Quiz, domande e contenuti basati su appunti di studenti reali. Creato dalla community per la community.",
		iconColor: "text-blue-600",
	},
	{
		icon: Target,
		title: "Focus UNIMORE",
		description:
			"Nata per supportare la preparazione degli esami all'Università di Modena e Reggio Emilia, ma pensata per tutti gli studenti.",
		iconColor: "text-green-600",
	},
	{
		icon: Github,
		title: "Open Source",
		description:
			"Codice e contenuti aperti, ospitati su GitHub. Chiunque può contribuire e migliorare la piattaforma.",
		iconColor: "text-purple-600",
	},
	{
		icon: Users,
		title: "Per la community",
		description:
			"Un progetto creato per necessità reali, con l'obiettivo di aiutare altri studenti ad affrontare esami universitari con più sicurezza.",
		iconColor: "text-orange-600",
	},
];

export const benefits: BenefitItem[] = [
	{
		title: "Quiz interattivi con timer",
		description:
			"Metti alla prova le tue conoscenze con quiz cronometrati, feedback istantaneo e spiegazioni dettagliate.",
	},
	{
		title: "Flashcard intelligenti",
		description:
			"Memorizza i concetti chiave con il nostro sistema di flashcard e salva le domande più difficili nei preferiti.",
	},
	{
		title: "Tracciamento progressi",
		description:
			"Monitora i tuoi miglioramenti con analisi dettagliate e statistiche personalizzate sui tuoi risultati.",
	},
	{
		title: "Non a scopo di lucro",
		description:
			"Sviluppata solo per supporto reciproco e come palestra per mettere in pratica competenze tecniche. Completamente gratuita.",
	},
];

export const ctaCardContent: CTACardProps = {
	title: "Pronto per iniziare?",
	description:
		"Unisciti agli studenti che stanno già migliorando la loro preparazione con Trivia More. Contribuisci anche tu alla crescita della piattaforma!",
	buttonText: "Registrati gratuitamente",
	buttonHref: "/auth/register",
	secondaryButtonText: "Contribuisci su GitHub",
	secondaryButtonHref: "https://github.com/MarinCervinschi/TriviaMore",
	disclaimer: "Nessuna carta di credito richiesta • Sempre gratuito • Open Source",
};

export const footerSections: FooterSection[] = [
	{
		title: "Piattaforma",
		links: [
			{ href: "/browse", label: "Esplora contenuti" },
			{ href: "/about", label: "Che cosa è Trivia More" },
			{ href: "/contact", label: "Contattaci" },
		],
	},
	{
		title: "Community",
		links: [
			{ href: "https://github.com/MarinCervinschi/TriviaMore", label: "GitHub" },
			{ href: "/contact", label: "Come contribuire" },
			{ href: "/contact", label: "Centro assistenza" },
		],
	},
	{
		title: "UNIMORE",
		links: [
			{ href: "/browse/dief", label: "Ingegneria" },
			{ href: "/browse/", label: "Scienze" },
			{ href: "/browse/", label: "Economia" },
		],
	},
];
