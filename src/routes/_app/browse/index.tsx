import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Library } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseHero } from "@/components/browse/browse-hero"
import { DepartmentCard } from "@/components/browse/department-card"
import { ItemGrid } from "@/components/browse/item-grid"
import { browseQueries } from "@/lib/browse/queries"

export const Route = createFileRoute("/_app/browse/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.departments()),
  head: () =>
    seoHead({
      title: "Esplora",
      description:
        "Scopri tutti i dipartimenti e i corsi disponibili su TriviaMore.",
      path: "/browse",
    }),
  component: BrowsePage,
})

function BrowsePage() {
  const { data: departments } = useSuspenseQuery(browseQueries.departments())

  const totalCourses = departments.reduce(
    (sum, d) => sum + (d.courses[0]?.count ?? 0),
    0,
  )

  return (
    <div className="container py-8">
      <div className="flex items-start justify-between">
        <BrowseHero
          icon={Library}
          title="Esplora i Contenuti"
          description="Scopri tutti i dipartimenti e i corsi disponibili. Seleziona un dipartimento per iniziare."
          stats={[
            { label: "dipartimenti", value: departments.length },
            { label: "corsi", value: totalCourses },
          ]}
        />
        <BrowseAdminButton to="/admin/departments" />
      </div>
      {departments.length === 0 ? (
        <BrowseEmptyState message="Nessun dipartimento disponibile." />
      ) : (
        <ItemGrid>
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </ItemGrid>
      )}
    </div>
  )
}
