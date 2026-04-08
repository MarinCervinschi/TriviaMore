import { lazy, Suspense, useEffect, useState } from "react"
import { createFileRoute, Link, notFound } from "@tanstack/react-router"
import { NotFoundPage } from "@/components/error/not-found-page"
import { breadcrumbJsonLd } from "@/lib/json-ld"
import { seoHead } from "@/lib/seo"
import { useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  GraduationCap,
  Heart,
  Lock,
  LogIn,
  MessageSquarePlus,
  Sparkles,
} from "lucide-react"

import { BrowseAdminButton } from "@/components/admin/browse-admin-button"
import { BrowseBreadcrumb } from "@/components/browse/browse-breadcrumb"
import {
  BrowseContributeState,
  BrowseEmptyState,
} from "@/components/browse/browse-empty-state"
import { BrowseStats } from "@/components/browse/browse-stats"
import { BrowseTable } from "@/components/browse/browse-table"
import { RequestFormDialog } from "@/components/requests/request-form-dialog"
import { SearchFilter } from "@/components/browse/search-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pagination, usePaginatedSearch } from "@/components/ui/pagination"
import { useAuth } from "@/hooks/useAuth"
import { CAMPUS_LOCATION_CONFIG, COURSE_TYPE_CONFIG } from "@/lib/browse/constants"
import { browseQueries } from "@/lib/browse/queries"
import { cn } from "@/lib/utils"
import { useAddClass, useRemoveClass } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import { updateRecentClassFn } from "@/lib/user/server"

