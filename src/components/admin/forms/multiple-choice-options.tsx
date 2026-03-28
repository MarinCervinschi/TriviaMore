import type { Control, FieldArrayWithId, FieldValues, UseFormRegister } from "react-hook-form"
import { Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

const ID_LETTERS = "abcdefghijklmnopqrstuvwxyz"

export function MultipleChoiceOptions({
  control,
  fields,
  options,
  correctAnswer,
  showPreview,
  register,
  append,
  remove,
  toggleCorrectAnswer,
}: {
  control: Control<FieldValues>
  fields: FieldArrayWithId<FieldValues, "options", "id">[]
  options: { id: string; text: string }[] | null | undefined
  correctAnswer: string[] | undefined
  showPreview: boolean
  register: UseFormRegister<FieldValues>
  append: (value: { id: string; text: string }) => void
  remove: (index: number) => void
  toggleCorrectAnswer: (optionId: string) => void
}) {
  return (
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
                {...register(`options.${index}.text`)}
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
        control={control}
        name="correct_answer"
        render={() => <FormMessage />}
      />
    </div>
  )
}
