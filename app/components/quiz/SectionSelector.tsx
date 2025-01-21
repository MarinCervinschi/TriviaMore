import { createElement } from "react"
import { Button } from "@components/ui/button"
import { QuizSection } from "@/lib/quiz-data"

interface SectionSelectorProps {
  sections: QuizSection[];
  onSelectSection: (sectionId: string) => void;
  onSelectRandom: () => void;
}

export function SectionSelector({ sections, onSelectSection, onSelectRandom }: SectionSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">Select a Quiz Section</h2>
      <div className="grid grid-cols-1 gap-4 tablet:grid-cols-2 descktop:grid-cols-3">
        {sections.map((section) => (
          <Button
            key={section.id}
            onClick={() => onSelectSection(section.id)}
            variant="outline"
            className="h-auto py-4 text-lg"
          >
            {section.icon && createElement(section.icon)}{section.name} 
          </Button>
        ))}
        <Button
          onClick={onSelectRandom}
          variant="default"
          className="h-auto py-4 text-lg col-span-full"
        >
          Random Mix (20 Questions)
        </Button>
      </div>
    </div>
  )
}

