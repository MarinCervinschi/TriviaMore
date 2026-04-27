import { useEffect, useMemo, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, BookOpen, Search, X } from "lucide-react"
import { z } from "zod"

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
import { SearchResultsSkeleton } from "@/components/skeletons"
import { UserHero } from "@/components/user/user-hero"
import { browseQueries } from "@/lib/browse/queries"
import { getAvailableClassYearsFn, getDepartmentCourseListFn } from "@/lib/browse/server"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useDebounce } from "@/hooks/useDebounce"

const PAGE_SIZE = 10

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
      description: "Cerca insegnamenti per nome.",
      path: "/search/classes",
    }),
  component: SearchClassesPage,
})

function SearchClassesPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { q, dept, course, year, mandatory } = Route.useSearch()
  const { data: departments } = useSuspenseQuery(browseQueries.departments())
  const [page, setPage] = useState(1)
  const prefersReduced = useReducedMotion()

  // Local state for the search input keeps typing snappy: the URL (and the DB query)
  // are only updated after the debounce settles, instead of on every keystroke.
  const [localQ, setLocalQ] = useState(q ?? "")
  const debouncedQuery = useDebounce(localQ, 600)

  // Push debounced value into the URL.
  useEffect(() => {
    if (debouncedQuery !== (q ?? "")) {
      updateSearch({ q: debouncedQuery || undefined })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  // Pull external URL changes (back/forward, clearFilters) back into local state.
  useEffect(() => {
    setLocalQ(q ?? "")
  }, [q])

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
      query: debouncedQuery || undefined,
      departmentId: dept || undefined,
      courseId: course || undefined,
      classYear: year,
      mandatory: mandatory === "true" ? true : mandatory === "false" ? false : undefined,
    }),
    [debouncedQuery, dept, course, year, mandatory],
  )

  const hasFilters = !!(searchParams.query || searchParams.departmentId || searchParams.courseId || searchParams.classYear !== undefined || searchParams.mandatory !== undefined)

  const { data: results, isFetching } = useQuery({
    ...browseQueries.searchClasses(searchParams),
    enabled: hasFilters,
    placeholderData: keepPreviousData,
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
    <div>
      <UserHero
        icon={BookOpen}
        title="Cerca Insegnamento"
        description="Cerca insegnamenti per nome"
        stats={hasFilters && results ? [{ label: "risultati", value: totalItems }] : undefined}
      />

      <div className="container py-8">
        {/* Search & Filters toolbar */}
        <div className="mb-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="es. Analisi Matematica, Algoritmi, Basi di Dati..."
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                className="h-10 rounded-xl pl-10"
              />
            </div>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="shrink-0 text-muted-foreground">
                <X className="mr-1.5 h-3.5 w-3.5" />
                Pulisci filtri
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={dept ?? ""}
              onValueChange={(v) =>
                updateSearch({ dept: v === "all" ? undefined : v, course: undefined, year: undefined })
              }
            >
              <SelectTrigger className="h-9 w-auto min-w-[180px] rounded-xl text-xs">
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
                <SelectTrigger className="h-9 w-auto min-w-[180px] rounded-xl text-xs">
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
              <SelectTrigger className="h-9 w-auto min-w-[130px] rounded-xl text-xs">
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
              <SelectTrigger className="h-9 w-auto min-w-[130px] rounded-xl text-xs">
                <SelectValue placeholder="Tutti i tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                <SelectItem value="true">Obbligatorio</SelectItem>
                <SelectItem value="false">A scelta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {!hasFilters ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-3">
              <Search className="h-6 w-6 text-primary" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-semibold">Inizia a cercare</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Cerca un insegnamento per nome, oppure seleziona un filtro
            </p>
          </div>
        ) : !results && isFetching ? (
          <SearchResultsSkeleton rows={5} />
        ) : !results || results.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <h3 className="text-lg font-semibold">Nessun insegnamento trovato</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Prova a modificare i filtri o il termine di ricerca
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-xl">
              Pulisci filtri
            </Button>
          </div>
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalItems}</span>
                {totalItems >= 50 ? "+" : ""} {totalItems === 1 ? "risultato" : "risultati"}
              </p>
            </div>
            <motion.div
              variants={withReducedMotion(staggerContainer, prefersReduced)}
              initial="hidden"
              animate="visible"
            >
              <BrowseTable
                headers={[
                  "Nome",
                  { label: "Codice", className: "hidden lg:table-cell" },
                  { label: "Corso", className: "hidden lg:table-cell" },
                  { label: "Anno", className: "hidden md:table-cell" },
                  { label: "CFU", className: "hidden md:table-cell" },
                  { label: "Tipo", className: "hidden sm:table-cell" },
                  "Sezioni",
                ]}
              >
                {paged.map((cls) => {
                  const sectionCount = cls.sections[0]?.count ?? 0
                  return (
                    <motion.tr
                      key={`${cls.id}-${cls.code}`}
                      variants={withReducedMotion(staggerItem, prefersReduced)}
                      className="group"
                    >
                      <td className="pl-6 pr-3 py-4 align-top">
                        <Link
                          to="/browse/$department/$course/$class"
                          params={{
                            department: cls.course.department.code.toLowerCase(),
                            course: cls.course.code.toLowerCase(),
                            class: cls.code.toLowerCase(),
                          }}
                          className="block"
                        >
                          <span className="block font-medium text-foreground group-hover:text-primary transition-colors">
                            {cls.name}
                          </span>
                          {cls.description && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                              {cls.description}
                            </p>
                          )}
                        </Link>
                      </td>
                      <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-center">
                        <Badge variant="outline" className="text-xs">{cls.code}</Badge>
                      </td>
                      <td className="hidden lg:table-cell whitespace-nowrap px-3 py-4 text-center">
                        <Badge variant="outline" className="text-xs">{cls.course.code}</Badge>
                      </td>
                      <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-center">
                        <span className="text-sm text-muted-foreground">{cls.class_year}°</span>
                      </td>
                      <td className="hidden md:table-cell whitespace-nowrap px-3 py-4 text-center">
                        {cls.cfu ? (
                          <span className="text-sm text-muted-foreground">{cls.cfu}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="hidden sm:table-cell whitespace-nowrap px-3 py-4 text-center">
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
                    </motion.tr>
                  )
                })}
              </BrowseTable>
            </motion.div>
            {totalPages > 1 && (
              <Pagination
                page={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalItems}
                pageSize={PAGE_SIZE}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
