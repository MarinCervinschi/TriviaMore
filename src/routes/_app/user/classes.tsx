import { useMemo, useState } from "react"

import { createFileRoute, Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ExternalLink, Filter, GraduationCap, Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserEmptyState } from "@/components/user/user-empty-state"
import { useRemoveClass } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import type { UserClass } from "@/lib/user/types"

export const Route = createFileRoute("/_app/user/classes")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.classes()),
  head: () => ({
    meta: [
      { title: "I Miei Corsi | TriviaMore" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ClassesPage,
})

function ClassesPage() {
  const { data: userClasses } = useSuspenseQuery(userQueries.classes())
  const removeClass = useRemoveClass()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [selectedCourseType, setSelectedCourseType] = useState("all")
  const [sortBy, setSortBy] = useState("name")

  const departments = useMemo(() => {
    const depts = [
      ...new Set(userClasses.map((uc) => uc.class.course.department.name)),
    ]
    return depts.sort()
  }, [userClasses])

  const courseTypes = useMemo(() => {
    const types = [
      ...new Set(userClasses.map((uc) => uc.class.course.course_type)),
    ]
    return types.sort()
  }, [userClasses])

  const filtered = useMemo(() => {
    const result = userClasses.filter((uc) => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        !search ||
        uc.class.name.toLowerCase().includes(search) ||
        uc.class.course.name.toLowerCase().includes(search) ||
        uc.class.course.department.name.toLowerCase().includes(search) ||
        uc.class.code.toLowerCase().includes(search)

      const matchesDept =
        selectedDepartment === "all" ||
        uc.class.course.department.name === selectedDepartment

      const matchesType =
        selectedCourseType === "all" ||
        uc.class.course.course_type === selectedCourseType

      return matchesSearch && matchesDept && matchesType
    })

    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.class.name.localeCompare(b.class.name)
        case "department":
          return a.class.course.department.name.localeCompare(
            b.class.course.department.name,
          )
        case "year":
          return a.class.class_year - b.class.class_year
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

  const hasActiveFilters =
    searchTerm || selectedDepartment !== "all" || selectedCourseType !== "all"

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedDepartment("all")
    setSelectedCourseType("all")
    setSortBy("name")
  }

  return (
    <div className="container space-y-8 py-8">
      <UserBreadcrumb current="I Miei Corsi" />

      <div>
        <h1 className="text-3xl font-bold">I Miei Corsi</h1>
        <p className="text-muted-foreground">
          Gestisci i corsi che stai seguendo ({filtered.length} di{" "}
          {userClasses.length} corsi)
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri
            </CardTitle>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Pulisci Filtri
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cerca</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nome corso, dipartimento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Dipartimento</label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i dipartimenti" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo di Corso</label>
              <Select
                value={selectedCourseType}
                onValueChange={setSelectedCourseType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  {courseTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ordina per</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome Corso</SelectItem>
                  <SelectItem value="department">Dipartimento</SelectItem>
                  <SelectItem value="year">Anno</SelectItem>
                  <SelectItem value="dateAdded">Data Aggiunta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classes Grid */}
      {filtered.length === 0 ? (
        userClasses.length === 0 ? (
          <UserEmptyState
            icon={GraduationCap}
            title="Nessun corso salvato"
            description="Esplora i dipartimenti e aggiungi i corsi che ti interessano!"
            actionLabel="Esplora Corsi"
            actionHref="/browse"
          />
        ) : (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-semibold">
                  Nessun corso trovato
                </h2>
                <p className="mb-4 text-muted-foreground">
                  Prova a modificare i filtri di ricerca.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Pulisci Filtri
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((userClass) => (
            <ClassCard
              key={userClass.class_id}
              userClass={userClass}
              onRemove={() => removeClass.mutate(userClass.class_id)}
              isRemoving={removeClass.isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ClassCard({
  userClass,
  onRemove,
  isRemoving,
}: {
  userClass: UserClass
  onRemove: () => void
  isRemoving: boolean
}) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{userClass.class.name}</CardTitle>
            <CardDescription>
              {userClass.class.course.department.name}
            </CardDescription>
          </div>
          <Badge variant="outline">
            {userClass.class.course.course_type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">{userClass.class.course.name}</p>
            <p className="text-sm text-muted-foreground">
              Anno {userClass.class.class_year} &bull; Codice:{" "}
              {userClass.class.code}
            </p>
          </div>

          <div className="flex gap-2">
            <Button asChild size="sm" className="flex-1">
              <Link
                to="/browse/$department/$course/$class"
                params={{
                  department:
                    userClass.class.course.department.code.toLowerCase(),
                  course: userClass.class.course.code,
                  class: userClass.class.code.toLowerCase(),
                }}
                className="flex items-center gap-2"
              >
                Apri Corso
                <ExternalLink className="h-3 w-3" />
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
              disabled={isRemoving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Aggiunto il{" "}
            {new Date(userClass.created_at).toLocaleDateString("it-IT")}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
