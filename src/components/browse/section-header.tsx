import { BookOpen, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { SectionDetail } from "@/lib/browse/types"

export function SectionHeader({ section }: { section: SectionDetail }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{section.name}</h1>
      {section.description && (
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {section.description}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Badge variant="secondary" className="gap-1 text-sm">
          {section.question_count} domande totali
        </Badge>
        {section.quiz_question_count > 0 && (
          <Badge variant="secondary" className="gap-1 text-sm">
            <BookOpen className="h-3 w-3" />
            {section.quiz_question_count} quiz
          </Badge>
        )}
        {section.flashcard_question_count > 0 && (
          <Badge variant="secondary" className="gap-1 text-sm">
            <Sparkles className="h-3 w-3" />
            {section.flashcard_question_count} flashcard
          </Badge>
        )}
      </div>
    </div>
  )
}
