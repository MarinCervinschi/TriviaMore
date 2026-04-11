import { useMemo, useState } from "react"

import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  GraduationCap,
  Search,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { BrowseTable } from "@/components/browse/browse-table"
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserEmptyState } from "@/components/user/user-empty-state"
import { UserHero } from "@/components/user/user-hero"
import { useRemoveClass } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"

export const Route = createFileRoute("/_app/user/classes")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.classes()),
  head: () => seoHead({ title: "I Miei Corsi", noindex: true }),
  component: ClassesPage,
})

function ClassesPage() {
  const { data: userClasses } = useSuspenseQuery(userQueries.classes())
  const removeClass = useRemoveClass()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedCourseType, setSelectedCourseType] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [page, setPage] = useState(1)

  const departments = useMemo(() => {
    const depts = [
      ...new Set(userClasses.map((uc) => uc.department_code)),
    ]
    return depts.sort()
  }, [userClasses])

  const courseTypes = useMemo(() => {
    const types = [
      ...new Set(userClasses.map((uc) => uc.course_type)),
    ]
    return types.sort()
  }, [userClasses])

  const filtered = useMemo(() => {
    const result = userClasses.filter((uc) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        !search ||
        uc.class_name.toLowerCase().includes(search) ||
        uc.course_name.toLowerCase().includes(search) ||
        uc.department_code.toLowerCase().includes(search) ||
        (uc.class_code ?? "").toLowerCase().includes(search)

      const matchesDept =
        selectedDepartment === "all" ||
        uc.department_code === selectedDepartment

      const matchesType =
        selectedCourseType === "all" ||
        uc.course_type === selectedCourseType

      return matchesSearch && matchesDept && matchesType
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.class_name.localeCompare(b.class_name)
        case "department":
          return a.department_code.localeCompare(
            b.department_code,
          )
        case "year":
          return (a.class_year ?? 0) - (b.class_year ?? 0)
        case "dateAdded":
          return (
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          )
        default:
          return 0
      }
    })

    return result
  }, [userClasses, searchTerm, selectedDepartment, selectedCourseType, sortBy])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const hasActiveFilters =
    searchTerm || selectedDepartment !== "all" || selectedCourseType !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("all")
    setSelectedCourseType("all")
    setSortBy("name")
    setPage(1)
  }

  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={GraduationCap}
        title="I Miei Corsi"
        description="Gestisci i corsi che stai seguendo"
        stats={[
          { label: "corsi totali", value: userClasses.length },
          { label: "visualizzati", value: filtered.length },
        ]}
      />

      <div className="container space-y-6">
        <UserBreadcrumb current="I Miei Corsi" />

        {/* Search + Filters — inline toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Cerca corso, dipartimento..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1) }}
              className="h-10 rounded-xl pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={selectedDepartment}
              onValueChange={(v) => { setSelectedDepartment(v); setPage(1) }}
            >
              <SelectTrigger className="h-10 w-auto min-w-[160px] rounded-xl">
                <SelectValue placeholder="Dipartimento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i dipartimenti</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCourseType}
              onValueChange={(v) => { setSelectedCourseType(v); setPage(1) }}
            >
              <SelectTrigger className="h-10 w-auto min-w-[140px] rounded-xl">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i tipi</SelectItem>
                {courseTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {COURSE_TYPE_CONFIG[type]?.label ?? type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10 w-auto min-w-[140px] rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="department">Dipartimento</SelectItem>
                <SelectItem value="year">Anno</SelectItem>
                <SelectItem value="dateAdded">Data Aggiunta</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Pulisci
              </Button>
            )}
          </div>
        </div>

        {/* Classes Table */}
        {filtered.length === 0 ? (
          userClasses.length === 0 ? (
            <UserEmptyState
              icon={GraduationCap}
              title="Nessun corso salvato"
              description="Esplora i dipartimenti e aggiungi i corsi che ti interessano!"
              actionLabel="Esplora Corsi"
              actionHref="/departments"
            />
          ) : (
            <div className="relative overflow-hidden rounded-3xl border bg-card p-12">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">
                  Nessun corso trovato
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Prova a modificare i filtri di ricerca.
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="rounded-xl"
                >
                  Pulisci Filtri
                </Button>
              </div>
            </div>
          )
        ) : (
          <>
          <BrowseTable
            headers={["Corso", "Dipartimento", "Tipo", "Anno", "Aggiunto", ""]}
          >
            {paged.map((userClass) => (
              <tr key={userClass.class_id} className="group">
                <td className="py-4 pl-6">
                  <Link
                    to="/departments/$department/$course/$class"
                    params={{
                      department:
                        userClass.department_code.toLowerCase(),
                      course: userClass.course_code,
                      class: (userClass.class_code ?? "").toLowerCase(),
                    }}
                    className="block"
                  >
                    <span className="font-medium text-foreground transition-colors group-hover:text-primary">
                      {userClass.class_name}
                    </span>
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {userClass.course_name} &bull;{" "}
                      {userClass.class_code}
                    </p>
                  </Link>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <Badge variant="outline" className="text-xs">
                    {userClass.department_code}
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  <Badge className={`rounded-full text-xs ${COURSE_TYPE_CONFIG[userClass.course_type]?.className ?? ""}`}>
                    {COURSE_TYPE_CONFIG[userClass.course_type]?.label ?? userClass.course_type}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                  {userClass.class_year}
                </td>
                <td className="px-4 py-4 text-center text-xs text-muted-foreground">
                  {new Date(userClass.created_at).toLocaleDateString("it-IT")}
                </td>
                <td className="px-4 py-4 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      removeClass.mutate(userClass.class_id)
                    }}
                    disabled={removeClass.isPending}
                    className="h-8 w-8 rounded-lg p-0 text-muted-foreground hover:text-destructive"
                    title="Rimuovi corso"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </td>
                <td className="pr-6 py-4">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </td>
              </tr>
            ))}
          </BrowseTable>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={pageSize}
          />
          </>
        )}
      </div>
    </div>
  )
}
