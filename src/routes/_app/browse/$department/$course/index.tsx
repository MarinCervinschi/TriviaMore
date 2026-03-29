import { useMemo, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseStats } from "@/components/browse/browse-stats"
import { BrowseTable } from "@/components/browse/browse-table"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { browseQueries } from "@/lib/browse/queries"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/browse/$department/$course/")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      browseQueries.course(params.department, params.course),
    )
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData, match }) => ({
    ...seoHead({
      title: `${loaderData?.name ?? "Corso"} | Esplora`,
      description:
        loaderData?.description ??
        `Classi del corso ${loaderData?.name ?? ""}`,
      path: match.pathname,
    }),
    scripts: [
      breadcrumbJsonLd([
        { name: "Esplora", path: "/browse" },
        {
          name: loaderData?.department?.name ?? "Dipartimento",
          path: `/browse/${match.params.department}`,
        },
        { name: loaderData?.name ?? "Corso", path: match.pathname },
      ]),
      courseJsonLd({
        name: loaderData?.name ?? "Corso",
        description: loaderData?.description ?? undefined,
        path: match.pathname,
        provider: loaderData?.department?.name,
      }),
    ],
  }),
  component: CoursePage,
  notFoundComponent: () => (
    <NotFoundPage message="Il corso che stai cercando non esiste." />
  ),
})

function CoursePage() {
  const { department: deptCode, course: courseCode } = Route.useParams()
  const { data: course } = useSuspenseQuery(
    browseQueries.course(deptCode, courseCode),
  )

  const [search, setSearch] = useState("")
  const [yearFilter, setYearFilter] = useState<number | "all">("all")

  if (!course) return null

  const availableYears = useMemo(() => {
    const years = [...new Set(course.classes.map((c) => c.class_year))].sort()
    return years
  }, [course.classes])

  const filtered = course.classes.filter(
    (c) =>
      (yearFilter === "all" || c.class_year === yearFilter) &&
      (!search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.toLowerCase().includes(search.toLowerCase())),
  )

  return (
    <div className="container py-8">
      <BrowseBreadcrumb
        segments={[
          { label: "Esplora", href: "/browse" },
          {
            label: course.department.name,
            href: `/browse/${deptCode}`,
          },
        ]}
        current={course.name}
      />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {course.name}
          </h1>
          {course.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {course.description}
            </p>
          )}
        </div>
        <BrowseAdminButton
          to="/admin/courses/$courseId"
          params={{ courseId: course.id }}
        />
      </div>

      <BrowseStats
        stats={[{ label: "classi", value: course.classes.length }]}
      />

      {availableYears.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setYearFilter("all")}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              yearFilter === "all"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            Tutti
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              onClick={() => setYearFilter(year)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                yearFilter === year
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              Anno {year}
            </button>
          ))}
        </div>
      )}

      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Cerca classi..."
      />

      {filtered.length === 0 ? (
        <BrowseEmptyState message="Nessuna classe trovata." />
      ) : (
        <BrowseTable headers={["Nome", "Codice", "Anno", "CFU", "Sezioni"]}>
          {filtered.map((classData) => {
            const sectionCount = classData.sections[0]?.count ?? 0
            return (
              <tr key={classData.id} className="group">
                <td className="pl-6 py-4">
                  <Link
                    to="/browse/$department/$course/$class"
                    params={{
                      department: deptCode.toLowerCase(),
                      course: courseCode.toLowerCase(),
                      class: classData.code.toLowerCase(),
                    }}
                    className="block"
                  >
                    <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {classData.name}
                    </span>
                    {classData.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                        {classData.description}
                      </p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-4 text-center">
                  <Badge variant="outline" className="text-xs">
                    {classData.code}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Anno {classData.class_year}
                  </span>
                </td>
                <td className="px-4 py-4 text-center">
                  {classData.cfu ? (
                    <span className="text-sm text-muted-foreground">
                      {classData.cfu}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {sectionCount}
                  </span>{" "}
                  {sectionCount === 1 ? "sezione" : "sezioni"}
                </td>
                <td className="pr-6 py-4">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </td>
              </tr>
            )
          })}
        </BrowseTable>
      )}
    </div>
  )
}
