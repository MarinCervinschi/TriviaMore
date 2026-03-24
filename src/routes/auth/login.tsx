import { Link, createFileRoute } from "@tanstack/react-router"

import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { Separator } from "@/components/ui/separator"
import { requireGuest } from "@/lib/auth/guards"

export const Route = createFileRoute("/auth/login")({
  beforeLoad: () => requireGuest(),
  component: LoginPage,
})

function LoginPage() {
  return (
    <AuthCard title="Accedi" description="Accedi al tuo account TriviaMore">
      <div className="grid gap-6">
        <LoginForm />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              O continua con
            </span>
          </div>
        </div>
        <OAuthButtons />
        <p className="text-center text-sm text-muted-foreground">
          Non hai un account?{" "}
          <Link
            to="/auth/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Registrati
          </Link>
        </p>
      </div>
    </AuthCard>
  )
}
