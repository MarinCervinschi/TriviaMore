export type FlashcardQuestion = {
  id: string
  content: string
  correct_answer: string[]
  explanation: string | null
  difficulty: "EASY" | "MEDIUM" | "HARD"
  order: number
}

export type FlashcardSection = {
  id: string
  name: string
  class: {
    name: string
    course: {
      name: string
      department: {
        name: string
      }
    }
  }
}

export type FlashcardSession = {
  id: string
  section: FlashcardSection
  questions: FlashcardQuestion[]
}
