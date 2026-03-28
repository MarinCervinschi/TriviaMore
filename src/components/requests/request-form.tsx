import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FolderPlus,
  MessageSquarePlus,
  Plus,
  Trash2,
} from "lucide-react"

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
import { requestQueries } from "@/lib/requests/queries"
import { useCreateRequest } from "@/lib/requests/mutations"
import { cn } from "@/lib/utils"

import type { SubmittedQuestion } from "@/lib/requests/types"

type SubmissionType = "section" | "questions" | null

const EMPTY_QUESTION: SubmittedQuestion = {
  content: "",
  question_type: "MULTIPLE_CHOICE",
  options: ["", ""],
  correct_answer: [],
  explanation: null,
  difficulty: "MEDIUM",
}

export function RequestForm({
  defaultTargetClassId,
  defaultTargetSectionId,
  onSuccess,
}: {
  defaultTargetClassId?: string
  defaultTargetSectionId?: string
  onSuccess?: () => void
}) {
  const [step, setStep] = useState<1 | 2 | 3>(defaultTargetSectionId ? 3 : defaultTargetClassId ? 3 : 1)
  const [type, setType] = useState<SubmissionType>(
    defaultTargetSectionId ? "questions" : defaultTargetClassId ? "section" : null,
  )

  // Target selection
  const [selectedDeptId, setSelectedDeptId] = useState("")
  const [selectedCourseId, setSelectedCourseId] = useState("")
  const [selectedClassId, setSelectedClassId] = useState(defaultTargetClassId ?? "")
  const [selectedSectionId, setSelectedSectionId] = useState(defaultTargetSectionId ?? "")

  // Section form
  const [sectionName, setSectionName] = useState("")
  const [sectionDesc, setSectionDesc] = useState("")

  // Questions form
  const [questions, setQuestions] = useState<SubmittedQuestion[]>([{ ...EMPTY_QUESTION }])

  const { data: tree = [] } = useQuery(requestQueries.contentTree())
  const createRequest = useCreateRequest(onSuccess)

  const courses = useMemo(() => {
    if (!selectedDeptId) return []
    return tree.find((d) => d.id === selectedDeptId)?.courses ?? []
  }, [tree, selectedDeptId])

  const classes = useMemo(() => {
    if (!selectedCourseId) return []
    return courses.find((c) => c.id === selectedCourseId)?.classes ?? []
  }, [courses, selectedCourseId])

  const sections = useMemo(() => {
    if (!selectedClassId) return []
    const cls = classes.find((c) => c.id === selectedClassId)
    return cls?.sections ?? []
  }, [classes, selectedClassId])

  const hasPrefilledTarget = !!defaultTargetClassId || !!defaultTargetSectionId

  const canProceedToStep3 =
    (type === "section" && selectedClassId) ||
    (type === "questions" && selectedSectionId)

  const canSubmit =
    (type === "section" && sectionName.trim().length >= 2) ||
    (type === "questions" && questions.every((q) => q.content.trim().length >= 10 && q.correct_answer.length > 0))

  function handleSubmit() {
    if (type === "section") {
      createRequest.mutate({
        type: "section",
        target_class_id: selectedClassId,
        submitted_content: {
          type: "section",
          name: sectionName.trim(),
          description: sectionDesc.trim(),
        },
      })
    } else if (type === "questions") {
      createRequest.mutate({
        type: "questions",
        target_section_id: selectedSectionId,
        submitted_content: {
          type: "questions",
          questions,
        },
      })
    }
  }

  // Step 1: Choose type
  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium">Cosa vuoi proporre?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <TypeCard
            icon={FolderPlus}
            title="Nuova sezione"
            description="Proponi una nuova sezione per una classe"
            selected={type === "section"}
            onClick={() => setType("section")}
          />
          <TypeCard
            icon={MessageSquarePlus}
            title="Nuove domande"
            description="Proponi domande per una sezione esistente"
            selected={type === "questions"}
            onClick={() => setType("questions")}
          />
        </div>
        <Button
          onClick={() => setStep(hasPrefilledTarget ? 3 : 2)}
          disabled={!type}
          className="w-full rounded-xl"
        >
          Continua
        </Button>
      </div>
    )
  }

  // Step 2: Pick target
  if (step === 2) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1 rounded-xl">
          ← Indietro
        </Button>
        <p className="text-sm font-medium">
          {type === "section" ? "Seleziona la classe" : "Seleziona la sezione"}
        </p>

        <div className="grid gap-3">
          <Select value={selectedDeptId} onValueChange={(v) => { setSelectedDeptId(v); setSelectedCourseId(""); setSelectedClassId(""); setSelectedSectionId("") }}>
            <SelectTrigger className="rounded-xl"><SelectValue placeholder="Dipartimento" /></SelectTrigger>
            <SelectContent>
              {tree.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {courses.length > 0 && (
            <Select value={selectedCourseId} onValueChange={(v) => { setSelectedCourseId(v); setSelectedClassId(""); setSelectedSectionId("") }}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Corso" /></SelectTrigger>
              <SelectContent>
                {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {classes.length > 0 && (
            <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSectionId("") }}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Classe" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}

          {type === "questions" && sections.length > 0 && (
            <Select value={selectedSectionId} onValueChange={setSelectedSectionId}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Sezione" /></SelectTrigger>
              <SelectContent>
                {sections.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>

        <Button onClick={() => setStep(3)} disabled={!canProceedToStep3} className="w-full rounded-xl">
          Continua
        </Button>
      </div>
    )
  }

  // Step 3: Content form
  return (
    <div className="space-y-4">
      {!hasPrefilledTarget && (
        <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1 rounded-xl">
          ← Indietro
        </Button>
      )}

      {type === "section" ? (
        <div className="space-y-4">
          <p className="text-sm font-medium">Dettagli sezione</p>
          <Input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="Nome della sezione"
            className="rounded-xl"
          />
          <Textarea
            value={sectionDesc}
            onChange={(e) => setSectionDesc(e.target.value)}
            placeholder="Descrizione (opzionale)"
            rows={3}
            className="rounded-xl"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Domande ({questions.length})</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuestions([...questions, { ...EMPTY_QUESTION }])}
              className="gap-1 rounded-xl"
            >
              <Plus className="size-3.5" />
              Aggiungi
            </Button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <QuestionEditor
                key={qi}
                index={qi}
                question={q}
                onChange={(updated) => {
                  const copy = [...questions]
                  copy[qi] = updated
                  setQuestions(copy)
                }}
                onRemove={questions.length > 1 ? () => setQuestions(questions.filter((_, i) => i !== qi)) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || createRequest.isPending}
        className="w-full rounded-xl"
      >
        {createRequest.isPending ? "Invio in corso..." : "Invia proposta"}
      </Button>
    </div>
  )
}

// ─── Sub-components ───

function TypeCard({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: typeof FolderPlus
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-start gap-3 rounded-2xl border-2 p-4 text-left transition-all",
        selected
          ? "border-primary bg-primary/5"
          : "border-transparent bg-muted/50 hover:bg-accent/50",
      )}
    >
      <div className={cn(
        "rounded-xl p-2",
        selected ? "bg-primary/10" : "bg-muted",
      )}>
        <Icon className={cn("size-5", selected ? "text-primary" : "text-muted-foreground")} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </button>
  )
}

function QuestionEditor({
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
    <div className="space-y-3 rounded-xl border bg-card/50 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground">Domanda {index + 1}</p>
        {onRemove && (
          <Button variant="ghost" size="icon" className="size-7" onClick={onRemove}>
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        )}
      </div>

      <Textarea
        value={question.content}
        onChange={(e) => onChange({ ...question, content: e.target.value })}
        placeholder="Testo della domanda (supporta Markdown e LaTeX)"
        rows={2}
        className="rounded-xl text-sm"
      />

      <div className="grid gap-3 sm:grid-cols-2">
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

      {/* MC Options */}
      {isMC && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Opzioni (clicca per selezionare la risposta corretta)</p>
          {(question.options ?? []).map((opt, oi) => {
            const optId = String.fromCharCode(97 + oi) // a, b, c, ...
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
                    "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors",
                    isCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-border text-muted-foreground hover:border-green-500/50",
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
                {(question.options?.length ?? 0) > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    onClick={() => {
                      const newOptions = (question.options ?? []).filter((_, i) => i !== oi)
                      const newAnswer = question.correct_answer.filter((a) => a !== optId)
                      onChange({ ...question, options: newOptions, correct_answer: newAnswer })
                    }}
                  >
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                )}
              </div>
            )
          })}
          {(question.options?.length ?? 0) < 6 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onChange({ ...question, options: [...(question.options ?? []), ""] })}
              className="gap-1 text-xs"
            >
              <Plus className="size-3" /> Aggiungi opzione
            </Button>
          )}
        </div>
      )}

      {/* True/False */}
      {question.question_type === "TRUE_FALSE" && (
        <div className="flex gap-2">
          {[{ id: "true", label: "Vero" }, { id: "false", label: "Falso" }].map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange({ ...question, correct_answer: [opt.id] })}
              className={cn(
                "flex-1 rounded-xl border-2 py-2 text-sm font-medium transition-colors",
                question.correct_answer.includes(opt.id)
                  ? "border-green-500 bg-green-500/10 text-green-600"
                  : "border-border hover:border-green-500/50",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Short answer */}
      {question.question_type === "SHORT_ANSWER" && (
        <Input
          value={question.correct_answer[0] ?? ""}
          onChange={(e) => onChange({ ...question, correct_answer: [e.target.value] })}
          placeholder="Risposta corretta"
          className="rounded-xl text-sm"
        />
      )}

      <Textarea
        value={question.explanation ?? ""}
        onChange={(e) => onChange({ ...question, explanation: e.target.value || null })}
        placeholder="Spiegazione (opzionale)"
        rows={2}
        className="rounded-xl text-sm"
      />
    </div>
  )
}
