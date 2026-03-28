import { useMemo } from "react"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

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
import { contentRequestSchema, type ContentRequestInput } from "@/lib/requests/schemas"
import { requestQueries } from "@/lib/requests/queries"

const REQUEST_TYPES = [
  { value: "NEW_SECTION", label: "Nuova sezione" },
  { value: "NEW_QUESTIONS", label: "Nuove domande" },
  { value: "ERROR_REPORT", label: "Segnalazione errore" },
  { value: "CONTENT_REQUEST", label: "Richiesta contenuto" },
] as const

export function RequestForm({
  defaultValues,
  onSubmit,
  isPending,
}: {
  defaultValues?: Partial<ContentRequestInput>
  onSubmit: (data: ContentRequestInput) => void
  isPending: boolean
}) {
  const form = useForm<ContentRequestInput>({
    resolver: standardSchemaResolver(contentRequestSchema),
    defaultValues: {
      request_type: defaultValues?.request_type ?? "CONTENT_REQUEST",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      target_department_id: defaultValues?.target_department_id ?? null,
      target_course_id: defaultValues?.target_course_id ?? null,
      target_class_id: defaultValues?.target_class_id ?? null,
      target_section_id: defaultValues?.target_section_id ?? null,
      question_id: defaultValues?.question_id ?? null,
    },
  })

  const { data: tree = [] } = useQuery(requestQueries.contentTree())

  const selectedDeptId = form.watch("target_department_id")
  const selectedCourseId = form.watch("target_course_id")
  const selectedClassId = form.watch("target_class_id")

  const courses = useMemo(() => {
    if (!selectedDeptId) return []
    const dept = tree.find((d) => d.id === selectedDeptId)
    return dept?.courses ?? []
  }, [tree, selectedDeptId])

  const classes = useMemo(() => {
    if (!selectedCourseId) return []
    const course = courses.find((c) => c.id === selectedCourseId)
    return course?.classes ?? []
  }, [courses, selectedCourseId])

  const sections = useMemo(() => {
    if (!selectedClassId) return []
    const cls = classes.find((c) => c.id === selectedClassId)
    return cls?.sections ?? []
  }, [classes, selectedClassId])

  // Determine if target selects should be locked (pre-filled from context)
  const hasPrefilledTarget =
    defaultValues?.target_department_id ||
    defaultValues?.target_course_id ||
    defaultValues?.target_class_id ||
    defaultValues?.target_section_id

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {/* Request type */}
        <FormField
          control={form.control}
          name="request_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo di richiesta</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Seleziona il tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {REQUEST_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titolo</FormLabel>
              <FormControl>
                <Input
                  placeholder="es. Aggiungere domande su Analisi 2"
                  className="rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrizione</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descrivi la tua richiesta nel dettaglio..."
                  rows={4}
                  className="rounded-xl"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Target selects — cascading hierarchy */}
        {!hasPrefilledTarget && (
          <div className="grid gap-3">
            <p className="text-sm font-medium">Target</p>

            {/* Department */}
            <FormField
              control={form.control}
              name="target_department_id"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={(val) => {
                      field.onChange(val)
                      // Reset children
                      form.setValue("target_course_id", null)
                      form.setValue("target_class_id", null)
                      form.setValue("target_section_id", null)
                    }}
                    value={field.value ?? ""}
                  >
                    <FormControl>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Dipartimento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tree.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Course */}
            {courses.length > 0 && (
              <FormField
                control={form.control}
                name="target_course_id"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue("target_class_id", null)
                        form.setValue("target_section_id", null)
                      }}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Corso (opzionale)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {/* Class */}
            {classes.length > 0 && (
              <FormField
                control={form.control}
                name="target_class_id"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val)
                        form.setValue("target_section_id", null)
                      }}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Classe (opzionale)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            {/* Section */}
            {sections.length > 0 && (
              <FormField
                control={form.control}
                name="target_section_id"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Sezione (opzionale)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sections.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}
          </div>
        )}

        <Button type="submit" disabled={isPending} className="rounded-xl">
          {isPending ? "Invio in corso..." : "Invia richiesta"}
        </Button>
      </form>
    </Form>
  )
}
