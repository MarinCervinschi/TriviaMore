import { Link } from "@tanstack/react-router"
import { BookOpen, Lock, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      className="block"
    >
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              {!section.is_public && (
                <Lock className="h-4 w-4 text-muted-foreground" />
              )}
              {section.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {section.quiz_question_count > 0 && (
              <Badge variant="secondary" className="gap-1">
                <BookOpen className="h-3 w-3" />
                {section.quiz_question_count} quiz
              </Badge>
            )}
            {section.flashcard_question_count > 0 && (
              <Badge variant="secondary" className="gap-1">
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
        </CardContent>
      </Card>
    </Link>
  )
}
