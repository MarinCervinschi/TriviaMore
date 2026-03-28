import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { ArrowLeft, CheckCircle2, Download, Eye, FileUp, MapPin, Settings2 } from "lucide-react"

import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HandleRequestDialog } from "@/components/requests/handle-request-dialog"
import { RequestStatusBadge } from "@/components/requests/request-status-badge"
import { RequestTypeBadge } from "@/components/requests/request-type-badge"
import { Textarea } from "@/components/ui/textarea"
import { requestQueries } from "@/lib/requests/queries"
import { useAcknowledgeRequest, useApproveRequest } from "@/lib/requests/mutations"
import { getFileDownloadUrlFn } from "@/lib/requests/server"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import type { SubmittedContent, SubmittedFileUpload, SubmittedQuestion } from "@/lib/requests/types"

export const Route = createFileRoute("/_app/admin/requests/$requestId")({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(
      requestQueries.requestDetail(params.requestId),
    ),
  head: () => seoHead({ title: "Dettaglio Proposta", noindex: true }),
  component: AdminRequestDetailPage,
})

function AdminRequestDetailPage() {
  const { requestId } = Route.useParams()
  const { data: request } = useSuspenseQuery(
    requestQueries.requestDetail(requestId),
  )
  const [handleOpen, setHandleOpen] = useState(false)
  const [reportNote, setReportNote] = useState("")
  const approve = useApproveRequest()
  const acknowledge = useAcknowledgeRequest()

  const isPending = request.status === "PENDING"
  const isReport = request.request_type === "REPORT"
  const isFileUpload = request.request_type === "FILE_UPLOAD"
  const isAcknowledgeOnly = isReport || isFileUpload

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Dettaglio Proposta" description="" />

      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 rounded-xl">
          <Link to="/admin/requests">
            <ArrowLeft className="size-4" />
            Torna alle proposte
          </Link>
        </Button>

        {isPending && !isAcknowledgeOnly && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl"
              onClick={() => setHandleOpen(true)}
            >
              <Settings2 className="size-4" />
              Rifiuta / Modifiche
            </Button>
            <Button
              size="sm"
              className="gap-1.5 rounded-xl bg-green-600 hover:bg-green-700"
              onClick={() => approve.mutate({ id: request.id })}
              disabled={approve.isPending}
            >
              <CheckCircle2 className="size-4" />
              {approve.isPending ? "Approvazione..." : "Approva e pubblica"}
            </Button>
          </div>
        )}
      </div>

      {/* Request info */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <RequestTypeBadge type={request.request_type} />
          <RequestStatusBadge status={request.status} />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" strokeWidth={1.5} />
          {request.target_label}
        </div>

        <p className="text-xs text-muted-foreground">
          Inviata il{" "}
          {new Date(request.created_at).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        {request.admin_note && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Nota amministratore
            </p>
            <p className="mt-1 text-sm">{request.admin_note}</p>
          </div>
        )}
      </div>

      {/* Submitted content preview */}
      <div className="rounded-2xl border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
          {isReport ? "Dettagli segnalazione" : isFileUpload ? "File caricato" : "Contenuto proposto"}
        </h3>
        <ContentPreview submitted={request.submitted} />
      </div>

      {/* Acknowledge section (reports + file uploads) */}
      {isAcknowledgeOnly && isPending && (
        <div className="rounded-2xl border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-primary">
            Rispondi alla segnalazione
          </h3>
          <Textarea
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            placeholder="Lascia una nota per l'utente (opzionale)"
            rows={3}
            className="rounded-xl"
          />
          <Button
            className="gap-1.5 rounded-xl"
            onClick={() => acknowledge.mutate({ id: request.id, admin_note: reportNote })}
            disabled={acknowledge.isPending}
          >
            <Eye className="size-4" />
            {acknowledge.isPending ? "Salvataggio..." : "Presa visione"}
          </Button>
        </div>
      )}

      <HandleRequestDialog
        requestId={request.id}
        open={handleOpen}
        onOpenChange={setHandleOpen}
      />
    </div>
  )
}

// ─── Content Preview ───

