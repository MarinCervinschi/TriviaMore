export function formatThirtyScaleGrade(score: number): string {
  if (score < 0) return "0"
  if (score <= 30) return Math.round(score).toString()
  return "30L"
}

export function getGradeColor(score: number): string {
  if (score < 18) return "text-red-600"
  if (score < 24) return "text-yellow-600"
  if (score < 27) return "text-blue-600"
  if (score <= 30) return "text-green-600"
  return "text-purple-600"
}

export function getGradeDescription(score: number): string {
  if (score < 18) return "Insufficiente"
  if (score < 21) return "Sufficiente"
  if (score < 24) return "Discreto"
  if (score < 27) return "Buono"
  if (score <= 30) return "Ottimo"
  return "Eccellente"
}
