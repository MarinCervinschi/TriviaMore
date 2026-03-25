import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { BrowseCourse } from "@/lib/browse/types"

const courseTypeLabels: Record<string, string> = {
  BACHELOR: "Triennale",
  MASTER: "Magistrale",
}

export function CourseCard({
  course,
  deptCode,
}: {
  course: BrowseCourse
  deptCode: string
}) {
  const classCount = course.classes[0]?.count ?? 0

  return (
    <Link
      to="/browse/$department/$course"
      params={{
        department: deptCode.toLowerCase(),
        course: course.code.toLowerCase(),
      }}
      className="block"
    >
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{course.name}</CardTitle>
            <Badge variant="secondary">
              {courseTypeLabels[course.course_type] ?? course.course_type}
            </Badge>
          </div>
          {course.description && (
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {classCount} {classCount === 1 ? "classe" : "classi"}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
