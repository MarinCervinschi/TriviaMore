import { Link, createFileRoute } from '@tanstack/react-router'
import { Moon, Sun, Monitor, LogIn, LogOut, User } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { theme, setTheme, resolvedTheme, mounted } = useTheme()
  const { user, isAuthenticated, isLoading, logout } = useAuth()

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">TriviaMore</h1>
        <p className="text-muted-foreground">
          TanStack Start — Fase 2: Autenticazione
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Auth status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" /> Autenticazione
            </CardTitle>
            <CardDescription>
              {isLoading ? 'Caricamento...' : isAuthenticated ? `Accesso come ${user?.name ?? user?.email}` : 'Non autenticato'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isAuthenticated && user ? (
              <>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Nome:</span> {user.name ?? '—'}</p>
                  <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                  <p><span className="text-muted-foreground">Ruolo:</span> <Badge variant="secondary">{user.role}</Badge></p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => logout.mutate({})}
                  disabled={logout.isPending}
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  {logout.isPending ? 'Uscita...' : 'Esci'}
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button size="sm" asChild>
                  <Link to="/auth/login">
                    <LogIn className="mr-1 h-4 w-4" /> Accedi
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/auth/register">Registrati</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme test */}
        <Card>
          <CardHeader>
            <CardTitle>Dark Mode</CardTitle>
            <CardDescription>
              Tema attuale: {mounted ? resolvedTheme : '...'} ({mounted ? theme : '...'})
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              variant={theme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('light')}
            >
              <Sun className="mr-1 h-4 w-4" /> Light
            </Button>
            <Button
              variant={theme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('dark')}
            >
              <Moon className="mr-1 h-4 w-4" /> Dark
            </Button>
            <Button
              variant={theme === 'system' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme('system')}
            >
              <Monitor className="mr-1 h-4 w-4" /> System
            </Button>
          </CardContent>
        </Card>

        {/* Components test */}
        <Card>
          <CardHeader>
            <CardTitle>Componenti UI</CardTitle>
            <CardDescription>Shadcn + Radix funzionano</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
            <Separator />
            <Input placeholder="Input di test..." />
            <div className="flex gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="destructive">Destructive</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </div>
          </CardContent>
        </Card>

        {/* CSS Variables test */}
        <Card>
          <CardHeader>
            <CardTitle>CSS Variables</CardTitle>
            <CardDescription>Colori dal tema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {['bg-primary', 'bg-secondary', 'bg-accent', 'bg-muted', 'bg-destructive', 'bg-card', 'bg-popover', 'bg-border'].map((color) => (
                <div key={color} className="text-center">
                  <div className={`${color} h-8 rounded border`} />
                  <span className="text-xs text-muted-foreground">{color.replace('bg-', '')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom styles test */}
        <Card>
          <CardHeader>
            <CardTitle>Stili Custom</CardTitle>
            <CardDescription>Classi CSS TriviaMore</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="gradient-text text-2xl font-bold">Gradient Text</p>
            <div className="gradient-bg rounded px-4 py-2 text-white">Gradient Background</div>
            <div className="fade-in rounded bg-muted p-3 text-sm">Fade-in animation</div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
