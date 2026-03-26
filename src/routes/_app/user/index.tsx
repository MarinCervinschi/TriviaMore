import { createFileRoute } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  BookmarkIcon,
  Calendar,
  ExternalLink,
  GraduationCap,
  Mail,
  Settings,
  TrendingUp,
  Trophy,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { userQueries } from "@/lib/user/queries"
import type { RecentClass, RecentQuizAttempt, UserProfile } from "@/lib/user/types"
import { getScoreBadgeVariant } from "@/lib/utils/quiz-results"

export const Route = createFileRoute("/_app/user/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.profile()),
  head: () => ({
    meta: [
      { title: "Dashboard | TriviaMore" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardPage,
})

function getRoleLabel(role: string): string {
  switch (role) {
    case "SUPERADMIN":
      return "Super Amministratore"
    case "ADMIN":
      return "Amministratore"
    case "MAINTAINER":
      return "Manutentore"
    case "STUDENT":
      return "Studente"
    default:
      return role
  }
}

function getDisplayName(profile: UserProfile): string {
  if (profile.name) return profile.name
  if (profile.email) return profile.email.split("@")[0]
  return "Utente Anonimo"
}

function getInitials(profile: UserProfile): string {
  if (profile.name) {
    return profile.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  return profile.email?.charAt(0).toUpperCase() ?? "U"
}

function DashboardPage() {
  const { data: profile } = useSuspenseQuery(userQueries.profile())

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)

  return (
    <div className="container space-y-8 py-8">
      {/* Header */}
      <div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20 border-4 border-white/20">
            <AvatarImage src={profile.image ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-white/20 text-xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
              {displayName}
            </h1>
            <div className="mb-2 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="border-white/20 bg-white/20 text-white"
              >
                {getRoleLabel(profile.role)}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-blue-100 sm:flex-row sm:items-center sm:gap-4">
              {profile.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{profile.email}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Membro dal{" "}
                  {new Date(profile.created_at).toLocaleDateString("it-IT")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <UserStatsCard
          label="Quiz Completati"
          value={profile.stats.total_quizzes}
          icon={Trophy}
          iconColor="text-yellow-500"
        />
        <UserStatsCard
          label="Punteggio Medio"
          value={`${profile.stats.average_score}/33`}
          icon={TrendingUp}
          iconColor="text-green-500"
        />
        <UserStatsCard
          label="Corsi Seguiti"
          value={profile.stats.user_classes_count}
          icon={GraduationCap}
          iconColor="text-blue-500"
        />
        <UserStatsCard
          label="Segnalibri"
          value={profile.stats.bookmarks_count}
          icon={BookmarkIcon}
          iconColor="text-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard
          icon={TrendingUp}
          iconColor="text-green-500"
          title="I Miei Progressi"
          description="Visualizza i tuoi progressi dettagliati per ogni materia"
          href="/user/progress"
          variant="default"
        />
        <QuickActionCard
          icon={GraduationCap}
          iconColor="text-blue-500"
          title="I Miei Corsi"
          description="Gestisci i corsi che stai seguendo al meglio"
          href="/user/classes"
          variant="outline"
        />
        <QuickActionCard
          icon={Settings}
          iconColor="text-gray-500"
          title="Impostazioni Profilo"
          description="Personalizza il tuo profilo e le preferenze dell'account"
          href="/user/settings"
          variant="outline"
        />
        <QuickActionCard
          icon={BookmarkIcon}
          iconColor="text-purple-500"
          title="I Miei Segnalibri"
          description="Accedi alle domande che hai salvato per dopo"
          href="/user/bookmarks"
          variant="outline"
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
  )
}

function QuickActionCard({
  icon: Icon,
  iconColor,
  title,
  description,
  href,
  variant,
}: {
  icon: typeof Trophy
  iconColor: string
  title: string
  description: string
  href: string
  variant: "default" | "outline"
}) {
  return (
    <Card className="transition-shadow hover:shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className={`h-5 w-5 ${iconColor}`} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant={variant} className="w-full">
          <Link to={href}>
            {variant === "default" ? "Visualizza" : "Gestisci"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function RecentClassesSection({ classes }: { classes: RecentClass[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Corsi Visti Recentemente</CardTitle>
            <CardDescription>I corsi che hai visitato di recente</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/user/classes" className="flex items-center gap-1">
              <GraduationCap className="h-4 w-4" />
              Tutti i Corsi
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((item) => (
            <Card key={item.class.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {item.class.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {item.class.course.department.name}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.class.course.course_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {item.class.course.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Anno {item.class.class_year} &bull; {item.class.code}
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link
                      to="/browse/$department/$course/$class"
                      params={{
                        department:
                          item.class.course.department.code.toLowerCase(),
                        course: item.class.course.code,
                        class: item.class.code.toLowerCase(),
                      }}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Apri Corso
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivitySection({
  attempts,
}: {
  attempts: RecentQuizAttempt[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attività Recenti</CardTitle>
        <CardDescription>
          I tuoi ultimi {attempts.length} quiz completati
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div
              key={attempt.id}
              className="flex flex-col gap-3 rounded-lg bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                  <Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {attempt.quiz.section.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-medium">
                      {attempt.quiz.section.class.course.department.name}
                    </span>
                    {" \u2022 "}
                    {attempt.quiz.section.class.course.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Classe: {attempt.quiz.section.class.name}
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
                <Button asChild variant="outline" size="sm">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
