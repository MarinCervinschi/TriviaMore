import { useState } from "react"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useFieldArray, useForm, type FieldValues } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
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
import { QuestionContentField } from "./question-content-field"
import { MultipleChoiceOptions } from "./multiple-choice-options"
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
        <QuestionContentField
          control={form.control as unknown as import("react-hook-form").Control<FieldValues>}
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          watchedContent={content}
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
          <MultipleChoiceOptions
            control={form.control as unknown as import("react-hook-form").Control<FieldValues>}
            fields={fields}
            options={options}
            correctAnswer={correctAnswer}
            showPreview={showPreview}
            register={form.register as unknown as import("react-hook-form").UseFormRegister<FieldValues>}
            append={append}
            remove={remove}
            toggleCorrectAnswer={toggleCorrectAnswer}
          />
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
