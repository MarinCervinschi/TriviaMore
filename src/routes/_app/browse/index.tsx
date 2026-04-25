import { lazy, Suspense, useMemo, useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  Compass,
  FileText,
  Trophy,
} from "lucide-react"

import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { DepartmentCard } from "@/components/browse/department-card"
import { SearchFilter } from "@/components/browse/search-filter"
import { ContentHierarchyDiagram } from "@/components/shared/content-hierarchy-diagram"
import { BrowseOverviewSkeleton } from "@/components/skeletons"
import { Skeleton } from "@/components/ui/skeleton"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { AREA_CONFIG, AREA_LABELS } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import { fadeInUp, staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import { seoHead } from "@/lib/seo"
import { cn } from "@/lib/utils"

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
const QuestionTypeDonutChart = lazy(() =>
  import("@/components/browse/charts/question-type-donut-chart").then((m) => ({
    default: m.QuestionTypeDonutChart,
  })),
)
const OverviewMap = lazy(() =>
  import("@/components/browse/overview-map").then((m) => ({
    default: m.OverviewMap,
  })),
)

export const Route = createFileRoute("/_app/browse/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(browseQueries.browseOverview()),
      context.queryClient.ensureQueryData(browseQueries.departments()),
    ])
  },
  head: () =>
    seoHead({
      title: "Esplora",
      description:
        "Esplora i dipartimenti, i corsi e gli insegnamenti dell'Universita' di Modena e Reggio Emilia su TriviaMore.",
      path: "/browse",
    }),
  pendingComponent: BrowseOverviewSkeleton,
  component: BrowsePage,
})

