import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Link, useMatchRoute } from "@tanstack/react-router"
import {
  BookOpen,
  ChevronRight,
  FileQuestion,
  FolderOpen,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Library,
  Shield,
  Trophy,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { adminQueries } from "@/lib/admin/queries"
import { requestQueries } from "@/lib/requests/queries"
import type {
  ContentTreeClass,
  ContentTreeCourse,
  ContentTreeDepartment,
} from "@/lib/admin/types"

export function AdminSidebar() {
  const { data: stats } = useQuery(adminQueries.stats())
  const { data: userStats } = useQuery(adminQueries.userStats())
  const { data: tree } = useQuery(adminQueries.contentTree())
  const matchRoute = useMatchRoute()

  const { data: requestCount } = useQuery(requestQueries.adminRequestCount())

  const isDashboardActive = matchRoute({ to: "/admin", fuzzy: false })
  const isDeptActive = matchRoute({ to: "/admin/departments", fuzzy: true })
  const isUsersActive = matchRoute({ to: "/admin/users", fuzzy: true })
  const isRequestsActive = matchRoute({ to: "/admin/requests", fuzzy: true })

  return (
    <nav className="rounded-2xl border bg-card/50 p-4">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-primary">
        Gestione
      </p>
      <div className="flex flex-col gap-0.5">
        {/* Dashboard */}
        <Link
          to="/admin"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
            isDashboardActive && "bg-primary/10 text-primary font-semibold",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Dipartimenti — with file tree */}
        <DepartmentsTreeLink
          isActive={!!isDeptActive}
          tree={tree}
          departmentCount={stats?.departmentCount}
        />

        {/* Utenti */}
        <Link
          to="/admin/users"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
            isUsersActive && "bg-primary/10 text-primary font-semibold",
          )}
        >
          <Users className="h-4 w-4" />
          Utenti
        </Link>

        {/* Richieste */}
        <Link
          to="/admin/requests"
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/50",
            isRequestsActive && "bg-primary/10 text-primary font-semibold",
          )}
        >
          <Inbox className="h-4 w-4" />
          Richieste
          {(requestCount ?? 0) > 0 && (
            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {requestCount}
            </span>
          )}
        </Link>

      </div>

      {/* Stats: Contenuti */}
      <div className="my-4 border-t border-border/50 pt-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Contenuti
        </p>
        <div className="flex flex-col gap-0.5">
          <SidebarStat icon={GraduationCap} label="Corsi" count={stats?.courseCount} />
          <SidebarStat icon={FolderOpen} label="Insegnamenti" count={stats?.classCount} />
          <SidebarStat icon={BookOpen} label="Sezioni" count={stats?.sectionCount} />
          <SidebarStat icon={FileQuestion} label="Domande" count={stats?.questionCount} />
        </div>
      </div>

      {/* Stats: Utenti */}
      <div className="border-t border-border/50 pt-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-primary">
          Utenti
        </p>
        <div className="flex flex-col gap-0.5">
          <SidebarStat icon={Users} label="Registrati" count={userStats?.totalUsers} />
          <SidebarStat icon={Shield} label="Admin" count={(userStats?.byRole?.SUPERADMIN ?? 0) + (userStats?.byRole?.ADMIN ?? 0) + (userStats?.byRole?.MAINTAINER ?? 0)} />
          <SidebarStat icon={Trophy} label="Quiz completati" count={userStats?.totalQuizAttempts} />
        </div>
      </div>
    </nav>
  )
}

// ─── Dipartimenti link with expandable file tree ───

