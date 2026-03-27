import type { Variants, Transition } from "framer-motion"

// --- Transition presets ---

export const springGentle: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 30,
  duration: 0.4,
}

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 30,
  duration: 0.2,
}

export const easeFade: Transition = {
  duration: 0.3,
  ease: "easeOut",
}

// --- Variant collections ---

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: springGentle },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: easeFade },
}

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: springGentle },
}

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: springGentle },
}

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: springGentle },
}

// --- Stagger orchestration ---

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springGentle,
  },
}

// --- Reduced motion helper ---

export function withReducedMotion(
  variants: Variants,
  prefersReduced: boolean,
): Variants {
  if (!prefersReduced) return variants

  const reduced: Variants = {}
  for (const key in variants) {
    const variant = variants[key]
    if (typeof variant === "object" && variant !== null) {
      const { x, y, scale, rotate, ...rest } = variant as Record<string, unknown>
      reduced[key] = {
        ...rest,
        x: 0,
        y: 0,
        scale: 1,
        rotate: 0,
        transition: { duration: 0 },
      }
    } else {
      reduced[key] = variant
    }
  }
  return reduced
}
