import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

export function QuizTimer({
  timeLimitMinutes,
  onTimeUp,
}: {
  /** Countdown limit in minutes; null = open-ended chronometer counting up. */
  timeLimitMinutes: number | null
  onTimeUp: () => void
}) {
  const isUnlimited = timeLimitMinutes === null
  const [seconds, setSeconds] = useState(
    isUnlimited ? 0 : timeLimitMinutes * 60,
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (isUnlimited) return prev + 1
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [onTimeUp, isUnlimited])

  const totalSeconds = Math.max(0, seconds)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const secs = totalSeconds % 60
  const isWarning = !isUnlimited && totalSeconds < 300

  const display = hours > 0
    ? `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`

  return (
    <div
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-mono text-sm font-medium transition-colors ${
        isWarning
          ? "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-600 dark:text-red-400"
          : "bg-muted text-muted-foreground"
      }`}
      aria-label={isUnlimited ? "Tempo trascorso" : "Tempo rimanente"}
    >
      <Clock className="h-3.5 w-3.5" />
      {display}
    </div>
  )
}