function DepartmentsTreeLink({
  isActive,
  tree,
  departmentCount,
}: {
  isActive: boolean
  tree?: ContentTreeDepartment[]
  departmentCount?: number
}) {
  const [open, setOpen] = useState(false)
  const hasTree = tree && tree.length > 0

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-xl transition-colors hover:bg-accent/50",
          isActive && "bg-primary/10",
        )}
      >
        {/* Chevron toggle */}
        <button
          onClick={() => hasTree && setOpen(!open)}
          className="shrink-0 px-2 py-2"
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200",
              open && "rotate-90",
              !hasTree && "invisible",
            )}
          />
        </button>

        {/* Main link */}
        <Link
          to="/admin/departments"
          className={cn(
            "flex flex-1 items-center gap-2 py-2 pr-3 text-sm font-medium",
            isActive ? "text-primary font-semibold" : "text-foreground",
          )}
        >
          <Library className="h-4 w-4" />
          <span className="flex-1">Dipartimenti</span>
          {departmentCount !== undefined && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {departmentCount}
            </span>
          )}
        </Link>
      </div>

      {/* File tree */}
      {open && hasTree && (
        <div className="ml-4 mt-0.5 border-l border-border/40 pl-1">
          {tree.map((dept) => (
            <DepartmentNode key={dept.id} department={dept} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Tree nodes ───

function DepartmentNode({ department }: { department: ContentTreeDepartment }) {
  const [open, setOpen] = useState(false)
  const hasCourses = department.courses.length > 0

  return (
    <div>
      <button
        onClick={() => hasCourses && setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-accent/50"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200",
            open && "rotate-90",
            !hasCourses && "invisible",
          )}
        />
        <Library className="h-3.5 w-3.5 shrink-0 text-blue-500" />
        <Link
          to="/admin/departments/$departmentId"
          params={{ departmentId: department.id }}
          className="flex-1 truncate text-left text-foreground hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {department.name}
        </Link>
        <span className="shrink-0 text-[10px] text-muted-foreground/50">
          {department.courses.length}
        </span>
      </button>

      {open && hasCourses && (
        <div className="ml-3 border-l border-border/40 pl-1">
          {department.courses.map((course) => (
            <CourseNode key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseNode({ course }: { course: ContentTreeCourse }) {
  const [open, setOpen] = useState(false)
  const hasClasses = course.classes.length > 0

  return (
    <div>
      <button
        onClick={() => hasClasses && setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-accent/50"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200",
            open && "rotate-90",
            !hasClasses && "invisible",
          )}
        />
        <GraduationCap className="h-3.5 w-3.5 shrink-0 text-green-500" />
        <Link
          to="/admin/courses/$courseId"
          params={{ courseId: course.id }}
          className="flex-1 truncate text-left text-foreground hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {course.name}
        </Link>
        <span className="shrink-0 text-[10px] text-muted-foreground/50">
          {course.classes.length}
        </span>
      </button>

      {open && hasClasses && (
        <div className="ml-3 border-l border-border/40 pl-1">
          {course.classes.map((cls) => (
            <ClassNode key={cls.id} cls={cls} />
          ))}
        </div>
      )}
    </div>
  )
}

function ClassNode({ cls }: { cls: ContentTreeClass }) {
  const [open, setOpen] = useState(false)
  const hasSections = cls.sections.length > 0

  return (
    <div>
      <button
        onClick={() => hasSections && setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-accent/50"
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 shrink-0 text-muted-foreground/50 transition-transform duration-200",
            open && "rotate-90",
            !hasSections && "invisible",
          )}
        />
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-orange-500" />
        <Link
          to="/admin/classes/$classId"
          params={{ classId: cls.id }}
          className="flex-1 truncate text-left text-foreground hover:text-primary"
          onClick={(e) => e.stopPropagation()}
        >
          {cls.name}
        </Link>
        <span className="shrink-0 text-[10px] text-muted-foreground/50">
          {cls.sections.length}
        </span>
      </button>

      {open && hasSections && (
        <div className="ml-3 border-l border-border/40 pl-1">
          {cls.sections.map((section) => (
            <Link
              key={section.id}
              to="/admin/sections/$sectionId"
              params={{ sectionId: section.id }}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs transition-colors hover:bg-accent/50"
            >
              <span className="h-3 w-3" />
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-purple-500" />
              <span className="flex-1 truncate text-foreground hover:text-primary">
                {section.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Stat row ───

function SidebarStat({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType
  label: string
  count?: number
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4" />
      <span className="flex-1">{label}</span>
      {count !== undefined && (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
          {count}
        </span>
      )}
    </div>
  )
}
