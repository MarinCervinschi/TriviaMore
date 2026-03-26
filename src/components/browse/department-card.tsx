import { Link } from "@tanstack/react-router"
import { ArrowRight, GraduationCap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { BrowseDepartment } from "@/lib/browse/types"

export function DepartmentCard({
  department,
}: {
  department: BrowseDepartment
}) {
  const courseCount = department.courses[0]?.count ?? 0

  return (
    <Link
      to="/browse/$department"
      params={{ department: department.code.toLowerCase() }}
      className="group block"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative">
          <div className="mb-4 flex items-start justify-between">
            <div className="inline-flex rounded-2xl bg-primary/10 p-3">
              <GraduationCap
                className="h-6 w-6 text-primary"
                strokeWidth={1.5}
              />
            </div>
            <Badge variant="outline" className="text-xs">
              {department.code}
            </Badge>
          </div>

          <h3 className="mb-1.5 text-lg font-semibold tracking-tight">
            {department.name}
          </h3>
          {department.description && (
            <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {department.description}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              <span className="font-semibold text-foreground">
                {courseCount}
              </span>{" "}
              {courseCount === 1 ? "corso" : "corsi"}
            </span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  )
}
