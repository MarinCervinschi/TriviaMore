import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  Building2,
  Compass,
  FileText,
  GraduationCap,
  HelpCircle,
} from "lucide-react"

import { BrowseHero } from "@/components/browse/browse-hero"
import { Card, CardContent } from "@/components/ui/card"
import {
  BrowseChartSkeleton as ChartSkeleton,
  BrowseOverviewSkeleton,
} from "@/components/skeletons"
import { browseQueries } from "@/lib/browse/queries"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { fadeInUp, staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import type { LucideIcon } from "lucide-react"

const DepartmentBarChart = lazy(() =>
  import("@/components/browse/charts/department-bar-chart").then((m) => ({
    default: m.DepartmentBarChart,
  })),
)
const CourseTypeDonutChart = lazy(() =>
  import("@/components/browse/charts/course-type-donut-chart").then((m) => ({
    default: m.CourseTypeDonutChart,
  })),
)
const CampusBarChart = lazy(() =>
  import("@/components/browse/charts/campus-bar-chart").then((m) => ({
    default: m.CampusBarChart,
  })),
)
const OverviewMap = lazy(() =>
  import("@/components/browse/overview-map").then((m) => ({
    default: m.OverviewMap,
  })),
)

export const Route = createFileRoute("/_app/browse/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.browseOverview()),
  head: () =>
    seoHead({
      title: "Esplora",
      description:
        "Panoramica della piattaforma TriviaMore: statistiche, grafici e mappa delle sedi universitarie.",
      path: "/browse",
    }),
  pendingComponent: BrowseOverviewSkeleton,
  component: BrowsePage,
})

// --- Animated counter (reused pattern from platform-stats) ---

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
  }, [target, isVisible, prefersReduced, duration])

  return count
}

// --- Stat card ---

const statConfig: {
  key: keyof typeof statConfig extends never ? never : string
  icon: LucideIcon
  label: string
  color: string
  bg: string
}[] = [
  { key: "departments", icon: Building2, label: "Dipartimenti", color: "text-primary", bg: "bg-primary/10" },
  { key: "courses", icon: GraduationCap, label: "Corsi di Laurea", color: "text-blue-600", bg: "bg-blue-500/10" },
  { key: "classes", icon: BookOpen, label: "Insegnamenti", color: "text-purple-600", bg: "bg-purple-500/10" },
  { key: "sections", icon: FileText, label: "Sezioni", color: "text-green-600", bg: "bg-green-500/10" },
  { key: "questions", icon: HelpCircle, label: "Domande", color: "text-orange-600", bg: "bg-orange-500/10" },
]

function StatCard({
  stat,
  value,
  isVisible,
  prefersReduced,
}: {
  stat: (typeof statConfig)[number]
  value: number
  isVisible: boolean
  prefersReduced: boolean
}) {
  const count = useAnimatedCounter(value, isVisible, prefersReduced)
  const Icon = stat.icon

  return (
    <motion.div variants={withReducedMotion(staggerItem, prefersReduced)}>
      <div className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
            <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {count.toLocaleString("it-IT")}
            </p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}


// --- Main page ---

function BrowsePage() {
  const { data: overview } = useSuspenseQuery(browseQueries.browseOverview())
  const prefersReduced = useReducedMotion()

  const { ref: statsRef, isVisible: statsVisible } = useScrollReveal()
  const { ref: chartsRef, isVisible: chartsVisible } = useScrollReveal()
  const { ref: mapRef, isVisible: mapVisible } = useScrollReveal()
  const { ref: navRef, isVisible: navVisible } = useScrollReveal()

  return (
    <div>
      {/* Hero */}
      <BrowseHero
        icon={Compass}
        title="Esplora TriviaMore"
        description="Scopri l'offerta formativa dell'Universita' di Modena e Reggio Emilia: dipartimenti, corsi, insegnamenti e quiz."
      />

      {/* Stats */}
      <section ref={statsRef} className="container py-8">
        <motion.div
          variants={withReducedMotion(staggerContainer, prefersReduced)}
          initial="hidden"
          animate={statsVisible ? "visible" : "hidden"}
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5"
        >
          {statConfig.map((stat) => (
            <StatCard
              key={stat.key}
              stat={stat}
              value={(overview.stats as any)[stat.key] ?? 0}
              isVisible={statsVisible}
              prefersReduced={prefersReduced}
            />
          ))}
        </motion.div>
      </section>

      {/* Navigation */}
      <section ref={navRef} className="container pb-4">
        <motion.div
          variants={withReducedMotion(fadeInUp, prefersReduced)}
          initial="hidden"
          animate={navVisible ? "visible" : "hidden"}
        >
          <Link to="/departments" className="group block">
            <Card className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Building2 className="h-6 w-6 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    Tutti i dipartimenti
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Esplora i dipartimenti, i corsi di laurea e gli insegnamenti disponibili
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </section>

      {/* Charts */}
      <section ref={chartsRef} className="container py-8">
        <motion.div
          variants={withReducedMotion(fadeInUp, prefersReduced)}
          initial="hidden"
          animate={chartsVisible ? "visible" : "hidden"}
        >
          <h2 className="mb-6 text-xl font-semibold tracking-tight">
            Dati e statistiche
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Suspense fallback={<ChartSkeleton />}>
                <DepartmentBarChart data={overview.coursesByDepartment} />
              </Suspense>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Suspense fallback={<ChartSkeleton />}>
                <CourseTypeDonutChart data={overview.coursesByType} />
              </Suspense>
              <Suspense fallback={<ChartSkeleton />}>
                <CampusBarChart data={overview.coursesByCampus} />
              </Suspense>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Map */}
      <section ref={mapRef} className="container py-8">
        <motion.div
          variants={withReducedMotion(fadeInUp, prefersReduced)}
          initial="hidden"
          animate={mapVisible ? "visible" : "hidden"}
        >
          <Suspense fallback={<ChartSkeleton height={360} />}>
            <OverviewMap locations={overview.locations} />
          </Suspense>
        </motion.div>
      </section>

    </div>
  )
}
