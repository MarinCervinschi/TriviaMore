import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { SignOut } from "@/components/sign-out";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/Theme/theme-toggle";
import { SimpleThemeToggle } from "@/components/Theme/simple-theme-toggle";


export default async function LandingPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header con toggle tema */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">Trivia MORE</h1>
          <div className="flex items-center gap-4">
            <SimpleThemeToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 text-center mb-6">
          <p className="text-muted-foreground mb-2">Connesso come:</p>
          <p className="font-medium text-foreground">{session?.user?.email}</p>
        </div>
        
        <div className="flex flex-col items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button className="w-48">Vai alla Dashboard</Button>
          </Link>
          
          <div className="text-center">
            <p className="text-muted-foreground">Questa è una pagina protetta con supporto per i temi!</p>
            <p className="text-sm text-muted-foreground mt-2">
              Prova a cambiare tema usando i pulsanti in alto a destra.
            </p>
          </div>
        </div>

        <div className="text-center">
          <SignOut />
        </div>
      </div>
    </div>
  )
}
