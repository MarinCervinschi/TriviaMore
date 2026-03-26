import { Link, createFileRoute } from "@tanstack/react-router"

import { AuthCard } from "@/components/auth/auth-card"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { RegisterForm } from "@/components/auth/register-form"
import { Separator } from "@/components/ui/separator"
import { requireGuest } from "@/lib/auth/guards"

export const Route = createFileRoute("/auth/register")({
  beforeLoad: () => requireGuest(),
  component: RegisterPage,
})

function RegisterPage() {
  return (
    <AuthCard
      title="Crea un account"
      description="Registrati per iniziare a usare TriviaMore"
    >
      <div className="grid gap-6">
        <RegisterForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card/80 px-3 text-muted-foreground backdrop-blur-sm">
              oppure
            </span>
          </div>
        </div>
        <OAuthButtons />
        <p className="text-center text-sm text-muted-foreground">
          Hai gia' un account?{" "}
          <Link
            to="/auth/login"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            Accedi
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
