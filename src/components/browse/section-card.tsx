import { Link } from "@tanstack/react-router"
import { ArrowRight, BookOpen, Lock, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { BrowseSection } from "@/lib/browse/types"

export function SectionCard({
  section,
  deptCode,
  courseCode,
  classCode,
}: {
  section: BrowseSection
  deptCode: string
  courseCode: string
  classCode: string
}) {
  const sectionSlug = section.name.replace(/ /g, "-").toLowerCase()

  return (
    <Link
      to="/browse/$department/$course/$class/$section"
      params={{
        department: deptCode.toLowerCase(),
        course: courseCode.toLowerCase(),
        class: classCode.toLowerCase(),
        section: sectionSlug,
      }}
      className="group block"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold tracking-tight">
            {!section.is_public && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
            {section.name}
          </h3>

          <div className="mb-4 flex flex-wrap gap-2">
            {section.quiz_question_count > 0 && (
              <Badge className="gap-1.5 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <BookOpen className="h-3 w-3" />
                {section.quiz_question_count} quiz
              </Badge>
            )}
            {section.flashcard_question_count > 0 && (
              <Badge className="gap-1.5 bg-purple-500/10 text-purple-600 border-purple-500/20">
                <Sparkles className="h-3 w-3" />
                {section.flashcard_question_count} flashcard
              </Badge>
            )}
            {section.question_count === 0 && (
              <span className="text-sm text-muted-foreground">
                Nessuna domanda
              </span>
            )}
          </div>

          <div className="flex items-center justify-end text-sm text-muted-foreground">
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