function BrowsePage() {
  const { data: overview } = useSuspenseQuery(browseQueries.browseOverview())
  const { data: departments } = useSuspenseQuery(browseQueries.departments())
  const prefersReduced = useReducedMotion()

  const { ref: deptRef, isVisible: deptVisible } = useScrollReveal()
  const { ref: hierarchyRef, isVisible: hierarchyVisible } = useScrollReveal()
  const { ref: dataRef, isVisible: dataVisible } = useScrollReveal()

  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")

  const availableAreas = useMemo(
    () =>
      [
        ...new Set(departments.flatMap((d) => (d.area ? [d.area] : []))),
      ].sort(),
    [departments],
  )

  const filteredDepartments = useMemo(() => {
    const byArea =
      areaFilter === "all"
        ? departments
        : departments.filter((d) => d.area === areaFilter)
    const q = search.toLowerCase().trim()
    if (!q) return byArea
    return byArea.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q),
    )
  }, [departments, areaFilter, search])

  return (
    <div>
      {/* Hero + toolbar — single tight block */}
      <section
        ref={deptRef}
        id="dipartimenti"
        className="container pt-10 pb-12 sm:pt-14"
      >
        <motion.div
          variants={withReducedMotion(fadeInUp, prefersReduced)}
          initial="hidden"
          animate={deptVisible ? "visible" : "hidden"}
        >
          <div className="mb-4 inline-flex rounded-2xl bg-primary/10 p-3">
            <Compass className="h-7 w-7 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Esplora UNIMORE
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Naviga la struttura accademica completa: dipartimenti, corsi di
            laurea, insegnamenti e sezioni di esercizio. Tutto in un unico
            posto.
          </p>
        </motion.div>

        {/* Toolbar: search + area pills */}
        <div className="mt-8 space-y-3">
          <SearchFilter
            value={search}
            onChange={setSearch}
            placeholder="Cerca dipartimento per nome o codice..."
          />

          {availableAreas.length > 1 && (
            <div className="-mt-3 flex flex-wrap items-center gap-2">
              <AreaPill
                active={areaFilter === "all"}
                onClick={() => setAreaFilter("all")}
                label="Tutti"
              />
              {availableAreas.map((area) => {
                const conf = AREA_CONFIG[area]
                return (
                  <AreaPill
                    key={area}
                    active={areaFilter === area}
                    onClick={() => setAreaFilter(area)}
                    label={AREA_LABELS[area] ?? area}
                    accent={conf?.accent}
                  />
                )
              })}
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                {filteredDepartments.length} di {departments.length}
              </span>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="mt-6">
          {filteredDepartments.length === 0 ? (
            <BrowseEmptyState message="Nessun dipartimento corrisponde ai filtri." />
          ) : (
            <motion.div
              variants={withReducedMotion(staggerContainer, prefersReduced)}
              initial="hidden"
              animate={deptVisible ? "visible" : "hidden"}
              className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
            >
              {filteredDepartments.map((dept) => (
                <motion.div
                  key={dept.id}
                  variants={withReducedMotion(staggerItem, prefersReduced)}
                >
                  <DepartmentCard department={dept} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Hierarchy diagram — full-bleed band */}
      <section ref={hierarchyRef} className="relative overflow-hidden py-14 sm:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-muted/40" />
          <div className="absolute inset-0 dot-pattern opacity-40" />
        </div>

        <div className="container">
          <motion.div
            variants={withReducedMotion(fadeInUp, prefersReduced)}
            initial="hidden"
            animate={hierarchyVisible ? "visible" : "hidden"}
            className="mx-auto mb-10 max-w-2xl text-center"
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Come è organizzato
            </p>
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">
              Dal dipartimento al singolo argomento
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Ogni contenuto segue la struttura accademica UNIMORE. Naviga la
              gerarchia per trovare in pochi click sezioni e quiz su cui
              esercitarti.
            </p>
          </motion.div>

          <ContentHierarchyDiagram orientation="horizontal" showFinalLabel={false} />
        </div>
      </section>

      {/* Data deep-dive — bento */}
      <section ref={dataRef} className="container pb-16 pt-4">
        <motion.div
          variants={withReducedMotion(fadeInUp, prefersReduced)}
          initial="hidden"
          animate={dataVisible ? "visible" : "hidden"}
          className="mb-8"
        >
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            Dati e statistiche
          </p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Uno sguardo d&apos;insieme
            </h2>
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <InlineStat value={overview.stats.classes} label="insegnamenti" />
              <DotSep />
              <InlineStat value={overview.stats.sections} label="sezioni" />
              <DotSep />
              <InlineStat value={overview.stats.questions} label="domande" />
            </p>
          </div>
        </motion.div>

        {/* Bento grid: 3 rows × 3 cols. Each row sizes to its tallest cell;
            companion cells use h-full to fill, so no empty zones. */}
        <motion.div
          variants={withReducedMotion(staggerContainer, prefersReduced)}
          initial="hidden"
          animate={dataVisible ? "visible" : "hidden"}
          className="grid gap-4 lg:grid-cols-3"
        >
          {/* Row 1: Map (cs2) + Course-type donut */}
          <motion.div
            variants={withReducedMotion(staggerItem, prefersReduced)}
            className="lg:col-span-2 [&>*]:h-full"
          >
            <Suspense fallback={<Skeleton className="h-full min-h-[380px] w-full rounded-2xl" />}>
              <OverviewMap locations={overview.locations} />
            </Suspense>
          </motion.div>
          <motion.div
            variants={withReducedMotion(staggerItem, prefersReduced)}
            className="[&>*]:h-full"
          >
            <Suspense fallback={<Skeleton className="h-full min-h-[380px] w-full rounded-2xl" />}>
              <CourseTypeDonutChart data={overview.coursesByType} />
            </Suspense>
          </motion.div>
          {/* Row 2: Department bar (cs2) + Question-type donut */}
          <motion.div
            variants={withReducedMotion(staggerItem, prefersReduced)}
            className="lg:col-span-2 [&>*]:h-full"
          >
            <Suspense fallback={<Skeleton className="h-full min-h-[420px] w-full rounded-2xl" />}>
              <DepartmentBarChart data={overview.coursesByDepartment} />
            </Suspense>
          </motion.div>
          <motion.div
            variants={withReducedMotion(staggerItem, prefersReduced)}
            className="[&>*]:h-full"
          >
            <Suspense fallback={<Skeleton className="h-full min-h-[420px] w-full rounded-2xl" />}>
              <QuestionTypeDonutChart data={overview.questionsByType} />
            </Suspense>
          </motion.div>
          {/* Row 3: Campus radial + Top classes (cs2) */}
          <motion.div
            variants={withReducedMotion(staggerItem, prefersReduced)}
            className="[&>*]:h-full"
          >
            <Suspense fallback={<Skeleton className="h-full min-h-[300px] w-full rounded-2xl" />}>
              <CampusBarChart data={overview.coursesByCampus} />
            </Suspense>
          </motion.div>
          <motion.div
            variants={withReducedMotion(staggerItem, prefersReduced)}
            className="lg:col-span-2 [&>*]:h-full"
          >
            <TopClassesStrip data={overview.topContributedClasses} />
          </motion.div>
        </motion.div>
      </section>
    </div>
  )
}

function InlineStat({ value, label }: { value: number; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="text-base font-bold tabular-nums text-foreground sm:text-lg">
        {value.toLocaleString("it-IT")}
      </span>
      <span>{label}</span>
    </span>
  )
}

function DotSep() {
  return (
    <span
      aria-hidden
      className="hidden h-1 w-1 rounded-full bg-muted-foreground/30 sm:block"
    />
  )
}

function TopClassesStrip({
  data,
}: {
  data: {
    id: string
    name: string
    deptCode: string
    courseCode: string
    classCode: string
    sectionCount: number
    questionCount: number
    deptArea: string | null
  }[]
}) {
  if (data.length === 0) return null

  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-transparent to-primary/0" />
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" strokeWidth={1.75} />
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
            Insegnamenti più contribuiti
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Per numero di sezioni
        </p>
      </div>
      <ol className="flex flex-1 flex-col justify-center gap-1.5">
        {data.map((cls, i) => {
          const accent = cls.deptArea ? AREA_CONFIG[cls.deptArea]?.accent : null
          return (
            <li key={cls.id}>
              <Link
                to="/browse/$department/$course/$class"
                params={{
                  department: cls.deptCode.toLowerCase(),
                  course: cls.courseCode.toLowerCase(),
                  class: cls.classCode.toLowerCase(),
                }}
                className="group flex items-center gap-3 rounded-xl border border-transparent bg-muted/40 px-3 py-2.5 transition-colors hover:border-primary/20 hover:bg-card"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-background font-mono text-xs font-bold text-muted-foreground tabular-nums ring-1 ring-border">
                  {i + 1}
                </span>
                {accent && (
                  <span
                    className={cn("h-2 w-2 shrink-0 rounded-full", accent)}
                    aria-hidden
                  />
                )}
                <p className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                  {cls.name}
                </p>
                <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                  <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="font-semibold tabular-nums text-foreground">
                    {cls.sectionCount}
                  </span>
                  <span>sez.</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="font-semibold tabular-nums text-foreground">
                    {cls.questionCount.toLocaleString("it-IT")}
                  </span>
                  <span className="hidden sm:inline">dom.</span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
              </Link>
            </li>
          )
        })}
      </ol>
    </article>
  )
}

function AreaPill({
  active,
  onClick,
  label,
  accent,
}: {
  active: boolean
  onClick: () => void
  label: string
  accent?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary ring-1 ring-primary/30"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      {accent && (
        <span
          className={cn("h-2 w-2 rounded-full", accent)}
          aria-hidden
        />
      )}
      {label}
    </button>
  )
}
