import { Link } from "@tanstack/react-router"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { BrowseClass } from "@/lib/browse/types"

export function ClassCard({
  classData,
  deptCode,
  courseCode,
}: {
  classData: BrowseClass
  deptCode: string
  courseCode: string
}) {
  const sectionCount = classData.sections[0]?.count ?? 0

  return (
    <Link
      to="/browse/$department/$course/$class"
      params={{
        department: deptCode.toLowerCase(),
        course: courseCode.toLowerCase(),
        class: classData.code.toLowerCase(),
      }}
      className="group block"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          <div className="mb-4">
            <Badge variant="outline">Anno {classData.class_year}</Badge>
          </div>

          <h3 className="mb-1.5 text-lg font-semibold tracking-tight">
            {classData.name}
          </h3>
          {classData.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {classData.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {sectionCount}
              </span>{" "}
              {sectionCount === 1 ? "sezione" : "sezioni"}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
