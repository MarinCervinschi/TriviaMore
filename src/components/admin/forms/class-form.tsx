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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { classSchema, type ClassInput } from "@/lib/admin/schemas"
import type { Class } from "@/lib/admin/types"

type ClassFormProps = {
  cls?: Class
  courseId: string
  onSubmit: (data: ClassInput) => void
  isPending: boolean
}

export function ClassForm({
  cls,
  courseId,
  onSubmit,
  isPending,
}: ClassFormProps) {
  const form = useForm<ClassInput>({
    resolver: standardSchemaResolver(classSchema),
    defaultValues: {
      name: cls?.name ?? "",
      code: cls?.code ?? "",
      description: cls?.description ?? "",
      course_id: cls?.course_id ?? courseId,
      class_year: cls?.class_year ?? 1,
      cfu: cls?.cfu ?? undefined,
      catalogue_url: cls?.catalogue_url ?? "",
      curriculum: cls?.curriculum ?? "",
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Codice</FormLabel>
              <FormControl>
                <Input
                  placeholder="es. AM1"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="class_year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Anno</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(Number(v))}
                defaultValue={String(field.value)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona anno" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      Anno {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          name="catalogue_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL catalogo</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://... (opzionale)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
                  placeholder="es. Informatica Applicata (opzionale)"
                  {...field}
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
                  placeholder="Descrizione della classe (opzionale)"
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
              ? "Aggiorna classe"
              : "Crea classe"}
        </Button>
      </form>
    </Form>
  )
}
