import { useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd } from "@/lib/json-ld"
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
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/browse/$department/")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      browseQueries.department(params.department),
    )
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData, match }) => ({
    ...seoHead({
      title: `${loaderData?.name ?? "Dipartimento"} | Esplora`,
      description:
        loaderData?.description ??
        `Corsi del dipartimento ${loaderData?.name ?? ""}`,
      path: match.pathname,
    }),
    scripts: [
      breadcrumbJsonLd([
        { name: "Esplora", path: "/browse" },
        { name: loaderData?.name ?? "Dipartimento", path: match.pathname },
      ]),
    ],
  }),
  component: DepartmentPage,
  notFoundComponent: () => (
    <NotFoundPage message="Il dipartimento che stai cercando non esiste." />
  ),
})

const courseTypeFilters = [
  { value: "all", label: "Tutti" },
  ...Object.entries(COURSE_TYPE_CONFIG).map(([value, { label }]) => ({
    value,
    label,
  })),
]

function DepartmentPage() {
  const { department: deptCode } = Route.useParams()
  const { data: department } = useSuspenseQuery(
    browseQueries.department(deptCode),
  )

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)

  if (!department) return null

  const typeFiltered =
    typeFilter === "all"
      ? department.courses
      : department.courses.filter((c) => c.course_type === typeFilter)

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    typeFiltered,
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
        segments={[{ label: "Esplora", href: "/browse" }]}
        current={department.name}
      />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {department.name}
          </h1>
          {department.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {department.description}
            </p>
          )}
        </div>
        <BrowseAdminButton
          to="/admin/departments/$departmentId"
          params={{ departmentId: department.id }}
        />
      </div>

      <BrowseStats
        stats={[{ label: "corsi", value: department.courses.length }]}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {courseTypeFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setTypeFilter(f.value); setPage(1) }}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
              typeFilter === f.value
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <SearchFilter
        value={search}
        onChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Cerca corsi..."
      />

      {paged.length === 0 ? (
        <BrowseEmptyState message="Nessun corso trovato." />
      ) : (
        <>
          <BrowseTable headers={["Nome", "Codice", "Tipo", "CFU", "Classi"]}>
            {paged.map((course) => {
              const classCount = course.course_classes[0]?.count ?? 0
              const typeConf = COURSE_TYPE_CONFIG[course.course_type]
              return (
                <tr key={course.id} className="group">
                  <td className="pl-6 py-4">
                    <Link
                      to="/browse/$department/$course"
                      params={{
                        department: deptCode.toLowerCase(),
                        course: course.code.toLowerCase(),
                      }}
                      className="block"
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {course.name}
                      </span>
                      {course.description && (
                        <p className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground">
                          {course.description}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      {course.code}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    {typeConf ? (
                      <Badge className={cn("text-xs", typeConf.className)}>
                        {typeConf.label}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {course.course_type}
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    {course.cfu ? (
                      <span className="text-sm text-muted-foreground">
                        {course.cfu}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {classCount}
                    </span>{" "}
                    {classCount === 1 ? "classe" : "classi"}
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
