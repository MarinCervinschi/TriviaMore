import { useState, useEffect } from "react"
import TimerProps from "@/types/TimerProps"

export function Timer({ isRunning, totalTime }: TimerProps) {
  const [time, setTime] = useState(0)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isRunning) {
      intervalId = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [isRunning])

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
    const seconds = timeInSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="text-lg font-semibold" aria-live="polite">
      Time: {formatTime(totalTime !== undefined ? totalTime : time)}
    </div>
  )
}

