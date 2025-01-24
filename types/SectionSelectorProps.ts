import QuizSection from "./QuizSection";

export default interface SectionSelectorProps {
    sections: QuizSection[];
    onSelectSection: (sectionId: string) => void;
    onSelectRandom: () => void;
  }