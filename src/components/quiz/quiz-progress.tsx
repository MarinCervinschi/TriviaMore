import { Progress } from "@/components/ui/progress"

export function QuizProgress({
  current,
  total,
}: {
  current: number
  total: number
}) {
  const percentage = ((current + 1) / total) * 100

  return (
    <div className="px-4 py-2">
      <Progress value={percentage} className="h-2" />
    </div>
  )
}
