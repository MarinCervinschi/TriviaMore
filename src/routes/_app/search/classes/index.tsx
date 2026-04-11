import { useDeferredValue, useMemo, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, Search, X } from "lucide-react"
import { z } from "zod"

import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseTable } from "@/components/browse/browse-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { browseQueries } from "@/lib/browse/queries"
import { getAvailableClassYearsFn, getDepartmentCourseListFn } from "@/lib/browse/server"

const PAGE_SIZE = 30

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  dept: z.string().optional().catch(undefined),
  course: z.string().optional().catch(undefined),
  year: z.coerce.number().optional().catch(undefined),
  mandatory: z.enum(["true", "false"]).optional().catch(undefined),
})

export const Route = createFileRoute("/_app/search/classes/")({
  validateSearch: searchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.departments()),
  head: () =>
    seoHead({
      title: "Cerca Insegnamento",
      description: "Cerca insegnamenti per nome o descrizione.",
      path: "/search/classes",
    }),
  component: SearchClassesPage,
})

function SearchClassesPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { q, dept, course, year, mandatory } = Route.useSearch()
  const { data: departments } = useSuspenseQuery(browseQueries.departments())
  const [page, setPage] = useState(1)

  const deferredQuery = useDeferredValue(q ?? "")

  const { data: departmentCourses } = useQuery({
    queryKey: ["department-course-list", dept],
    queryFn: () => getDepartmentCourseListFn({ data: { departmentId: dept! } }),
    enabled: !!dept,
  })

  const { data: availableYears } = useQuery({
    queryKey: ["available-class-years", dept, course],
    queryFn: () => getAvailableClassYearsFn({ data: { departmentId: dept, courseId: course } }),
    staleTime: 5 * 60 * 1000,
  })

  const searchParams = useMemo(
    () => ({
      query: deferredQuery || undefined,
      departmentId: dept || undefined,
      courseId: course || undefined,
      classYear: year,
      mandatory: mandatory === "true" ? true : mandatory === "false" ? false : undefined,
    }),
    [deferredQuery, dept, course, year, mandatory],
  )

  const hasFilters = !!(searchParams.query || searchParams.departmentId || searchParams.courseId || searchParams.classYear !== undefined || searchParams.mandatory !== undefined)

  const { data: results, isFetching } = useQuery({
    ...browseQueries.searchClasses(searchParams),
    enabled: hasFilters,
  })

  const totalItems = results?.length ?? 0
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages, 1))
  const paged = results?.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) ?? []

  const updateSearch = (updates: Record<string, string | number | undefined>) => {
    setPage(1)
    navigate({
      search: (prev) => {
        const next = { ...prev, ...updates }
        for (const key of Object.keys(next)) {
          const val = next[key as keyof typeof next]
          if (val === undefined || val === "") delete next[key as keyof typeof next]
        }
        return next
      },
      replace: true,
    })
  }

  const clearFilters = () => {
    setPage(1)
    navigate({ search: {}, replace: true })
  }

  const years = availableYears ?? [1, 2, 3]

  return (
    <div className="container py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Cerca Insegnamento
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cerca insegnamenti per nome o descrizione
        </p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="es. Analisi Matematica, Algoritmi, Basi di Dati..."
          value={q ?? ""}
          onChange={(e) => updateSearch({ q: e.target.value || undefined })}
          className="h-11 pl-10"
        />
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select
          value={dept ?? ""}
          onValueChange={(v) =>
            updateSearch({ dept: v === "all" ? undefined : v, course: undefined, year: undefined })
          }
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Tutti i dipartimenti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i dipartimenti</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.code} — {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {dept && departmentCourses && departmentCourses.length > 0 && (
          <Select
            value={course ?? ""}
            onValueChange={(v) => updateSearch({ course: v === "all" ? undefined : v, year: undefined })}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Tutti i corsi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutti i corsi</SelectItem>
              {departmentCourses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.code} — {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={year !== undefined ? String(year) : ""}
          onValueChange={(v) => updateSearch({ year: v === "all" ? undefined : Number(v) })}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tutti gli anni" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli anni</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}° anno</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={mandatory ?? ""}
          onValueChange={(v) => updateSearch({ mandatory: v === "all" ? undefined : v })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tutti i tipi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i tipi</SelectItem>
            <SelectItem value="true">Obbligatorio</SelectItem>
            <SelectItem value="false">A scelta</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="mr-1 h-3.5 w-3.5" />
            Pulisci filtri
          </Button>
        )}
      </div>

      {!hasFilters ? (
        <BrowseEmptyState message="Cerca un insegnamento per nome o descrizione, oppure seleziona un filtro." />
      ) : isFetching ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Ricerca in corso...</div>
      ) : !results || results.length === 0 ? (
        <BrowseEmptyState message="Nessun insegnamento trovato." />
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            {totalItems}{totalItems >= 50 ? "+" : ""} {totalItems === 1 ? "risultato" : "risultati"}
          </p>
          <BrowseTable headers={["Nome", "Codice", "Corso", "Anno", "CFU", "Tipo", "Sezioni"]}>
            {paged.map((cls) => {
              const sectionCount = cls.sections[0]?.count ?? 0
              return (
                <tr key={`${cls.id}-${cls.code}`} className="group">
                  <td className="pl-6 py-4">
                    <Link
                      to="/browse/$department/$course/$class"
                      params={{
                        department: cls.course.department.code.toLowerCase(),
                        course: cls.course.code.toLowerCase(),
                        class: cls.code.toLowerCase(),
                      }}
                      className="block"
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {cls.name}
                      </span>
                      {cls.description && (
                        <p className="mt-0.5 max-w-[280px] truncate text-xs text-muted-foreground">
                          {cls.description}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <Badge variant="outline" className="text-xs">{cls.code}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <Badge variant="outline" className="text-xs">{cls.course.code}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <span className="text-sm text-muted-foreground">{cls.class_year}°</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    {cls.cfu ? (
                      <span className="text-sm text-muted-foreground">{cls.cfu}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <Badge variant={cls.mandatory ? "default" : "secondary"} className="text-xs">
                      {cls.mandatory ? "Obbligatorio" : "A scelta"}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-center">
                    <span className="text-sm font-semibold text-foreground">{sectionCount}</span>
                  </td>
                  <td className="pr-6 py-4">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </td>
                </tr>
              )
            })}
          </BrowseTable>
          {totalPages > 1 && (
            <Pagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
            />
          )}
        </>
      )}
    </div>
  )
}
