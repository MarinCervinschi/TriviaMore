import { useState } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseStats } from "@/components/browse/browse-stats"
import { CourseCard } from "@/components/browse/course-card"
import { ItemGrid } from "@/components/browse/item-grid"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { browseQueries } from "@/lib/browse/queries"

export const Route = createFileRoute("/_app/browse/$department/")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      browseQueries.department(params.department),
    )
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Dipartimento"} | Esplora | TriviaMore` },
      {
        name: "description",
        content: loaderData?.description ?? `Corsi del dipartimento ${loaderData?.name ?? ""}`,
      },
    ],
  }),
  component: DepartmentPage,
})

const courseTypeFilters = [
  { value: "all", label: "Tutti" },
  { value: "BACHELOR", label: "Triennale" },
  { value: "MASTER", label: "Magistrale" },
] as const

function DepartmentPage() {
  const { department: deptCode } = Route.useParams()
  const { data: department } = useSuspenseQuery(
    browseQueries.department(deptCode),
  )

  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  if (!department) return null

  const filtered = department.courses.filter((c) => {
    const matchesSearch =
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
    const matchesType =
      typeFilter === "all" || c.course_type === typeFilter
    return matchesSearch && matchesType
  })

  return (
    <div className="container py-8">
      <BrowseBreadcrumb
        segments={[{ label: "Esplora", href: "/browse" }]}
        current={department.name}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{department.name}</h1>
        {department.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {department.description}
          </p>
        )}
      </div>
      <BrowseStats
        stats={[
          { label: "corsi", value: department.courses.length },
        ]}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {courseTypeFilters.map((f) => (
          <Badge
            key={f.value}
            variant={typeFilter === f.value ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setTypeFilter(f.value)}
          >
            {f.label}
          </Badge>
        ))}
      </div>
      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Cerca corsi..."
      />
      {filtered.length === 0 ? (
        <BrowseEmptyState message="Nessun corso trovato." />
      ) : (
        <ItemGrid>
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              deptCode={deptCode}
            />
          ))}
        </ItemGrid>
      )}
    </div>
  )
}
