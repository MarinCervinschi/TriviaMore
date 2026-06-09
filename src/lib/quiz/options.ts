export type QuestionOption = {
  id: string
  text: string
}

export function parseOptions(options: string[] | null): QuestionOption[] {
  if (!options) return []
  return options.map((text) => ({ id: text, text }))
}

export function isCorrectOption(
  optionId: string,
  correctAnswer: string[],
): boolean {
  return correctAnswer.includes(optionId)
}
