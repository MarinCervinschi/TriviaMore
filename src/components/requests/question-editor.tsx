import { Plus, Trash2 } from "lucide-react"

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
import { cn } from "@/lib/utils"

import type { SubmittedQuestion } from "@/lib/requests/types"

export function QuestionEditor({
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
