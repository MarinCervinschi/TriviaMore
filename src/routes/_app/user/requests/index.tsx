import { useState } from "react"
import { createFileRoute, Link } from "@tanstack/react-router"
import { seoHead } from "@/lib/seo"
import { useSuspenseQuery } from "@tanstack/react-query"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  Flag,
  FolderPlus,
  Inbox,
  Info,
  MapPin,
  MessageSquarePlus,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RequestFormDialog } from "@/components/requests/request-form-dialog"
import { RequestStatusBadge } from "@/components/requests/request-status-badge"
import { UserHero } from "@/components/user/user-hero"
import { requestQueries } from "@/lib/requests/queries"
import { useReviseRequest } from "@/lib/requests/mutations"
import { useReducedMotion } from "@/hooks/useReducedMotion"
import { cn } from "@/lib/utils"

import type {
  ContentRequestWithMeta,
  SubmittedContent,
  SubmittedQuestion,
  SubmittedReport,
} from "@/lib/requests/types"

export const Route = createFileRoute("/_app/user/requests/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(requestQueries.userRequests()),
  head: () => seoHead({ title: "Contributi", noindex: true }),
  component: UserContributionsPage,
})

const REASON_LABELS: Record<string, string> = {
  errata: "Errata",
  imprecisa: "Imprecisa",
  fuori_contesto: "Fuori contesto",
  altro: "Altro",
}

