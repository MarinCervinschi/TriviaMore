import { motion } from "framer-motion"
import {
  Building2,
  GraduationCap,
  BookOpen,
  FileText,
  ChevronDown,
} from "lucide-react"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import type { LucideIcon } from "lucide-react"

interface TreeLevel {
  icon: LucideIcon
  label: string
  example: string
  color: string
  bg: string
  borderColor: string
}

const levels: TreeLevel[] = [
  {
    icon: Building2,
    label: "Dipartimento",
    example: "Ingegneria \"Enzo Ferrari\"",
    color: "text-primary",
    bg: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  {
    icon: GraduationCap,
    label: "Corso di Laurea",
    example: "Ingegneria Informatica",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    icon: BookOpen,
    label: "Corso",
    example: "Basi di Dati",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    icon: FileText,
    label: "Sezione",
    example: "SQL e Algebra Relazionale",
    color: "text-green-600",
    bg: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
]

function TreeNode({
  level,
  isLast,
}: {
  level: TreeLevel
  isLast: boolean
}) {
  const Icon = level.icon

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative w-full max-w-xs rounded-2xl border ${level.borderColor} bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-5`}
      >
        <div className="flex items-center gap-3">
          <div className={`shrink-0 rounded-xl p-2.5 ${level.bg}`}>
            <Icon className={`h-5 w-5 ${level.color}`} strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs font-semibold uppercase tracking-wider ${level.color}`}>
              {level.label}
            </p>
            <p className="truncate text-sm font-medium">{level.example}</p>
          </div>
        </div>
      </div>

      {/* Connector arrow */}
      {!isLast && (
        <div className="flex flex-col items-center py-2">
          <div className="h-4 w-px bg-border" />
          <ChevronDown className="h-4 w-4 -mt-1 text-muted-foreground/60" strokeWidth={1.5} />
        </div>
      )}
    </div>
  )
}

export function ContentExplorer() {
  const prefersReduced = useReducedMotion()
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()
  const { ref: treeRef, isVisible: treeVisible } = useScrollReveal()

  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

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
              {levels.map((level, i) => {
                const Icon = level.icon
                return (
                  <div key={level.label} className="flex items-center gap-2.5">
                    <div className={`rounded-lg p-1.5 ${level.bg}`}>
                      <Icon className={`h-3.5 w-3.5 ${level.color}`} strokeWidth={1.5} />
                    </div>
                    <span>
                      <span className="font-medium text-foreground">{level.label}</span>
                      {" — "}
                      {i === 0 && "la facolta' di riferimento"}
                      {i === 1 && "il percorso di laurea"}
                      {i === 2 && "la materia specifica"}
                      {i === 3 && "l'argomento su cui esercitarti"}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Right — visual tree diagram */}
          <motion.div
            ref={treeRef}
            className="flex justify-center"
            variants={container}
            initial="hidden"
            animate={treeVisible ? "visible" : "hidden"}
          >
            <div className="flex flex-col items-center">
              {levels.map((level, i) => (
                <motion.div key={level.label} variants={item}>
                  <TreeNode
                    level={level}
                    isLast={i === levels.length - 1}
                  />
                </motion.div>
              ))}

              {/* Final label */}
              <motion.p
                variants={item}
                className="mt-4 rounded-full bg-green-500/10 px-4 py-1.5 text-xs font-semibold text-green-600"
              >
                Quiz & Flashcard pronti
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
