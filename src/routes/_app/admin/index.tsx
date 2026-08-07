import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import {
  ArrowRight,
  BookOpen,
  FileQuestion,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  Target,
  Trophy,
  Users,
} from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { StatCard } from "@/components/shared/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/useAuth"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminQueries.stats()),
  component: AdminDashboard,
  head: () => seoHead({ title: "Gestione Contenuti", noindex: true }),
})

function AdminDashboard() {
  const { user } = useAuth()
  const isSuperadmin = user?.role === "SUPERADMIN"
  const { data: stats } = useSuspenseQuery(adminQueries.stats())
  // User stats are SUPERADMIN-only (getAdminUserStatsFn). Running this query as
  // a MAINTAINER/ADMIN would trigger requireSuperadmin's redirect to /user.
  const { data: userStats } = useQuery({
    ...adminQueries.userStats(),
    enabled: isSuperadmin,
  })
  const { data: myCourses } = useQuery(adminQueries.myMaintainedCourses())

  const contentCards = [
    { label: "Dipartimenti", value: stats.departmentCount, icon: Library, to: "/admin/departments", color: "blue" },
    { label: "Corsi", value: stats.courseCount, icon: GraduationCap, to: "/admin/departments", color: "green" },
    { label: "Insegnamenti", value: stats.classCount, icon: FolderOpen, to: "/admin/departments", color: "orange" },
    { label: "Sezioni", value: stats.sectionCount, icon: BookOpen, to: "/admin/departments", color: "purple" },
    { label: "Domande", value: stats.questionCount, icon: FileQuestion, to: "/admin/departments", color: "red" },
  ]

  return (
    <div className="py-2">
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Gestione Contenuti"
        description="Panoramica della piattaforma"
      />

      {/* Content stats */}
      <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
        Contenuti
      </p>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {contentCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            href={card.to}
          />
        ))}
      </div>

      {/* User stats */}
      {userStats && (
        <>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            Utenti e Utilizzo
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Utenti totali"
              value={userStats.totalUsers}
              icon={Users}
              color="blue"
              href="/admin/users"
              subtitle={Object.entries(userStats.byRole)
                .map(([role, count]) =>
                  `${role === "STUDENT" ? "Studenti" : role === "ADMIN" ? "Admin" : role === "MAINTAINER" ? "Maintainer" : "Superadmin"}: ${count}`,
                )
                .join(" · ")}
            />
            <StatCard
              label="Quiz completati"
              value={userStats.totalQuizAttempts}
              icon={Trophy}
              color="yellow"
              subtitle={`${userStats.recentQuizAttempts} negli ultimi 30 giorni`}
            />
            <StatCard
              label="Punteggio medio"
              value={
                userStats.averageScore != null
                  ? `${Math.round((userStats.averageScore / 33) * 100)}%`
                  : "—"
              }
              icon={Target}
              color="green"
            />
            <StatCard
              label="Utenti attivi"
              value={userStats.activeUsers}
              icon={Users}
              color="purple"
              subtitle="con almeno 1 quiz completato"
            />
          </div>
        </>
      )}

      {/* My maintained courses */}
      {(myCourses ?? []).length > 0 && (
        <div className="mt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-primary">
            I miei corsi mantenuti
          </p>
          <Card className="overflow-hidden rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-xs font-medium uppercase tracking-wider">
                      Corso
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider">
                      Codice
                    </TableHead>
                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider">
                      Azioni
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(myCourses ?? []).map((course) => (
                    <TableRow
                      key={course.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <TableCell>
                        <Link
                          to="/admin/courses/$courseId"
                          params={{ courseId: course.id }}
                          className="font-medium hover:underline"
                        >
                          {course.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full">
                          {course.code}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-lg"
                          asChild
                        >
                          <Link
                            to="/admin/courses/$courseId"
                            params={{ courseId: course.id }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
