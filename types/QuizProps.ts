import QuizSection from './QuizSection'
import QuizQuestion from './QuizQuestion'

export default interface QuizProps {
  section: QuizSection
  questions: QuizQuestion[]
  quizClassId: string
}