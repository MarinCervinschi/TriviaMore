import { useMemo } from "react"

import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Clock, Target, TrendingUp, Trophy } from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserEmptyState } from "@/components/user/user-empty-state"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { userQueries } from "@/lib/user/queries"
import type { UserProgress } from "@/lib/user/types"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent } from "@/lib/utils/quiz-results"

export const Route = createFileRoute("/_app/user/progress")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.progress()),
  head: () => ({
    meta: [
      { title: "Progressi | TriviaMore" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ProgressPage,
})

function ProgressPage() {
  const { data: progressData } = useSuspenseQuery(userQueries.progress())

  const { studyProgress, overallStats, studyChartData, examChartData } =
    useMemo(() => {
      const study = progressData.filter((p) => p.quiz_mode === "STUDY")
      const exam = progressData.filter(
        (p) => p.quiz_mode === "EXAM_SIMULATION",
      )

      const totalStudyQuizzes = study.reduce(
        (sum, p) => sum + p.quizzes_taken,
        0,
      )
      const totalExamQuizzes = exam.reduce(
        (sum, p) => sum + p.quizzes_taken,
        0,
      )

      const studyScores = study
        .map((p) => p.average_score ?? 0)
        .filter((s) => s > 0)
      const examScores = exam
        .map((p) => p.average_score ?? 0)
        .filter((s) => s > 0)

      const avgStudy =
        studyScores.length > 0
          ? studyScores.reduce((a, b) => a + b, 0) / studyScores.length
          : 0
      const avgExam =
        examScores.length > 0
          ? examScores.reduce((a, b) => a + b, 0) / examScores.length
          : 0

      const studyChart = study
        .map((p) => ({
          name: p.section.name,
          averageScore: p.average_score ?? 0,
          className: p.section.class.name,
        }))
        .sort((a, b) => b.averageScore - a.averageScore)

      const examByCourseName: Record<
        string,
        { courseName: string; averageScore: number; quizzesTaken: number }
      > = {}
      for (const p of exam) {
        const name = p.section.class.course.name
        examByCourseName[name] = {
          courseName: name,
          averageScore: p.average_score ?? 0,
          quizzesTaken: p.quizzes_taken,
        }
      }

      return {
        studyProgress: study,
        overallStats: {
          totalStudyQuizzes,
          totalExamQuizzes,
          avgStudy,
          avgExam,
          bestStudy: Math.max(...study.map((p) => p.best_score ?? 0), 0),
          bestExam: Math.max(...exam.map((p) => p.best_score ?? 0), 0),
        },
        studyChartData: studyChart,
        examChartData: Object.values(examByCourseName),
      }
    }, [progressData])

  if (progressData.length === 0) {
    return (
      <div className="container space-y-8 py-8">
        <UserBreadcrumb current="Progressi" />
        <div>
          <h1 className="text-3xl font-bold">I Miei Progressi</h1>
          <p className="text-muted-foreground">
            Analizza le tue performance e i tuoi miglioramenti nel tempo
          </p>
        </div>
        <UserEmptyState
          icon={Trophy}
          title="Nessun progresso disponibile"
          description="Inizia a completare alcuni quiz per vedere i tuoi progressi qui!"
          actionLabel="Esplora i Corsi"
          actionHref="/browse"
        />
      </div>
    )
  }

  const sectionsWithIssues = studyProgress.filter(
    (s) => (s.average_score ?? 0) < 18,
  )
  const excellentSections = studyProgress.filter(
    (s) => (s.average_score ?? 0) >= 27,
  )

  return (
    <div className="container space-y-8 py-8">
      <UserBreadcrumb current="Progressi" />

      <div>
        <h1 className="text-3xl font-bold">I Miei Progressi</h1>
        <p className="text-muted-foreground">
          Analizza le tue performance e i tuoi miglioramenti nel tempo
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <UserStatsCard
          label="Quiz Studio Totali"
          value={overallStats.totalStudyQuizzes}
          icon={Target}
          iconColor="text-blue-500"
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Media Studio
                </p>
                <p
                  className={`text-2xl font-bold ${getGradeColor(overallStats.avgStudy)}`}
                >
                  {formatThirtyScaleGrade(overallStats.avgStudy)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getGradeDescription(overallStats.avgStudy)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <UserStatsCard
          label="Quiz Esame Totali"
          value={overallStats.totalExamQuizzes}
          icon={Trophy}
          iconColor="text-yellow-500"
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Media Esame
                </p>
                <p
                  className={`text-2xl font-bold ${getGradeColor(overallStats.avgExam)}`}
                >
                  {formatThirtyScaleGrade(overallStats.avgExam)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getGradeDescription(overallStats.avgExam)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
          <TabsTrigger value="overview">Panoramica Sezioni</TabsTrigger>
          <TabsTrigger value="details">Dettagli Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Study Chart */}
          {studyChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Performance per Sezione - Studio (Voti in 33esimi)
                </CardTitle>
                <CardDescription>
                  Analisi delle performance nelle sezioni di studio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={studyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar
                      dataKey="averageScore"
                      fill="#10b981"
                      name="Studio"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Exam Chart */}
          {examChartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Performance Esami per Corso (Voti in 33esimi)
                </CardTitle>
                <CardDescription>
                  Risultati delle simulazioni d'esame per ogni corso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={examChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="courseName"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      fontSize={12}
                    />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar
                      dataKey="averageScore"
                      fill="#ef4444"
                      name="Esame"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Sections needing improvement */}
          {sectionsWithIssues.length > 0 && (
            <ProgressSectionList
              title="Sezioni di Studio da Migliorare (Sotto la Sufficienza)"
              icon={Target}
              iconColor="text-orange-600"
              borderColor="border-orange-400"
              items={sectionsWithIssues}
            />
          )}

          {/* Excellent sections */}
          {excellentSections.length > 0 && (
            <ProgressSectionList
              title="Sezioni di Studio Eccellenti (27+)"
              icon={TrendingUp}
              iconColor="text-green-600"
              borderColor="border-green-400"
              items={excellentSections}
            />
          )}
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tabella Dettagliata Performance</CardTitle>
              <CardDescription>
                Ogni record di progresso per modalità (Studio/Esame)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Sezione</th>
                      <th className="p-2 text-left">Classe</th>
                      <th className="p-2 text-center">Modalità</th>
                      <th className="p-2 text-center">Quiz</th>
                      <th className="p-2 text-center">Media</th>
                      <th className="p-2 text-center">Migliore</th>
                      <th className="p-2 text-center">Tempo Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progressData.map((record) => (
                      <tr
                        key={record.id}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="p-2 font-medium">
                          {record.section.name}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {record.section.class.name}
                        </td>
                        <td className="p-2 text-center">
                          <Badge
                            variant={
                              record.quiz_mode === "STUDY"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {record.quiz_mode === "STUDY" ? "Studio" : "Esame"}
                          </Badge>
                        </td>
                        <td className="p-2 text-center">
                          {record.quizzes_taken}
                        </td>
                        <td
                          className={`p-2 text-center font-bold ${getGradeColor(record.average_score ?? 0)}`}
                        >
                          {formatThirtyScaleGrade(record.average_score ?? 0)}
                        </td>
                        <td
                          className={`p-2 text-center font-bold ${getGradeColor(record.best_score ?? 0)}`}
                        >
                          {formatThirtyScaleGrade(record.best_score ?? 0)}
                        </td>
                        <td className="p-2 text-center text-muted-foreground">
                          {formatTimeSpent(record.total_time_spent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Summary stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Statistiche di Studio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatRow
                    label="Media voti di studio:"
                    value={formatThirtyScaleGrade(overallStats.avgStudy)}
                    color={getGradeColor(overallStats.avgStudy)}
                  />
                  <StatRow
                    label="Miglior voto di studio:"
                    value={formatThirtyScaleGrade(overallStats.bestStudy)}
                    color={getGradeColor(overallStats.bestStudy)}
                  />
                  <StatRow
                    label="Quiz di studio completati:"
                    value={overallStats.totalStudyQuizzes.toString()}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiche di Esame</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <StatRow
                    label="Media voti d'esame:"
                    value={formatThirtyScaleGrade(overallStats.avgExam)}
                    color={getGradeColor(overallStats.avgExam)}
                  />
                  <StatRow
                    label="Miglior voto d'esame:"
                    value={formatThirtyScaleGrade(overallStats.bestExam)}
                    color={getGradeColor(overallStats.bestExam)}
                  />
                  <StatRow
                    label="Quiz d'esame completati:"
                    value={overallStats.totalExamQuizzes.toString()}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatRow({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color?: string
}) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={`font-bold ${color ?? ""}`}>{value}</span>
    </div>
  )
}

function ProgressSectionList({
  title,
  icon: Icon,
  iconColor,
  borderColor,
  items,
}: {
  title: string
  icon: typeof Target
  iconColor: string
  borderColor: string
  items: UserProgress[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between border-l-4 ${borderColor} pl-4`}
            >
              <div>
                <h4 className="font-medium">{item.section.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {item.section.class.name}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`font-bold ${getGradeColor(item.average_score ?? 0)}`}
                >
                  {formatThirtyScaleGrade(item.average_score ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.quizzes_taken} quiz
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
