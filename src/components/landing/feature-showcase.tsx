import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import { cn } from "@/lib/utils"
import type { ShowcaseFeature } from "./data"

// TODO: Replace placeholders with real <img src="/screenshots/..." /> once screenshots are captured
function ScreenshotPlaceholder({ feature }: { feature: ShowcaseFeature }) {
  return (
    <div className="h-full w-full rounded-2xl border bg-card p-4 shadow-inner">
      {/* Window chrome */}
      <div className="mb-3 flex items-center gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
        <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
        <div className="ml-2 h-4 w-32 rounded-md bg-muted" />
      </div>

      {/* Content based on feature type */}
      {feature.id === "quiz" && <QuizMockup />}
      {/* TODO: replace with real screenshot when ready */}
      {/* {feature.id === "dashboard" && (
        <img
          src="/screenshots/dashboard.png"
          alt="Dashboard utente"
          className="w-full rounded-xl"
          loading="lazy"
        />
      )} */}
      {feature.id === "dashboard" && <DashboardMockup />}
      {feature.id === "flashcards" && <FlashcardMockup />}
      {feature.id === "progress" && <ProgressMockup />}
    </div>
  )
}

function QuizMockup() {
  return (
    <div className="space-y-3">
      {/* Timer bar */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded-full bg-muted" />
        <div className="h-2 flex-1 mx-4 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-3/5 rounded-full gradient-bg" />
        </div>
        <div className="h-3 w-12 rounded-full bg-primary/20" />
      </div>
      {/* Question */}
      <div className="rounded-xl border bg-background p-3">
        <div className="mb-2 h-3 w-3/4 rounded bg-muted" />
        <div className="h-3 w-1/2 rounded bg-muted" />
      </div>
      {/* Answer options */}
      <div className="grid grid-cols-1 gap-2">
        {[false, true, false, false].map((active, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl border p-2.5 transition-colors",
              active ? "border-primary bg-primary/10" : "bg-background",
            )}
          >
            <div className={cn("h-2.5 rounded", active ? "w-2/3 bg-primary/40" : "w-3/5 bg-muted")} />
          </div>
        ))}
      </div>
    </div>
  )
}

