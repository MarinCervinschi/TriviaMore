export function getPerformanceLevel(score: number): {
  level: "excellent" | "good" | "fair" | "poor"
  label: string
  color: string
} {
  if (score >= 30)
    return { level: "excellent", label: "Eccellente", color: "green" }
  if (score >= 25) return { level: "good", label: "Buono", color: "blue" }
  if (score >= 20)
    return { level: "fair", label: "Sufficiente", color: "yellow" }
  return { level: "poor", label: "Insufficiente", color: "red" }
}

export function getScoreColor(score: number): string {
  if (score >= 30) return "text-green-600 dark:text-green-400"
  if (score >= 25) return "text-blue-600 dark:text-blue-400"
  if (score >= 20) return "text-yellow-600 dark:text-yellow-400"
  return "text-red-600 dark:text-red-400"
}

export function getScoreBadgeVariant(
  score: number,
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 30) return "default"
  if (score >= 25) return "secondary"
  if (score >= 20) return "outline"
  return "destructive"
}

export function formatTimeSpent(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}
