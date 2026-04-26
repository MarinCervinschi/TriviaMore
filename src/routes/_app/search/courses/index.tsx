import { useMemo, useState } from "react"
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { seoHead } from "@/lib/seo"
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, GraduationCap, Search, X } from "lucide-react"
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
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { useDebounce } from "@/hooks/useDebounce"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 10

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  dept: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  campus: z.string().optional().catch(undefined),
})

export const Route = createFileRoute("/_app/search/courses/")({
  validateSearch: searchSchema,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.departments()),
  head: () =>
    seoHead({
      title: "Cerca Corso",
      description: "Cerca corsi di laurea per nome, codice o descrizione.",
      path: "/search/courses",
    }),
  component: SearchCoursesPage,
})

function SearchCoursesPage() {
  const navigate = useNavigate({ from: Route.fullPath })
  const { q, dept, type, campus } = Route.useSearch()
  const { data: departments } = useSuspenseQuery(browseQueries.departments())
  const [page, setPage] = useState(1)
  const prefersReduced = useReducedMotion()

  const debouncedQuery = useDebounce(q ?? "", 400)

  const searchParams = useMemo(
    () => ({
      query: debouncedQuery || undefined,
      departmentId: dept || undefined,
      courseType: type || undefined,
      campus: campus || undefined,
    }),
    [debouncedQuery, dept, type, campus],
  )

  const hasFilters = !!(searchParams.query || searchParams.departmentId || searchParams.courseType || searchParams.campus)

  const { data: results, isFetching } = useQuery({
    ...browseQueries.searchCourses(searchParams),
    enabled: hasFilters,
    placeholderData: keepPreviousData,
  })

  const totalItems = results?.length ?? 0
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)
  const safePage = Math.min(page, Math.max(totalPages, 1))
  const paged = results?.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) ?? []

  const updateSearch = (updates: Record<string, string | undefined>) => {
    setPage(1)
    navigate({
      search: (prev) => {
        const next = { ...prev, ...updates }
        for (const key of Object.keys(next)) {
          if (!next[key as keyof typeof next]) delete next[key as keyof typeof next]
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

  return (
    <div>
      <UserHero
        icon={GraduationCap}
        title="Cerca Corso"
        description="Cerca corsi di laurea per nome, codice o descrizione"
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
                placeholder="es. Informatica, Economia, LM-32..."
                value={q ?? ""}
                onChange={(e) => updateSearch({ q: e.target.value || undefined })}
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
              onValueChange={(v) => updateSearch({ dept: v === "all" ? undefined : v })}
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

            <Select
              value={type ?? ""}
              onValueChange={(v) => updateSearch({ type: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-xl text-xs">
                <SelectValue placeholder="Tutti i tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {Object.entries(COURSE_TYPE_CONFIG).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={campus ?? ""}
              onValueChange={(v) => updateSearch({ campus: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-xl text-xs">
                <SelectValue placeholder="Tutti i campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i campus</SelectItem>
                {Object.entries(CAMPUS_LOCATION_CONFIG).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
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
              Cerca un corso per nome, codice o descrizione, oppure seleziona un filtro
            </p>
          </div>
        ) : !results && isFetching ? (
          <SearchResultsSkeleton rows={5} />
        ) : !results || results.length === 0 ? (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <h3 className="text-lg font-semibold">Nessun corso trovato</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Prova a modificare i filtri o il termine di ricerca
            </p>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mt-4 rounded-xl">
              Pulisci filtri
            </Button>
          </div>
        ) : (
          <div className={cn(isFetching && "opacity-60 transition-opacity")}>
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
              <BrowseTable headers={["Nome", "Codice", "Dipartimento", "Tipo", "Campus", "CFU", "Insegnamenti"]}>
                {paged.map((course) => {
                  const typeConf = COURSE_TYPE_CONFIG[course.course_type]
                  const classCount = course.course_classes[0]?.count ?? 0
                  return (
                    <motion.tr
                      key={course.id}
                      variants={withReducedMotion(staggerItem, prefersReduced)}
                      className="group"
                    >
                      <td className="min-w-[16rem] pl-6 pr-3 py-4 align-top">
                        <Link
                          to="/browse/$department/$course"
                          params={{
                            department: course.department.code.toLowerCase(),
                            course: course.code.toLowerCase(),
                          }}
                          className="block"
                        >
                          <span className="block font-medium text-foreground group-hover:text-primary transition-colors">
                            {course.name}
                          </span>
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <Badge variant="outline" className="text-xs">{course.code}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <Badge variant="outline" className="text-xs">{course.department.code}</Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        {typeConf ? (
                          <Badge className={cn("text-xs", typeConf.className)}>{typeConf.label}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{course.course_type}</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        {course.location ? (
                          <span className="text-sm text-muted-foreground">
                            {CAMPUS_LOCATION_CONFIG[course.location]?.short ?? course.location}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        {course.cfu ? (
                          <span className="text-sm text-muted-foreground">{course.cfu}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-center">
                        <span className="text-sm font-semibold text-foreground">{classCount}</span>
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
