import { useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Check,
  ChevronsUpDown,
  FileUp,
  FolderPlus,
  MessageSquarePlus,
  Plus,
  Trash2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import type { SubmittedQuestion } from "@/lib/requests/types"

type SubmissionType = "section" | "questions" | "file_upload" | null

const ACCEPTED_EXTENSIONS = ".pdf,.docx"
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

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

  // File upload form
  const [file, setFile] = useState<File | null>(null)
  const [fileComment, setFileComment] = useState("")
  const [uploading, setUploading] = useState(false)

  const { data: tree = [] } = useQuery(requestQueries.contentTree())
  const { user } = useAuth()
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
    (type === "questions" && selectedSectionId) ||
    (type === "file_upload" && selectedClassId)

  const canSubmit =
    (type === "section" && sectionName.trim().length >= 2) ||
    (type === "questions" && questions.every((q) => q.content.trim().length >= 10 && q.correct_answer.length > 0)) ||
    (type === "file_upload" && file !== null)

  async function handleSubmit() {
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
        submitted_content: { type: "questions", questions },
      })
    } else if (type === "file_upload" && file && user) {
      setUploading(true)
      try {
        const supabase = createClient()
        const ext = file.name.split(".").pop() ?? "bin"
        const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from("contributions")
          .upload(filePath, file)

        if (uploadError) throw uploadError

        createRequest.mutate({
          type: "file_upload",
          target_class_id: selectedClassId,
          submitted_content: {
            type: "file_upload",
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            comment: fileComment.trim() || null,
          },
        })
      } catch {
        toast.error("Errore nel caricamento del file")
      } finally {
        setUploading(false)
      }
    }
  }

  const isPending = createRequest.isPending || uploading

  // ─── Step 1: Choose type ───
  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-medium">Cosa vuoi proporre?</p>
        <div className="grid gap-3">
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
          <TypeCard
            icon={FileUp}
            title="Carica file"
            description="Carica un file con domande gia pronte (PDF, DOCX)"
            selected={type === "file_upload"}
            onClick={() => setType("file_upload")}
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

  // ─── Step 2: Pick target ───
  if (step === 2) {
    const needsSection = type === "questions"

    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="gap-1 rounded-xl">
          ← Indietro
        </Button>
        <p className="text-sm font-medium">
          {needsSection ? "Seleziona la sezione" : "Seleziona la classe"}
        </p>

        <div className="grid gap-3">
          <SearchableSelect
            items={tree.map((d) => ({ value: d.id, label: d.name }))}
            value={selectedDeptId}
            onValueChange={(v) => { setSelectedDeptId(v); setSelectedCourseId(""); setSelectedClassId(""); setSelectedSectionId("") }}
            placeholder="Cerca dipartimento..."
          />

          {courses.length > 0 && (
            <SearchableSelect
              items={courses.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedCourseId}
              onValueChange={(v) => { setSelectedCourseId(v); setSelectedClassId(""); setSelectedSectionId("") }}
              placeholder="Cerca corso..."
            />
          )}

          {classes.length > 0 && (
            <SearchableSelect
              items={classes.map((c) => ({ value: c.id, label: c.name }))}
              value={selectedClassId}
              onValueChange={(v) => { setSelectedClassId(v); setSelectedSectionId("") }}
              placeholder="Cerca classe..."
            />
          )}

          {needsSection && sections.length > 0 && (
            <SearchableSelect
              items={sections.map((s) => ({ value: s.id, label: s.name }))}
              value={selectedSectionId}
              onValueChange={setSelectedSectionId}
              placeholder="Cerca sezione..."
            />
          )}
        </div>

        <Button onClick={() => setStep(3)} disabled={!canProceedToStep3} className="w-full rounded-xl">
          Continua
        </Button>
      </div>
    )
  }

  // ─── Step 3: Content form ───
  return (
    <div className="space-y-4">
      {!hasPrefilledTarget && (
        <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="gap-1 rounded-xl">
          ← Indietro
        </Button>
      )}

      {type === "section" && (
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
      )}

      {type === "questions" && (
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

      {type === "file_upload" && (
        <FileUploadForm
          file={file}
          onFileChange={setFile}
          comment={fileComment}
          onCommentChange={setFileComment}
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!canSubmit || isPending}
        className="w-full rounded-xl"
      >
        {isPending ? "Invio in corso..." : "Invia proposta"}
      </Button>
    </div>
  )
}

// ─── Searchable Select ───

function SearchableSelect({
  items,
  value,
  onValueChange,
  placeholder,
}: {
  items: { value: string; label: string }[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
}) {
  const [open, setOpen] = useState(false)
  const selected = items.find((i) => i.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between rounded-xl font-normal"
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Nessun risultato</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    onValueChange(item.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 size-4", value === item.value ? "opacity-100" : "opacity-0")} />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ─── File Upload Form ───

function FileUploadForm({
  file,
  onFileChange,
  comment,
  onCommentChange,
}: {
  file: File | null
  onFileChange: (file: File | null) => void
  comment: string
  onCommentChange: (comment: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0]
    if (!selected) return

    if (selected.size > MAX_FILE_SIZE) {
      toast.error("Il file supera il limite di 10 MB")
      return
    }

    onFileChange(selected)
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Carica file</p>

      <div className="rounded-xl border border-dashed p-6 text-center">
        {file ? (
          <div className="space-y-2">
            <div className="mx-auto inline-flex rounded-2xl bg-primary/10 p-3">
              <FileUp className="size-6 text-primary" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { onFileChange(null); if (inputRef.current) inputRef.current.value = "" }}
              className="text-xs text-destructive"
            >
              Rimuovi
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto inline-flex rounded-2xl bg-muted p-3">
              <Upload className="size-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">
              Clicca o trascina un file qui
            </p>
            <p className="text-xs text-muted-foreground/70">
              PDF o DOCX, max 10 MB
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="rounded-xl"
            >
              Scegli file
            </Button>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Carica un file contenente domande gia pronte. Limitati a file con domande strutturate per facilitare la revisione.
      </p>

      <Textarea
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        placeholder="Commento (opzionale) — es. materia, argomento, note per lo staff"
        rows={2}
        className="rounded-xl"
      />
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
      <div className={cn("rounded-xl p-2", selected ? "bg-primary/10" : "bg-muted")}>
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

      {isMC && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Opzioni (clicca per selezionare la risposta corretta)</p>
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