const REASON_LABELS: Record<string, string> = {
  errata: "Errata",
  imprecisa: "Imprecisa",
  fuori_contesto: "Fuori contesto",
  altro: "Altro",
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function ContentPreview({ submitted }: { submitted: SubmittedContent }) {
  if (submitted.type === "file_upload") {
    return <FileUploadPreview file={submitted} />
  }

  if (submitted.type === "report") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {submitted.reasons.map((r) => (
            <Badge key={r} variant="outline" className="rounded-full border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400">
              {REASON_LABELS[r] ?? r}
            </Badge>
          ))}
        </div>
        {submitted.comment && (
          <div className="rounded-xl border p-4">
            <p className="text-xs font-medium text-muted-foreground mb-1">Commento utente</p>
            <p className="text-sm">{submitted.comment}</p>
          </div>
        )}
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Domanda segnalata</p>
          <p className="text-sm">{submitted.question_content}</p>
        </div>
      </div>
    )
  }

  if (submitted.type === "section") {
    return (
      <div className="rounded-xl border p-5 space-y-2">
        <p className="text-lg font-semibold">{submitted.name}</p>
        {submitted.description && (
          <p className="text-sm text-muted-foreground">{submitted.description}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {submitted.questions.map((q, i) => (
        <QuestionCard key={i} question={q} index={i} />
      ))}
    </div>
  )
}

function QuestionCard({ question, index }: { question: SubmittedQuestion; index: number }) {
  const typeLabels = { MULTIPLE_CHOICE: "Scelta multipla", TRUE_FALSE: "Vero/Falso", SHORT_ANSWER: "Risposta breve" }
  const diffColors = { EASY: "text-green-500", MEDIUM: "text-amber-500", HARD: "text-red-500" }
  const diffLabels = { EASY: "Facile", MEDIUM: "Medio", HARD: "Difficile" }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Domanda {index + 1}</p>
        <div className="flex gap-1.5">
          <Badge variant="outline" className="rounded-full text-[10px]">
            {typeLabels[question.question_type]}
          </Badge>
          <Badge variant="outline" className={cn("rounded-full text-[10px]", diffColors[question.difficulty])}>
            {diffLabels[question.difficulty]}
          </Badge>
        </div>
      </div>

      <p className="text-sm font-medium">{question.content}</p>

      {/* Options */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-1.5">
          {question.options.map((opt, oi) => {
            const optId = String.fromCharCode(97 + oi)
            const isCorrect = question.correct_answer.includes(optId)
            return (
              <div
                key={oi}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                  isCorrect
                    ? "border border-green-500/30 bg-green-500/10 font-medium text-green-700 dark:text-green-400"
                    : "bg-muted/50",
                )}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {optId.toUpperCase()}
                </span>
                {opt}
                {isCorrect && (
                  <CheckCircle2 className="ml-auto size-4 text-green-500" />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* True/False answer */}
      {question.question_type === "TRUE_FALSE" && (
        <p className="text-sm">
          Risposta: <span className="font-medium text-green-600">{question.correct_answer[0] === "true" ? "Vero" : "Falso"}</span>
        </p>
      )}

      {/* Short answer */}
      {question.question_type === "SHORT_ANSWER" && (
        <p className="text-sm">
          Risposta: <span className="font-medium text-green-600">{question.correct_answer[0]}</span>
        </p>
      )}

      {/* Explanation */}
      {question.explanation && (
        <div className="rounded-lg bg-muted/50 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Spiegazione</p>
          <p className="mt-0.5 text-sm">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}

function FileUploadPreview({ file }: { file: SubmittedFileUpload }) {
  const [downloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    try {
      const signedUrl = await getFileDownloadUrlFn({ data: { filePath: file.file_path } })
      const response = await fetch(signedUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = file.file_name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Errore nel download del file")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-xl border p-5">
        <div className="rounded-xl bg-emerald-500/10 p-3">
          <FileUp className="size-6 text-emerald-500" strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <p className="font-medium">{file.file_name}</p>
          <p className="text-sm text-muted-foreground">{formatFileSize(file.file_size)}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={handleDownload}
          disabled={downloading}
        >
          <Download className="size-4" />
          {downloading ? "Download..." : "Scarica"}
        </Button>
      </div>
      {file.comment && (
        <div className="rounded-xl border p-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Commento utente</p>
          <p className="text-sm">{file.comment}</p>
        </div>
      )}
    </div>
  )
}
