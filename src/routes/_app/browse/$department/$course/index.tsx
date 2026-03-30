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
import { Pagination, usePaginatedSearch } from "@/components/ui/pagination"
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
  const [curriculumFilter, setCurriculumFilter] = useState<string | "all">(
    "all",
  )
  const [page, setPage] = useState(1)

  if (!course) return null

  const availableYears = useMemo(() => {
    const years = [...new Set(course.classes.map((c) => c.class_year))].sort()
    return years
  }, [course.classes])

  const availableCurricula = useMemo(() => {
    const curricula = [
      ...new Set(
        course.classes
          .map((c) => c.curriculum)
          .filter((c): c is string => !!c),
      ),
    ].sort()
    return curricula
  }, [course.classes])

  const preFiltered = course.classes.filter(
    (c) =>
      (yearFilter === "all" || c.class_year === yearFilter) &&
      (curriculumFilter === "all" || c.curriculum === curriculumFilter),
  )

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    preFiltered,
    (c, q) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q),
    search,
    page,
    10,
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
            onClick={() => { setYearFilter("all"); setPage(1) }}
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
              onClick={() => { setYearFilter(year); setPage(1) }}
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

      {availableCurricula.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => { setCurriculumFilter("all"); setPage(1) }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              curriculumFilter === "all"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            Tutti i curriculum
          </button>
          {availableCurricula.map((cur) => (
            <button
              key={cur}
              onClick={() => { setCurriculumFilter(cur); setPage(1) }}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                curriculumFilter === cur
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {cur}
            </button>
          ))}
        </div>
      )}

      <SearchFilter
        value={search}
        onChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Cerca classi..."
      />

      {paged.length === 0 ? (
        <BrowseEmptyState message="Nessuna classe trovata." />
      ) : (
        <>
        <BrowseTable headers={["Nome", "Codice", "Anno", "CFU", "Sezioni"]}>
          {paged.map((classData) => {
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
                      <p className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground">
                        {classData.description}
                      </p>
                    )}
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <Badge variant="outline" className="text-xs">
                    {classData.code}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <span className="text-sm text-muted-foreground">
                    Anno {classData.class_year}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  {classData.cfu ? (
                    <span className="text-sm text-muted-foreground">
                      {classData.cfu}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-muted-foreground">
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
  )
}
