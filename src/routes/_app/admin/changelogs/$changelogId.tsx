import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { Megaphone, Send } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ChangelogForm } from "@/components/admin/forms/changelog-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { cn } from "@/lib/utils"
import { useUpdateChangelog, usePublishChangelog } from "@/lib/changelogs/mutations"
import { changelogQueries } from "@/lib/changelogs/queries"
import { CATEGORY_CONFIG } from "@/lib/changelogs/types"

export const Route = createFileRoute("/_app/admin/changelogs/$changelogId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      changelogQueries.adminDetail(params.changelogId),
    ),
  component: AdminChangelogDetailPage,
  head: () => seoHead({ title: "Dettaglio Changelog | Gestione", noindex: true }),
})

function AdminChangelogDetailPage() {
  const { changelogId } = Route.useParams()
  const { data: changelog } = useSuspenseQuery(
    changelogQueries.adminDetail(changelogId),
  )
  const [publishOpen, setPublishOpen] = useState(false)

  const updateChangelog = useUpdateChangelog()
  const publishChangelog = usePublishChangelog(() => setPublishOpen(false))

  const catConfig =
    CATEGORY_CONFIG[changelog.category as keyof typeof CATEGORY_CONFIG]

  return (
    <div className="py-2 space-y-6">
      <AdminPageHeader
        title={`v${changelog.version}`}
        description={changelog.title}
        icon={Megaphone}
        backTo="/admin/changelogs"
        backLabel="Changelog"
        actions={
          changelog.is_draft ? (
            <Button
              className="rounded-xl shadow-lg shadow-primary/25"
              onClick={() => setPublishOpen(true)}
            >
              <Send className="mr-2 h-4 w-4" />
              Pubblica
            </Button>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
            >
              Pubblicato il{" "}
              {new Date(changelog.published_at!).toLocaleDateString("it-IT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Badge>
          )
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Edit form */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle>Modifica</CardTitle>
          </CardHeader>
          <CardContent>
            <ChangelogForm
              changelog={changelog}
              onSubmit={(data) =>
                updateChangelog.mutate({ id: changelog.id, ...data })
              }
              isPending={updateChangelog.isPending}
            />
          </CardContent>
        </Card>

        {/* Live preview */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle>Anteprima</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-xl bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                  v{changelog.version}
                </span>
                {catConfig && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-full",
                      catConfig.bg,
                      catConfig.color,
                      catConfig.border,
                    )}
                  >
                    {catConfig.label}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                {changelog.title}
              </h2>
              <div className="rounded-xl border bg-muted/20 p-4">
                <MarkdownRenderer content={changelog.body} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        title="Pubblica changelog"
        description="Pubblicando questo changelog, tutti gli utenti riceveranno una notifica. Vuoi procedere?"
        confirmText="Pubblica e notifica"
        onConfirm={() => publishChangelog.mutate({ id: changelog.id })}
      />
    </div>
  )
}
