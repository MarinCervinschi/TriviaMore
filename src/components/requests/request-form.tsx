import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FileUp,
  FolderPlus,
  MessageSquarePlus,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { requestQueries } from "@/lib/requests/queries"
import { useCreateRequest } from "@/lib/requests/mutations"
import { useAuth } from "@/hooks/useAuth"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

import { SearchableSelect } from "./searchable-select"
import { FileUploadForm } from "./file-upload-form"
import { TypeCard } from "./type-card"
import { QuestionEditor } from "./question-editor"

import type { SubmittedQuestion } from "@/lib/requests/types"

type SubmissionType = "section" | "questions" | "file_upload" | null

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
