"use client";

import Link from "next/link";

import { ChevronRight, Home } from "lucide-react";
import { User } from "next-auth";

import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface UserBookmarksComponentProps {
	bookmarks: any[];
	currentUser: User;
}

export default function UserBookmarksComponent({
	bookmarks,
	currentUser,
}: UserBookmarksComponentProps) {
	return (
		<div className="container mx-auto space-y-8 px-4 py-8">
			{/* Breadcrumb */}
			<nav className="flex items-center space-x-2 text-sm text-muted-foreground">
				<Link href="/user" className="flex items-center gap-1 hover:text-foreground">
					<Home className="h-4 w-4" />
					Dashboard
				</Link>
				<ChevronRight className="h-4 w-4" />
				<span className="text-foreground">Segnalibri</span>
			</nav>

			<div>
				<h1 className="text-3xl font-bold">I Miei Segnalibri</h1>
				<p className="text-muted-foreground">
					Accedi alle domande che hai salvato per dopo
				</p>
			</div>

			{bookmarks.length === 0 ? (
				<Card>
					<CardContent className="p-6">
						<div className="text-center">
							<h2 className="mb-2 text-xl font-semibold">Nessun segnalibro salvato</h2>
							<p className="text-muted-foreground">
								Aggiungi domande ai segnalibri durante i quiz per rivederle facilmente!
							</p>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{bookmarks.map(bookmark => (
						<Card key={bookmark.questionId}>
							<CardHeader>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<CardTitle className="text-lg">
											{bookmark.question.section.class.course.name}
										</CardTitle>
										<CardDescription>
											{bookmark.question.section.class.course.department.name} •{" "}
											{bookmark.question.section.name}
										</CardDescription>
									</div>
									<Badge variant="outline">{bookmark.question.difficulty}</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									<div>
										<h4 className="mb-2 font-medium">Domanda:</h4>
										<p className="text-muted-foreground">{bookmark.question.content}</p>
									</div>

									{bookmark.question.explanation && (
										<div>
											<h4 className="mb-2 font-medium">Spiegazione:</h4>
											<p className="text-sm text-muted-foreground">
												{bookmark.question.explanation}
											</p>
										</div>
									)}

									<div className="text-xs text-muted-foreground">
										Salvato il{" "}
										{new Date(bookmark.createdAt).toLocaleDateString("it-IT")}
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
