import { useState } from "react"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseStats } from "@/components/browse/browse-stats"
import { ClassCard } from "@/components/browse/class-card"
import { ItemGrid } from "@/components/browse/item-grid"
import { SearchFilter } from "@/components/browse/search-filter"
import { browseQueries } from "@/lib/browse/queries"

export const Route = createFileRoute("/_app/browse/$department/$course/")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      browseQueries.course(params.department, params.course),
    )
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Corso"} | Esplora | TriviaMore` },
      {
        name: "description",
        content: loaderData?.description ?? `Classi del corso ${loaderData?.name ?? ""}`,
      },
    ],
  }),
  component: CoursePage,
})

function CoursePage() {
  const { department: deptCode, course: courseCode } = Route.useParams()
  const { data: course } = useSuspenseQuery(
    browseQueries.course(deptCode, courseCode),
  )

  const [search, setSearch] = useState("")

  if (!course) return null

  const filtered = course.classes.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()),
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
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.name}</h1>
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
      <SearchFilter
        value={search}
        onChange={setSearch}
        placeholder="Cerca classi..."
      />
      {filtered.length === 0 ? (
        <BrowseEmptyState message="Nessuna classe trovata." />
      ) : (
        <ItemGrid>
          {filtered.map((classData) => (
            <ClassCard
              key={classData.id}
              classData={classData}
              deptCode={deptCode}
              courseCode={courseCode}
            />
          ))}
        </ItemGrid>
      )}
    </div>
  )
}
