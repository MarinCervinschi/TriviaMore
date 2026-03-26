import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import {
  BookOpen,
  FileQuestion,
  FolderOpen,
  GraduationCap,
  Library,
  Target,
  Trophy,
  Users,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { adminQueries } from "@/lib/admin/queries"

export const Route = createFileRoute("/_app/admin/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(adminQueries.stats()),
  component: AdminDashboard,
  head: () => seoHead({ title: "Gestione Contenuti", noindex: true }),
})

function AdminDashboard() {
  const { data: stats } = useSuspenseQuery(adminQueries.stats())
  const { data: userStats } = useQuery(adminQueries.userStats())

  const contentCards = [
    {
      label: "Dipartimenti",
      value: stats.departmentCount,
      icon: Library,
      to: "/admin/departments",
      color: "text-blue-500",
    },
    {
      label: "Corsi",
      value: stats.courseCount,
      icon: GraduationCap,
      to: "/admin/departments",
      color: "text-green-500",
    },
    {
      label: "Classi",
      value: stats.classCount,
      icon: FolderOpen,
      to: "/admin/departments",
      color: "text-orange-500",
    },
    {
      label: "Sezioni",
      value: stats.sectionCount,
      icon: BookOpen,
      to: "/admin/departments",
      color: "text-purple-500",
    },
    {
      label: "Domande",
      value: stats.questionCount,
      icon: FileQuestion,
      to: "/admin/departments",
      color: "text-red-500",
    },
  ]

  return (
    <div className="py-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Gestione Contenuti</h1>
        <p className="mt-1 text-muted-foreground">
          Panoramica della piattaforma
        </p>
      </div>

      {/* Content stats */}
      <h2 className="mb-3 text-lg font-semibold">Contenuti</h2>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {contentCards.map((card) => (
          <Link key={card.label} to={card.to}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* User stats */}
      {userStats && (
        <>
          <h2 className="mb-3 text-lg font-semibold">Utenti e Utilizzo</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Link to="/admin/users">
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Utenti totali
                  </CardTitle>
                  <Users className="h-5 w-5 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{userStats.totalUsers}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {Object.entries(userStats.byRole).map(([role, count]) => (
                      <span
                        key={role}
                        className="text-xs text-muted-foreground"
                      >
                        {role === "STUDENT"
                          ? "Studenti"
                          : role === "ADMIN"
                            ? "Admin"
                            : role === "MAINTAINER"
                              ? "Maintainer"
                              : "Superadmin"}
                        : {count}
                        {role !== "STUDENT" ? " · " : ""}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quiz completati
                </CardTitle>
                <Trophy className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {userStats.totalQuizAttempts}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {userStats.recentQuizAttempts} negli ultimi 30 giorni
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Punteggio medio
                </CardTitle>
                <Target className="h-5 w-5 text-green-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {userStats.averageScore != null
                    ? `${Math.round(userStats.averageScore * 100)}%`
                    : "—"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Utenti attivi
                </CardTitle>
                <Users className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{userStats.activeUsers}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  con almeno 1 quiz completato
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
