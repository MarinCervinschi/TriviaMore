import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { BrowseCourse } from "@/lib/browse/types"

const courseTypeConfig: Record<string, { label: string; className: string }> = {
  BACHELOR: {
    label: "Triennale",
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  MASTER: {
    label: "Magistrale",
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
}

export function CourseCard({
  course,
  deptCode,
}: {
  course: BrowseCourse
  deptCode: string
}) {
  const classCount = course.classes[0]?.count ?? 0
  const typeConfig = courseTypeConfig[course.course_type] ?? {
    label: course.course_type,
    className: "",
  }

  return (
    <Link
      to="/browse/$department/$course"
      params={{
        department: deptCode.toLowerCase(),
        course: course.code.toLowerCase(),
      }}
      className="group block"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          <div className="mb-4">
            <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
          </div>

          <h3 className="mb-1.5 text-lg font-semibold tracking-tight">
            {course.name}
          </h3>
          {course.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {course.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {classCount}
              </span>{" "}
              {classCount === 1 ? "classe" : "classi"}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
