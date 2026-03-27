import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import type { BenefitItem, CTACardProps } from "./data"

function BenefitItemComponent({
  benefit,
  index,
}: {
  benefit: BenefitItem
  index: number
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {index + 1}
      </div>
      <div>
        <h3 className="mb-1 font-semibold tracking-tight">{benefit.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {benefit.description}
        </p>
      </div>
    </div>
  )
}

function CTACard({
  title,
  description,
  buttonText,
  buttonHref,
  secondaryButtonText,
  secondaryButtonHref,
  disclaimer,
}: CTACardProps) {
  const prefersReduced = useReducedMotion()
  const { ref, isVisible } = useScrollReveal()
  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)

  return (
    <motion.div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card p-8 sm:p-10"
      variants={fadeUp}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* Decorative orb with drift */}
      <motion.div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]"
        animate={prefersReduced ? undefined : { x: [0, 10, 0], y: [0, -8, 0] }}
        transition={prefersReduced ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <h3 className="mb-3 text-2xl font-bold tracking-tight">{title}</h3>
      <p className="mb-8 text-muted-foreground">{description}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button size="lg" className="shadow-lg shadow-primary/25" asChild>
          <Link to={buttonHref}>
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        {secondaryButtonText && secondaryButtonHref && (
          <Button size="lg" variant="outline" asChild>
            <a
              href={secondaryButtonHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" />
              {secondaryButtonText}
            </a>
          </Button>
        )}
      </div>

      {disclaimer && (
        <div className="mt-6 flex flex-wrap items-center gap-x-1 text-xs text-muted-foreground">
          {disclaimer.split("•").map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-green-500" />
              {item.trim()}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export function BenefitsSection({
  benefits,
  ctaCard,
}: {
  benefits: BenefitItem[]
  ctaCard: CTACardProps
}) {
  const prefersReduced = useReducedMotion()
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()
  const { ref: listRef, isVisible: listVisible } = useScrollReveal()

  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Benefits */}
        <div className="mb-20 grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <motion.div
            ref={headingRef}
            variants={fadeUp}
            initial="hidden"
            animate={headingVisible ? "visible" : "hidden"}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Perche' TriviaMore
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Progettato per il tuo successo
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Ogni funzionalita' e' pensata per aiutarti a prepararti meglio,
              piu' velocemente e con piu' sicurezza.
            </p>
          </motion.div>

          <motion.div
            ref={listRef}
            className="space-y-6"
            variants={container}
            initial="hidden"
            animate={listVisible ? "visible" : "hidden"}
          >
            {benefits.map((benefit, i) => (
              <motion.div key={benefit.title} variants={item}>
                <BenefitItemComponent benefit={benefit} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <CTACard {...ctaCard} />
      </div>
    </section>
  )
}
