import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import type { HeroContent } from "./data"

export function HeroSection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}: HeroContent) {
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Base warm tone */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 via-background to-background dark:from-orange-950/20 dark:via-background dark:to-background" />
        {/* Animated orbs */}
        <motion.div
          className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"
          animate={prefersReduced ? undefined : { x: [0, 20, 0], y: [0, -15, 0] }}
          transition={prefersReduced ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-orange-300/15 blur-[100px] dark:bg-orange-500/10"
          animate={prefersReduced ? undefined : { x: [0, -18, 0], y: [0, 12, 0] }}
          transition={prefersReduced ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-red-300/10 blur-[80px] dark:bg-red-500/8"
          animate={prefersReduced ? undefined : { x: [0, 10, 0], y: [0, -8, 0] }}
          transition={prefersReduced ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-pattern" />
      </div>

      <motion.div
        className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32 lg:px-8"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          variants={item}
        >
          <Sparkles className="h-4 w-4" />
          <span>Open Source &bull; Gratuito &bull; Per studenti</span>
        </motion.div>

        <motion.h1
          className="mx-auto mb-8 max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          variants={item}
        >
          {title}
        </motion.h1>

        <motion.p
          className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          variants={item}
        >
          {subtitle}
        </motion.p>

        <motion.div
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          variants={item}
        >
          <Button size="lg" className="h-13 px-8 text-base shadow-lg shadow-primary/25" asChild>
            <Link to={primaryCTA.href}>
              {primaryCTA.text}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-13 px-8 text-base backdrop-blur-sm"
            asChild
          >
            <Link to={secondaryCTA.href}>{secondaryCTA.text}</Link>
          </Button>
        </motion.div>

        {/* Stats row */}
        <motion.div
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground sm:gap-12"
          variants={item}
        >
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">100%</span>
            <span>Gratuito</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">Open</span>
            <span>Source</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">UNIMORE</span>
            <span>Focalizzato</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
