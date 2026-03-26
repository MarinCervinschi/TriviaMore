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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-red-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
