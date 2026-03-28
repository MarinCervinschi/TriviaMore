import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
} from "lucide-react"

import {
  formatThirtyScaleGrade,
  getGradeColor,
} from "@/lib/utils/grading"
import type { UserProgress } from "@/lib/user/types"

export function SectionsComparison({
  studyProgress,
}: {
  studyProgress: UserProgress[]
}) {
  const sectionsWithIssues = studyProgress.filter(
    (s) => (s.average_score ?? 0) < 18,
  )
  const excellentSections = studyProgress.filter(
    (s) => (s.average_score ?? 0) >= 27,
  )

  if (sectionsWithIssues.length === 0 && excellentSections.length === 0) {
    return null
  }

  return (
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
  )
}
