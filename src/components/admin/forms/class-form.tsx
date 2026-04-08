import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { classSchema, courseClassSchema, type ClassInput } from "@/lib/admin/schemas"
import type { Class } from "@/lib/admin/types"

const classWithJunctionSchema = classSchema.merge(
  courseClassSchema.pick({ code: true, class_year: true, mandatory: true, curriculum: true }),
)

type JunctionDefaults = {
  code?: string
  class_year?: number
  mandatory?: boolean
  curriculum?: string
}

type ClassFormProps = {
  cls?: Class
  onSubmit: (data: ClassInput & JunctionDefaults) => void
  isPending: boolean
  junction?: JunctionDefaults
}

export function ClassForm({
  cls,
  onSubmit,
  isPending,
  junction,
}: ClassFormProps) {
  const form = useForm<ClassInput & JunctionDefaults>({
    resolver: standardSchemaResolver(junction ? classWithJunctionSchema : classSchema),
    defaultValues: {
      name: cls?.name ?? "",
      description: cls?.description ?? "",
      cfu: cls?.cfu ?? undefined,
      code: junction?.code ?? "",
      class_year: junction?.class_year ?? 1,
      mandatory: junction?.mandatory ?? false,
      curriculum: junction?.curriculum ?? "",
    },
  })

  const showJunction = !!junction

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
        {showJunction && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Codice</FormLabel>
                <FormControl>
                  <Input
                    placeholder="es. ANA-MAT"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
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
        {showJunction && (
          <>
            <FormField
              control={form.control}
              name="class_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anno</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="es. 1"
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
              name="mandatory"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">Obbligatorio</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="curriculum"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Curriculum</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="es. Applicazioni (opzionale)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
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
