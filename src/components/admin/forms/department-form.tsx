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
import {
  departmentSchema,
  type DepartmentInput,
} from "@/lib/admin/schemas"
import type { Department } from "@/lib/admin/types"

type DepartmentFormProps = {
  department?: Department
  onSubmit: (data: DepartmentInput) => void
  isPending: boolean
}

export function DepartmentForm({
  department,
  onSubmit,
  isPending,
}: DepartmentFormProps) {
  const form = useForm<DepartmentInput>({
    resolver: standardSchemaResolver(departmentSchema),
    defaultValues: {
      name: department?.name ?? "",
      code: department?.code ?? "",
      description: department?.description ?? "",
      area: department?.area ?? "",
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="es. Ingegneria" {...field} />
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
                  placeholder="es. ING"
                  {...field}
                  onChange={(e) =>
                    field.onChange(e.target.value.toUpperCase())
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona area (opzionale)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="SCIENZE">Scienze</SelectItem>
                  <SelectItem value="TECNOLOGIA">Tecnologia</SelectItem>
                  <SelectItem value="SALUTE">Salute</SelectItem>
                  <SelectItem value="VITA">Vita</SelectItem>
                  <SelectItem value="SOCIETA_CULTURA">
                    Societa e Cultura
                  </SelectItem>
                </SelectContent>
              </Select>
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
                  placeholder="Descrizione del dipartimento (opzionale)"
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
            : department
              ? "Aggiorna dipartimento"
              : "Crea dipartimento"}
        </Button>
      </form>
    </Form>
  )
}
