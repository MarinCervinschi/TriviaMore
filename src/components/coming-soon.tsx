import { motion } from "framer-motion"
import { Construction, Github, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"

export function ComingSoon() {
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Mesh gradient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 via-background to-background dark:from-orange-950/20 dark:via-background dark:to-background" />
        <motion.div
          className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[100px]"
          animate={prefersReduced ? undefined : { x: [0, 20, 0], y: [0, -15, 0] }}
          transition={
            prefersReduced
              ? undefined
              : { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-orange-300/15 blur-[100px] dark:bg-orange-500/10"
          animate={prefersReduced ? undefined : { x: [0, -18, 0], y: [0, 12, 0] }}
          transition={
            prefersReduced
              ? undefined
              : { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <div className="absolute inset-0 dot-pattern" />
      </div>

      <motion.div
        className="mx-auto max-w-2xl px-4 text-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div className="mb-10 flex justify-center" variants={item}>
          <Logo size="lg" />
        </motion.div>

        {/* Badge */}
        <motion.div
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm"
          variants={item}
        >
          <Construction className="h-4 w-4" />
          <span>Versione 3.0 in arrivo</span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          variants={item}
        >
          <span className="gradient-text">Stiamo costruendo</span>
          <br />
          qualcosa di nuovo
        </motion.h1>

        {/* Description */}
        <motion.p
          className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl"
          variants={item}
        >
          TriviaMore sta per tornare, completamente rinnovato.
          <br className="hidden sm:block" />
          Nuova piattaforma, stessa missione: aiutarti a studiare meglio.
        </motion.p>

        {/* Features preview */}
        <motion.div
          className="mb-10 flex flex-wrap items-center justify-center gap-3"
          variants={item}
        >
          {["Quiz migliorati", "Flashcard", "Nuova UI", "Open Source"].map(
            (feature) => (
              <span
                key={feature}
                className="rounded-full border border-border/50 bg-card/50 px-3 py-1 text-sm text-muted-foreground backdrop-blur-sm"
              >
                <Sparkles className="mr-1 inline h-3 w-3 text-primary" />
                {feature}
              </span>
            ),
          )}
        </motion.div>

        {/* GitHub link */}
        <motion.div variants={item}>
          <Button variant="outline" className="h-12 px-6 text-base backdrop-blur-sm" asChild>
            <a
              href="https://github.com/MarinCervinschi/TriviaMore"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-5 w-5" />
              Seguici su GitHub
            </a>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
