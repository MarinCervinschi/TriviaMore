import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  GraduationCap,
  BookOpen,
  FileText,
} from "lucide-react"

import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import {
  fadeInUp,
  staggerContainer,
  staggerItem,
  withReducedMotion,
} from "@/lib/motion"
import type { PlatformStats } from "@/lib/browse/server"
import type { LucideIcon } from "lucide-react"

function useAnimatedCounter(
  target: number,
  isVisible: boolean,
  prefersReduced: boolean,
  duration = 2000,
) {
  const [count, setCount] = useState(0)
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!isVisible || hasAnimated.current || target === 0) return
    hasAnimated.current = true

    if (prefersReduced) {
      setCount(target)
      return
    }

    const startTime = performance.now()
    let raf: number

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        raf = requestAnimationFrame(animate)
      }
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isVisible, target, prefersReduced, duration])

  return count
}

interface StatItemProps {
  icon: LucideIcon
  value: number
  label: string
  color: string
  bg: string
  isVisible: boolean
  prefersReduced: boolean
}

function StatItem({
  icon: Icon,
  value,
  label,
  color,
  bg,
  isVisible,
  prefersReduced,
}: StatItemProps) {
  const animatedValue = useAnimatedCounter(value, isVisible, prefersReduced)

  return (
    <div className="group relative overflow-hidden rounded-2xl border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className={`mx-auto mb-4 inline-flex rounded-2xl p-3 ${bg}`}>
        <Icon className={`h-6 w-6 ${color}`} strokeWidth={1.5} />
      </div>

      <p className="relative text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
        {animatedValue.toLocaleString("it-IT")}
      </p>

      <p className="relative mt-2 text-sm font-medium text-muted-foreground sm:text-base">
        {label}
      </p>
    </div>
  )
}

const statConfig: {
  key: keyof PlatformStats
  icon: LucideIcon
  label: string
  color: string
  bg: string
}[] = [
  {
    key: "departments",
    icon: Building2,
    label: "Dipartimenti",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "courses",
    icon: GraduationCap,
    label: "Corsi di Laurea",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    key: "classes",
    icon: BookOpen,
    label: "Corsi",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    key: "sections",
    icon: FileText,
    label: "Sezioni",
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
]

export function PlatformStatsSection({
  stats,
}: {
  stats: PlatformStats
}) {
  const prefersReduced = useReducedMotion()
  const { ref: headingRef, isVisible: headingVisible } = useScrollReveal()
  const { ref: gridRef, isVisible: gridVisible } = useScrollReveal()

  const fadeUp = withReducedMotion(fadeInUp, prefersReduced)
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -left-32 top-1/3 h-[350px] w-[350px] rounded-full bg-primary/8 blur-[100px]"
          animate={prefersReduced ? undefined : { x: [0, 20, 0], y: [0, -15, 0] }}
          transition={prefersReduced ? undefined : { duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-32 bottom-1/4 h-[300px] w-[300px] rounded-full bg-blue-400/8 blur-[80px]"
          animate={prefersReduced ? undefined : { x: [0, -15, 0], y: [0, 10, 0] }}
          transition={prefersReduced ? undefined : { duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={headingRef}
          className="mb-16 text-center"
          variants={fadeUp}
          initial="hidden"
          animate={headingVisible ? "visible" : "hidden"}
        >
          <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
            La Piattaforma in Numeri
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Cresce ogni giorno grazie alla community
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Studenti come te contribuiscono con nuove domande, correzioni e
            materiale. Ecco cosa abbiamo costruito insieme.
          </p>
        </motion.div>

        <motion.div
          ref={gridRef}
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate={gridVisible ? "visible" : "hidden"}
        >
          {statConfig.map((cfg) => (
            <motion.div key={cfg.key} variants={item}>
              <StatItem
                icon={cfg.icon}
                value={stats[cfg.key]}
                label={cfg.label}
                color={cfg.color}
                bg={cfg.bg}
                isVisible={gridVisible}
                prefersReduced={prefersReduced}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
