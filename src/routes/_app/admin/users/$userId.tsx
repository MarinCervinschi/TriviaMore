import { useState } from "react"
import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { BookOpen, GraduationCap, Library, Plus, Trash2, Trophy } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import {
  useAddCourseMaintainer,
  useAddDepartmentAdmin,
  useAddSectionAccess,
  useRemoveCourseMaintainer,
  useRemoveDepartmentAdmin,
  useRemoveSectionAccess,
  useUpdateUserRole,
} from "@/lib/admin/mutations"
import { adminQueries } from "@/lib/admin/queries"
import type { UserRole } from "@/lib/admin/types"

const ROLE_LABELS: Record<string, string> = {
  SUPERADMIN: "Superadmin",
  ADMIN: "Admin",
  MAINTAINER: "Maintainer",
  STUDENT: "Studente",
}

export const Route = createFileRoute("/_app/admin/users/$userId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(adminQueries.user(params.userId)),
  component: AdminUserDetailPage,
  head: () => ({
    meta: [{ title: "Dettaglio Utente | Gestione | TriviaMore" }],
  }),
})

function AdminUserDetailPage() {
  const { userId } = Route.useParams()
  const { data: user } = useSuspenseQuery(adminQueries.user(userId))
  const { user: currentUser } = useAuth()
  const isSuperadmin = currentUser?.role === "SUPERADMIN"

  const [roleConfirm, setRoleConfirm] = useState<UserRole | null>(null)
  const [addDeptId, setAddDeptId] = useState("")
  const [addCourseId, setAddCourseId] = useState("")
  const [addSectionId, setAddSectionId] = useState("")

  const updateRole = useUpdateUserRole(() => setRoleConfirm(null))
  const addDeptAdmin = useAddDepartmentAdmin()
  const removeDeptAdmin = useRemoveDepartmentAdmin()
  const addMaintainer = useAddCourseMaintainer()
  const removeMaintainer = useRemoveCourseMaintainer()
  const addSectionAccess = useAddSectionAccess()
  const removeSectionAccess = useRemoveSectionAccess()

  // Available items for assignment
  const { data: departments } = useQuery(adminQueries.departments())
  const { data: allCourses } = useQuery(adminQueries.allCourses())
  const { data: privateSections } = useQuery(adminQueries.privateSections())

  const availableDepts = (departments ?? []).filter(
    (d) => !user.managed_departments.some((md) => md.id === d.id),
  )

  const availableCourses = (allCourses ?? []).filter(
    (c) => !user.maintained_courses.some((mc) => mc.id === c.id),
  )

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?"

  return (
    <div className="py-2">
      <AdminPageHeader
        title={user.name ?? "Utente"}
        description={user.email ?? ""}
        backTo="/admin/users"
        backLabel="Utenti"
      />

      <div className="grid gap-6">
        {/* Profile + Stats */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profilo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{user.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Registrato il{" "}
                    {new Date(user.created_at).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium">Ruolo</label>
                {isSuperadmin ? (
                  <Select
                    value={user.role}
                    onValueChange={(v) => setRoleConfirm(v as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        ["SUPERADMIN", "ADMIN", "MAINTAINER", "STUDENT"] as const
                      ).map((r) => (
                        <SelectItem key={r} value={r}>
                          {ROLE_LABELS[r]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="outline" className="text-sm">
                    {ROLE_LABELS[user.role]}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistiche</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Quiz completati</dt>
                  <dd className="flex items-center gap-2 text-2xl font-bold">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    {user.stats.total_quizzes}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Punteggio medio</dt>
                  <dd className="text-2xl font-bold">
                    {user.stats.average_score != null
                      ? `${Math.round(user.stats.average_score * 100)}%`
                      : "—"}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm text-muted-foreground">Ultimo quiz</dt>
                  <dd className="text-sm">
                    {user.stats.last_quiz_at
                      ? new Date(user.stats.last_quiz_at).toLocaleDateString("it-IT", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Nessun quiz completato"}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        {/* Department Admin assignments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Library className="h-5 w-5" />
                Dipartimenti gestiti
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Dipartimenti di cui l'utente è amministratore
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {user.managed_departments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {user.managed_departments.map((dept) => (
                  <Badge key={dept.id} variant="secondary" className="gap-1 pr-1">
                    {dept.name} ({dept.code})
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() =>
                        removeDeptAdmin.mutate({
                          user_id: userId,
                          department_id: dept.id,
                        })
                      }
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {availableDepts.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={addDeptId} onValueChange={setAddDeptId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seleziona dipartimento..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepts.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name} ({d.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!addDeptId || addDeptAdmin.isPending}
                  onClick={() => {
                    if (addDeptId) {
                      addDeptAdmin.mutate({
                        user_id: userId,
                        department_id: addDeptId,
                      })
                      setAddDeptId("")
                    }
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Aggiungi
                </Button>
              </div>
            )}
            {user.managed_departments.length === 0 && availableDepts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nessun dipartimento disponibile.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Course Maintainer assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Corsi mantenuti
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Corsi di cui l'utente è maintainer
            </p>
          </CardHeader>
          <CardContent>
            {user.maintained_courses.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {user.maintained_courses.map((course) => (
                  <Badge key={course.id} variant="secondary" className="gap-1 pr-1">
                    {course.name} ({course.department_name})
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() =>
                        removeMaintainer.mutate({
                          user_id: userId,
                          course_id: course.id,
                        })
                      }
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {availableCourses.length > 0 && (
              <div className="flex items-center gap-2">
                <Select value={addCourseId} onValueChange={setAddCourseId}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Seleziona corso..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!addCourseId || addMaintainer.isPending}
                  onClick={() => {
                    if (addCourseId) {
                      addMaintainer.mutate({
                        user_id: userId,
                        course_id: addCourseId,
                      })
                      setAddCourseId("")
                    }
                  }}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Aggiungi
                </Button>
              </div>
            )}
            {user.maintained_courses.length === 0 && availableCourses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nessun corso disponibile.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Section Access */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Accessi sezioni private
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Sezioni private a cui l'utente ha accesso
            </p>
          </CardHeader>
          <CardContent>
            {user.section_accesses.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {user.section_accesses.map((section) => (
                  <Badge key={section.id} variant="secondary" className="gap-1 pr-1">
                    {section.name} ({section.class_name})
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 hover:bg-destructive/20"
                      onClick={() =>
                        removeSectionAccess.mutate({
                          user_id: userId,
                          section_id: section.id,
                        })
                      }
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {(() => {
              const availableSections = (privateSections ?? []).filter(
                (s) => !user.section_accesses.some((sa) => sa.id === s.id),
              )
              return availableSections.length > 0 ? (
                <div className="flex items-center gap-2">
                  <Select value={addSectionId} onValueChange={setAddSectionId}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Seleziona sezione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.class_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    disabled={!addSectionId || addSectionAccess.isPending}
                    onClick={() => {
                      if (addSectionId) {
                        addSectionAccess.mutate({
                          user_id: userId,
                          section_id: addSectionId,
                        })
                        setAddSectionId("")
                      }
                    }}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Aggiungi
                  </Button>
                </div>
              ) : user.section_accesses.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nessuna sezione privata disponibile.
                </p>
              ) : null
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Role change confirmation */}
      <ConfirmationDialog
        open={!!roleConfirm}
        onOpenChange={(open) => !open && setRoleConfirm(null)}
        title="Cambia ruolo"
        description={`Sei sicuro di voler cambiare il ruolo di ${user.name ?? "questo utente"} a "${roleConfirm ? ROLE_LABELS[roleConfirm] : ""}"?`}
        confirmText="Conferma"
        onConfirm={() => {
          if (roleConfirm) updateRole.mutate({ id: userId, role: roleConfirm })
        }}
      />
    </div>
  )
}
