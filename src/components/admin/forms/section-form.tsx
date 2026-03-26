import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { sectionSchema, type SectionInput } from "@/lib/admin/schemas"
import type { Section } from "@/lib/admin/types"

type SectionFormProps = {
  section?: Section
  classId: string
  onSubmit: (data: SectionInput) => void
  isPending: boolean
}

export function SectionForm({
  section,
  classId,
  onSubmit,
  isPending,
}: SectionFormProps) {
  const form = useForm<SectionInput>({
    resolver: standardSchemaResolver(sectionSchema),
    defaultValues: {
      name: section?.name ?? "",
      description: section?.description ?? "",
      class_id: section?.class_id ?? classId,
      is_public: section?.is_public ?? true,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="es. Capitolo 1 - Limiti" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrizione della sezione (opzionale)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Pubblica</FormLabel>
                <FormDescription>
                  Le sezioni pubbliche sono accessibili a tutti gli utenti.
                  Quelle private richiedono un accesso esplicito.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvataggio..."
            : section
              ? "Aggiorna sezione"
              : "Crea sezione"}
        </Button>
      </form>
    </Form>
  )
}
