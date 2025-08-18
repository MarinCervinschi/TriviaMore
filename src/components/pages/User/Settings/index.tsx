import Link from "next/link";

import { ChevronRight, Home } from "lucide-react";
import { User } from "next-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserProfileData, UserService } from "@/lib/services/user.service";

function getRoleLabel(role: string): string {
	switch (role) {
		case "SUPERADMIN":
			return "Super Amministratore";
		case "ADMIN":
			return "Amministratore";
		case "MAINTAINER":
			return "Manutentore";
		case "STUDENT":
			return "Studente";
		default:
			return role;
	}
}

interface UserSettingsComponentProps {
	userProfile: UserProfileData;
	currentUser: User;
}

export default function UserSettingsComponent({
	userProfile,
	currentUser,
}: UserSettingsComponentProps) {
	const displayName = UserService.getDisplayName(userProfile);

	const initials = userProfile.name
		? userProfile.name
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
		: userProfile.email?.charAt(0).toUpperCase() || "U";

	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
				<Link href="/user" className="flex items-center gap-1 hover:text-foreground">
					<Home className="h-4 w-4" />
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">Impostazioni</span>
			</nav>

			<div>
				<h1 className="text-3xl font-bold">Impostazioni Profilo</h1>
				<p className="text-muted-foreground">
					Gestisci le informazioni del tuo account e le preferenze
				</p>
			</div>

			<div className="grid gap-6">
				{/* Profile Info */}
				<Card>
					<CardHeader>
						<CardTitle>Informazioni Profilo</CardTitle>
						<CardDescription>
							Le tue informazioni personali e i dettagli dell&apos;account
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="flex items-center gap-4">
							<Avatar className="h-20 w-20">
								<AvatarImage src={userProfile.image || undefined} alt={displayName} />
								<AvatarFallback className="text-lg font-bold">
									{initials}
								</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="text-lg font-semibold">{displayName}</h3>
								<Badge variant="outline">{getRoleLabel(userProfile.role)}</Badge>
							</div>
						</div>

						<div className="grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Label htmlFor="name">Nome completo</Label>
								<Input
									id="name"
									value={userProfile.name || ""}
									placeholder="Il tuo nome completo"
									disabled
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									value={userProfile.email || ""}
									placeholder="La tua email"
									disabled
								/>
							</div>
						</div>

						<div className="pt-4">
							<Button disabled>Salva Modifiche</Button>
							<p className="mt-2 text-sm text-muted-foreground">
								Le modifiche al profilo saranno disponibili in una versione futura
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Account Stats */}
				<Card>
					<CardHeader>
						<CardTitle>Statistiche Account</CardTitle>
						<CardDescription>
							Informazioni sul tuo utilizzo della piattaforma
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
							<div className="rounded-lg border p-4 text-center">
								<p className="text-2xl font-bold">
									{userProfile.stats?.totalQuizzes || 0}
								</p>
								<p className="text-sm text-muted-foreground">Quiz Completati</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<p className="text-2xl font-bold">{userProfile._count.userClasses}</p>
								<p className="text-sm text-muted-foreground">Corsi Seguiti</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<p className="text-2xl font-bold">{userProfile._count.bookmarks}</p>
								<p className="text-sm text-muted-foreground">Segnalibri</p>
							</div>
							<div className="rounded-lg border p-4 text-center">
								<p className="text-2xl font-bold">
									{userProfile.stats?.averageScore || 0}
								</p>
								<p className="text-sm text-muted-foreground">Punteggio Medio</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Account Details */}
				<Card>
					<CardHeader>
						<CardTitle>Dettagli Account</CardTitle>
						<CardDescription>Informazioni tecniche sul tuo account</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="grid gap-2">
								<Label className="text-sm font-medium">ID Utente</Label>
								<p className="rounded bg-gray-100 p-2 font-mono text-sm dark:bg-gray-800">
									{userProfile.id}
								</p>
							</div>
							<div className="grid gap-2">
								<Label className="text-sm font-medium">Membro dal</Label>
								<p className="text-sm">
									{new Date(userProfile.createdAt).toLocaleDateString("it-IT", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
							<div className="grid gap-2">
								<Label className="text-sm font-medium">Ultimo aggiornamento</Label>
								<p className="text-sm">
									{new Date(userProfile.updatedAt).toLocaleDateString("it-IT", {
										year: "numeric",
										month: "long",
										day: "numeric",
									})}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
