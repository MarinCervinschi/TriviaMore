import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

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
import { Textarea } from "@/components/ui/textarea"
import { classSchema, type ClassInput } from "@/lib/admin/schemas"
import type { Class } from "@/lib/admin/types"

type ClassFormProps = {
  cls?: Class
  onSubmit: (data: ClassInput) => void
  isPending: boolean
}

export function ClassForm({
  cls,
  onSubmit,
  isPending,
}: ClassFormProps) {
  const form = useForm<ClassInput>({
    resolver: standardSchemaResolver(classSchema),
    defaultValues: {
      name: cls?.name ?? "",
      description: cls?.description ?? "",
      cfu: cls?.cfu ?? undefined,
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
                <Input placeholder="es. Analisi Matematica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cfu"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CFU</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="es. 6"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                />
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
                  placeholder="Descrizione dell'insegnamento (opzionale)"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Salvataggio..."
            : cls
              ? "Aggiorna insegnamento"
              : "Crea insegnamento"}
        </Button>
      </form>
    </Form>
  )
}
