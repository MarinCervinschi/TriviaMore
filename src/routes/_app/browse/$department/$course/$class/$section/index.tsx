import { createFileRoute, notFound } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import { FlashcardCard } from "@/components/browse/flashcard-card"
import { QuizCard } from "@/components/browse/quiz-card"
import { SectionHeader } from "@/components/browse/section-header"
import { useAuth } from "@/hooks/useAuth"
import { browseQueries } from "@/lib/browse/queries"

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
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Sezione"} | Esplora | TriviaMore` },
      {
        name: "description",
        content:
          loaderData?.description ?? `Sezione ${loaderData?.name ?? ""}`,
      },
    ],
  }),
  component: SectionPage,
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

  const { isAuthenticated } = useAuth()

  if (!section) return null

  return (
    <div className="container py-8">
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
      <SectionHeader section={section} />
      <div className="grid gap-6 md:grid-cols-2">
        <QuizCard
          questionCount={section.quiz_question_count}
          sectionId={section.id}
          isAuthenticated={isAuthenticated}
        />
        <FlashcardCard
          questionCount={section.flashcard_question_count}
          sectionId={section.id}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  )
}
