"use client";

import React from "react";

import Link from "next/link";

import { ChevronRight, Clock, Home, Target, TrendingUp, Trophy } from "lucide-react";
import type { User } from "next-auth";
import {
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
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

interface ProgressData {
	id: string;
	studyQuizzesTaken: number;
	studyAverageScore: number | null;
	examQuizzesTaken: number;
	examAverageScore: number | null;
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
	currentUser: User;
}

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#06b6d4"];

export default function UserProgressComponent({
	progressData,
	currentUser,
}: UserProgressComponentProps) {
	// Prepare data for charts
	const chartData = progressData.map((progress, index) => ({
		name: progress.section.name,
		studyScore: progress.studyAverageScore || 0,
		examScore: progress.examAverageScore || 0,
		studyQuizzes: progress.studyQuizzesTaken,
		examQuizzes: progress.examQuizzesTaken,
		totalQuizzes: progress.studyQuizzesTaken + progress.examQuizzesTaken,
		color: COLORS[index % COLORS.length],
	}));

	// Department statistics
	const departmentStats = progressData.reduce(
		(acc, progress) => {
			const deptName = progress.section.class.course.department.name;
			if (!acc[deptName]) {
				acc[deptName] = {
					name: deptName,
					totalQuizzes: 0,
					averageScore: 0,
					sections: 0,
				};
			}
			acc[deptName].totalQuizzes +=
				progress.studyQuizzesTaken + progress.examQuizzesTaken;
			acc[deptName].averageScore +=
				(progress.studyAverageScore || 0) + (progress.examAverageScore || 0);
			acc[deptName].sections += 1;
			return acc;
		},
		{} as Record<string, any>
	);

	const departmentChartData = Object.values(departmentStats).map((dept: any) => ({
		...dept,
		averageScore: dept.averageScore / (dept.sections * 2), // Divide by sections and 2 (study + exam)
	}));

	// Overall statistics
	const totalStudyQuizzes = progressData.reduce(
		(sum, p) => sum + p.studyQuizzesTaken,
		0
	);
	const totalExamQuizzes = progressData.reduce((sum, p) => sum + p.examQuizzesTaken, 0);
	const overallStudyAverage =
		progressData.length > 0
			? progressData.reduce((sum, p) => sum + (p.studyAverageScore || 0), 0) /
				progressData.length
			: 0;
	const overallExamAverage =
		progressData.length > 0
			? progressData.reduce((sum, p) => sum + (p.examAverageScore || 0), 0) /
				progressData.length
			: 0;

	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
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
					{/* Overall Statistics */}
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
										<p className="text-2xl font-bold">
											{Math.round(overallStudyAverage)}%
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
										<p className="text-2xl font-bold">
											{Math.round(overallExamAverage)}%
										</p>
									</div>
									<Clock className="h-8 w-8 text-purple-500" />
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Charts and Detailed Analysis */}
					<Tabs defaultValue="overview" className="space-y-6">
						<TabsList className="grid w-full grid-cols-1 md:grid-cols-3">
							<TabsTrigger value="overview">Panoramica</TabsTrigger>
							<TabsTrigger value="performance">Performance</TabsTrigger>
							<TabsTrigger value="details">Dettagli</TabsTrigger>
						</TabsList>

						<TabsContent value="overview" className="space-y-6">
							<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
								{/* Quiz Distribution by Department */}
								<Card>
									<CardHeader>
										<CardTitle>Distribuzione Quiz per Dipartimento</CardTitle>
										<CardDescription>
											Numero totale di quiz completati per dipartimento
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={300}>
											<PieChart>
												<Pie
													data={departmentChartData}
													cx="50%"
													cy="50%"
													labelLine={false}
													label={({ name, totalQuizzes }: any) =>
														`${name}: ${totalQuizzes}`
													}
													outerRadius={80}
													fill="#8884d8"
													dataKey="totalQuizzes"
												>
													{departmentChartData.map((entry, index) => (
														<Cell
															key={`cell-${index}`}
															fill={COLORS[index % COLORS.length]}
														/>
													))}
												</Pie>
												<Tooltip />
											</PieChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>

								{/* Average Scores by Department */}
								<Card>
									<CardHeader>
										<CardTitle>Punteggi Medi per Dipartimento</CardTitle>
										<CardDescription>
											Performance media per ogni dipartimento
										</CardDescription>
									</CardHeader>
									<CardContent>
										<ResponsiveContainer width="100%" height={300}>
											<BarChart data={departmentChartData}>
												<CartesianGrid strokeDasharray="3 3" />
												<XAxis
													dataKey="name"
													angle={-45}
													textAnchor="end"
													height={80}
													fontSize={12}
												/>
												<YAxis />
												<Tooltip />
												<Bar dataKey="averageScore" fill="#3b82f6" />
											</BarChart>
										</ResponsiveContainer>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="performance" className="space-y-6">
							{/* Study vs Exam Performance */}
							<Card>
								<CardHeader>
									<CardTitle>Confronto Studio vs Esame</CardTitle>
									<CardDescription>
										Confronta le tue performance tra quiz di studio e quiz d&apos;esame
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={400}>
										<BarChart data={chartData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												height={100}
												fontSize={12}
											/>
											<YAxis />
											<Tooltip />
											<Bar dataKey="studyScore" fill="#10b981" name="Studio" />
											<Bar dataKey="examScore" fill="#ef4444" name="Esame" />
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>

							{/* Quiz Volume Comparison */}
							<Card>
								<CardHeader>
									<CardTitle>Volume Quiz per Sezione</CardTitle>
									<CardDescription>
										Numero di quiz completati per ogni sezione
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ResponsiveContainer width="100%" height={300}>
										<BarChart data={chartData}>
											<CartesianGrid strokeDasharray="3 3" />
											<XAxis
												dataKey="name"
												angle={-45}
												textAnchor="end"
												height={80}
												fontSize={12}
											/>
											<YAxis />
											<Tooltip />
											<Bar dataKey="totalQuizzes" fill="#8b5cf6" />
										</BarChart>
									</ResponsiveContainer>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="details" className="space-y-6">
							{/* Detailed Progress Cards */}
							<div className="space-y-4">
								{progressData.map(progress => (
									<Card key={progress.id} className="transition-shadow hover:shadow-md">
										<CardHeader>
											<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
												<div>
													<CardTitle className="text-lg">
														{progress.section.name}
													</CardTitle>
													<CardDescription>
														{progress.section.class.course.department.name} •{" "}
														{progress.section.class.course.name} •{" "}
														{progress.section.class.name}
													</CardDescription>
												</div>
												<Badge variant="outline">
													Ultimo accesso:{" "}
													{new Date(progress.lastAccessedAt).toLocaleDateString(
														"it-IT"
													)}
												</Badge>
											</div>
										</CardHeader>
										<CardContent>
											<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
												<div className="text-center">
													<p className="text-sm font-medium text-muted-foreground">
														Quiz Studio
													</p>
													<p className="text-2xl font-bold text-blue-600">
														{progress.studyQuizzesTaken}
													</p>
												</div>
												<div className="text-center">
													<p className="text-sm font-medium text-muted-foreground">
														Media Studio
													</p>
													<p className="text-2xl font-bold text-green-600">
														{progress.studyAverageScore
															? `${Math.round(progress.studyAverageScore)}%`
															: "N/A"}
													</p>
												</div>
												<div className="text-center">
													<p className="text-sm font-medium text-muted-foreground">
														Quiz Esame
													</p>
													<p className="text-2xl font-bold text-yellow-600">
														{progress.examQuizzesTaken}
													</p>
												</div>
												<div className="text-center">
													<p className="text-sm font-medium text-muted-foreground">
														Media Esame
													</p>
													<p className="text-2xl font-bold text-red-600">
														{progress.examAverageScore
															? `${Math.round(progress.examAverageScore)}%`
															: "N/A"}
													</p>
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	);
}
