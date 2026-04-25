import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, Building2, GraduationCap, MapPin } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseHero } from "@/components/browse/browse-hero"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { AREA_CONFIG, AREA_LABELS, CAMPUS_LOCATION_CONFIG } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import { DepartmentsListSkeleton } from "@/components/skeletons"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/departments/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.departments()),
  head: () =>
    seoHead({
      title: "Dipartimenti",
      description:
        "Scopri tutti i dipartimenti e i corsi disponibili su TriviaMore.",
      path: "/departments",
    }),
  pendingComponent: DepartmentsListSkeleton,
  component: DepartmentsPage,
})

function DepartmentsPage() {
  const { data: departments } = useSuspenseQuery(browseQueries.departments())

  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")

  const totalCourses = departments.reduce(
    (sum, d) => sum + (d.courses[0]?.count ?? 0),
    0,
  )

  const availableAreas = [
    ...new Set(
      departments.flatMap((d) => (d.area ? [d.area] : [])),
    ),
  ].sort()

  const areaFiltered =
    areaFilter === "all"
      ? departments
      : departments.filter((d) => d.area === areaFilter)

  const query = search.toLowerCase().trim()
  const filtered = query
    ? areaFiltered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.code.toLowerCase().includes(query),
      )
    : areaFiltered

  return (
    <div>
      <BrowseHero
        icon={Building2}
        title="Dipartimenti"
        description="Scopri tutti i dipartimenti e i corsi disponibili. Seleziona un dipartimento per esplorarne i corsi."
        stats={[
          { label: "dipartimenti", value: departments.length },
          { label: "corsi", value: totalCourses },
        ]}
      />

      <div className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Tutti i dipartimenti
          </h2>
          <BrowseAdminButton to="/admin/departments" />
        </div>

        {availableAreas.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => setAreaFilter("all")}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                areaFilter === "all"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Tutti
            </button>
            {availableAreas.map((area) => (
              <button
                key={area}
                onClick={() => setAreaFilter(area)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  areaFilter === area
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {AREA_LABELS[area] ?? area}
              </button>
            ))}
          </div>
        )}

        <SearchFilter
          value={search}
          onChange={setSearch}
          placeholder="Cerca dipartimenti..."
        />

        {filtered.length === 0 ? (
          <BrowseEmptyState message="Nessun dipartimento trovato." />
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dept) => {
              const courseCount = dept.courses[0]?.count ?? 0
              const areaConf = dept.area ? AREA_CONFIG[dept.area] : null
              const campuses = [
                ...new Set(
                  dept.department_locations
                    .map((l) => l.campus_location)
                    .filter(Boolean),
                ),
              ]
              return (
                <Link
                  key={dept.id}
                  to="/departments/$department"
                  params={{ department: dept.code.toLowerCase() }}
                  className="group"
                >
                  <div className="relative h-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/30">
                    {/* Gradient overlay based on area */}
                    <div
                      className={cn(
                        "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                        areaConf?.gradient ?? "from-primary/10 to-transparent",
                      )}
                    />

                    {/* Accent bar */}
                    <div className={cn("h-1 w-full", areaConf?.accent ?? "bg-primary")} />

                    <div className="relative flex h-full flex-col gap-4 p-5 pt-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="mb-2.5 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-[11px] font-mono tracking-wide">
                              {dept.code}
                            </Badge>
                            {areaConf && (
                              <Badge variant="secondary" className="text-[11px]">
                                {areaConf.label}
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                            {dept.name}
                          </h3>
                        </div>
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 transition-all group-hover:bg-primary/10">
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>

                      {/* Description */}
                      {dept.description && (
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {dept.description}
                        </p>
                      )}

                      {/* Footer stats */}
                      <div className="mt-auto flex items-center gap-4 border-t pt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="h-4 w-4" />
                          <span className="font-semibold text-foreground">{courseCount}</span>
                          {" "}{courseCount === 1 ? "corso" : "corsi"}
                        </span>
                        {campuses.length > 0 && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4" />
                            {campuses.map((c) => CAMPUS_LOCATION_CONFIG[c!]?.short ?? c).join(", ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
