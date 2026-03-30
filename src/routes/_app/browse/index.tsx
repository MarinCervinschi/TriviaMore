import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, Library } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseHero } from "@/components/browse/browse-hero"
import { BrowseTable } from "@/components/browse/browse-table"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { Pagination, usePaginatedSearch } from "@/components/ui/pagination"
import { AREA_LABELS } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/browse/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.departments()),
  head: () =>
    seoHead({
      title: "Esplora",
      description:
        "Scopri tutti i dipartimenti e i corsi disponibili su TriviaMore.",
      path: "/browse",
    }),
  component: BrowsePage,
})

function BrowsePage() {
  const { data: departments } = useSuspenseQuery(browseQueries.departments())

  const [search, setSearch] = useState("")
  const [areaFilter, setAreaFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

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

  const { paged, safePage, totalPages, totalItems } = usePaginatedSearch(
    areaFiltered,
    (dept, query) =>
      dept.name.toLowerCase().includes(query) ||
      dept.code.toLowerCase().includes(query),
    search,
    page,
    10,
  )

  return (
    <div>
      <BrowseHero
        icon={Library}
        title="Esplora i Contenuti"
        description="Scopri tutti i dipartimenti e i corsi disponibili. Seleziona un dipartimento per iniziare."
        stats={[
          { label: "dipartimenti", value: departments.length },
          { label: "corsi", value: totalCourses },
        ]}
      />

      <div className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Dipartimenti
          </h2>
          <BrowseAdminButton to="/admin/departments" />
        </div>

        {availableAreas.length > 1 && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              onClick={() => { setAreaFilter("all"); setPage(1) }}
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
                onClick={() => { setAreaFilter(area); setPage(1) }}
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
          onChange={(v) => {
            setSearch(v)
            setPage(1)
          }}
          placeholder="Cerca dipartimenti..."
        />

        {paged.length === 0 ? (
          <BrowseEmptyState message="Nessun dipartimento disponibile." />
        ) : (
          <>
            <BrowseTable headers={["Nome", "Codice", "Area", "Corsi"]}>
              {paged.map((dept) => {
                const courseCount = dept.courses[0]?.count ?? 0
                return (
                  <tr key={dept.id} className="group">
                    <td className="pl-6 py-4">
                      <Link
                        to="/browse/$department"
                        params={{ department: dept.code.toLowerCase() }}
                        className="block"
                      >
                        <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {dept.name}
                        </span>
                        {dept.description && (
                          <p className="mt-0.5 max-w-[280px] truncate line-clamp-1 text-xs text-muted-foreground">
                            {dept.description}
                          </p>
                        )}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <Badge variant="outline" className="text-xs">
                        {dept.code}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      {dept.area ? (
                        <Badge variant="secondary" className="text-xs">
                          {AREA_LABELS[dept.area]}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground/50">
                          —
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-muted-foreground">
                      <span className="font-semibold text-foreground">
                        {courseCount}
                      </span>{" "}
                      {courseCount === 1 ? "corso" : "corsi"}
                    </td>
                    <td className="pr-6 py-4">
                      <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </td>
                  </tr>
                )
              })}
            </BrowseTable>
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={10}
            />
          </>
        )}
      </div>
    </div>
  )
}
