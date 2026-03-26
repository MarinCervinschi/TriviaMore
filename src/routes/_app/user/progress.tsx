import { useMemo, useState } from "react"

import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Clock,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { BrowseTable } from "@/components/browse/browse-table"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserEmptyState } from "@/components/user/user-empty-state"
import { UserHero } from "@/components/user/user-hero"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { userQueries } from "@/lib/user/queries"
import {
  formatThirtyScaleGrade,
  getGradeColor,
  getGradeDescription,
} from "@/lib/utils/grading"
import { formatTimeSpent } from "@/lib/utils/quiz-results"

export const Route = createFileRoute("/_app/user/progress")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.progress()),
  head: () => seoHead({ title: "Progressi", noindex: true }),
  component: ProgressPage,
})

const tooltipStyle = {
  borderRadius: "12px",
  border: "1px solid hsl(var(--border))",
  boxShadow:
    "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  backgroundColor: "hsl(var(--card))",
  color: "hsl(var(--foreground))",
}

function getBarColor(score: number): string {
  if (score >= 27) return "#22c55e"
  if (score >= 18) return "#d14124"
  return "#ef4444"
}

function ProgressPage() {
  const { data: progressData } = useSuspenseQuery(userQueries.progress())
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview",
  )

  const {
    studyProgress,
    overallStats,
    studyChartData,
    examChartData,
    radialData,
    totalTime,
  } = useMemo(() => {
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
        name: p.section.name.length > 20
          ? p.section.name.substring(0, 18) + "..."
          : p.section.name,
        fullName: p.section.name,
        averageScore: +(p.average_score ?? 0).toFixed(1),
        bestScore: +(p.best_score ?? 0).toFixed(1),
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
        averageScore: +(p.average_score ?? 0).toFixed(1),
        quizzesTaken: p.quizzes_taken,
      }
    }

    const totalTimeAll = progressData.reduce(
      (sum, p) => sum + p.total_time_spent,
      0,
    )

    // Radial chart: overall average as percentage of 33
    const overallAvg =
      [...studyScores, ...examScores].length > 0
        ? [...studyScores, ...examScores].reduce((a, b) => a + b, 0) /
          [...studyScores, ...examScores].length
        : 0
    const radial = [
      {
        name: "Media",
        value: +((overallAvg / 33) * 100).toFixed(0),
        score: +overallAvg.toFixed(1),
        fill: overallAvg >= 27 ? "#22c55e" : overallAvg >= 18 ? "#d14124" : "#ef4444",
      },
    ]

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
      radialData: radial,
      totalTime: totalTimeAll,
    }
  }, [progressData])

  if (progressData.length === 0) {
    return (
      <div className="space-y-8 pb-8">
        <UserHero
          icon={TrendingUp}
          title="I Miei Progressi"
          description="Analizza le tue performance e i tuoi miglioramenti nel tempo"
        />
        <div className="container space-y-6">
          <UserBreadcrumb current="Progressi" />
          <UserEmptyState
            icon={Trophy}
            title="Nessun progresso disponibile"
            description="Inizia a completare alcuni quiz per vedere i tuoi progressi qui!"
            actionLabel="Esplora i Corsi"
            actionHref="/browse"
          />
        </div>
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
    <div className="space-y-8 pb-8">
      <UserHero
        icon={TrendingUp}
        title="I Miei Progressi"
        description="Analizza le tue performance e i tuoi miglioramenti nel tempo"
        stats={[
          {
            label: "quiz totali",
            value:
              overallStats.totalStudyQuizzes + overallStats.totalExamQuizzes,
          },
          {
            label: "media studio",
            value: formatThirtyScaleGrade(overallStats.avgStudy),
          },
          {
            label: "tempo totale",
            value: formatTimeSpent(totalTime),
          },
        ]}
      />

      <div className="container space-y-8">
        <UserBreadcrumb current="Progressi" />

        {/* Stats bento grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <UserStatsCard
            label="Quiz Studio"
            value={overallStats.totalStudyQuizzes}
            icon={Target}
            iconColor="text-blue-500"
            iconBg="blue"
          />
          <UserStatsCard
            label="Quiz Esame"
            value={overallStats.totalExamQuizzes}
            icon={Trophy}
            iconColor="text-yellow-500"
            iconBg="yellow"
          />
          <UserStatsCard
            label="Tempo Totale"
            value={formatTimeSpent(totalTime)}
            icon={Clock}
            iconColor="text-purple-500"
            iconBg="purple"
          />

          {/* Average score card with radial gauge */}
          <div className="col-span-2 group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-[30px]" />
            <div className="relative flex items-center gap-4">
              <div className="shrink-0">
                <ResponsiveContainer width={96} height={96}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="value"
                      cornerRadius={10}
                      background={{ fill: "hsl(var(--muted))" }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Media Generale
                </p>
                <p
                  className={`text-3xl font-bold ${getGradeColor(radialData[0].score)}`}
                >
                  {formatThirtyScaleGrade(radialData[0].score)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {getGradeDescription(radialData[0].score)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 rounded-2xl bg-muted/50 p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "overview"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Panoramica
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === "details"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dettaglio Performance
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Study chart — horizontal bars colored by score */}
            {studyChartData.length > 0 && (
              <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Performance Studio</h3>
                  <p className="text-sm text-muted-foreground">
                    Media e miglior voto per sezione (in 33esimi)
                  </p>
                </div>
                <div className="px-2 pb-6 sm:px-6">
                  <ResponsiveContainer
                    width="100%"
                    height={Math.max(studyChartData.length * 48, 200)}
                  >
                    <BarChart
                      data={studyChartData}
                      layout="vertical"
                      margin={{ left: 10, right: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id="studyGradient"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#d14124" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#f56565" stopOpacity={0.9} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        className="stroke-border/30"
                      />
                      <XAxis
                        type="number"
                        domain={[0, 33]}
                        fontSize={12}
                        className="fill-muted-foreground"
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        fontSize={12}
                        className="fill-muted-foreground"
                        tickLine={false}
                        axisLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={tooltipStyle}
                        formatter={(value, name) => [
                          formatThirtyScaleGrade(value as number),
                          name === "averageScore" ? "Media" : "Migliore",
                        ]}
                        labelFormatter={(_label, payload) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const item = (payload as any)?.[0]?.payload
                          return item?.fullName ?? _label
                        }}
                      />
                      <Bar
                        dataKey="averageScore"
                        name="averageScore"
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      >
                        {studyChartData.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={getBarColor(entry.averageScore)}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Exam chart */}
            {examChartData.length > 0 && (
              <div className="overflow-hidden rounded-2xl border bg-card">
                <div className="p-6">
                  <h3 className="text-lg font-bold">Performance Esami</h3>
                  <p className="text-sm text-muted-foreground">
                    Risultati delle simulazioni d'esame per corso
                  </p>
                </div>
                <div className="px-2 pb-6 sm:px-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={examChartData}>
                      <defs>
                        <linearGradient
                          id="examAreaGrad"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor="#d14124" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#d14124" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border/30"
                      />
                      <XAxis
                        dataKey="courseName"
                        fontSize={12}
                        className="fill-muted-foreground"
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 33]}
                        fontSize={12}
                        className="fill-muted-foreground"
                        tickLine={false}
                      />
                      <RechartsTooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [
                          formatThirtyScaleGrade(value as number),
                          "Media",
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="averageScore"
                        stroke="#d14124"
                        strokeWidth={2}
                        fill="url(#examAreaGrad)"
                        dot={{ r: 5, fill: "#d14124", strokeWidth: 2, stroke: "hsl(var(--card))" }}
                        activeDot={{ r: 7 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Sections needing improvement & excellent — side by side */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {sectionsWithIssues.length > 0 && (
                <div className="overflow-hidden rounded-2xl border bg-card">
                  <div className="flex items-center gap-3 border-b p-5">
                    <div className="rounded-xl bg-orange-500/10 p-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">Da Migliorare</h3>
                      <p className="text-xs text-muted-foreground">
                        Sotto la sufficienza (&lt;18)
                      </p>
                    </div>
                  </div>
                  <div className="divide-y">
                    {sectionsWithIssues.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {item.section.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.section.class.name} &bull; {item.quizzes_taken}{" "}
                            quiz
                          </p>
                        </div>
                        <div className="ml-3 flex items-center gap-1.5">
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                          <span
                            className={`text-lg font-bold ${getGradeColor(item.average_score ?? 0)}`}
                          >
                            {formatThirtyScaleGrade(item.average_score ?? 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {excellentSections.length > 0 && (
                <div className="overflow-hidden rounded-2xl border bg-card">
                  <div className="flex items-center gap-3 border-b p-5">
                    <div className="rounded-xl bg-green-500/10 p-2">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">Eccellenti</h3>
                      <p className="text-xs text-muted-foreground">
                        Ottimi risultati (27+)
                      </p>
                    </div>
                  </div>
                  <div className="divide-y">
                    {excellentSections.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-5 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {item.section.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.section.class.name} &bull; {item.quizzes_taken}{" "}
                            quiz
                          </p>
                        </div>
                        <div className="ml-3 flex items-center gap-1.5">
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                          <span
                            className={`text-lg font-bold ${getGradeColor(item.average_score ?? 0)}`}
                          >
                            {formatThirtyScaleGrade(item.average_score ?? 0)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="space-y-6">
            {/* Summary cards — study vs exam side by side */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10 blur-[30px]" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-blue-500/10 p-2">
                      <Target className="h-5 w-5 text-blue-500" />
                    </div>
                    <h3 className="font-bold">Studio</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {overallStats.totalStudyQuizzes}
                      </p>
                      <p className="text-xs text-muted-foreground">Quiz</p>
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${getGradeColor(overallStats.avgStudy)}`}
                      >
                        {formatThirtyScaleGrade(overallStats.avgStudy)}
                      </p>
                      <p className="text-xs text-muted-foreground">Media</p>
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${getGradeColor(overallStats.bestStudy)}`}
                      >
                        {formatThirtyScaleGrade(overallStats.bestStudy)}
                      </p>
                      <p className="text-xs text-muted-foreground">Migliore</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-yellow-500/10 blur-[30px]" />
                <div className="relative space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-yellow-500/10 p-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    </div>
                    <h3 className="font-bold">Esame</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">
                        {overallStats.totalExamQuizzes}
                      </p>
                      <p className="text-xs text-muted-foreground">Quiz</p>
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${getGradeColor(overallStats.avgExam)}`}
                      >
                        {formatThirtyScaleGrade(overallStats.avgExam)}
                      </p>
                      <p className="text-xs text-muted-foreground">Media</p>
                    </div>
                    <div>
                      <p
                        className={`text-2xl font-bold ${getGradeColor(overallStats.bestExam)}`}
                      >
                        {formatThirtyScaleGrade(overallStats.bestExam)}
                      </p>
                      <p className="text-xs text-muted-foreground">Migliore</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed table using BrowseTable */}
            <div>
              <h3 className="mb-3 text-lg font-bold">
                Tutti i Record di Progresso
              </h3>
              <BrowseTable
                headers={[
                  "Sezione",
                  "Classe",
                  "Modalita",
                  "Quiz",
                  "Media",
                  "Migliore",
                  "Tempo",
                ]}
              >
                {progressData.map((record) => (
                  <tr
                    key={record.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <td className="py-3 pl-6 font-medium">
                      {record.section.name}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {record.section.class.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          record.quiz_mode === "STUDY"
                            ? "default"
                            : "secondary"
                        }
                        className="rounded-full"
                      >
                        {record.quiz_mode === "STUDY" ? "Studio" : "Esame"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {record.quizzes_taken}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-bold ${getGradeColor(record.average_score ?? 0)}`}
                    >
                      {formatThirtyScaleGrade(record.average_score ?? 0)}
                    </td>
                    <td
                      className={`px-4 py-3 text-center font-bold ${getGradeColor(record.best_score ?? 0)}`}
                    >
                      {formatThirtyScaleGrade(record.best_score ?? 0)}
                    </td>
                    <td className="px-4 py-3 pr-6 text-center text-sm text-muted-foreground">
                      {formatTimeSpent(record.total_time_spent)}
                    </td>
                    {/* Empty cell for arrow column from BrowseTable */}
                    <td />
                  </tr>
                ))}
              </BrowseTable>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
