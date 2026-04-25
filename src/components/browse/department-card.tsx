import { Link } from "@tanstack/react-router"
import {
  ArrowRight,
  Atom,
  Building2,
  Cpu,
  GraduationCap,
  HeartPulse,
  Landmark,
  Leaf,
  MapPin,
  type LucideIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  AREA_CONFIG,
  CAMPUS_LOCATION_CONFIG,
} from "@/lib/browse/constants"
import { cn } from "@/lib/utils"

const AREA_ICONS: Record<string, LucideIcon> = {
  SCIENZE: Atom,
  TECNOLOGIA: Cpu,
  SALUTE: HeartPulse,
  VITA: Leaf,
  SOCIETA_CULTURA: Landmark,
}

const AREA_BANNER_TEXT: Record<string, string> = {
  SCIENZE: "text-blue-700 dark:text-blue-300",
  TECNOLOGIA: "text-indigo-700 dark:text-indigo-300",
  SALUTE: "text-rose-700 dark:text-rose-300",
  VITA: "text-emerald-700 dark:text-emerald-300",
  SOCIETA_CULTURA: "text-amber-700 dark:text-amber-300",
}

export type DepartmentCardData = {
  id: string
  code: string
  name: string
  description?: string | null
  area?: string | null
  courses: { count: number }[]
  department_locations: { campus_location: string | null }[]
}

export function DepartmentCard({
  department,
}: {
  department: DepartmentCardData
}) {
  const courseCount = department.courses[0]?.count ?? 0
  const areaConf = department.area ? AREA_CONFIG[department.area] : null
  const AreaIcon = department.area ? AREA_ICONS[department.area] : null
  const areaTextClass = department.area
    ? AREA_BANNER_TEXT[department.area]
    : "text-foreground"

  const campuses = [
    ...new Set(
      department.department_locations
        .map((l) => l.campus_location)
        .filter(Boolean),
    ),
  ] as string[]

  return (
    <Link
      to="/browse/$department"
      params={{ department: department.code.toLowerCase() }}
      className="group block h-full"
    >
      <article
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-sm",
          "transition-all duration-300",
          "hover:-translate-y-1 hover:shadow-xl hover:border-primary/30",
        )}
      >
        {/* Area banner */}
        <div
          className={cn(
            "relative flex items-center gap-2.5 px-5 py-4",
            "bg-gradient-to-br",
            areaConf?.gradient ?? "from-primary/10 to-primary/5",
          )}
        >
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background/80 shadow-sm ring-1 ring-border/50 backdrop-blur",
              areaTextClass,
            )}
          >
            {AreaIcon ? (
              <AreaIcon className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <Building2 className="h-4 w-4" strokeWidth={1.75} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[10px] font-bold uppercase tracking-[0.16em]",
                areaTextClass,
              )}
            >
              {areaConf?.label ?? "Area"}
            </p>
            <p className="truncate font-mono text-[11px] text-muted-foreground">
              {department.code}
            </p>
          </div>
          <div
            className={cn(
              "h-7 w-7 shrink-0 rounded-full bg-background/70 ring-1 ring-border/50 backdrop-blur",
              "flex items-center justify-center transition-transform",
              "group-hover:translate-x-0.5",
            )}
          >
            <ArrowRight
              className={cn("h-3.5 w-3.5 transition-colors", areaTextClass)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col gap-2.5 p-5">
          <h3 className="line-clamp-2 text-base font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-lg">
            {department.name}
          </h3>
          {department.description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {department.description}
            </p>
          )}

          {/* Footer */}
          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <GraduationCap className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-semibold text-foreground tabular-nums">
                {courseCount}
              </span>
              <span className="text-xs sm:text-sm">
                {courseCount === 1 ? "corso" : "corsi"}
              </span>
            </span>
            {campuses.length > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" strokeWidth={1.75} />
                <span className="flex flex-wrap gap-1">
                  {campuses.map((c) => (
                    <Badge
                      key={c}
                      variant="outline"
                      className="font-mono text-[10px]"
                    >
                      {CAMPUS_LOCATION_CONFIG[c]?.short ?? c}
                    </Badge>
                  ))}
                </span>
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
