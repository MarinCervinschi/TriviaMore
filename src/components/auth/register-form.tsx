import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { AcceptanceCheckboxes } from "@/components/legal/acceptance-checkboxes"
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
import { useAuth } from "@/hooks/useAuth"
import { registerSchema, type RegisterInput } from "@/lib/auth/schemas"

export function RegisterForm() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: standardSchemaResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      terms_accepted: false,
      privacy_accepted: false,
    },
  })

  async function onSubmit(values: RegisterInput) {
    const result = await signup.mutateAsync({ data: values })
    if (result.success) {
      toast.success("Registrazione completata")
      navigate({ to: "/" })
    } else {
      toast.error(result.error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome utente</FormLabel>
              <FormControl>
                <Input
                  placeholder="Mario Rossi"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="nome@esempio.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 caratteri, maiuscola e numero"
                    autoComplete="new-password"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Nascondi password" : "Mostra password"}
                    </span>
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <AcceptanceCheckboxes
          termsAccepted={form.watch("terms_accepted")}
          privacyAccepted={form.watch("privacy_accepted")}
          onTermsChange={(value) =>
            form.setValue("terms_accepted", value, {
              shouldValidate: form.formState.isSubmitted,
            })
          }
          onPrivacyChange={(value) =>
            form.setValue("privacy_accepted", value, {
              shouldValidate: form.formState.isSubmitted,
            })
          }
          termsError={form.formState.errors.terms_accepted?.message}
          privacyError={form.formState.errors.privacy_accepted?.message}
          disabled={signup.isPending}
        />
        <Button
          type="submit"
          size="lg"
          className="w-full shadow-lg shadow-primary/25"
          disabled={signup.isPending}
        >
          {signup.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registrazione in corso...
            </>
          ) : (
            "Registrati"
          )}
        </Button>
      </form>
    </Form>
  )
}
