import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Library } from "lucide-react"

import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseHero } from "@/components/browse/browse-hero"
import { BrowseStats } from "@/components/browse/browse-stats"
import { DepartmentCard } from "@/components/browse/department-card"
import { ItemGrid } from "@/components/browse/item-grid"
import { browseQueries } from "@/lib/browse/queries"

export const Route = createFileRoute("/_app/browse/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(browseQueries.departments()),
  head: () => ({
    meta: [
      { title: "Esplora | TriviaMore" },
      {
        name: "description",
        content:
          "Scopri tutti i dipartimenti e i corsi disponibili su TriviaMore.",
      },
    ],
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
      <BrowseHero
        icon={Library}
        title="Esplora i Contenuti"
        description="Scopri tutti i dipartimenti e i corsi disponibili. Seleziona un dipartimento per iniziare."
      />
      <BrowseStats
        stats={[
          { label: "dipartimenti", value: departments.length },
          { label: "corsi", value: totalCourses },
        ]}
      />
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
