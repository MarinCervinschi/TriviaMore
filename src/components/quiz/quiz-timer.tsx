import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function QuizTimer({
  timeLimitMinutes,
  onTimeUp,
}: {
  timeLimitMinutes: number
  onTimeUp: () => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60)

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onTimeUp])

  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const isWarning = secondsLeft < 300 // < 5 min

  return (
    <div
      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-mono font-medium ${
        isWarning
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Clock className="h-4 w-4" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  )
}
