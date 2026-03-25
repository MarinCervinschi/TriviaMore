import { useEffect, useState } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Heart } from "lucide-react"

import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseStats } from "@/components/browse/browse-stats"
import { Button } from "@/components/ui/button"
import { ItemGrid } from "@/components/browse/item-grid"
import { SearchFilter } from "@/components/browse/search-filter"
import { SectionCard } from "@/components/browse/section-card"
import { useAuth } from "@/hooks/useAuth"
import { browseQueries } from "@/lib/browse/queries"
import { useAddClass, useRemoveClass } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import { updateRecentClassFn } from "@/lib/user/server"

export const Route = createFileRoute(
  "/_app/browse/$department/$course/$class/",
)({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      browseQueries.class(params.department, params.course, params.class),
    )
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Classe"} | Esplora | TriviaMore` },
      {
        name: "description",
        content:
          loaderData?.description ?? `Sezioni della classe ${loaderData?.name ?? ""}`,
      },
    ],
  }),
  component: ClassPage,
})

function ClassPage() {
  const {
    department: deptCode,
    course: courseCode,
    class: classCode,
  } = Route.useParams()
  const { data: classData } = useSuspenseQuery(
    browseQueries.class(deptCode, courseCode, classCode),
  )

  const [search, setSearch] = useState("")

  const { isAuthenticated } = useAuth()
  const addClass = useAddClass()
  const removeClass = useRemoveClass()

  const { data: isSaved } = useQuery({
    ...userQueries.isClassSaved(classData?.id ?? ""),
    enabled: isAuthenticated && !!classData,
  })

  // Track recent class visit for authenticated users
  useEffect(() => {
    if (isAuthenticated && classData?.id) {
      updateRecentClassFn({ data: { classId: classData.id } })
    }
  }, [isAuthenticated, classData?.id])

  if (!classData) return null

  const totalQuestions = classData.sections.reduce(
    (sum, s) => sum + s.question_count,
    0,
  )

  const filtered = classData.sections.filter(
    (s) =>
      !search || s.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleToggleSave = () => {
    if (isSaved) {
      removeClass.mutate(classData.id)
    } else {
      addClass.mutate(classData.id)
    }
  }

  return (
    <div className="container py-8">
      <BrowseBreadcrumb
        segments={[
          { label: "Esplora", href: "/browse" },
          {
            label: classData.course.department.name,
            href: `/browse/${deptCode}`,
          },
          {
            label: classData.course.name,
            href: `/browse/${deptCode}/${courseCode}`,
          },
        ]}
        current={classData.name}
      />
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{classData.name}</h1>
          {classData.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {classData.description}
            </p>
          )}
        </div>
        {isAuthenticated && (
          <Button
            variant={isSaved ? "default" : "outline"}
            size="sm"
            onClick={handleToggleSave}
            disabled={addClass.isPending || removeClass.isPending}
            className="shrink-0"
          >
            <Heart
              className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
            />
            {isSaved ? "Salvato" : "Salva"}
          </Button>
        )}
      </div>
      <BrowseStats
        stats={[
          { label: "sezioni", value: classData.sections.length },
          { label: "domande", value: totalQuestions },
        ]}
      />
      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Cerca sezioni..."
      />
      {filtered.length === 0 ? (
        <BrowseEmptyState message="Nessuna sezione trovata." />
      ) : (
        <ItemGrid>
          {filtered.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              deptCode={deptCode}
              courseCode={courseCode}
              classCode={classCode}
            />
          ))}
        </ItemGrid>
      )}
    </div>
  )
}
