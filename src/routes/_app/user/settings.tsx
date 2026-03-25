import { createFileRoute } from "@tanstack/react-router"
import { useSuspenseQuery } from "@tanstack/react-query"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { userQueries } from "@/lib/user/queries"
import type { UserProfile } from "@/lib/user/types"

export const Route = createFileRoute("/_app/user/settings")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.profile()),
  head: () => ({
    meta: [
      { title: "Impostazioni | TriviaMore" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SettingsPage,
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

function SettingsPage() {
  const { data: profile } = useSuspenseQuery(userQueries.profile())

  if (!profile) return null

  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)

  return (
    <div className="container space-y-8 py-8">
      <UserBreadcrumb current="Impostazioni" />

      <div>
        <h1 className="text-3xl font-bold">Impostazioni Profilo</h1>
        <p className="text-muted-foreground">
          Gestisci le informazioni del tuo account e le preferenze
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informazioni Profilo</CardTitle>
            <CardDescription>
              Le tue informazioni personali e i dettagli dell'account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={profile.image ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <Badge variant="outline">{getRoleLabel(profile.role)}</Badge>
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile.email ?? ""}
                  placeholder="La tua email"
                  disabled
                />
              </div>
            </div>

            <div className="pt-4">
              <Button disabled>Salva Modifiche</Button>
              <p className="mt-2 text-sm text-muted-foreground">
                Le modifiche al profilo saranno disponibili in una versione
                futura
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Statistiche Account</CardTitle>
            <CardDescription>
              Informazioni sul tuo utilizzo della piattaforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">
                  {profile.stats.total_quizzes}
                </p>
                <p className="text-sm text-muted-foreground">
                  Quiz Completati
                </p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">
                  {profile.stats.user_classes_count}
                </p>
                <p className="text-sm text-muted-foreground">Corsi Seguiti</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">
                  {profile.stats.bookmarks_count}
                </p>
                <p className="text-sm text-muted-foreground">Segnalibri</p>
              </div>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-2xl font-bold">
                  {profile.stats.average_score}
                </p>
                <p className="text-sm text-muted-foreground">
                  Punteggio Medio
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Account</CardTitle>
            <CardDescription>
              Informazioni tecniche sul tuo account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">ID Utente</Label>
                <p className="rounded bg-muted p-2 font-mono text-sm">
                  {profile.id}
                </p>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Membro dal</Label>
                <p className="text-sm">
                  {new Date(profile.created_at).toLocaleDateString("it-IT", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="grid gap-2">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
