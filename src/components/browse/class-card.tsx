import { Link } from "@tanstack/react-router"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
      className="block"
    >
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{classData.name}</CardTitle>
            <Badge variant="outline">Anno {classData.class_year}</Badge>
          </div>
          {classData.description && (
            <CardDescription className="line-clamp-2">
              {classData.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {sectionCount} {sectionCount === 1 ? "sezione" : "sezioni"}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
