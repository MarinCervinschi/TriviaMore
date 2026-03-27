import { Link, useRouter } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { AlertTriangle, Home, RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import {
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"

export function ErrorPage({
  error,
}: {
  error: Error
}) {
  const router = useRouter()
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute -right-24 top-1/3 h-[350px] w-[350px] rounded-full bg-destructive/8 blur-[90px]" />
      </div>

      <motion.div
        className="relative flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Icon with glow */}
        <motion.div className="mb-6" variants={item}>
          <div className="relative inline-flex rounded-3xl bg-destructive/10 p-6">
            <div className="pointer-events-none absolute inset-0 rounded-3xl shadow-[0_0_30px_hsl(var(--destructive)/0.15)]" />
            <AlertTriangle className="relative h-12 w-12 text-destructive" strokeWidth={1.5} />
          </div>
        </motion.div>

        <motion.h1
          className="text-2xl font-bold sm:text-3xl"
          variants={item}
        >
          Qualcosa è andato storto
        </motion.h1>

        <motion.p
          className="mt-3 max-w-md text-muted-foreground"
          variants={item}
        >
          Si è verificato un errore imprevisto. Riprova o torna alla home.
        </motion.p>

        {/* Dev error message */}
        {import.meta.env.DEV && error.message && (
          <motion.pre
            className="mt-6 max-w-lg overflow-auto rounded-2xl border bg-muted/50 p-4 text-left font-mono text-xs text-muted-foreground"
            variants={item}
          >
            {error.message}
          </motion.pre>
        )}

        {/* Buttons */}
        <motion.div className="mt-10 flex gap-3" variants={item}>
          <Button onClick={() => router.invalidate()}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Riprova
          </Button>
          <Button variant="outline" asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Torna alla home
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
