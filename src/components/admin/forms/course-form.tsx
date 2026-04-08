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
import { courseSchema, type CourseInput } from "@/lib/admin/schemas"
import type { Course } from "@/lib/admin/types"

type CourseFormProps = {
  course?: Course
  departmentId: string
  onSubmit: (data: CourseInput) => void
  isPending: boolean
}

export function CourseForm({
  course,
  departmentId,
  onSubmit,
  isPending,
}: CourseFormProps) {
  const form = useForm<CourseInput>({
    resolver: standardSchemaResolver(courseSchema),
    defaultValues: {
      name: course?.name ?? "",
      code: course?.code ?? "",
      description: course?.description ?? "",
      department_id: course?.department_id ?? departmentId,
      course_type: course?.course_type ?? "BACHELOR",
      location: course?.location ?? "",
      cfu: course?.cfu ?? undefined,
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
                <Input placeholder="es. Informatica" {...field} />
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
                  placeholder="es. INFO"
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
          name="course_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo di corso</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="BACHELOR">Triennale</SelectItem>
                  <SelectItem value="MASTER">Magistrale</SelectItem>
                  <SelectItem value="SINGLE_CYCLE">Ciclo Unico</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sede</FormLabel>
              <Select
                onValueChange={(v) => field.onChange(v === "_none" ? "" : v)}
                defaultValue={field.value || "_none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona sede (opzionale)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="_none">Nessuna</SelectItem>
                  <SelectItem value="MODENA">Modena</SelectItem>
                  <SelectItem value="REGGIO_EMILIA">Reggio Emilia</SelectItem>
                  <SelectItem value="CARPI">Carpi</SelectItem>
                  <SelectItem value="MANTOVA">Mantova</SelectItem>
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
              <FormLabel>CFU totali</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="es. 180"
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
                  placeholder="Descrizione del corso (opzionale)"
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
            : course
              ? "Aggiorna corso"
              : "Crea corso"}
        </Button>
      </form>
    </Form>
  )
}
