"use client";

import Link from "next/link";

import { ChevronRight, Home } from "lucide-react";
import { User } from "next-auth";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UserProgressComponentProps {
	progressData: any[];
	currentUser: User;
}

export default function UserProgressComponent({
	progressData,
	currentUser,
}: UserProgressComponentProps) {
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
					Visualizza i tuoi progressi dettagliati per ogni materia
				</p>
			</div>

			{progressData.length === 0 ? (
				<Card>
					<CardContent className="p-6">
						<div className="text-center">
							<h2 className="mb-2 text-xl font-semibold">
								Nessun progresso disponibile
							</h2>
							<p className="text-muted-foreground">
								Inizia a completare alcuni quiz per vedere i tuoi progressi qui!
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{progressData.map(progress => (
						<Card key={progress.id}>
							<CardHeader>
								<CardTitle>{progress.section.class.course.name}</CardTitle>
								<CardDescription>
									{progress.section.class.course.department.name} •{" "}
									{progress.section.name}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Quiz Studio
										</p>
										<p className="text-2xl font-bold">{progress.studyQuizzesTaken}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Media Studio
										</p>
										<p className="text-2xl font-bold">
											{progress.studyAverageScore
												? `${Math.round(progress.studyAverageScore)}%`
												: "N/A"}
										</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Quiz Esame
										</p>
										<p className="text-2xl font-bold">{progress.examQuizzesTaken}</p>
									</div>
									<div>
										<p className="text-sm font-medium text-muted-foreground">
											Media Esame
										</p>
										<p className="text-2xl font-bold">
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
			)}
		</div>
	);
}
