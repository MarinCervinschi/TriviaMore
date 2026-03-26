import { useEffect, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { ArrowRight, BookOpen, Heart, Lock, Sparkles } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseEmptyState } from "@/components/browse/browse-empty-state"
import { BrowseStats } from "@/components/browse/browse-stats"
import { BrowseTable } from "@/components/browse/browse-table"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  head: ({ loaderData, match }) => ({
    ...seoHead({
      title: `${loaderData?.name ?? "Classe"} | Esplora`,
      description:
        loaderData?.description ??
        `Sezioni della classe ${loaderData?.name ?? ""}`,
      path: match.pathname,
    }),
    scripts: [
      breadcrumbJsonLd([
        { name: "Esplora", path: "/browse" },
        {
          name: loaderData?.course?.department?.name ?? "Dipartimento",
          path: `/browse/${match.params.department}`,
        },
        {
          name: loaderData?.course?.name ?? "Corso",
          path: `/browse/${match.params.department}/${match.params.course}`,
        },
        { name: loaderData?.name ?? "Classe", path: match.pathname },
      ]),
    ],
  }),
  component: ClassPage,
  notFoundComponent: () => (
    <NotFoundPage message="La classe che stai cercando non esiste." />
  ),
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
  const queryClient = useQueryClient()

  const { isAuthenticated } = useAuth()
  const addClass = useAddClass()
  const removeClass = useRemoveClass()

  const { data: isSaved } = useQuery({
    ...userQueries.isClassSaved(classData?.id ?? ""),
    enabled: isAuthenticated && !!classData,
  })

  useEffect(() => {
    if (isAuthenticated && classData?.id) {
      updateRecentClassFn({ data: { classId: classData.id } }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      })
    }
  }, [isAuthenticated, classData?.id, queryClient])

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
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {classData.name}
          </h1>
          {classData.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {classData.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BrowseAdminButton
            to="/admin/classes/$classId"
            params={{ classId: classData.id }}
          />
          {isAuthenticated && (
            <Button
              variant={isSaved ? "default" : "outline"}
              size="sm"
              onClick={handleToggleSave}
              disabled={addClass.isPending || removeClass.isPending}
            >
              <Heart
                className={`mr-2 h-4 w-4 ${isSaved ? "fill-current" : ""}`}
              />
              {isSaved ? "Salvato" : "Salva"}
            </Button>
          )}
        </div>
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
        <BrowseTable headers={["Sezione", "Quiz", "Flashcard", "Totale"]}>
          {filtered.map((section) => {
            const sectionSlug = section.name
              .replace(/ /g, "-")
              .toLowerCase()
            return (
              <tr key={section.id} className="group">
                <td className="pl-6 py-4">
                  <Link
                    to="/browse/$department/$course/$class/$section"
                    params={{
                      department: deptCode.toLowerCase(),
                      course: courseCode.toLowerCase(),
                      class: classCode.toLowerCase(),
                      section: sectionSlug,
                    }}
                    className="block"
                  >
                    <span className="flex items-center gap-2 font-medium text-foreground group-hover:text-primary transition-colors">
                      {!section.is_public && (
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      {section.name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-4 text-center">
                  {section.quiz_question_count > 0 ? (
                    <Badge className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                      <BookOpen className="h-3 w-3" />
                      {section.quiz_question_count}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center">
                  {section.flashcard_question_count > 0 ? (
                    <Badge className="gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                      <Sparkles className="h-3 w-3" />
                      {section.flashcard_question_count}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-4 text-center text-sm text-muted-foreground">
                  {section.question_count}
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
  )
}
