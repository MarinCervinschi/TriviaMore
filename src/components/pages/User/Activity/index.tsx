"use client";

import { useState } from "react";

import Link from "next/link";

import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	Clock,
	Eye,
	Home,
	Target,
	Trophy,
} from "lucide-react";
import type { User } from "next-auth";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizAttempt {
	id: string;
	score: number;
	totalQuestions: number;
	correctAnswers: number;
	completedAt: Date;
	duration: number | null;
	evaluationMode: "STUDY" | "EXAM";
	section: {
		id: string;
		name: string;
		class: {
			id: string;
			name: string;
			course: {
				id: string;
				name: string;
				department: {
					id: string;
					name: string;
				};
			};
		};
	};
}

interface UserActivityComponentProps {
	recentActivity: QuizAttempt[];
	currentUser: User;
}

const ITEMS_PER_PAGE = 12;

export default function UserActivityComponent({
	recentActivity,
	currentUser,
}: UserActivityComponentProps) {
	const [currentPage, setCurrentPage] = useState(1);

	// Calculate pagination
	const totalPages = Math.ceil(recentActivity.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const currentActivities = recentActivity.slice(startIndex, endIndex);

	// Group current page activities by date
	const groupedActivities = currentActivities.reduce(
		(groups, activity) => {
			const date = new Date(activity.completedAt).toDateString();
			if (!groups[date]) {
				groups[date] = [];
			}
			groups[date].push(activity);
			return groups;
		},
		{} as Record<string, QuizAttempt[]>
	);

	// Calculate statistics for all activities
	const totalQuizzes = recentActivity.length;
	const averageScore =
		recentActivity.length > 0
			? Math.round(
					recentActivity.reduce((sum, activity) => sum + activity.score, 0) /
						recentActivity.length
				)
			: 0;
	const studyQuizzes = recentActivity.filter(a => a.evaluationMode === "STUDY").length;
	const examQuizzes = recentActivity.filter(a => a.evaluationMode === "EXAM").length;

	const formatDuration = (duration: number | null) => {
		if (!duration) return "N/A";
		const minutes = Math.floor(duration / 60);
		const seconds = duration % 60;
		return `${minutes}m ${seconds}s`;
	};

	const getScoreBadgeVariant = (score: number) => {
		if (score >= 80) return "default";
		if (score >= 60) return "secondary";
		return "destructive";
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		// Scroll to top when changing page
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const PaginationControls = () => {
		if (totalPages <= 1) return null;

		return (
			<div className="flex items-center justify-between border-t bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
				<div className="flex flex-1 justify-between sm:hidden">
					<Button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						variant="outline"
						size="sm"
					>
						Precedente
					</Button>
					<Button
						onClick={() => handlePageChange(currentPage + 1)}
						disabled={currentPage === totalPages}
						variant="outline"
						size="sm"
					>
						Successivo
					</Button>
				</div>

				<div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
					<div>
						<p className="text-sm text-gray-700 dark:text-gray-300">
							Mostrando <span className="font-medium">{startIndex + 1}</span> a{" "}
							<span className="font-medium">{Math.min(endIndex, totalQuizzes)}</span> di{" "}
							<span className="font-medium">{totalQuizzes}</span> risultati
						</p>
					</div>

					<div>
						<nav
							className="isolate inline-flex -space-x-px rounded-md shadow-sm"
							aria-label="Pagination"
						>
							{/* First page */}
							<Button
								onClick={() => handlePageChange(1)}
								disabled={currentPage === 1}
								variant="outline"
								size="sm"
								className="relative inline-flex items-center rounded-l-md px-2 py-2"
							>
								<span className="sr-only">Prima pagina</span>
								<ChevronsLeft className="h-4 w-4" aria-hidden="true" />
							</Button>

							{/* Previous page */}
							<Button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								variant="outline"
								size="sm"
								className="relative inline-flex items-center px-2 py-2"
							>
								<span className="sr-only">Pagina precedente</span>
								<ChevronLeft className="h-4 w-4" aria-hidden="true" />
							</Button>

							{/* Page numbers */}
							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								let pageNumber;
								if (totalPages <= 5) {
									pageNumber = i + 1;
								} else if (currentPage <= 3) {
									pageNumber = i + 1;
								} else if (currentPage >= totalPages - 2) {
									pageNumber = totalPages - 4 + i;
								} else {
									pageNumber = currentPage - 2 + i;
								}

								return (
									<Button
										key={pageNumber}
										onClick={() => handlePageChange(pageNumber)}
										variant={currentPage === pageNumber ? "default" : "outline"}
										size="sm"
										className="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
									>
										{pageNumber}
									</Button>
								);
							})}

							{/* Next page */}
							<Button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								variant="outline"
								size="sm"
								className="relative inline-flex items-center px-2 py-2"
							>
								<span className="sr-only">Pagina successiva</span>
								<ChevronRight className="h-4 w-4" aria-hidden="true" />
							</Button>

							{/* Last page */}
							<Button
								onClick={() => handlePageChange(totalPages)}
								disabled={currentPage === totalPages}
								variant="outline"
								size="sm"
								className="relative inline-flex items-center rounded-r-md px-2 py-2"
							>
								<span className="sr-only">Ultima pagina</span>
								<ChevronsRight className="h-4 w-4" aria-hidden="true" />
							</Button>
						</nav>
					</div>
				</div>
			</div>
		);
	};

	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
				<Link href="/user" className="flex items-center gap-1 hover:text-foreground">
					<Home className="h-4 w-4" />
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">Attività Recenti</span>
			</nav>

			<div>
				<h1 className="text-3xl font-bold">Attività Recenti</h1>
				<p className="text-muted-foreground">
					Cronologia completa di tutti i quiz completati ({totalQuizzes} totali)
				</p>
			</div>

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium text-muted-foreground">Quiz Totali</p>
								<p className="text-2xl font-bold">{totalQuizzes}</p>
							</div>
							<Target className="h-8 w-8 text-blue-500" />
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
								<p className="text-2xl font-bold">{averageScore}%</p>
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
									Studio / Esame
								</p>
								<p className="text-2xl font-bold">
									{studyQuizzes} / {examQuizzes}
								</p>
							</div>
							<Clock className="h-8 w-8 text-purple-500" />
						</div>
					</CardContent>
				</Card>
			</div>

			{recentActivity.length === 0 ? (
				<Card>
					<CardContent className="p-12">
						<div className="text-center">
							<Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h2 className="mb-2 text-xl font-semibold">Nessuna attività recente</h2>
							<p className="mb-4 text-muted-foreground">
								Inizia a completare alcuni quiz per vedere le tue attività qui!
							</p>
							<Link
								href="/browse"
								className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
							>
								Esplora i Corsi
							</Link>
						</div>
					</CardContent>
				</Card>
			) : (
				<>
					{/* Activities List */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>
									Attività - Pagina {currentPage} di {totalPages}
								</span>
								<Badge variant="outline">{currentActivities.length} elementi</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-6">
							{Object.entries(groupedActivities).map(([date, activities]) => (
								<div key={date} className="space-y-4">
									<h3 className="border-b pb-2 text-lg font-semibold text-muted-foreground">
										{new Date(date).toLocaleDateString("it-IT", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</h3>

									<div className="space-y-3">
										{activities.map(activity => (
											<div
												key={activity.id}
												className="flex flex-col gap-4 rounded-lg border bg-card p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
											>
												<div className="space-y-2">
													<div className="flex flex-wrap items-center gap-2">
														<h4 className="font-semibold">{activity.section.name}</h4>
														<Badge
															variant={
																activity.evaluationMode === "STUDY"
																	? "default"
																	: "secondary"
															}
														>
															{activity.evaluationMode === "STUDY" ? "Studio" : "Esame"}
														</Badge>
													</div>

													<p className="text-sm text-muted-foreground">
														<span className="font-medium">
															{activity.section.class.course.department.name}
														</span>
														{" • "}
														{activity.section.class.course.name}
														{" • "}
														{activity.section.class.name}
													</p>

													<div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
														<span>
															<strong className="text-foreground">
																{activity.correctAnswers}
															</strong>
															/{activity.totalQuestions} corrette
														</span>
														<span>Durata: {formatDuration(activity.duration)}</span>
														<span>
															{new Date(activity.completedAt).toLocaleTimeString(
																"it-IT",
																{
																	hour: "2-digit",
																	minute: "2-digit",
																}
															)}
														</span>
													</div>
												</div>

												<div className="flex items-center gap-3">
													<Badge
														variant={getScoreBadgeVariant(activity.score)}
														className="text-sm"
													>
														{activity.score}%
													</Badge>

													<Button asChild size="sm" variant="outline">
														<Link href={`/quiz/results/${activity.id}`}>
															<Eye className="mr-2 h-4 w-4" />
															Vedi Quiz
														</Link>
													</Button>
												</div>
											</div>
										))}
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Pagination Controls */}
					<PaginationControls />
				</>
			)}
		</div>
	);
}
