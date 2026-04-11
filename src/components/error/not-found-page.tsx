import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { HelpCircle, Home, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import {
  staggerContainer,
  staggerItem,
  scaleIn,
  withReducedMotion,
} from "@/lib/motion"

export function NotFoundPage({
  message = "La pagina che stai cercando non esiste o è stata spostata.",
}: {
  message?: string
}) {
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)
  const scale = withReducedMotion(scaleIn, prefersReduced)

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dot-pattern opacity-40" />
        <div className="absolute -left-32 top-1/4 h-[400px] w-[400px] rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute -right-32 bottom-1/4 h-[350px] w-[350px] rounded-full bg-orange-300/10 blur-[80px] dark:bg-orange-500/8" />
      </div>

      <motion.div
        className="relative flex flex-col items-center"
        variants={container}
        initial="hidden"
        animate="visible"
      >
        {/* Floating question mark */}
        <motion.div
          className="mb-6"
          animate={prefersReduced ? undefined : { y: [0, -10, 0] }}
          transition={prefersReduced ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="inline-flex rounded-3xl bg-primary/10 p-5">
            <HelpCircle className="h-12 w-12 text-primary" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* 404 */}
        <motion.h1
          className="gradient-text text-8xl font-bold tracking-tighter sm:text-9xl"
          variants={scale}
        >
          404
        </motion.h1>

        {/* Playful subheading */}
        <motion.h2
          className="mt-4 text-xl font-semibold sm:text-2xl"
          variants={item}
        >
          Questa domanda non era nel quiz!
        </motion.h2>

        <motion.p
          className="mt-3 max-w-md text-muted-foreground"
          variants={item}
        >
          {message}
        </motion.p>

        {/* Buttons */}
        <motion.div className="mt-10 flex gap-3" variants={item}>
          <Button asChild>
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              Torna alla home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/departments">
              <Search className="mr-2 h-4 w-4" />
              Dipartimenti
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
