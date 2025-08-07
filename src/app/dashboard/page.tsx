"use client";

import React from "react";

import Link from "next/link";

import {
	ArrowRight,
	BookOpen,
	Calendar,
	Mail,
	Settings,
	Shield,
	Trophy,
	User as UserIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";

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
import Loader from "@/components/Common/Loader";

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

function getRoleBadgeVariant(role: string) {
	switch (role) {
		case "SUPERADMIN":
			return "destructive";
		case "ADMIN":
			return "default";
		case "MAINTAINER":
			return "secondary";
		case "STUDENT":
			return "outline";
		default:
			return "outline";
	}
}

export default function DashboardPage() {
	const { data: session } = useSession();
	const user = session?.user;

	if (!user) {
		return <Loader />;
	}

	const initials = user.name
		? user.name
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
		: user.email?.charAt(0).toUpperCase() || "U";

	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Welcome Section */}
			<div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-4">
						<Avatar className="h-16 w-16 border-2 border-white/20">
							<AvatarImage src={user.image || undefined} alt={user.name || "User"} />
							<AvatarFallback className="bg-white/20 text-lg">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className="mb-2 text-3xl font-bold">
								Benvenuto, {user.name || user.email}!
							</h1>
							<p className="text-blue-100">
								Ecco la tua dashboard personale su TriviaMore
							</p>
						</div>
					</div>
					<div className="text-right">
						<Badge variant="secondary" className="bg-white/20 text-white">
							{getRoleLabel(user.role)}
						</Badge>
					</div>
				</div>
			</div>
			<Button asChild className="w-full max-w-xs">
				<Link href="/" className="flex items-center justify-center">
					Home <ArrowRight className="ml-2 h-4 w-4" />
				</Link>
			</Button>

			{/* User Info Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<UserIcon className="h-5 w-5" />
						Informazioni del Profilo
					</CardTitle>
					<CardDescription>I tuoi dati di sessione attuali</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<UserIcon className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Nome</p>
									<p className="text-sm text-muted-foreground">
										{user.name || "Non specificato"}
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Mail className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Email</p>
									<p className="text-sm text-muted-foreground">{user.email}</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<Shield className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Ruolo</p>
									<Badge variant={getRoleBadgeVariant(user.role) as any}>
										{getRoleLabel(user.role)}
									</Badge>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<div>
									<p className="text-sm font-medium">Informazioni Account</p>
									<p className="text-sm text-muted-foreground">
										Dati dalla sessione corrente
									</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div>
									<p className="text-sm font-medium">ID Utente</p>
									<p className="font-mono text-xs text-muted-foreground">{user.id}</p>
								</div>
							</div>

							<div className="flex items-center gap-3">
								<div>
									<p className="text-sm font-medium">Verifiche</p>
									<div className="mt-1 flex gap-2">
										<Badge variant="outline" className="text-xs">
											{user.email ? "Email Presente" : "Email Mancante"}
										</Badge>
										<Badge variant="outline" className="text-xs">
											{user.image ? "Foto Profilo" : "Nessuna Foto"}
										</Badge>
									</div>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Quick Actions */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="h-5 w-5" />
							Esplora Corsi
						</CardTitle>
						<CardDescription>
							Scopri i corsi disponibili e inizia a studiare
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full">
							<Link href="/browse">
								Vai ai Corsi <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Trophy className="h-5 w-5" />I Miei Quiz
						</CardTitle>
						<CardDescription>
							Visualizza i quiz completati e le statistiche
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="outline" className="w-full">
							<Link href="/my-quizzes" className="flex items-center">
								Vedi Quiz <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Settings className="h-5 w-5" />
							Impostazioni
						</CardTitle>
						<CardDescription>Gestisci il tuo profilo e le preferenze</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="secondary" className="w-full">
							<Link href="/settings" className="flex items-center">
								Impostazioni <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Next Steps */}
			<Card>
				<CardHeader>
					<CardTitle>Prossimi Passi</CardTitle>
					<CardDescription>Suggerimenti per iniziare su TriviaMore</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						<div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
								1
							</div>
							<div>
								<p className="font-medium">Esplora i corsi disponibili</p>
								<p className="text-sm text-muted-foreground">
									Naviga tra i dipartimenti e trova i corsi di tuo interesse
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 rounded-lg bg-green-50 p-3">
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-white">
								2
							</div>
							<div>
								<p className="font-medium">Iscriviti alle classi</p>
								<p className="text-sm text-muted-foreground">
									Aggiungi le classi ai tuoi preferiti per accedere ai quiz
								</p>
							</div>
						</div>

						<div className="flex items-center gap-3 rounded-lg bg-purple-50 p-3">
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-500 text-sm font-bold text-white">
								3
							</div>
							<div>
								<p className="font-medium">Inizia con i quiz</p>
								<p className="text-sm text-muted-foreground">
									Metti alla prova le tue conoscenze e migliora i tuoi punteggi
								</p>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Debug Info */}
			<Card>
				<CardHeader>
					<CardTitle>Debug - Dati Sessione</CardTitle>
					<CardDescription>
						Visualizzazione dei dati completi della sessione (solo per sviluppo)
					</CardDescription>
				</CardHeader>
				<CardContent>
					<pre className="overflow-auto rounded-lg bg-gray-100 p-4 text-sm">
						{JSON.stringify(user, null, 2)}
					</pre>
				</CardContent>
			</Card>
		</div>
	);
}
