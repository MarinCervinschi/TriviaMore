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
  const isWarning = secondsLeft < 300

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-medium transition-colors ${
        isWarning
          ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400"
          : "bg-muted text-muted-foreground"
      }`}
    >
      <Clock className="h-3.5 w-3.5" />
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  )
}
