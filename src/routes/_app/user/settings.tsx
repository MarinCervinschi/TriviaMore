import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Calendar, Settings } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserHero } from "@/components/user/user-hero"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { userQueries } from "@/lib/user/queries"
import { getDisplayName, getInitials, getRoleLabel } from "@/lib/user/utils"
import {
  BookmarkIcon,
  GraduationCap,
  TrendingUp,
  Trophy,
} from "lucide-react"

export const Route = createFileRoute("/_app/user/settings")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.profile()),
  head: () => seoHead({ title: "Impostazioni", noindex: true }),
  component: SettingsPage,
})

function SettingsPage() {
  const { data: profile } = useSuspenseQuery(userQueries.profile())

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)

  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={Settings}
        title="Impostazioni Profilo"
        description="Gestisci le informazioni del tuo account e le preferenze"
      />

      <div className="container space-y-6">
        <UserBreadcrumb current="Impostazioni" />

        {/* Profile Info */}
        <div className="relative overflow-hidden rounded-3xl border bg-card">
          {/* Decorative orb */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />

          <div className="relative p-6 sm:p-8">
            <h2 className="mb-1 text-xl font-bold">Informazioni Profilo</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Le tue informazioni personali e i dettagli dell'account
            </p>

            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
                <AvatarImage
                  src={profile.image ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <Badge className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  value={profile.name ?? ""}
                  placeholder="Il tuo nome completo"
                  disabled
                  className="rounded-xl bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email ?? ""}
                  placeholder="La tua email"
                  disabled
                  className="rounded-xl bg-muted/30"
                />
              </div>
            </div>

            <div className="mt-6">
              <Button disabled className="shadow-lg shadow-primary/25">
                Salva Modifiche
              </Button>
              <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm text-muted-foreground">
                  Le modifiche al profilo saranno disponibili in una versione
                  futura
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div>
          <h2 className="mb-1 text-xl font-bold">Statistiche Account</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Informazioni sul tuo utilizzo della piattaforma
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <UserStatsCard
              label="Quiz Completati"
              value={profile.stats.total_quizzes}
              icon={Trophy}
              iconColor="text-yellow-500"
              iconBg="yellow"
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
            <UserStatsCard
              label="Punteggio Medio"
              value={profile.stats.average_score}
              icon={TrendingUp}
              iconColor="text-green-500"
              iconBg="green"
            />
          </div>
        </div>

        {/* Account Details */}
        <div className="relative overflow-hidden rounded-3xl border bg-card">
          <div className="p-6 sm:p-8">
            <h2 className="mb-1 text-xl font-bold">Dettagli Account</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Informazioni tecniche sul tuo account
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">ID Utente</Label>
                <p className="rounded-xl bg-muted/50 p-3 font-mono text-sm">
                  {profile.id}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Membro dal</Label>
                <p className="text-sm">
                  {new Date(profile.created_at).toLocaleDateString("it-IT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">
                  Ultimo aggiornamento
                </Label>
                <p className="text-sm">
                  {new Date(profile.updated_at).toLocaleDateString("it-IT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
