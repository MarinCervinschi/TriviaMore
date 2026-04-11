import {
  BarChart3,
  BookOpen,
  CheckCircle,
  Github,
  Target,
  Timer,
  Users,
} from "lucide-react"

import type { LucideIcon } from "lucide-react"

export interface FeatureCard {
  icon: LucideIcon
  title: string
  description: string
  iconColor: string
  iconBg: string
}

export interface BenefitItem {
  title: string
  description: string
}

export interface CTACardProps {
  title: string
  description: string
  buttonText: string
  buttonHref: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
  disclaimer?: string
}

export interface FooterSection {
  title: string
  links: { href: string; label: string }[]
}

export interface ShowcaseFeature {
  id: string
  icon: LucideIcon
  title: string
  description: string
  highlights: string[]
  iconColor: string
  iconBg: string
}

export interface HeroContent {
  title: string
  subtitle: string
  primaryCTA: { text: string; href: string }
  secondaryCTA: { text: string; href: string }
}

export const heroContent: HeroContent = {
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
    href: "/departments",
  },
}

export const features: FeatureCard[] = [
  {
    icon: BookOpen,
    title: "Materiale collaborativo",
    description:
      "Quiz, domande e contenuti basati su appunti di studenti reali. Creato dalla community per la community.",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
  },
  {
    icon: Target,
    title: "Focus UNIMORE",
    description:
      "Nata per supportare la preparazione degli esami all'Università di Modena e Reggio Emilia, ma pensata per tutti gli studenti.",
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10",
  },
  {
    icon: Github,
    title: "Open Source",
    description:
      "Codice e contenuti aperti, ospitati su GitHub. Chiunque può contribuire e migliorare la piattaforma.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-500/10",
  },
  {
    icon: Users,
    title: "Per la community",
    description:
      "Un progetto creato per necessità reali, con l'obiettivo di aiutare altri studenti ad affrontare esami universitari con più sicurezza.",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-500/10",
  },
]

export const benefits: BenefitItem[] = [
  {
    title: "Preparazione che funziona",
    description:
      "Domande scritte da chi ha gia' superato gli esami, non estratte da manuali generici. Studi quello che conta davvero.",
  },
  {
    title: "Trova subito il tuo corso",
    description:
      "Contenuti organizzati per dipartimento, corso e sezione — esattamente come il tuo piano di studi UNIMORE.",
  },
  {
    title: "Studia come preferisci",
    description:
      "Quiz con timer per simulare l'esame, modalita' studio per ripassare con calma, flashcard per memorizzare i concetti chiave.",
  },
  {
    title: "Zero costi, zero pubblicita'",
    description:
      "Nessun paywall, nessun abbonamento. Tutto il materiale e' accessibile subito, gratis, per sempre.",
  },
]

export const ctaCardContent: CTACardProps = {
  title: "Pronto per iniziare?",
  description:
    "Unisciti agli studenti che stanno già migliorando la loro preparazione con Trivia More. Contribuisci anche tu alla crescita della piattaforma!",
  buttonText: "Registrati gratuitamente",
  buttonHref: "/auth/register",
  secondaryButtonText: "Contribuisci su GitHub",
  secondaryButtonHref: "https://github.com/MarinCervinschi/TriviaMore",
  disclaimer:
    "Nessuna carta di credito richiesta • Sempre gratuito • Open Source",
}

export const showcaseFeatures: ShowcaseFeature[] = [
  {
    id: "quiz",
    icon: Timer,
    title: "Quiz interattivi con timer",
    description:
      "Metti alla prova le tue conoscenze con quiz cronometrati che simulano l'esperienza d'esame reale.",
    highlights: [
      "Modalita' studio e simulazione esame",
      "Timer configurabile con avvisi",
      "Feedback istantaneo con spiegazioni",
      "Navigazione rapida tra domande",
    ],
    iconColor: "text-blue-600",
    iconBg: "bg-blue-500/10",
  },
  {
    id: "dashboard",
    icon: BarChart3,
    title: "Dashboard personale",
    description:
      "Tieni sotto controllo la tua preparazione con statistiche dettagliate e attivita' recenti.",
    highlights: [
      "Statistiche quiz e punteggi",
      "Corsi visualizzati di recente",
      "Panoramica progressi per materia",
      "Accesso rapido alle azioni frequenti",
    ],
    iconColor: "text-green-600",
    iconBg: "bg-green-500/10",
  },
  {
    id: "progress",
    icon: CheckCircle,
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
]

export const footerSections: FooterSection[] = [
  {
    title: "Piattaforma",
    links: [
      { href: "/departments", label: "Esplora contenuti" },
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
    title: "UNIMORE",
    links: [
      { href: "/departments/dief", label: "Ingegneria" },
      { href: "/departments", label: "Scienze" },
      { href: "/departments", label: "Economia" },
    ],
  },
]