const StartExamDialog = lazy(
  () =>
    import("@/components/exam/start-exam-dialog").then((m) => ({
      default: m.StartExamDialog,
    })),
)

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
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { isAuthenticated } = useAuth()
  const addClass = useAddClass()
  const removeClass = useRemoveClass()

  const { data: isSaved } = useQuery({
    ...userQueries.isClassSaved(classData?.id ?? ""),
    enabled: isAuthenticated && !!classData,
  })

  useEffect(() => {
    if (isAuthenticated && classData?.id && classData?.course?.id) {
      updateRecentClassFn({ data: { classId: classData.id, courseId: classData.course.id } }).then(() => {
        queryClient.invalidateQueries({ queryKey: ["user", "profile"] })
      })
    }
  }, [isAuthenticated, classData?.id, classData?.course?.id, queryClient])

  if (!classData) return null

  const totalQuestions = classData.sections.reduce(
    (sum, s) => sum + s.question_count,
    0,
  )

  const { paged, totalPages, safePage, totalItems } = usePaginatedSearch(
    classData.sections,
    (s, q) => s.name.toLowerCase().includes(q),
    search,
    page,
    10,
  )

  const handleToggleSave = () => {
    if (isSaved) {
      removeClass.mutate(classData.id)
    } else {
      addClass.mutate({ classId: classData.id, courseId: classData.course.id })
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
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {COURSE_TYPE_CONFIG[classData.course.course_type] && (
              <Badge className={cn("text-xs", COURSE_TYPE_CONFIG[classData.course.course_type].className)}>
                {COURSE_TYPE_CONFIG[classData.course.course_type].label}
              </Badge>
            )}
            {classData.courseClass?.class_year && (
              <Badge variant="outline" className="text-xs">
                Anno {classData.courseClass.class_year}
              </Badge>
            )}
            {classData.courseClass && (
              <Badge
                variant="outline"
                className={cn(
                  "text-xs",
                  classData.courseClass.mandatory
                    ? "bg-green-500/10 text-green-600 border-green-500/20"
                    : "bg-orange-500/10 text-orange-600 border-orange-500/20",
                )}
              >
                {classData.courseClass.mandatory ? "Obbligatorio" : "A scelta"}
              </Badge>
            )}
            {classData.course.location && (
              <Badge variant="outline" className="text-xs">
                {CAMPUS_LOCATION_CONFIG[classData.course.location]?.short ?? classData.course.location}
              </Badge>
            )}
            {classData.cfu && (
              <Badge variant="secondary" className="text-xs">
                {classData.cfu} CFU
              </Badge>
            )}
            {classData.courseClass?.curriculum && (
              <Badge variant="outline" className="text-xs">
                {classData.courseClass.curriculum}
              </Badge>
            )}
            {classData.courseClass?.catalogue_url && (
              <a
                href={classData.courseClass.catalogue_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                Catalogo
              </a>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BrowseAdminButton
            to="/admin/classes/$classId"
            params={{ classId: classData.id }}
          />
          {isAuthenticated && (
            <>
              <RequestFormDialog
                defaultTargetClassId={classData.id}
                trigger={
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <MessageSquarePlus className="h-4 w-4" />
                    <span className="hidden sm:inline">Proponi contenuto</span>
                  </Button>
                }
              />
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
            </>
          )}
        </div>
      </div>
      <BrowseStats
        stats={[
          { label: "sezioni", value: classData.sections.length },
          { label: "domande", value: totalQuestions },
        ]}
      />
      {classData.examSimulation &&
        (classData.examSimulation.totalQuizQuestions > 0 ||
          classData.examSimulation.totalFlashcardQuestions > 0) && (
          <ExamSimulationSection
            examSimulation={classData.examSimulation}
            isAuthenticated={isAuthenticated}
          />
        )}
      <SearchFilter
        value={search}
        onChange={(v) => { setSearch(v); setPage(1) }}
        placeholder="Cerca sezioni..."
      />
      {classData.sections.length === 0 ? (
        <BrowseContributeState message="Nessuna sezione disponibile per questa classe.">
          <RequestFormDialog defaultTargetClassId={classData.id} />
        </BrowseContributeState>
      ) : paged.length === 0 ? (
        <BrowseEmptyState message="Nessuna sezione trovata." />
      ) : (
        <>
        <BrowseTable headers={["Sezione", "Quiz", "Flashcard", "Totale"]}>
          {paged.map((section) => {
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
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  {section.quiz_question_count > 0 ? (
                    <Badge className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                      <BookOpen className="h-3 w-3" />
                      {section.quiz_question_count}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center">
                  {section.flashcard_question_count > 0 ? (
                    <Badge className="gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                      <Sparkles className="h-3 w-3" />
                      {section.flashcard_question_count}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-center text-sm text-muted-foreground">
                  {section.question_count}
                </td>
                <td className="pr-6 py-4">
                  <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                </td>
              </tr>
            )
          })}
        </BrowseTable>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
          pageSize={10}
        />
        </>
      )}
    </div>
  )
}

function ExamSimulationSection({
  examSimulation,
  isAuthenticated,
}: {
  examSimulation: NonNullable<
    import("@/lib/browse/types").ClassWithSections["examSimulation"]
  >
  isAuthenticated: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="mb-6">
      <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-card to-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex shrink-0 rounded-xl bg-amber-500/10 p-2.5">
              <GraduationCap className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="font-semibold tracking-tight">
                Simulazione Esame
              </h2>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {examSimulation.totalQuizQuestions > 0 && (
                  <Badge className="gap-1 bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs">
                    <BookOpen className="h-3 w-3" />
                    {examSimulation.totalQuizQuestions} quiz
                  </Badge>
                )}
                {examSimulation.totalFlashcardQuestions > 0 && (
                  <Badge className="gap-1 bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs">
                    <Sparkles className="h-3 w-3" />
                    {examSimulation.totalFlashcardQuestions} flashcard
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {isAuthenticated ? (
            <Button
              size="sm"
              className="shrink-0 shadow-sm"
              onClick={() => setDialogOpen(true)}
            >
              Simula Esame
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button size="sm" className="shrink-0 shadow-sm" asChild>
              <Link to="/auth/register">
                <LogIn className="mr-2 h-4 w-4" />
                Registrati per iniziare
              </Link>
            </Button>
          )}
        </div>
      </div>
      {dialogOpen && (
        <Suspense>
          <StartExamDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            sectionId={examSimulation.sectionId}
            maxQuizQuestions={examSimulation.totalQuizQuestions}
            maxFlashcardQuestions={examSimulation.totalFlashcardQuestions}
          />
        </Suspense>
      )}
    </div>
  )
}
