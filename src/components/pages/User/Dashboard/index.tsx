"use client";

import Link from "next/link";

import {
	Activity,
	BookmarkIcon,
	Calendar,
	ExternalLink,
	GraduationCap,
	Mail,
	Settings,
	TrendingUp,
	Trophy,
} from "lucide-react";
import type { User } from "next-auth";

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
import { type UserProfileData, UserService } from "@/lib/services/user.service";

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

function formatTimeSpent(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours > 0) {
		return `${hours}h ${minutes}m`;
	}
	return `${minutes}m`;
}

function getScoreBadgeVariant(score: number) {
	if (score >= 80) return "default";
	if (score >= 60) return "secondary";
	return "destructive";
}

interface UserDashboardComponentProps {
	userProfile: UserProfileData;
	currentUser: User;
}

export default function UserDashboardComponent({
	userProfile,
	currentUser,
}: UserDashboardComponentProps) {
	const displayName = UserService.getDisplayName(userProfile);

	const initials = userProfile.name
		? userProfile.name
				.split(" ")
				.map((n: string) => n[0])
				.join("")
				.toUpperCase()
		: userProfile.email?.charAt(0).toUpperCase() || "U";

	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Header con info utente */}
			<div className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4">
						<Avatar className="h-20 w-20 border-4 border-white/20">
							<AvatarImage src={userProfile.image || undefined} alt={displayName} />
							<AvatarFallback className="bg-white/20 text-xl font-bold">
								{initials}
							</AvatarFallback>
						</Avatar>
						<div>
							<h1 className="mb-2 text-2xl font-bold sm:text-3xl">{displayName}</h1>
							<div className="mb-2 flex items-center gap-2">
								<Badge
									variant="secondary"
									className="border-white/20 bg-white/20 text-white"
								>
									{getRoleLabel(userProfile.role)}
								</Badge>
							</div>
							<div className="flex flex-col gap-2 text-blue-100 sm:flex-row sm:items-center sm:gap-4">
								<div className="flex items-center gap-1">
									<Mail className="h-4 w-4" />
									<span className="text-sm">{userProfile.email}</span>
								</div>
								<div className="flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									<span className="text-sm">
										Membro dal{" "}
										{new Date(userProfile.createdAt).toLocaleDateString("it-IT")}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Statistiche rapide */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Quiz Completati
								</p>
								<p className="text-2xl font-bold">
									{userProfile.stats?.totalQuizzes || 0}
								</p>
							</div>
							<Trophy className="h-8 w-8 text-yellow-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Punteggio Medio
								</p>
								<p className="text-2xl font-bold">
									{userProfile.stats?.averageScore || 0}%
								</p>
							</div>
							<TrendingUp className="h-8 w-8 text-green-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">
									Corsi Seguiti
								</p>
								<p className="text-2xl font-bold">{userProfile._count.userClasses}</p>
							</div>
							<GraduationCap className="h-8 w-8 text-blue-500" />
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Segnalibri</p>
								<p className="text-2xl font-bold">{userProfile._count.bookmarks}</p>
							</div>
							<BookmarkIcon className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Azioni rapide */}
			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
				<Card className="transition-shadow hover:shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<TrendingUp className="h-5 w-5 text-green-500" />I Miei Progressi
						</CardTitle>
						<CardDescription>
							Visualizza i tuoi progressi dettagliati per ogni materia
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild className="w-full">
							<Link href="/user/progress">Visualizza Progressi</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="transition-shadow hover:shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<Activity className="h-5 w-5 text-orange-500" />
							Attività Recenti
						</CardTitle>
						<CardDescription>
							Visualizza la cronologia completa delle tue attività
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" className="w-full bg-transparent">
							<Link href="/user/activity">Vedi Tutte le Attività</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="transition-shadow hover:shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<BookmarkIcon className="h-5 w-5 text-purple-500" />I Miei Segnalibri
						</CardTitle>
						<CardDescription>
							Accedi alle domande che hai salvato per dopo
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" className="w-full bg-transparent">
							<Link href="/user/bookmarks">Visualizza Segnalibri</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="transition-shadow hover:shadow-lg">
					<CardHeader className="pb-4">
						<CardTitle className="flex items-center gap-2 text-lg">
							<GraduationCap className="h-5 w-5 text-blue-500" />I Miei Corsi
						</CardTitle>
						<CardDescription>Gestisci i corsi che stai seguendo</CardDescription>
					</CardHeader>
					<CardContent>
						<Button asChild variant="outline" className="w-full bg-transparent">
							<Link href="/user/classes">Gestisci Corsi</Link>
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Attività recente - Solo alcune */}
			{userProfile.recentActivity?.quizAttempts &&
				userProfile.recentActivity.quizAttempts.length > 0 && (
					<Card>
						<CardHeader>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<CardTitle>Attività Recente</CardTitle>
									<CardDescription>I tuoi ultimi quiz completati</CardDescription>
								</div>
								<Button asChild variant="outline" size="sm">
									<Link href="/user/activity" className="flex items-center gap-1">
										<Activity className="h-4 w-4" />
										Vedi Tutto
									</Link>
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								{userProfile.recentActivity.quizAttempts.slice(0, 3).map(attempt => (
									<div
										key={attempt.id}
										className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between"
									>
										<div className="flex items-start gap-3">
											<div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
												<Trophy className="h-4 w-4 text-blue-600 dark:text-blue-400" />
											</div>
											<div className="min-w-0 flex-1">
												<p className="font-medium">{attempt.quiz.section.name}</p>
												<div className="mt-1 space-y-1">
													<p className="text-sm text-muted-foreground">
														<span className="font-medium">
															{attempt.quiz.section.class.course.department.name}
														</span>
														{" • "}
														{attempt.quiz.section.class.course.name}
													</p>
													<p className="text-sm text-muted-foreground">
														Classe: {attempt.quiz.section.class.name}
													</p>
												</div>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="text-right">
												<Badge variant={getScoreBadgeVariant(attempt.score)}>
													{Math.round(attempt.score)}%
												</Badge>
												<p className="mt-1 text-xs text-muted-foreground">
													{new Date(attempt.completedAt).toLocaleDateString("it-IT")}
												</p>
											</div>
											<Button asChild size="sm" variant="outline">
												<Link
													href={`/quiz/results/${attempt.id}`}
													className="flex items-center gap-1"
												>
													<ExternalLink className="h-3 w-3" />
													Vedi
												</Link>
											</Button>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

			{/* Materie preferite */}
			{userProfile.stats?.favoriteSubjects &&
				userProfile.stats.favoriteSubjects.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle>Le Tue Materie Preferite</CardTitle>
							<CardDescription>Basato sui quiz che hai completato</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								{userProfile.stats.favoriteSubjects.map(subject => (
									<div
										key={subject.name}
										className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
									>
										<span className="font-medium">{subject.name}</span>
										<Badge variant="outline">{subject.count} quiz</Badge>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				)}

			{/* Settings Card */}
			<Card className="transition-shadow hover:shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Settings className="h-5 w-5 text-gray-500" />
						Impostazioni Account
					</CardTitle>
					<CardDescription>Personalizza il tuo profilo e le preferenze</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="secondary" className="w-full sm:w-auto">
						<Link href="/user/settings">Modifica Profilo</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
