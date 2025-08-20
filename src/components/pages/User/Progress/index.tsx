"use client";

import React from "react";

import Link from "next/link";

import {
	ChevronRight,
	Clock,
	Home,
	Info,
	Target,
	TrendingUp,
	Trophy,
} from "lucide-react";
import type { User } from "next-auth";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Tooltip as RechartsTooltip,
	ResponsiveContainer,
	XAxis,
	YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	formatThirtyScaleGrade,
	getGradeColor,
	getGradeDescription,
} from "@/lib/utils/grading";
import { formatTimeSpent } from "@/lib/utils/quiz-results";

export interface ProgressData {
	id: string;
	quizMode: "STUDY" | "EXAM_SIMULATION";
	quizzesTaken: number;
	averageScore: number | null;
	bestScore: number | null;
	totalTimeSpent: number;
	lastAccessedAt: Date;
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

interface UserProgressComponentProps {
	progressData: ProgressData[];
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

export default function UserProgressComponent({
	progressData,
}: UserProgressComponentProps) {
	const studyProgress = progressData.filter(p => p.quizMode === "STUDY");
	const examProgress = progressData.filter(p => p.quizMode === "EXAM_SIMULATION");

	const allProgressRecords = progressData.map((progress, index) => ({
		id: progress.id,
		sectionId: progress.section.id,
		name: progress.section.name,
		className: progress.section.class.name,
		courseName: progress.section.class.course.name,
		courseId: progress.section.class.course.id,
		departmentName: progress.section.class.course.department.name,
		quizMode: progress.quizMode,
		quizzesTaken: progress.quizzesTaken,
		averageScore: progress.averageScore || 0,
		bestScore: progress.bestScore || 0,
		totalTimeSpent: progress.totalTimeSpent,
		lastAccessed: progress.lastAccessedAt,
		color: COLORS[index % COLORS.length],
	}));

	const studySectionData = studyProgress
		.map((progress, index) => ({
			id: progress.id,
			sectionId: progress.section.id,
			name: progress.section.name,
			className: progress.section.class.name,
			courseName: progress.section.class.course.name,
			courseId: progress.section.class.course.id,
			departmentName: progress.section.class.course.department.name,
			averageScore: progress.averageScore || 0,
			bestScore: progress.bestScore || 0,
			quizzesTaken: progress.quizzesTaken,
			totalTimeSpent: progress.totalTimeSpent,
			lastAccessed: progress.lastAccessedAt,
			color: COLORS[index % COLORS.length],
		}))
		.sort((a, b) => b.averageScore - a.averageScore);

	const examDataByCourse = examProgress.reduce(
		(acc, progress) => {
			const courseId = progress.section.class.course.id;
			const courseName = progress.section.class.course.name;

			acc[courseId] = {
				courseId,
				courseName,
				className: progress.section.class.name,
				departmentName: progress.section.class.course.department.name,
				averageScore: progress.averageScore || 0,
				bestScore: progress.bestScore || 0,
				quizzesTaken: progress.quizzesTaken,
				totalTimeSpent: progress.totalTimeSpent,
				lastAccessed: progress.lastAccessedAt,
			};

			return acc;
		},
		{} as Record<string, any>
	);

	const totalStudyQuizzes = studyProgress.reduce((sum, p) => sum + p.quizzesTaken, 0);
	const totalExamQuizzes = examProgress.reduce((sum, p) => sum + p.quizzesTaken, 0);

	const studyScores = studyProgress
		.map(p => p.averageScore || 0)
		.filter(score => score > 0);
	const examScores = examProgress
		.map(p => p.averageScore || 0)
		.filter(score => score > 0);

	const overallStudyAverage =
		studyScores.length > 0
			? studyScores.reduce((sum, score) => sum + score, 0) / studyScores.length
			: 0;
	const overallExamAverage =
		examScores.length > 0
			? examScores.reduce((sum, score) => sum + score, 0) / examScores.length
			: 0;

	const overallStats = {
		totalStudyQuizzes,
		totalExamQuizzes,
		averageStudyScore: overallStudyAverage,
		averageExamScore: overallExamAverage,
		bestStudyScore: Math.max(...studySectionData.map(section => section.bestScore), 0),
		bestExamScore: Math.max(
			...Object.values(examDataByCourse).map((exam: any) => exam.bestScore),
			0
		),
	};

	const bestSection = studySectionData.length > 0 ? studySectionData[0] : null;
	const sectionsWithIssues = studySectionData.filter(s => s.averageScore < 18);
	const excellentSections = studySectionData.filter(s => s.averageScore >= 27);

	const examCourses = Object.values(examDataByCourse);
	const coursesWithPoorExams = examCourses.filter(
		(exam: any) => exam.averageScore < 18
	);
	const coursesWithExcellentExams = examCourses.filter(
		(exam: any) => exam.averageScore >= 27
	);

	return (
		<div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
				<Link href="/user" className="flex items-center gap-1 hover:text-foreground">
					<Home className="h-4 w-4" />
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">Progressi</span>
			</nav>

			<div>
				<h1 className="text-3xl font-bold">I Miei Progressi</h1>
				<p className="text-muted-foreground">
					Analizza le tue performance e i tuoi miglioramenti nel tempo
				</p>
			</div>

			{progressData.length === 0 ? (
				<Card>
					<CardContent className="p-12">
						<div className="text-center">
							<Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h2 className="mb-2 text-xl font-semibold">
								Nessun progresso disponibile
							</h2>
							<p className="mb-4 text-muted-foreground">
								Inizia a completare alcuni quiz per vedere i tuoi progressi qui!
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
					{/* Overall Statistics - Updated for 33 scale */}
					<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
						<Card>
							<CardContent className="p-6">
								<div className="flex items-center justify-between">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Quiz Studio Totali
										</p>
										<p className="text-2xl font-bold">{totalStudyQuizzes}</p>
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
											Media Studio
										</p>
										<p
											className={`text-2xl font-bold ${getGradeColor(overallStudyAverage)}`}
										>
											{formatThirtyScaleGrade(overallStudyAverage)}
										</p>
										<p className="text-xs text-muted-foreground">
											{getGradeDescription(overallStudyAverage)}
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
											Quiz Esame Totali
										</p>
										<p className="text-2xl font-bold">{totalExamQuizzes}</p>
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
											Media Esame
										</p>
										<p
											className={`text-2xl font-bold ${getGradeColor(overallExamAverage)}`}
										>
											{formatThirtyScaleGrade(overallExamAverage)}
										</p>
										<p className="text-xs text-muted-foreground">
											{getGradeDescription(overallExamAverage)}
										</p>
									</div>
									<Clock className="h-8 w-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sections Performance Analysis */}
					<Tabs defaultValue="overview" className="space-y-6">
						<TabsList className="grid w-full grid-cols-1 md:grid-cols-2">
							<TabsTrigger value="overview">Panoramica Sezioni</TabsTrigger>
							<TabsTrigger value="details">Dettagli Performance</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							{/* Top Performance Sections */}
							{bestSection && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Trophy className="h-5 w-5 text-yellow-500" />
											Sezione con Migliore Performance
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-semibold">{bestSection.name}</h3>
												<p className="text-sm text-muted-foreground">
													{bestSection.className} • {bestSection.courseName}
												</p>
											</div>
											<div className="text-right">
												<p
													className={`text-2xl font-bold ${getGradeColor(bestSection.averageScore)}`}
												>
													{formatThirtyScaleGrade(bestSection.averageScore)}
												</p>
												<p className="text-sm text-muted-foreground">
													{getGradeDescription(bestSection.averageScore)}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}

							{/* Sections Performance Chart - Solo Studio */}
							<Card>
								<CardHeader>
									<CardTitle>
										Performance per Sezione - Studio (Voti in 33esimi)
									</CardTitle>
									<CardDescription>
										Analisi delle performance nelle sezioni di studio
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={400}>
										<BarChart data={studySectionData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												height={100}
												fontSize={12}
											/>
											<YAxis />
											<RechartsTooltip />
											<Bar dataKey="averageScore" fill="#10b981" name="Studio" />
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Exam Performance by Course */}
							{examCourses.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle>Performance Esami per Corso (Voti in 33esimi)</CardTitle>
										<CardDescription>
											Risultati delle simulazioni d&apos;esame per ogni corso
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={300}>
											<BarChart data={examCourses}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="courseName"
													angle={-45}
													textAnchor="end"
													height={100}
													fontSize={12}
												/>
												<YAxis />
												<RechartsTooltip />
												<Bar dataKey="averageScore" fill="#ef4444" name="Esame" />
											</BarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							)}

							{/* Poor performing exams */}
							{coursesWithPoorExams.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-red-600">
											<Target className="h-5 w-5" />
											Esami da Migliorare (Sotto la Sufficienza)
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{coursesWithPoorExams.map((exam: any) => (
												<div
													key={exam.courseId}
													className="flex items-center justify-between border-l-4 border-red-400 pl-4"
												>
													<div>
														<h4 className="font-medium">{exam.courseName}</h4>
														<p className="text-sm text-muted-foreground">
															{exam.className} • {exam.departmentName}
														</p>
													</div>
													<div className="text-right">
														<p
															className={`font-bold ${getGradeColor(exam.averageScore)}`}
														>
															{formatThirtyScaleGrade(exam.averageScore)}
														</p>
														<p className="text-xs text-muted-foreground">
															{exam.quizzesTaken} quiz d&apos;esame
														</p>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Excellent exams */}
							{coursesWithExcellentExams.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-blue-600">
											<TrendingUp className="h-5 w-5" />
											Esami Eccellenti (27+)
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											{coursesWithExcellentExams.map((exam: any) => (
												<div
													key={exam.courseId}
													className="flex items-center justify-between border-l-4 border-blue-400 pl-4"
												>
													<div>
														<h4 className="font-medium">{exam.courseName}</h4>
														<p className="text-sm text-muted-foreground">
															{exam.className}
														</p>
													</div>
													<div className="text-right">
														<p
															className={`font-bold ${getGradeColor(exam.averageScore)}`}
														>
															{formatThirtyScaleGrade(exam.averageScore)}
														</p>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Sections that need attention */}
							{sectionsWithIssues.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-orange-600">
											<Target className="h-5 w-5" />
											Sezioni di Studio da Migliorare (Sotto la Sufficienza)
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-3">
											{sectionsWithIssues.map(section => (
												<div
													key={section.id}
													className="flex items-center justify-between border-l-4 border-orange-400 pl-4"
												>
													<div>
														<h4 className="font-medium">{section.name}</h4>
														<p className="text-sm text-muted-foreground">
															{section.className}
														</p>
													</div>
													<div className="text-right">
														<p
															className={`font-bold ${getGradeColor(section.averageScore)}`}
														>
															{formatThirtyScaleGrade(section.averageScore)}
														</p>
														<p className="text-xs text-muted-foreground">
															{section.quizzesTaken} quiz
														</p>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}

							{/* Excellent sections */}
							{excellentSections.length > 0 && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-green-600">
											<TrendingUp className="h-5 w-5" />
											Sezioni di Studio Eccellenti (27+)
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 gap-3 md:grid-cols-2">
											{excellentSections.map(section => (
												<div
													key={section.id}
													className="flex items-center justify-between border-l-4 border-green-400 pl-4"
												>
													<div>
														<h4 className="font-medium">{section.name}</h4>
														<p className="text-sm text-muted-foreground">
															{section.className}
														</p>
													</div>
													<div className="text-right">
														<p
															className={`font-bold ${getGradeColor(section.averageScore)}`}
														>
															{formatThirtyScaleGrade(section.averageScore)}
														</p>
													</div>
												</div>
											))}
										</div>
									</CardContent>
								</Card>
							)}
						</TabsContent>

						<TabsContent value="details" className="space-y-6">
							{/* Detailed Progress Table */}
							<Card>
								<CardHeader>
									<CardTitle>Tabella Dettagliata Performance</CardTitle>
									<CardDescription>
										Ogni record di progresso per modalità (Studio/Esame)
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b">
													<th className="p-2 text-left">Sezione</th>
													<th className="p-2 text-left">Classe</th>
													<th className="p-2 text-center">Modalità</th>
													<th className="p-2 text-center">Quiz</th>
													<th className="p-2 text-center">Media</th>
													<th className="p-2 text-center">Migliore</th>
													<th className="p-2 text-center">Tempo Totale</th>
												</tr>
											</thead>
											<tbody>
												{allProgressRecords.map(record => (
													<tr key={record.id} className="border-b hover:bg-muted/50">
														<td className="p-2 font-medium">{record.name}</td>
														<td className="p-2">
															<TooltipProvider>
																<Tooltip>
																	<TooltipTrigger asChild>
																		<div className="flex cursor-help items-center gap-1">
																			<span className="text-muted-foreground">
																				{record.className}
																			</span>
																			<Info className="h-3 w-3 text-muted-foreground" />
																		</div>
																	</TooltipTrigger>
																	<TooltipContent>
																		<div className="text-sm">
																			<p className="font-medium">{record.courseName}</p>
																			<p className="text-muted-foreground">
																				{record.departmentName}
																			</p>
																		</div>
																	</TooltipContent>
																</Tooltip>
															</TooltipProvider>
														</td>
														<td className="p-2 text-center">
															<Badge
																variant={
																	record.quizMode === "STUDY" ? "default" : "secondary"
																}
															>
																{record.quizMode === "STUDY" ? "Studio" : "Esame"}
															</Badge>
														</td>
														<td className="p-2 text-center">{record.quizzesTaken}</td>
														<td
															className={`p-2 text-center font-bold ${getGradeColor(record.averageScore)}`}
														>
															{formatThirtyScaleGrade(record.averageScore)}
														</td>
														<td
															className={`p-2 text-center font-bold ${getGradeColor(record.bestScore)}`}
														>
															{formatThirtyScaleGrade(record.bestScore)}
														</td>
														<td className="p-2 text-center text-muted-foreground">
															{formatTimeSpent(record.totalTimeSpent)}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</CardContent>
							</Card>

							{/* Performance insights */}
							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<Card>
									<CardHeader>
										<CardTitle>Statistiche di Studio</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="flex justify-between">
												<span>Media voti di studio:</span>
												<span
													className={`font-bold ${getGradeColor(overallStats.averageStudyScore)}`}
												>
													{formatThirtyScaleGrade(overallStats.averageStudyScore)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Miglior voto di studio:</span>
												<span
													className={`font-bold ${getGradeColor(overallStats.bestStudyScore)}`}
												>
													{formatThirtyScaleGrade(overallStats.bestStudyScore)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Quiz di studio completati:</span>
												<span className="font-bold">
													{overallStats.totalStudyQuizzes}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Statistiche di Esame</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="space-y-4">
											<div className="flex justify-between">
												<span>Media voti d&apos;esame:</span>
												<span
													className={`font-bold ${getGradeColor(overallStats.averageExamScore)}`}
												>
													{formatThirtyScaleGrade(overallStats.averageExamScore)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Miglior voto d&apos;esame:</span>
												<span
													className={`font-bold ${getGradeColor(overallStats.bestExamScore)}`}
												>
													{formatThirtyScaleGrade(overallStats.bestExamScore)}
												</span>
											</div>
											<div className="flex justify-between">
												<span>Quiz d&apos;esame completati:</span>
												<span className="font-bold">
													{overallStats.totalExamQuizzes}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	);
}
