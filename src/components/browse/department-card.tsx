import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      className="block"
    >
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{department.name}</CardTitle>
            <Badge variant="outline">{department.code}</Badge>
          </div>
          {department.description && (
            <CardDescription className="line-clamp-2">
              {department.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {courseCount} {courseCount === 1 ? "corso" : "corsi"}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
