import { useState } from "react"
import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import {
  AlertTriangle,
  BookmarkIcon,
  Calendar,
  Camera,
  GraduationCap,
  Loader2,
  Save,
  Settings,
  Trash2,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserBreadcrumb } from "@/components/user/user-breadcrumb"
import { UserHero } from "@/components/user/user-hero"
import { UserStatsCard } from "@/components/user/user-stats-card"
import { useDeleteAccount, useUpdateProfile } from "@/lib/user/mutations"
import { userQueries } from "@/lib/user/queries"
import { getDisplayName, getInitials, getRoleLabel } from "@/lib/user/utils"
import type { UserProfile } from "@/lib/user/types"

export const Route = createFileRoute("/_app/user/settings")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueries.profile()),
  head: () => seoHead({ title: "Impostazioni", noindex: true }),
  component: SettingsPage,
})

function SettingsPage() {
  const { data: profile } = useSuspenseQuery(userQueries.profile())

  if (!profile) return null

  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={Settings}
        title="Impostazioni Profilo"
        description="Gestisci le informazioni del tuo account e le preferenze"
      />

      <div className="container space-y-6">
        <UserBreadcrumb current="Impostazioni" />

        <ProfileForm profile={profile} />

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

        <DeleteAccountSection />
      </div>
    </div>
  )
}

function ProfileForm({ profile }: { profile: UserProfile }) {
  const updateProfile = useUpdateProfile()
  const displayName = getDisplayName(profile)
  const initials = getInitials(profile)

  const [name, setName] = useState(profile.name ?? "")
  const [imageUrl, setImageUrl] = useState(profile.image ?? "")

  const hasChanges =
    name !== (profile.name ?? "") || imageUrl !== (profile.image ?? "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    updateProfile.mutate({
      name: name.trim(),
      image: imageUrl.trim() || null,
    })
  }

  const handleReset = () => {
    setName(profile.name ?? "")
    setImageUrl(profile.image ?? "")
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-card">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-[60px]" />

      <form onSubmit={handleSubmit} className="relative p-6 sm:p-8">
        <h2 className="mb-1 text-xl font-bold">Informazioni Profilo</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Modifica le tue informazioni personali
        </p>

        <div className="mb-6 flex items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-primary/20">
            <AvatarImage
              src={imageUrl || profile.image || undefined}
              alt={displayName}
            />
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{name || displayName}</h3>
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Il tuo nome completo"
              className="rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={profile.email ?? ""}
              disabled
              className="rounded-xl bg-muted/30"
            />
            <p className="text-xs text-muted-foreground">
              L'email non può essere modificata
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="image">
            <Camera className="mr-1 inline h-4 w-4" />
            URL Immagine Profilo
          </Label>
          <Input
            id="image"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://esempio.com/la-tua-foto.jpg"
            className="rounded-xl"
          />
          <p className="text-xs text-muted-foreground">
            Inserisci l'URL di un'immagine per il tuo avatar
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button
            type="submit"
            disabled={!hasChanges || !name.trim() || updateProfile.isPending}
            className="shadow-lg shadow-primary/25"
          >
            {updateProfile.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salva Modifiche
          </Button>
          {hasChanges && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
            >
              <X className="mr-2 h-4 w-4" />
              Annulla
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}

function DeleteAccountSection() {
  const deleteAccount = useDeleteAccount()
  const [confirmText, setConfirmText] = useState("")

  const canDelete = confirmText === "ELIMINA"

  return (
    <div className="relative overflow-hidden rounded-3xl border border-destructive/30 bg-card">
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-destructive/10 p-3">
            <AlertTriangle className="h-6 w-6 text-destructive" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-destructive">
              Elimina Account
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Questa azione è permanente e irreversibile. Tutti i tuoi dati
              verranno eliminati: profilo, progressi, segnalibri, corsi salvati
              e cronologia quiz.
            </p>
          </div>
        </div>

        <div className="mt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="rounded-xl">
                <Trash2 className="mr-2 h-4 w-4" />
                Elimina il mio account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Conferma eliminazione account
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <span className="block">
                    Stai per eliminare permanentemente il tuo account. Questa
                    azione non può essere annullata.
                  </span>
                  <span className="block font-medium text-foreground">
                    Verranno eliminati:
                  </span>
                  <span className="block text-sm">
                    • Tutti i progressi e i risultati dei quiz
                    <br />
                    • I segnalibri salvati
                    <br />
                    • I corsi seguiti
                    <br />
                    • Le informazioni del profilo
                  </span>
                  <span className="block">
                    Scrivi{" "}
                    <span className="font-mono font-bold text-destructive">
                      ELIMINA
                    </span>{" "}
                    per confermare:
                  </span>
                </AlertDialogDescription>
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Scrivi ELIMINA"
                  className="mt-2 rounded-xl"
                  autoComplete="off"
                />
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setConfirmText("")}>
                  Annulla
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={!canDelete || deleteAccount.isPending}
                  onClick={(e) => {
                    e.preventDefault()
                    deleteAccount.mutate()
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteAccount.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Elimina definitivamente
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
