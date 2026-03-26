import { useState } from "react"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useFieldArray, useForm } from "react-hook-form"
import { Eye, Plus, Trash2 } from "lucide-react"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { parseOptions, type QuestionOption } from "@/lib/quiz/options"
import type { Question } from "@/lib/admin/types"
import type { Json } from "@/lib/supabase/database.types"

// Form-level schema (options as {id, text} objects)
const questionFormSchema = z.object({
  content: z
    .string()
    .min(10, "Il contenuto deve essere di almeno 10 caratteri")
    .max(2000, "Il contenuto non può superare i 2000 caratteri")
    .trim(),
  question_type: z.enum(["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"]),
  options: z
    .array(z.object({ id: z.string(), text: z.string() }))
    .optional()
    .nullable(),
  correct_answer: z
    .array(z.string())
    .min(1, "Deve esserci almeno una risposta corretta"),
  explanation: z.string().optional().or(z.literal("")),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  section_id: z.string().min(1),
})

type QuestionFormValues = z.infer<typeof questionFormSchema>

type QuestionFormProps = {
  question?: Question
  sectionId: string
  onSubmit: (data: {
    content: string
    question_type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER"
    options?: string[] | null
    correct_answer: string[]
    explanation?: string
    difficulty: "EASY" | "MEDIUM" | "HARD"
    section_id: string
  }) => void
  isPending: boolean
}

const ID_LETTERS = "abcdefghijklmnopqrstuvwxyz"

export function QuestionForm({
  question,
  sectionId,
  onSubmit,
  isPending,
}: QuestionFormProps) {
  const [showPreview, setShowPreview] = useState(false)

  const existingOptions: QuestionOption[] = question?.options
    ? parseOptions(question.options as Json)
    : []

  const defaultOptions: QuestionOption[] =
    existingOptions.length > 0
      ? existingOptions
      : [
          { id: "a", text: "" },
          { id: "b", text: "" },
        ]

  const form = useForm<QuestionFormValues>({
    resolver: standardSchemaResolver(questionFormSchema),
    defaultValues: {
      content: question?.content ?? "",
      question_type: question?.question_type ?? "MULTIPLE_CHOICE",
      options: defaultOptions,
      correct_answer: question?.correct_answer ?? [],
      explanation: question?.explanation ?? "",
      difficulty: question?.difficulty ?? "MEDIUM",
      section_id: question?.section_id ?? sectionId,
    },
  })

  const questionType = form.watch("question_type")
  const content = form.watch("content")
  const options = form.watch("options")
  const correctAnswer = form.watch("correct_answer")

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  })

  function toggleCorrectAnswer(optionId: string) {
    const current = form.getValues("correct_answer")
    if (current.includes(optionId)) {
      form.setValue(
        "correct_answer",
        current.filter((a) => a !== optionId),
      )
    } else {
      form.setValue("correct_answer", [...current, optionId])
    }
  }

  function handleSubmit(values: QuestionFormValues) {
    // Convert {id, text} options back to the format the server expects
    const serverOptions =
      values.options && values.question_type !== "SHORT_ANSWER"
        ? values.options.map((o) => o.text)
        : null

    onSubmit({
      content: values.content,
      question_type: values.question_type,
      options: serverOptions,
      correct_answer: values.correct_answer,
      explanation: values.explanation,
      difficulty: values.difficulty,
      section_id: values.section_id,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid gap-4">
        {/* Content with preview */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Domanda</FormLabel>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  <Eye className="mr-1 h-3.5 w-3.5" />
                  {showPreview ? "Editor" : "Anteprima"}
                </Button>
              </div>
              {showPreview ? (
                <div className="rounded-md border p-3">
                  {content ? (
                    <MarkdownRenderer content={content} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nessun contenuto da visualizzare
                    </p>
                  )}
                </div>
              ) : (
                <FormControl>
                  <Textarea
                    placeholder="Scrivi la domanda (supporta Markdown e formule LaTeX)..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
              )}
              <FormDescription>
                Supporta Markdown e formule LaTeX ($..$ inline, $$..$$
                blocco)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="question_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={(v) => {
                    field.onChange(v)
                    if (v === "TRUE_FALSE") {
                      form.setValue("options", [
                        { id: "true", text: "Vero" },
                        { id: "false", text: "Falso" },
                      ])
                      form.setValue("correct_answer", [])
                    } else if (v === "SHORT_ANSWER") {
                      form.setValue("options", null)
                      form.setValue("correct_answer", [""])
                    } else {
                      form.setValue("options", [
                        { id: "a", text: "" },
                        { id: "b", text: "" },
                      ])
                      form.setValue("correct_answer", [])
                    }
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MULTIPLE_CHOICE">
                      Scelta multipla
                    </SelectItem>
                    <SelectItem value="TRUE_FALSE">Vero/Falso</SelectItem>
                    <SelectItem value="SHORT_ANSWER">
                      Risposta breve
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficoltà</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EASY">Facile</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HARD">Difficile</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Multiple choice options */}
        {questionType === "MULTIPLE_CHOICE" && (
          <div className="space-y-3">
            <FormLabel>Opzioni</FormLabel>
            <FormDescription>
              Seleziona le risposte corrette con la checkbox. Supporta
              Markdown.
            </FormDescription>
            {fields.map((field, index) => {
              const optionId = options?.[index]?.id ?? ID_LETTERS[index]
              const isCorrect = correctAnswer?.includes(optionId)

              return (
                <div key={field.id} className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrectAnswer(optionId)}
                    className={`mt-2.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs font-bold transition-colors ${
                      isCorrect
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 hover:border-primary"
                    }`}
                  >
                    {isCorrect ? "✓" : ID_LETTERS[index]?.toUpperCase()}
                  </button>
                  <div className="flex-1 space-y-1">
                    <Input
                      placeholder={`Opzione ${ID_LETTERS[index]?.toUpperCase()}`}
                      {...form.register(`options.${index}.text`)}
                    />
                    {showPreview && options?.[index]?.text && (
                      <div className="rounded border bg-muted/30 px-2 py-1">
                        <MarkdownRenderer
                          content={options[index].text}
                          className="text-sm"
                        />
                      </div>
                    )}
                  </div>
                  {fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="mt-1"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              )
            })}
            {fields.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ id: ID_LETTERS[fields.length], text: "" })
                }
              >
                <Plus className="mr-1 h-4 w-4" />
                Aggiungi opzione
              </Button>
            )}
            <FormField
              control={form.control}
              name="correct_answer"
              render={() => <FormMessage />}
            />
          </div>
        )}

        {/* True/False */}
        {questionType === "TRUE_FALSE" && (
          <FormField
            control={form.control}
            name="correct_answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risposta corretta</FormLabel>
                <Select
                  onValueChange={(v) => field.onChange([v])}
                  defaultValue={field.value?.[0]}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Vero</SelectItem>
                    <SelectItem value="false">Falso</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Short answer */}
        {questionType === "SHORT_ANSWER" && (
          <FormField
            control={form.control}
            name="correct_answer.0"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risposta corretta</FormLabel>
                <FormControl>
                  <Input placeholder="La risposta corretta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="explanation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Spiegazione (opzionale)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Spiega la risposta corretta (supporta Markdown)..."
                  rows={2}
                  {...field}
                />
              </FormControl>
              {showPreview && field.value && (
                <div className="rounded border bg-muted/30 px-3 py-2">
                  <MarkdownRenderer content={field.value} />
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvataggio..."
            : question
              ? "Aggiorna domanda"
              : "Crea domanda"}
        </Button>
      </form>
    </Form>
  )
}
