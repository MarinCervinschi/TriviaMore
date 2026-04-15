import { useState } from "react"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { Eye, Pencil } from "lucide-react"

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
import { cn } from "@/lib/utils"
import {
  changelogSchema,
  type ChangelogInput,
} from "@/lib/changelogs/schemas"
import type { Changelog } from "@/lib/changelogs/types"

type ChangelogFormProps = {
  changelog?: Changelog
  onSubmit: (data: ChangelogInput) => void
  isPending: boolean
}

export function ChangelogForm({
  changelog,
  onSubmit,
  isPending,
}: ChangelogFormProps) {
  const [preview, setPreview] = useState(false)

  const form = useForm<ChangelogInput>({
    resolver: standardSchemaResolver(changelogSchema),
    defaultValues: {
      version: changelog?.version ?? "",
      title: changelog?.title ?? "",
      body: changelog?.body ?? "",
      category: (changelog?.category as ChangelogInput["category"]) ?? "new",
    },
  })

  const watchedBody = form.watch("body")

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Versione</FormLabel>
                <FormControl>
                  <Input placeholder="es. 3.0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">Novità</SelectItem>
                    <SelectItem value="improved">Miglioramento</SelectItem>
                    <SelectItem value="fixed">Correzione</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input
                  placeholder="es. Nuova modalità quiz"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Contenuto</FormLabel>
                <div className="flex gap-1 rounded-lg border p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreview(false)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      !preview
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Pencil className="h-3 w-3" />
                    Modifica
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreview(true)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                      preview
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Eye className="h-3 w-3" />
                    Anteprima
                  </button>
                </div>
              </div>
              {preview ? (
                <div className="min-h-[200px] rounded-xl border bg-muted/30 p-4">
                  {watchedBody ? (
                    <MarkdownRenderer content={watchedBody} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Nessun contenuto da visualizzare
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <FormControl>
                    <Textarea
                      placeholder="Descrivi le modifiche in markdown..."
                      rows={12}
                      className="font-mono text-sm"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Supporta Markdown (titoli, liste, grassetto, codice, ecc.)
                  </p>
                </>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvataggio..."
            : changelog
              ? "Aggiorna changelog"
              : "Crea changelog"}
        </Button>
      </form>
    </Form>
  )
}
