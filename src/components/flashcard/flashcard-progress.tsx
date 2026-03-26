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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
