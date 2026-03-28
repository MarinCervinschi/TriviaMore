import type { Control, FieldValues } from "react-hook-form"
import { Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

export function QuestionContentField({
  control,
  showPreview,
  setShowPreview,
  watchedContent,
}: {
  control: Control<FieldValues>
  showPreview: boolean
  setShowPreview: (v: boolean) => void
  watchedContent: string
}) {
  return (
    <FormField
      control={control}
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
              {watchedContent ? (
                <MarkdownRenderer content={watchedContent} />
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
  )
}
