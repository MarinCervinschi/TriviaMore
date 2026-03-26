import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, Library } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseHero } from "@/components/browse/browse-hero"
import { BrowseTable } from "@/components/browse/browse-table"
import { Badge } from "@/components/ui/badge"
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
    <div>
      <BrowseHero
        icon={Library}
        title="Esplora i Contenuti"
        description="Scopri tutti i dipartimenti e i corsi disponibili. Seleziona un dipartimento per iniziare."
        stats={[
          { label: "dipartimenti", value: departments.length },
          { label: "corsi", value: totalCourses },
        ]}
      />

      <div className="container py-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Dipartimenti
          </h2>
          <BrowseAdminButton to="/admin/departments" />
        </div>

        {departments.length === 0 ? (
          <BrowseEmptyState message="Nessun dipartimento disponibile." />
        ) : (
          <BrowseTable headers={["Nome", "Codice", "Corsi"]}>
            {departments.map((dept) => {
              const courseCount = dept.courses[0]?.count ?? 0
              return (
                <tr key={dept.id} className="group">
                  <td className="pl-6 py-4">
                    <Link
                      to="/browse/$department"
                      params={{ department: dept.code.toLowerCase() }}
                      className="block"
                    >
                      <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                        {dept.name}
                      </span>
                      {dept.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {dept.description}
                        </p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <Badge variant="outline" className="text-xs">
                      {dept.code}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-center text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {courseCount}
                    </span>{" "}
                    {courseCount === 1 ? "corso" : "corsi"}
                  </td>
                  <td className="pr-6 py-4">
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </td>
                </tr>
              )
            })}
          </BrowseTable>
        )}
      </div>
    </div>
  )
}
