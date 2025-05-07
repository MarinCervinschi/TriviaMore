import QuizSection from "./QuizSection";

export default interface SectionSelectorProps {
  sections: QuizSection[]
  flashCards: QuizSection[] | undefined
  quizClassId: string | undefined
}