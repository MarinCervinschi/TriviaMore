import Link from "next/link";

import { SimpleThemeToggle } from "@/components/Theme/simple-theme-toggle";
import { ThemeToggle } from "@/components/Theme/theme-toggle";
import { SignOut } from "@/components/sign-out";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export default async function LandingPage() {
	const session = await auth();

	return (
		<div className="min-h-screen bg-background p-6 text-foreground">
			<div className="mx-auto max-w-4xl">
				{/* Header con toggle tema */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="gradient-text text-3xl font-bold">Trivia MORE</h1>
					<div className="flex items-center gap-4">
						<SimpleThemeToggle />
						<ThemeToggle />
					</div>
				</div>

				<div className="mb-6 rounded-lg border bg-card p-6 text-center">
					<p className="mb-2 text-muted-foreground">Connesso come:</p>
					<p className="font-medium text-foreground">
						{session?.user?.email ?? "Ospite"}
					</p>
				</div>

				<div className="mb-6 flex flex-col items-center gap-4">
					{session && session.user ? (
						<Link href="/dashboard">
							<Button className="w-48">Vai alla Dashboard</Button>
						</Link>
					) : (
						<Link href="/auth/login">
							<Button className="w-48">Login</Button>
						</Link>
					)}

					<div className="text-center">
						<p className="text-muted-foreground">
							Questa è una pagina protetta con supporto per i temi!
						</p>
						<p className="mt-2 text-sm text-muted-foreground">
							Prova a cambiare tema usando i pulsanti in alto a destra.
						</p>
					</div>
				</div>

				<div className="text-center">{session && session.user && <SignOut />}</div>
			</div>
		</div>
	);
}
