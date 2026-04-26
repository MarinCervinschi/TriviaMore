import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BookmarkIcon,
  Calendar,
  ExternalLink,
  GraduationCap,
  Inbox,
  Mail,
  TrendingUp,
  Trophy,
} from "lucide-react"

import { UserDashboardSkeleton } from "@/components/skeletons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BrowseTable } from "@/components/browse/browse-table"
import { COURSE_TYPE_CONFIG } from "@/lib/browse/constants"
import { UserHero } from "@/components/user/user-hero"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { userQueries } from "@/lib/user/queries"
import { getDisplayName, getInitials, getRoleLabel } from "@/lib/user/utils"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { staggerContainer, staggerItem, withReducedMotion } from "@/lib/motion"
import type { RecentClass, RecentQuizAttempt } from "@/lib/user/types"
import { getScoreBadgeVariant } from "@/lib/utils/quiz-results"

export const Route = createFileRoute("/_app/user/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.profile()),
  head: () => seoHead({ title: "Dashboard", noindex: true }),
  pendingComponent: UserDashboardSkeleton,
  component: DashboardPage,
})

function DashboardPage() {
  const { data: profile } = useSuspenseQuery(userQueries.profile())

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <UserHero
        icon={Trophy}
        title=""
        description=""
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16 shrink-0 border-4 border-background shadow-xl ring-2 ring-primary/20 sm:h-20 sm:w-20 lg:h-24 lg:w-24">
            <AvatarImage src={profile.image ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary sm:text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
              Ciao,{" "}
              <span className="gradient-text break-words">{displayName}</span>
            </h1>
            <div className="mb-3 flex items-center gap-2">
              <Badge className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm sm:px-4 sm:py-1.5 sm:text-sm">
                {getRoleLabel(profile.role)}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
              {profile.email && (
                <div className="flex min-w-0 items-center gap-1.5">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate text-sm">{profile.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 shrink-0" />
                <span className="text-sm">
                  Membro dal{" "}
                  {new Date(profile.created_at).toLocaleDateString("it-IT")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </UserHero>

      <div className="container space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <UserStatsCard
            label="Quiz Completati"
            value={profile.stats.total_quizzes}
            icon={Trophy}
            iconColor="text-yellow-500"
            iconBg="yellow"
          />
          <UserStatsCard
            label="Punteggio Medio"
            value={`${profile.stats.average_score}/33`}
            icon={TrendingUp}
            iconColor="text-green-500"
            iconBg="green"
          />
          <UserStatsCard
            label="Corsi Seguiti"
            value={profile.stats.user_classes_count}
            icon={GraduationCap}
            iconColor="text-blue-500"
            iconBg="blue"
          />
          <UserStatsCard
            label="Segnalibri"
            value={profile.stats.bookmarks_count}
            icon={BookmarkIcon}
            iconColor="text-purple-500"
            iconBg="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickActionCard
            icon={Inbox}
            color="amber"
            title="I Miei Contributi"
            description="Proponi nuovi contenuti per la piattaforma"
            href="/user/requests"
          />
          <QuickActionCard
            icon={TrendingUp}
            color="green"
            title="I Miei Progressi"
            description="Visualizza i tuoi progressi dettagliati per ogni materia"
            href="/user/progress"
          />
          <QuickActionCard
            icon={GraduationCap}
            color="blue"
            title="I Miei Corsi"
            description="Gestisci i corsi che stai seguendo al meglio"
            href="/user/classes"
          />
          <QuickActionCard
            icon={BookmarkIcon}
            color="purple"
            title="I Miei Segnalibri"
            description="Accedi alle domande che hai salvato per dopo"
            href="/user/bookmarks"
          />
        </div>

        {/* Recent Classes */}
        {profile.recent_classes.length > 0 && (
          <RecentClassesSection classes={profile.recent_classes} />
        )}

        {/* Recent Activity */}
        {profile.recent_quiz_attempts.length > 0 && (
          <RecentActivitySection attempts={profile.recent_quiz_attempts} />
        )}
      </div>
    </div>
  )
}

const actionColorMap: Record<string, { border: string; gradient: string; orb: string; badge: string; iconColor: string }> = {
  amber: {
    border: "border-amber-500/20",
    gradient: "from-amber-500/5 via-card to-card",
    orb: "bg-amber-500/10",
    badge: "bg-amber-500/10",
    iconColor: "text-amber-500",
  },
  green: {
    border: "border-green-500/20",
    gradient: "from-green-500/5 via-card to-card",
    orb: "bg-green-500/10",
    badge: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  blue: {
    border: "border-blue-500/20",
    gradient: "from-blue-500/5 via-card to-card",
    orb: "bg-blue-500/10",
    badge: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  primary: {
    border: "border-primary/20",
    gradient: "from-primary/5 via-card to-card",
    orb: "bg-primary/10",
    badge: "bg-primary/10",
    iconColor: "text-primary",
  },
  purple: {
    border: "border-purple-500/20",
    gradient: "from-purple-500/5 via-card to-card",
    orb: "bg-purple-500/10",
    badge: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
}

function QuickActionCard({
  icon: Icon,
  color,
  title,
  description,
  href,
}: {
  icon: typeof Trophy
  color: string
  title: string
  description: string
  href: string
}) {
  const colors = actionColorMap[color] ?? actionColorMap.primary

  return (
    <Link
      to={href}
      className={`group relative overflow-hidden rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.gradient} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl`}
    >
      {/* Decorative orb */}
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full ${colors.orb} blur-[30px]`}
      />

      <div className="relative">
        <div className={`mb-4 inline-flex rounded-2xl ${colors.badge} p-3`}>
          <Icon className={`h-6 w-6 ${colors.iconColor}`} strokeWidth={1.5} />
        </div>
        <h3 className="mb-1 text-lg font-semibold tracking-tight">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        <div className="flex items-center gap-1 text-sm font-medium text-primary">
          Vai
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  )
}

function RecentClassesSection({ classes }: { classes: RecentClass[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            I tuoi corsi
          </p>
          <h2 className="text-xl font-bold">Corsi Visti Recentemente</h2>
        </div>
        <Button asChild variant="ghost" size="sm" className="group">
          <Link to="/user/classes" className="flex items-center gap-1">
            <GraduationCap className="h-4 w-4" />
            Tutti i Corsi
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </div>

      <BrowseTable headers={["Corso", "Dipartimento", "Tipo", "Anno"]}>
        {classes.map((item) => (
          <tr key={item.class_id} className="group">
            <td className="min-w-[16rem] py-4 pl-6 pr-3 align-top">
              <Link
                to="/browse/$department/$course/$class"
                params={{
                  department: item.department_code.toLowerCase(),
                  course: item.course_code.toLowerCase(),
                  class: (item.class_code ?? "").toLowerCase(),
                }}
                className="block"
              >
                <span className="block font-medium text-foreground transition-colors group-hover:text-primary">
                  {item.class_name}
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {item.course_name}
                </p>
              </Link>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-center">
              <Badge variant="outline" className="text-xs">
                {item.department_code}
              </Badge>
            </td>
            <td className="whitespace-nowrap px-3 py-4 text-center">
              <Badge className={`rounded-full text-xs ${COURSE_TYPE_CONFIG[item.course_type]?.className ?? ""}`}>
                {COURSE_TYPE_CONFIG[item.course_type]?.label ?? item.course_type}
              </Badge>
            </td>
            <td className="px-4 py-4 text-center text-sm text-muted-foreground">
              {item.class_year}
            </td>
            <td className="pr-6 py-4">
              <ArrowRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </td>
          </tr>
        ))}
      </BrowseTable>
    </div>
  )
}

function RecentActivitySection({
  attempts,
}: {
  attempts: RecentQuizAttempt[]
}) {
  const prefersReduced = useReducedMotion()
  const container = withReducedMotion(staggerContainer, prefersReduced)
  const item = withReducedMotion(staggerItem, prefersReduced)

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          La tua attivita
        </p>
        <h2 className="text-xl font-bold">
          Ultimi {attempts.length} Quiz Completati
        </h2>
      </div>

      <motion.div className="space-y-3" variants={container} initial="hidden" animate="visible">
        {attempts.map((attempt) => (
          <motion.div
            key={attempt.id}
            variants={item}
            className="flex flex-col gap-3 rounded-2xl border bg-card p-4 transition-all duration-300 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{attempt.section_name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Insegnamento: {attempt.class_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <Badge variant={getScoreBadgeVariant(attempt.score)}>
                  {attempt.score}/33
                </Badge>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(attempt.completed_at).toLocaleDateString("it-IT")}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-xl">
                <Link
                  to="/quiz/results/$attemptId"
                  params={{ attemptId: attempt.id }}
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  Vedi
                </Link>
              </Button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
