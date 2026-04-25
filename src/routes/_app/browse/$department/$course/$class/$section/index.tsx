import { createFileRoute, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { BookOpen, FileText, Sparkles } from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseContributeState } from "@/components/browse/browse-empty-state"
import { BrowsePageHeader } from "@/components/browse/browse-page-header"
import { FlashcardCard } from "@/components/browse/flashcard-card"
import { QuizCard } from "@/components/browse/quiz-card"
import { RequestFormDialog } from "@/components/requests/request-form-dialog"
import { Badge } from "@/components/ui/badge"
import { browseQueries } from "@/lib/browse/queries"
import { SectionDetailSkeleton } from "@/components/skeletons"

export const Route = createFileRoute(
  "/_app/browse/$department/$course/$class/$section/",
)({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(
      browseQueries.section(
        params.department,
        params.course,
        params.class,
        params.section,
      ),
    )
    if (!data) throw notFound()
    return data
  },
  head: ({ loaderData, match }) => ({
    ...seoHead({
      title: `${loaderData?.name ?? "Sezione"} | Esplora`,
      description:
        loaderData?.description ??
        `Sezione ${loaderData?.name ?? ""}`,
      path: match.pathname,
    }),
    scripts: [
      breadcrumbJsonLd([
        { name: "Esplora", path: "/browse" },
        {
          name: loaderData?.class?.course?.department?.name ?? "Dipartimento",
          path: `/browse/${match.params.department}`,
        },
        {
          name: loaderData?.class?.course?.name ?? "Corso",
          path: `/browse/${match.params.department}/${match.params.course}`,
        },
        {
          name: loaderData?.class?.name ?? "Insegnamento",
          path: `/browse/${match.params.department}/${match.params.course}/${match.params.class}`,
        },
        { name: loaderData?.name ?? "Sezione", path: match.pathname },
      ]),
    ],
  }),
  pendingComponent: SectionDetailSkeleton,
  component: SectionPage,
  notFoundComponent: () => (
    <NotFoundPage message="La sezione che stai cercando non esiste." />
  ),
})

function SectionPage() {
  const {
    department: deptCode,
    course: courseCode,
    class: classCode,
    section: sectionSlug,
  } = Route.useParams()
  const { data: section } = useSuspenseQuery(
    browseQueries.section(deptCode, courseCode, classCode, sectionSlug),
  )

  if (!section) return null

  return (
    <div className="pb-8">
      <BrowsePageHeader
        breadcrumb={
          <BrowseBreadcrumb
            segments={[
              { label: "Esplora", href: "/browse" },
              {
                label: section.class.course.department.name,
                href: `/browse/${deptCode}`,
              },
              {
                label: section.class.course.name,
                href: `/browse/${deptCode}/${courseCode}`,
              },
              {
                label: section.class.name,
                href: `/browse/${deptCode}/${courseCode}/${classCode}`,
              },
            ]}
            current={section.name}
          />
        }
        icon={FileText}
        title={section.name}
        description={section.description}
        badges={
          <>
            <Badge variant="secondary" className="text-xs">
              {section.question_count}{" "}
              {section.question_count === 1 ? "domanda" : "domande"}
            </Badge>
            {section.quiz_question_count > 0 && (
              <Badge className="gap-1 border-blue-500/20 bg-blue-500/10 text-xs text-blue-600">
                <BookOpen className="h-3 w-3" />
                {section.quiz_question_count} quiz
              </Badge>
            )}
            {section.flashcard_question_count > 0 && (
              <Badge className="gap-1 border-purple-500/20 bg-purple-500/10 text-xs text-purple-600">
                <Sparkles className="h-3 w-3" />
                {section.flashcard_question_count} flashcard
              </Badge>
            )}
          </>
        }
        actions={
          <BrowseAdminButton
            to="/admin/sections/$sectionId"
            params={{ sectionId: section.id }}
          />
        }
      />
      <div className="container pt-8">
        {section.quiz_question_count === 0 &&
        section.flashcard_question_count === 0 ? (
          <BrowseContributeState message="Nessuna domanda disponibile per questa sezione.">
            <RequestFormDialog
              defaultTargetClassId={section.class.id}
              defaultTargetSectionId={section.id}
            />
          </BrowseContributeState>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <QuizCard
              questionCount={section.quiz_question_count}
              sectionId={section.id}
            />
            <FlashcardCard
              questionCount={section.flashcard_question_count}
              sectionId={section.id}
            />
          </div>
        )}
      </div>
    </div>
  )
}
