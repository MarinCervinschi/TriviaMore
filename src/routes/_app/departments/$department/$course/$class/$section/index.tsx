import { createFileRoute, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { BrowseContributeState } from "@/components/browse/browse-empty-state"
import { FlashcardCard } from "@/components/browse/flashcard-card"
import { QuizCard } from "@/components/browse/quiz-card"
import { RequestFormDialog } from "@/components/requests/request-form-dialog"
import { SectionHeader } from "@/components/browse/section-header"
import { browseQueries } from "@/lib/browse/queries"

export const Route = createFileRoute(
  "/_app/departments/$department/$course/$class/$section/",
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
        { name: "Dipartimenti", path: "/departments" },
        {
          name: loaderData?.class?.course?.department?.name ?? "Dipartimento",
          path: `/departments/${match.params.department}`,
        },
        {
          name: loaderData?.class?.course?.name ?? "Corso",
          path: `/departments/${match.params.department}/${match.params.course}`,
        },
        {
          name: loaderData?.class?.name ?? "Insegnamento",
          path: `/departments/${match.params.department}/${match.params.course}/${match.params.class}`,
        },
        { name: loaderData?.name ?? "Sezione", path: match.pathname },
      ]),
    ],
  }),
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
    <div className="container py-8">
      <BrowseBreadcrumb
        segments={[
          { label: "Dipartimenti", href: "/departments" },
          {
            label: section.class.course.department.name,
            href: `/departments/${deptCode}`,
          },
          {
            label: section.class.course.name,
            href: `/departments/${deptCode}/${courseCode}`,
          },
          {
            label: section.class.name,
            href: `/departments/${deptCode}/${courseCode}/${classCode}`,
          },
        ]}
        current={section.name}
      />
      <div className="flex items-start justify-between">
        <SectionHeader section={section} />
        <BrowseAdminButton
          to="/admin/sections/$sectionId"
          params={{ sectionId: section.id }}
        />
      </div>
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
  )
}
