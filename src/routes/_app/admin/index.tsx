import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import {
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
import { AdminStatCard } from "@/components/admin/admin-stat-card"
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
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {contentCards.map((card) => (
          <AdminStatCard
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
            <AdminStatCard
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
            <AdminStatCard
              label="Quiz completati"
              value={userStats.totalQuizAttempts}
              icon={Trophy}
              color="yellow"
              subtitle={`${userStats.recentQuizAttempts} negli ultimi 30 giorni`}
            />
            <AdminStatCard
              label="Punteggio medio"
              value={
                userStats.averageScore != null
                  ? `${Math.round((userStats.averageScore / 33) * 100)}%`
                  : "—"
              }
              icon={Target}
              color="green"
            />
            <AdminStatCard
              label="Utenti attivi"
              value={userStats.activeUsers}
              icon={Users}
              color="purple"
              subtitle="con almeno 1 quiz completato"
            />
          </div>
        </>
      )}
    </div>
  )
}
