import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import {
  ArrowRight,
  Github,
  GraduationCap,
  Heart,
  Lightbulb,
  Target,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { OrbitingTechStack } from "@/components/landing"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"

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

const values = [
  {
    icon: Heart,
    title: "Open Source",
    description:
      "Codice completamente aperto su GitHub. Trasparenza e collaborazione guidano ogni decisione.",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
  {
    icon: Users,
    title: "Community-Driven",
    description:
      "Ogni funzionalita' nasce dalle esigenze reali degli studenti. La community guida lo sviluppo.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    icon: GraduationCap,
    title: "Focalizzato su UNIMORE",
    description:
      "Progettato per i corsi dell'Universita' di Modena e Reggio Emilia, con contenuti curati dagli studenti.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Lightbulb,
    title: "Innovazione Continua",
    description:
      "Tecnologie moderne per un'esperienza di apprendimento coinvolgente e sempre aggiornata.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
]

function AboutPage() {
  const prefersReduced = useReducedMotion()

  const { ref: heroRef, isVisible: heroVisible } = useScrollReveal()
  const { ref: missionRef, isVisible: missionVisible } = useScrollReveal()
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollReveal()

  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="relative">
      {/* Hero with mesh background */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
          <div className="absolute -right-40 top-0 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute -left-40 bottom-0 h-[300px] w-[300px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
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
              Chi Siamo
            </motion.p>
            <motion.h1
              className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl"
              variants={item}
            >
              Studiare insieme,{" "}
              <span className="gradient-text">crescere insieme</span>
            </motion.h1>
            <motion.p
              className="text-lg leading-relaxed text-muted-foreground sm:text-xl"
              variants={item}
            >
              TriviaMore e' una piattaforma open source creata da studenti per
              studenti dell&apos;Universita' di Modena e Reggio Emilia. Nata da
              un&apos;esigenza reale, cresciuta con la community.
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Mission — full-width accent band */}
      <section className="relative border-y bg-muted/30">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <motion.div
          ref={missionRef}
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
          variants={fadeUp}
          initial="hidden"
          animate={missionVisible ? "visible" : "hidden"}
        >
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex rounded-2xl bg-blue-500/10 p-4">
                <Target className="h-8 w-8 text-blue-600" strokeWidth={1.5} />
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                La Nostra Missione
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Crediamo che l&apos;apprendimento debba essere accessibile,
                collaborativo e divertente. Forniamo agli studenti di UNIMORE
                uno strumento gratuito e open source per prepararsi
                efficacemente agli esami attraverso quiz interattivi e
                flashcard personalizzate.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "100%", label: "Gratuito" },
                { value: "Open", label: "Source" },
                { value: "UNIMORE", label: "Focalizzato" },
                { value: "Community", label: "Driven" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border bg-card p-6 text-center"
                >
                  <p className="text-3xl font-bold text-primary">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              I Nostri Valori
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Cosa ci guida
            </h2>
          </div>

          <motion.div
            ref={valuesRef}
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            variants={container}
            initial="hidden"
            animate={valuesVisible ? "visible" : "hidden"}
          >
            {values.map((value) => {
              const Icon = value.icon
              return (
                <motion.div
                  key={value.title}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  variants={item}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div
                    className={`mb-4 inline-flex rounded-2xl p-3 ${value.bg}`}
                  >
                    <Icon
                      className={`h-6 w-6 ${value.color}`}
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Tech Stack — Orbiting animation */}
      <section className="border-y bg-muted/20 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Stack Tecnologico
            </p>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Costruito con tecnologie moderne
            </h2>
          </div>
          <OrbitingTechStack />
        </div>
      </section>

      {/* CTA — gradient card full-width */}
      <section className="relative py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-primary/8 blur-[100px]" />
          <div className="absolute right-1/4 top-0 h-[250px] w-[250px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8 text-center sm:p-16">
            <div className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[80px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-orange-300/10 blur-[80px]" />

            <h2 className="relative mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Unisciti alla Community
            </h2>
            <p className="relative mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
              Che tu sia uno sviluppatore, un designer o semplicemente uno
              studente con idee, il tuo contributo e' prezioso!
            </p>
            <div className="relative flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="shadow-lg shadow-primary/25"
                asChild
              >
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
  )
}
