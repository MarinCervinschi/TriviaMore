import { motion } from "framer-motion"

import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { fadeInUp, withReducedMotion } from "@/lib/motion"

export function LoadingPage() {
  const prefersReduced = useReducedMotion()
  const variants = withReducedMotion(fadeInUp, prefersReduced)

  return (
    <div className="relative flex min-h-[60vh] items-center justify-center overflow-hidden">
      {/* Background texture */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 dot-pattern opacity-40" />

        {/* Decorative orbs with slow drift */}
        <motion.div
          className="absolute -left-24 top-1/3 h-[300px] w-[300px] rounded-full bg-primary/8 blur-[80px]"
          animate={prefersReduced ? undefined : { x: [0, 15, 0], y: [0, -10, 0] }}
          transition={prefersReduced ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 bottom-1/4 h-[250px] w-[250px] rounded-full bg-orange-300/10 blur-[70px] dark:bg-orange-500/8"
          animate={prefersReduced ? undefined : { x: [0, -12, 0], y: [0, 8, 0] }}
          transition={prefersReduced ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        className="flex flex-col items-center"
        variants={variants}
        initial="hidden"
        animate="visible"
      >
        <LoadingSpinner size="lg" text="Caricamento..." />
      </motion.div>
    </div>
  )
}
