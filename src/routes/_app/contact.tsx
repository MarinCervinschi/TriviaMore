import { createFileRoute } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import {
  ArrowUpRight,
  Bug,
  ChevronDown,
  Github,
  Heart,
  Lightbulb,
  Send,
} from "lucide-react"
import { useState } from "react"

import { ContactForm } from "@/components/contact/contact-form"
import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import { cn } from "@/lib/utils"

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

const quickLinks = [
  {
    icon: Bug,
    title: "Segnala un Bug",
    description: "Hai trovato un problema? Apri una issue su GitHub.",
    color: "text-red-500",
    bg: "bg-red-500/10",
    href: "https://github.com/MarinCervinschi/TriviaMore/issues/new?template=bug_report.md",
  },
  {
    icon: Lightbulb,
    title: "Proponi una Funzionalita'",
    description: "Hai un'idea per migliorare TriviaMore?",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    href: "https://github.com/MarinCervinschi/TriviaMore/issues/new?template=feature_request.md",
  },
  {
    icon: Heart,
    title: "Contribuisci",
    description: "Sviluppatore, designer o appassionato? Aiutaci!",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    href: "https://github.com/MarinCervinschi/TriviaMore",
  },
]

const faqs = [
  {
    q: "Come posso contribuire al progetto?",
    a: "Puoi contribuire in molti modi: sviluppando nuove funzionalita', migliorando il design, aggiungendo contenuti per i corsi, o semplicemente segnalando bug e suggerimenti.",
  },
  {
    q: "TriviaMore e' davvero gratuito?",
    a: "Si', completamente! TriviaMore e' un progetto open source gratuito e sempre lo sara'. E' fatto da studenti per studenti.",
  },
  {
    q: "Posso aggiungere contenuti per il mio corso?",
    a: "Assolutamente! Incoraggiamo gli studenti ad aggiungere quiz e flashcard per i loro corsi. Contattaci per sapere come contribuire con i contenuti.",
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border/50 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-5 text-left transition-colors hover:text-primary"
      >
        <span className="pr-4 font-semibold">{q}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
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
          <p className="leading-relaxed text-muted-foreground">{a}</p>
        </div>
      </div>
    </div>
  )
}

function ContactPage() {
  const prefersReduced = useReducedMotion()

  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal()
  const { ref: linksRef, isVisible: linksVisible } = useScrollReveal()
  const { ref: formRef, isVisible: formVisible } = useScrollReveal()
  const { ref: faqRef, isVisible: faqVisible } = useScrollReveal()

  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
          <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute -right-32 bottom-0 h-[300px] w-[300px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
          <div className="absolute inset-0 dot-pattern" />
        </div>

        <motion.div
          ref={heroRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          variants={container}
          initial="hidden"
          animate={heroVisible ? "visible" : "hidden"}
        >
          <div className="mx-auto max-w-3xl text-center">
            <motion.p
              className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary"
              variants={item}
            >
              Contatti
            </motion.p>
            <motion.h1
              className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              variants={item}
            >
              Parliamo del{" "}
              <span className="gradient-text">tuo progetto</span>
            </motion.h1>
            <motion.p
              className="text-lg leading-relaxed text-muted-foreground sm:text-xl"
              variants={item}
            >
              Hai domande, suggerimenti o vuoi contribuire? Siamo qui per
              ascoltarti.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Quick action links */}
      <section className="border-y bg-muted/20">
        <motion.div
          ref={linksRef}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          variants={container}
          initial="hidden"
          animate={linksVisible ? "visible" : "hidden"}
        >
          <div className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <motion.a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 px-6 py-6 transition-colors hover:bg-muted/50"
                  variants={item}
                >
                  <div className={`shrink-0 rounded-xl p-3 ${link.bg}`}>
                    <Icon
                      className={`h-5 w-5 ${link.color}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{link.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </motion.a>
              )
            })}
          </div>
        </motion.div>
      </section>

      {/* Main content: Form + GitHub */}
      <section className="py-20 sm:py-28">
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
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-8">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-transparent" />

                <div className="relative">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="inline-flex rounded-xl bg-primary/10 p-3">
                      <Send className="h-5 w-5 text-primary" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight">
                        Invia un Messaggio
                      </h2>
                      <p className="text-sm text-muted-foreground">
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
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-muted/50 blur-[40px]" />
                <div className="relative">
                  <Github className="mb-4 h-10 w-10" strokeWidth={1.2} />
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">
                    Contribuisci su GitHub
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    Il modo migliore per contribuire al progetto, segnalare bug
                    o proporre nuove funzionalita'.
                  </p>
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href="https://github.com/MarinCervinschi/TriviaMore"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visita il Repository
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              {/* Guidelines */}
              <div className="rounded-2xl border bg-card p-6 sm:p-8">
                <h3 className="mb-4 text-lg font-semibold tracking-tight">
                  Linee Guida
                </h3>
                <div className="space-y-3">
                  {[
                    "Sii rispettoso e costruttivo",
                    "Fornisci dettagli chiari nei report",
                    "Cerca nelle issue esistenti prima",
                    "Segui le linee guida del progetto",
                  ].map((rule) => (
                    <div key={rule} className="flex items-start gap-3">
                      <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <p className="text-sm text-muted-foreground">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* FAQ — accordion style */}
      <section className="border-t bg-muted/20 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 dot-pattern opacity-30" />
        <motion.div
          ref={faqRef}
          className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
          variants={fadeUp}
          initial="hidden"
          animate={faqVisible ? "visible" : "hidden"}
        >
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Domande Frequenti
            </h2>
          </div>

          <div className="rounded-2xl border bg-card p-6 sm:p-8">
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}
