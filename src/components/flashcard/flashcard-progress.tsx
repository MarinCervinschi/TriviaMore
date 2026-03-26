import { Progress } from "@/components/ui/progress"

export function FlashcardProgress({
  studied,
  total,
}: {
  studied: number
  total: number
}) {
  const percentage = total > 0 ? (studied / total) * 100 : 0

  return (
    <div className="px-4 py-2">
      <Progress value={percentage} className="h-2" />
    </div>
  )
}