function generateTitle(submitted: SubmittedContent): string {
  if (submitted.type === "section") return `Nuova sezione: ${submitted.name}`
  if (submitted.type === "report") {
    const label = REASON_LABELS[submitted.reasons[0]] ?? submitted.reasons[0]
    return `Segnalazione: ${label}`
  }
  const count = submitted.questions.length
  return `${count} ${count === 1 ? "domanda" : "domande"}`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "ora"
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}g`
  return new Date(dateStr).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
}

function UserContributionsPage() {
  const { data: requests } = useSuspenseQuery(requestQueries.userRequests())
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const prefersReduced = useReducedMotion()

  return (
    <div className="space-y-8 pb-8">
      <UserHero
        icon={Inbox}
        title="I Miei Contributi"
        description="Proponi nuovi contenuti per la piattaforma."
      />

      <div className="container max-w-3xl space-y-4">
        {/* Info banner */}
        <div className="flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <Info className="size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
          <p className="text-xs text-muted-foreground">
            Per segnalare bug o fare richieste particolari, visita la pagina{" "}
            <Link to="/contact" className="font-medium text-primary hover:underline">
              Contatti
            </Link>
            .
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {requests.length} {requests.length === 1 ? "proposta" : "proposte"}
          </p>
          <RequestFormDialog
            trigger={
              <Button size="sm" className="gap-1.5 rounded-xl shadow-lg shadow-primary/25">
                <Plus className="size-4" />
                Proponi contenuto
              </Button>
            }
          />
        </div>

        {requests.length === 0 ? (
          <div className="rounded-3xl border bg-card p-12 text-center">
            <div className="mx-auto mb-4 inline-flex rounded-2xl bg-primary/10 p-4">
              <Inbox className="size-10 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 text-xl font-semibold">Nessuna proposta</h2>
            <p className="text-muted-foreground">
              Contribuisci proponendo sezioni o domande!
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-card">
            {requests.map((request, i) => (
              <ContributionRow
                key={request.id}
                request={request}
                isLast={i === requests.length - 1}
                isExpanded={expandedId === request.id}
                onToggle={() => setExpandedId(expandedId === request.id ? null : request.id)}
                prefersReduced={prefersReduced}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ContributionRow({
  request,
  isLast,
  isExpanded,
  onToggle,
  prefersReduced,
}: {
  request: ContentRequestWithMeta
  isLast: boolean
  isExpanded: boolean
  onToggle: () => void
  prefersReduced: boolean
}) {
  const iconMap = { NEW_SECTION: FolderPlus, NEW_QUESTIONS: MessageSquarePlus, REPORT: Flag }
  const colorMap = {
    NEW_SECTION: { bg: "bg-blue-500/10", text: "text-blue-500" },
    NEW_QUESTIONS: { bg: "bg-purple-500/10", text: "text-purple-500" },
    REPORT: { bg: "bg-red-500/10", text: "text-red-500" },
  }
  const Icon = iconMap[request.request_type]
  const colors = colorMap[request.request_type]
  const title = generateTitle(request.submitted)

  return (
    <div className={cn(!isLast && !isExpanded && "border-b border-border/50")}>
      {/* Row header */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-accent/30"
      >
        <div className={cn("rounded-xl p-2", colors.bg)}>
          <Icon className={cn("size-4", colors.text)} strokeWidth={1.5} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
            <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
            {request.target_label}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-muted-foreground">{timeAgo(request.updated_at)}</span>
          <RequestStatusBadge status={request.status} />
          <ChevronDown className={cn(
            "size-4 text-muted-foreground transition-transform",
            isExpanded && "rotate-180",
          )} />
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={prefersReduced ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={prefersReduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="border-t px-5 py-4 space-y-4">
              {/* Admin note */}
              {request.admin_note && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Nota dello staff
                  </p>
                  <p className="mt-1 text-sm">{request.admin_note}</p>
                </div>
              )}

              {/* Editable form or read-only preview */}
              {request.status === "NEEDS_REVISION" ? (
                <RevisionForm requestId={request.id} submitted={request.submitted} />
              ) : (
                <SubmittedContentPreview submitted={request.submitted} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SubmittedContentPreview({ submitted }: { submitted: SubmittedContent }) {
  if (submitted.type === "report") {
    return <ReportPreview report={submitted} />
  }

  if (submitted.type === "section") {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sezione proposta</p>
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-sm font-medium">{submitted.name}</p>
          {submitted.description && (
            <p className="mt-1 text-xs text-muted-foreground">{submitted.description}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Domande proposte ({submitted.questions.length})
      </p>
      <div className="space-y-2">
        {submitted.questions.map((q, i) => (
          <QuestionPreview key={i} question={q} index={i} />
        ))}
      </div>
    </div>
  )
}

// ─── Revision Form ───

function RevisionForm({ requestId, submitted }: { requestId: string; submitted: SubmittedContent }) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(submitted)
  const revise = useReviseRequest(() => setEditing(false))

  if (!editing) {
    return (
      <div className="space-y-3">
        <SubmittedContentPreview submitted={submitted} />
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 rounded-xl"
          onClick={() => setEditing(true)}
        >
          <Pencil className="size-3.5" />
          Modifica e reinvia
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
      <p className="text-xs font-semibold text-orange-600 dark:text-orange-400">Modifica la tua proposta</p>

      {content.type === "section" ? (
        <SectionEditor
          content={content}
          onChange={(updated) => setContent(updated)}
        />
      ) : content.type === "questions" ? (
        <QuestionsEditor
          content={content}
          onChange={(updated) => setContent(updated)}
        />
      ) : null}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="rounded-xl"
          onClick={() => { setContent(submitted); setEditing(false) }}
        >
          Annulla
        </Button>
        <Button
          size="sm"
          className="gap-1.5 rounded-xl"
          onClick={() => revise.mutate({ id: requestId, submitted_content: content })}
          disabled={revise.isPending}
        >
          <Send className="size-3.5" />
          {revise.isPending ? "Invio..." : "Reinvia proposta"}
        </Button>
      </div>
    </div>
  )
}

function SectionEditor({
  content,
  onChange,
}: {
  content: { type: "section"; name: string; description: string }
  onChange: (c: SubmittedContent) => void
}) {
  return (
    <div className="space-y-3">
      <Input
        value={content.name}
        onChange={(e) => onChange({ ...content, name: e.target.value })}
        placeholder="Nome della sezione"
        className="rounded-xl"
      />
      <Textarea
        value={content.description}
        onChange={(e) => onChange({ ...content, description: e.target.value })}
        placeholder="Descrizione (opzionale)"
        rows={3}
        className="rounded-xl"
      />
    </div>
  )
}

function QuestionsEditor({
  content,
  onChange,
}: {
  content: { type: "questions"; questions: SubmittedQuestion[] }
  onChange: (c: SubmittedContent) => void
}) {
  function updateQuestion(index: number, updated: SubmittedQuestion) {
    const copy = [...content.questions]
    copy[index] = updated
    onChange({ ...content, questions: copy })
  }

  function removeQuestion(index: number) {
    onChange({ ...content, questions: content.questions.filter((_, i) => i !== index) })
  }

  function addQuestion() {
    onChange({
      ...content,
      questions: [...content.questions, {
        content: "",
        question_type: "MULTIPLE_CHOICE",
        options: ["", ""],
        correct_answer: [],
        explanation: null,
        difficulty: "MEDIUM",
      }],
    })
  }

  return (
    <div className="space-y-3">
      {content.questions.map((q, i) => (
        <RevisionQuestionEditor
          key={i}
          index={i}
          question={q}
          onChange={(updated) => updateQuestion(i, updated)}
          onRemove={content.questions.length > 1 ? () => removeQuestion(i) : undefined}
        />
      ))}
      <Button variant="ghost" size="sm" onClick={addQuestion} className="gap-1 text-xs">
        <Plus className="size-3" /> Aggiungi domanda
      </Button>
    </div>
  )
}

function RevisionQuestionEditor({
  index,
  question,
  onChange,
  onRemove,
}: {
  index: number
  question: SubmittedQuestion
  onChange: (q: SubmittedQuestion) => void
  onRemove?: () => void
}) {
  const isMC = question.question_type === "MULTIPLE_CHOICE"

  return (
    <div className="space-y-2 rounded-xl border bg-card p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Domanda {index + 1}</p>
        {onRemove && (
          <Button variant="ghost" size="icon" className="size-6" onClick={onRemove}>
            <Trash2 className="size-3 text-destructive" />
          </Button>
        )}
      </div>

      <Textarea
        value={question.content}
        onChange={(e) => onChange({ ...question, content: e.target.value })}
        placeholder="Testo della domanda"
        rows={2}
        className="rounded-xl text-sm"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <Select
          value={question.question_type}
          onValueChange={(v) => {
            const qt = v as SubmittedQuestion["question_type"]
            onChange({
              ...question,
              question_type: qt,
              options: qt === "MULTIPLE_CHOICE" ? ["", ""] : null,
              correct_answer: [],
            })
          }}
        >
          <SelectTrigger className="rounded-xl text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="MULTIPLE_CHOICE">Scelta multipla</SelectItem>
            <SelectItem value="TRUE_FALSE">Vero/Falso</SelectItem>
            <SelectItem value="SHORT_ANSWER">Risposta breve</SelectItem>
          </SelectContent>
        </Select>

        <Select value={question.difficulty} onValueChange={(v) => onChange({ ...question, difficulty: v as SubmittedQuestion["difficulty"] })}>
          <SelectTrigger className="rounded-xl text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="EASY">Facile</SelectItem>
            <SelectItem value="MEDIUM">Medio</SelectItem>
            <SelectItem value="HARD">Difficile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isMC && (
        <div className="space-y-1.5">
          {(question.options ?? []).map((opt, oi) => {
            const optId = String.fromCharCode(97 + oi)
            const isCorrect = question.correct_answer.includes(optId)
            return (
              <div key={oi} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newAnswer = isCorrect
                      ? question.correct_answer.filter((a) => a !== optId)
                      : [...question.correct_answer, optId]
                    onChange({ ...question, correct_answer: newAnswer })
                  }}
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[9px] font-bold transition-colors",
                    isCorrect ? "border-green-500 bg-green-500 text-white" : "border-border hover:border-green-500/50",
                  )}
                >
                  {optId.toUpperCase()}
                </button>
                <Input
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...(question.options ?? [])]
                    newOptions[oi] = e.target.value
                    onChange({ ...question, options: newOptions })
                  }}
                  placeholder={`Opzione ${optId.toUpperCase()}`}
                  className="rounded-xl text-sm"
                />
              </div>
            )
          })}
        </div>
      )}

      {question.question_type === "TRUE_FALSE" && (
        <div className="flex gap-2">
          {[{ id: "true", label: "Vero" }, { id: "false", label: "Falso" }].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...question, correct_answer: [opt.id] })}
              className={cn(
                "flex-1 rounded-xl border-2 py-1.5 text-sm font-medium transition-colors",
                question.correct_answer.includes(opt.id) ? "border-green-500 bg-green-500/10 text-green-600" : "border-border",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.question_type === "SHORT_ANSWER" && (
        <Input
          value={question.correct_answer[0] ?? ""}
          onChange={(e) => onChange({ ...question, correct_answer: [e.target.value] })}
          placeholder="Risposta corretta"
          className="rounded-xl text-sm"
        />
      )}
    </div>
  )
}

// ─── Previews ───

function ReportPreview({ report }: { report: SubmittedReport }) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Segnalazione</p>
      <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {report.reasons.map((r) => (
            <Badge key={r} variant="outline" className="rounded-full border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs">
              {REASON_LABELS[r] ?? r}
            </Badge>
          ))}
        </div>
        {report.comment && (
          <p className="text-sm text-foreground/90">{report.comment}</p>
        )}
        <p className="line-clamp-2 text-xs text-muted-foreground italic">
          &quot;{report.question_content}&quot;
        </p>
      </div>
    </div>
  )
}

function QuestionPreview({ question, index }: { question: SubmittedQuestion; index: number }) {
  const typeLabels = { MULTIPLE_CHOICE: "Scelta multipla", TRUE_FALSE: "Vero/Falso", SHORT_ANSWER: "Risposta breve" }
  const diffLabels = { EASY: "Facile", MEDIUM: "Medio", HARD: "Difficile" }

  return (
    <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Domanda {index + 1}</p>
        <div className="flex gap-1.5">
          <Badge variant="outline" className="rounded-full text-[10px]">{typeLabels[question.question_type]}</Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">{diffLabels[question.difficulty]}</Badge>
        </div>
      </div>
      <p className="text-sm">{question.content}</p>
      {question.options && (
        <div className="flex flex-wrap gap-1.5">
          {question.options.map((opt, oi) => {
            const optId = String.fromCharCode(97 + oi)
            const isCorrect = question.correct_answer.includes(optId)
            return (
              <Badge
                key={oi}
                variant="outline"
                className={cn(
                  "rounded-full text-xs",
                  isCorrect && "border-green-500/40 bg-green-500/10 text-green-600 dark:text-green-400",
                )}
              >
                {optId.toUpperCase()}: {opt}
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
