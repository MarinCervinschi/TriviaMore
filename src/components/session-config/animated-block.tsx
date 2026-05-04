import type { ReactNode } from "react"
import { motion } from "framer-motion"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import {
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"

type AnimatedProps = {
  children: ReactNode
  className?: string
}

/**
 * Stagger orchestrator. Wrap a list of {@link AnimatedBlock} children to
 * cascade their entrance once the dialog opens.
 */
export function AnimatedStack({ children, className }: AnimatedProps) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={withReducedMotion(staggerContainer, prefersReduced)}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  )
}

/** Single block participating in the parent {@link AnimatedStack}. */
export function AnimatedBlock({ children, className }: AnimatedProps) {
  const prefersReduced = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={withReducedMotion(staggerItem, prefersReduced)}
    >
      {children}
    </motion.div>
  )
}
