import { BookOpen, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { SectionDetail } from "@/lib/browse/types"

export function SectionHeader({ section }: { section: SectionDetail }) {
  return (
    <div className="mb-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {section.name}
      </h1>
      {section.description && (
        <p className="mb-4 max-w-2xl text-lg text-muted-foreground">
          {section.description}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="gap-1.5 text-sm">
          {section.question_count} domande totali
        </Badge>
        {section.quiz_question_count > 0 && (
          <Badge className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20 text-sm">
            <BookOpen className="h-3 w-3" />
            {section.quiz_question_count} quiz
          </Badge>
        )}
        {section.flashcard_question_count > 0 && (
          <Badge className="gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/20 text-sm">
            <Sparkles className="h-3 w-3" />
            {section.flashcard_question_count} flashcard
          </Badge>
        )}
      </div>
    </div>
  )
}