function DashboardMockup() {
  return (
    <div className="space-y-3">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-2">
        {["bg-blue-500/10", "bg-green-500/10", "bg-purple-500/10", "bg-orange-500/10"].map((bg, i) => (
          <div key={i} className={cn("rounded-xl border p-3", bg)}>
            <div className="mb-1.5 h-2 w-8 rounded bg-muted" />
            <div className="h-4 w-12 rounded bg-foreground/20" />
          </div>
        ))}
      </div>
      {/* Recent activity */}
      <div className="rounded-xl border bg-background p-3">
        <div className="mb-2 h-2.5 w-24 rounded bg-muted" />
        {[0.8, 0.6, 0.7].map((w, i) => (
          <div key={i} className="mb-1.5 flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-muted" />
            <div className="h-2" style={{ width: `${w * 100}%` }}>
              <div className="h-full rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FlashcardMockup() {
  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Progress */}
      <div className="flex w-full items-center gap-2">
        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
          <div className="h-full w-2/5 rounded-full gradient-bg" />
        </div>
        <div className="h-3 w-16 rounded bg-muted" />
      </div>
      {/* Flashcard */}
      <div className="w-full rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-card p-6 text-center">
        <div className="mx-auto mb-3 h-3 w-3/4 rounded bg-muted" />
        <div className="mx-auto mb-4 h-3 w-1/2 rounded bg-muted" />
        <div className="mx-auto h-6 w-24 rounded-lg bg-primary/15" />
      </div>
      {/* Nav buttons */}
      <div className="flex gap-2">
        <div className="h-8 w-20 rounded-xl bg-muted" />
        <div className="h-8 w-20 rounded-xl bg-primary/20" />
      </div>
    </div>
  )
}

function ProgressMockup() {
  return (
    <div className="space-y-3">
      {/* Chart area */}
      <div className="rounded-xl border bg-background p-3">
        <div className="mb-2 h-2.5 w-20 rounded bg-muted" />
        <div className="flex items-end gap-1.5 h-20">
          {[0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.75].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-primary/30"
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        {["bg-green-500/10", "bg-blue-500/10", "bg-orange-500/10"].map((bg, i) => (
          <div key={i} className={cn("rounded-xl border p-2 text-center", bg)}>
            <div className="mx-auto mb-1 h-3 w-8 rounded bg-foreground/20" />
            <div className="mx-auto h-2 w-12 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

function ShowcaseRow({
  feature,
  index,
}: {
  feature: ShowcaseFeature
  index: number
}) {
  const isReversed = index % 2 !== 0
  const prefersReduced = useReducedMotion()
  const { ref, isVisible } = useScrollReveal()

  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)
  const slideVariant = withReducedMotion(
    isReversed ? slideInLeft : slideInRight,
    prefersReduced,
  )

  const Icon = feature.icon

  return (
    <motion.div
      ref={ref}
      className="grid items-center gap-8 lg:gap-16 grid-cols-1 lg:grid-cols-2"
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
    >
      {/* Text side */}
      <motion.div
        className={isReversed ? "lg:order-2" : ""}
        variants={container}
      >
        <motion.div
          className={cn("mb-4 inline-flex rounded-2xl p-3", feature.iconBg)}
          variants={item}
        >
          <Icon className={cn("h-7 w-7", feature.iconColor)} strokeWidth={1.5} />
        </motion.div>

        <motion.h3
          className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
          variants={item}
        >
          {feature.title}
        </motion.h3>

        <motion.p
          className="mb-6 text-lg leading-relaxed text-muted-foreground"
          variants={item}
        >
          {feature.description}
        </motion.p>

        <motion.ul className="space-y-3" variants={item}>
          {feature.highlights.map((highlight) => (
            <li key={highlight} className="flex items-start gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
              <span className="text-muted-foreground">{highlight}</span>
            </li>
          ))}
        </motion.ul>
      </motion.div>

      {/* Screenshot side with 3D perspective */}
      <motion.div
        className={isReversed ? "lg:order-1" : ""}
        variants={slideVariant}
      >
        <div className="[perspective:1200px]">
          <div
            className="transition-transform duration-500 hover:[transform:rotateY(0deg)_rotateX(0deg)]"
            style={{
              transform: isReversed
                ? "rotateY(6deg) rotateX(3deg)"
                : "rotateY(-6deg) rotateX(3deg)",
            }}
          >
            <div className="relative overflow-hidden rounded-2xl border shadow-2xl">
              <ScreenshotPlaceholder feature={feature} />
              {/* Gradient overlay for depth */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function FeatureShowcase({
  features,
}: {
  features: ShowcaseFeature[]
}) {
  const prefersReduced = useReducedMotion()
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()
  const headingItem = withReducedMotion(staggerItem, prefersReduced)
  const headingContainer = withReducedMotion(staggerContainer, prefersReduced)

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute -left-40 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute -right-40 bottom-1/4 h-[350px] w-[350px] rounded-full bg-orange-300/8 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          ref={headingRef}
          className="mb-20 text-center"
          variants={headingContainer}
          initial="hidden"
          animate={headingVisible ? "visible" : "hidden"}
        >
          <motion.p
            className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary"
            variants={headingItem}
          >
            Funzionalita'
          </motion.p>
          <motion.h2
            className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            variants={headingItem}
          >
            Scopri cosa puoi fare con{" "}
            <span className="gradient-text">TriviaMore</span>
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-lg text-muted-foreground"
            variants={headingItem}
          >
            Strumenti pensati per uno studio efficace e una preparazione
            ottimale agli esami.
          </motion.p>
        </motion.div>

        {/* Alternating feature rows */}
        <div className="space-y-20 lg:space-y-28">
          {features.map((feature, i) => (
            <ShowcaseRow key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
