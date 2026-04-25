import { motion } from "framer-motion"

import {
  CONTENT_LEVELS,
  ContentHierarchyDiagram,
} from "@/components/shared/content-hierarchy-diagram"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { fadeInUp, withReducedMotion } from "@/lib/motion"

export function ContentExplorer() {
  const prefersReduced = useReducedMotion()
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()

  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)

  return (
    <section className="relative py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-muted/30" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left — heading */}
          <motion.div
            ref={headingRef}
            variants={fadeUp}
            initial="hidden"
            animate={headingVisible ? "visible" : "hidden"}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
              Come funziona
            </p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Contenuti organizzati come il tuo piano di studi
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-muted-foreground">
              Ogni contenuto segue la struttura accademica UNIMORE: dal
              dipartimento fino alla sezione su cui esercitarti con quiz e
              flashcard.
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              {CONTENT_LEVELS.map((level) => {
                const Icon = level.icon
                return (
                  <div key={level.label} className="flex items-center gap-2.5">
                    <div className={`rounded-lg p-1.5 ${level.bg}`}>
                      <Icon
                        className={`h-3.5 w-3.5 ${level.color}`}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </div>
                    <span>
                      <span className="font-medium text-foreground">
                        {level.label}
                      </span>
                      {" — "}
                      {level.description}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Right — visual tree diagram */}
          <ContentHierarchyDiagram />
        </div>
      </div>
    </section>
  )
}
