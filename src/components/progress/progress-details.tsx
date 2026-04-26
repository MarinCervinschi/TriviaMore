import { Target, Trophy } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { BrowseTable } from "@/components/browse/browse-table"
import {
  formatThirtyScaleGrade,
  getGradeColor,
} from "@/lib/utils/grading"
import { formatTimeSpent } from "@/lib/utils/quiz-results"
import type { OverallStats } from "@/hooks/useProgressData"
import type { UserProgress } from "@/lib/user/types"

export function ProgressDetails({
  overallStats,
  progressData,
}: {
  overallStats: OverallStats
  progressData: UserProgress[]
}) {
  return (
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
            <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
              <div>
                <p className="text-xl font-bold sm:text-2xl">
                  {overallStats.totalStudyQuizzes}
                </p>
                <p className="text-xs text-muted-foreground">Quiz</p>
              </div>
              <div>
                <p
                  className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.avgStudy)}`}
                >
                  {formatThirtyScaleGrade(overallStats.avgStudy)}
                </p>
                <p className="text-xs text-muted-foreground">Media</p>
              </div>
              <div>
                <p
                  className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.bestStudy)}`}
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
            <div className="grid grid-cols-3 gap-2 text-center sm:gap-4">
              <div>
                <p className="text-xl font-bold sm:text-2xl">
                  {overallStats.totalExamQuizzes}
                </p>
                <p className="text-xs text-muted-foreground">Quiz</p>
              </div>
              <div>
                <p
                  className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.avgExam)}`}
                >
                  {formatThirtyScaleGrade(overallStats.avgExam)}
                </p>
                <p className="text-xs text-muted-foreground">Media</p>
              </div>
              <div>
                <p
                  className={`text-xl font-bold sm:text-2xl ${getGradeColor(overallStats.bestExam)}`}
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
            "Insegnamento",
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
              <td className="min-w-[14rem] py-3 pl-6 pr-3 align-top font-medium">
                {record.section_name}
              </td>
              <td className="min-w-[12rem] px-4 py-3 align-top text-center text-sm text-muted-foreground">
                {record.class_name}
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
  )
}
