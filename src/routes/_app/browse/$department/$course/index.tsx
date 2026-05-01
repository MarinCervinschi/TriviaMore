import { useMemo, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd, courseJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, GraduationCap } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowsePageHeader } from "@/components/browse/browse-page-header"
import { BrowseTable } from "@/components/browse/browse-table"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { Pagination, usePaginatedSearch } from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import type { BrowseClassInCourse } from "@/lib/browse/types"
import { CourseDetailSkeleton } from "@/components/skeletons"
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
      title: loaderData?.name ?? "Corso",
      description:
        loaderData?.description ??
        `Insegnamenti del corso ${loaderData?.name ?? ""} a UniMore. Quiz, simulazioni d'esame, flashcard e dashboard personale per ogni esame.`,
      path: match.pathname,
      jsonLd: [
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
  }),
  pendingComponent: CourseDetailSkeleton,
  component: CoursePage,
  notFoundComponent: () => (
    <NotFoundPage message="Il corso che stai cercando non esiste." />
  ),
})

function ClassRow({
  classData,
  deptCode,
  courseCode,
}: {
  classData: BrowseClassInCourse
  deptCode: string
  courseCode: string
}) {
  const sectionCount = classData.class.sections[0]?.count ?? 0
  return (
    <tr key={classData.class.id} className="group">
      <td className="pl-6 pr-3 py-4 align-top">
        <Link
          to="/browse/$department/$course/$class"
          params={{
            department: deptCode.toLowerCase(),
            course: courseCode.toLowerCase(),
            class: classData.code.toLowerCase(),
          }}
          className="block"
        >
          <span className="block font-medium text-foreground group-hover:text-primary transition-colors">
            {classData.class.name}
          </span>
          {classData.class.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {classData.class.description}
            </p>
          )}
        </Link>
      </td>
      <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-center">
        <Badge variant="outline" className="text-xs">
          {classData.code}
        </Badge>
      </td>
      <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-center">
        {classData.class.cfu ? (
          <span className="text-sm text-muted-foreground">
            {classData.class.cfu}
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
}

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

  const groupedClasses = useMemo(() => {
    const byYear = new Map<number, BrowseClassInCourse[]>()
    for (const c of preFiltered) {
      const list = byYear.get(c.class_year) ?? []
      list.push(c)
      byYear.set(c.class_year, list)
    }
    return [...byYear.entries()]
      .sort(([a], [b]) => a - b)
      .map(([year, classes]) => ({
        year,
        mandatory: classes.filter((c) => c.mandatory),
        elective: classes.filter((c) => !c.mandatory),
      }))
  }, [preFiltered])

  const isGroupedView = search === ""

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    preFiltered,
    (c, q) =>
      c.class.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q),
    search,
    page,
    10,
  )

  const tableHeaders = [
    "Nome",
    { label: "Codice", className: "hidden md:table-cell" },
    { label: "CFU", className: "hidden sm:table-cell" },
    "Sezioni",
  ]

  return (
    <div className="pb-8">
      <BrowsePageHeader
        breadcrumb={
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
        }
        icon={GraduationCap}
        title={course.name}
        description={course.description}
        badges={
          <>
            {COURSE_TYPE_CONFIG[course.course_type] && (
              <Badge
                className={cn(
                  "text-xs",
                  COURSE_TYPE_CONFIG[course.course_type].className,
                )}
              >
                {COURSE_TYPE_CONFIG[course.course_type].label}
              </Badge>
            )}
            {course.location && (
              <Badge variant="outline" className="text-xs">
                {CAMPUS_LOCATION_CONFIG[course.location]?.short ?? course.location}
              </Badge>
            )}
            {course.cfu && (
              <Badge variant="secondary" className="text-xs">
                {course.cfu} CFU
              </Badge>
            )}
          </>
        }
        stats={[
          {
            label:
              course.classes.length === 1 ? "insegnamento" : "insegnamenti",
            value: course.classes.length,
          },
        ]}
        actions={
          <BrowseAdminButton
            to="/admin/courses/$courseId"
            params={{ courseId: course.id }}
          />
        }
      />

      <div className="container pt-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        {availableYears.length > 1 && (
          <div className="flex flex-wrap gap-2">
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

        {availableCurricula.length > 0 && (
          <Select
            value={curriculumFilter}
            onValueChange={(v) => { setCurriculumFilter(v); setPage(1) }}
          >
            <SelectTrigger className="w-auto min-w-[200px] max-w-[300px]">
              <SelectValue placeholder="Tutti i curriculum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i curriculum</SelectItem>
              {availableCurricula.map((cur) => (
                <SelectItem key={cur} value={cur}>
                  {cur}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <SearchFilter
        value={search}
        onChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Cerca insegnamenti..."
      />

      {isGroupedView ? (
        preFiltered.length === 0 ? (
          <BrowseEmptyState message="Nessun insegnamento trovato." />
        ) : (
          groupedClasses.map((group) => {
            const hasBoth = group.mandatory.length > 0 && group.elective.length > 0
            return (
              <section key={group.year} className="mt-8 first:mt-4">
                <h2 className="mb-4 text-lg font-semibold">Anno {group.year}</h2>
                {group.mandatory.length > 0 && (
                  <>
                    {hasBoth && (
                      <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                        Obbligatori
                      </h3>
                    )}
                    <BrowseTable headers={tableHeaders}>
                      {group.mandatory.map((c) => (
                        <ClassRow
                          key={c.class.id}
                          classData={c}
                          deptCode={deptCode}
                          courseCode={courseCode}
                        />
                      ))}
                    </BrowseTable>
                  </>
                )}
                {group.elective.length > 0 && (
                  <>
                    {hasBoth && (
                      <h3 className="mb-2 mt-4 text-sm font-medium text-muted-foreground">
                        A scelta
                      </h3>
                    )}
                    <BrowseTable headers={tableHeaders}>
                      {group.elective.map((c) => (
                        <ClassRow
                          key={c.class.id}
                          classData={c}
                          deptCode={deptCode}
                          courseCode={courseCode}
                        />
                      ))}
                    </BrowseTable>
                  </>
                )}
              </section>
            )
          })
        )
      ) : paged.length === 0 ? (
        <BrowseEmptyState message="Nessun insegnamento trovato." />
      ) : (
        <>
          <BrowseTable headers={tableHeaders}>
            {paged.map((c) => (
              <ClassRow
                key={c.class.id}
                classData={c}
                deptCode={deptCode}
                courseCode={courseCode}
              />
            ))}
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
