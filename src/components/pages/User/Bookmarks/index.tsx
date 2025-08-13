"use client";

import Link from "next/link";

import { JsonValue } from "@prisma/client/runtime/library";
import { Bookmark, ChevronRight, Home } from "lucide-react";
import { User } from "next-auth";

import { BookmarkButton } from "@/components/BookmarkButton";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface QuestionData {
	id: string;
	content: string;
	questionType: string;
	options: JsonValue;
	correctAnswer: string[];
	explanation: string | null;
	difficulty: "EASY" | "MEDIUM" | "HARD";
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

interface BookmarkData {
	userId: string;
	questionId: string;
	createdAt: string | Date;
	question: QuestionData;
}

interface UserBookmarksComponentProps {
	bookmarks: BookmarkData[];
	currentUser: User;
}

export default function UserBookmarksComponent({
	bookmarks,
	currentUser,
}: UserBookmarksComponentProps) {
	const getDifficultyColor = (difficulty: string) => {
		switch (difficulty) {
			case "EASY":
				return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
			case "MEDIUM":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
			case "HARD":
				return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
		}
	};

	const getDifficultyLabel = (difficulty: string) => {
		switch (difficulty) {
			case "EASY":
				return "Facile";
			case "MEDIUM":
				return "Medio";
			case "HARD":
				return "Difficile";
			default:
				return difficulty;
		}
	};

	const getQuestionTypeLabel = (type: string) => {
		switch (type) {
			case "MULTIPLE_CHOICE":
				return "Scelta multipla";
			case "TRUE_FALSE":
				return "Vero/Falso";
			case "SHORT_ANSWER":
				return "Risposta aperta";
			default:
				return type;
		}
	};

	// Helper function to safely get options as string array
	const getOptionsAsArray = (options: JsonValue): string[] => {
		if (Array.isArray(options)) {
			return options.filter((item): item is string => typeof item === "string");
		}
		return [];
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
				<span className="text-foreground">Segnalibri</span>
			</nav>

			<div>
				<h1 className="text-3xl font-bold">I Miei Segnalibri</h1>
				<p className="text-muted-foreground">
					Domande che hai salvato per ripassare più tardi
				</p>
			</div>

			{bookmarks.length === 0 ? (
				<Card>
					<CardContent className="p-12">
						<div className="text-center">
							<Bookmark className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
							<h2 className="mb-2 text-xl font-semibold">Nessun segnalibro salvato</h2>
							<p className="mb-4 text-muted-foreground">
								Durante i quiz, clicca sull&apos;icona del segnalibro per salvare le
								domande interessanti!
							</p>
							<Link
								href="/browse"
								className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
							>
								Esplora i Quiz
							</Link>
						</div>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					<div className="text-sm text-muted-foreground">
						{bookmarks.length} domand{bookmarks.length === 1 ? "a" : "e"} salvat
						{bookmarks.length === 1 ? "a" : "e"}
					</div>

					<div className="grid gap-6">
						{bookmarks.map((bookmark: BookmarkData) => (
							<Card key={bookmark.questionId} className="overflow-hidden">
								<CardHeader>
									<div className="flex items-start justify-between">
										<div className="flex-1 space-y-2">
											<div className="flex items-center gap-2">
												<Badge
													className={getDifficultyColor(bookmark.question.difficulty)}
												>
													{getDifficultyLabel(bookmark.question.difficulty)}
												</Badge>
												<Badge variant="outline">
													{getQuestionTypeLabel(bookmark.question.questionType)}
												</Badge>
											</div>
											<div className="space-y-1">
												<h3 className="text-sm font-medium text-muted-foreground">
													{bookmark.question.section.name}
												</h3>
												<p className="text-xs text-muted-foreground">
													{bookmark.question.section.class.name} •{" "}
													{bookmark.question.section.class.course.name} •{" "}
													{bookmark.question.section.class.course.department.name}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2">
											<div className="text-xs text-muted-foreground">
												Salvato il{" "}
												{new Date(bookmark.createdAt).toLocaleDateString("it-IT")}
											</div>
											<BookmarkButton
												questionId={bookmark.questionId}
												isGuest={false}
												size="sm"
											/>
										</div>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="text-lg font-medium">
										<MarkdownRenderer
											content={bookmark.question.content}
											className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
										/>
									</div>

									{bookmark.question.options && (
										<div className="space-y-2">
											<p className="text-sm font-medium text-muted-foreground">
												Opzioni:
											</p>
											<ul className="space-y-1">
												{getOptionsAsArray(bookmark.question.options).map(
													(option, index) => (
														<li
															key={index}
															className={`rounded p-2 text-sm ${
																bookmark.question.correctAnswer.includes(option)
																	? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
																	: "bg-gray-50 dark:bg-gray-800"
															}`}
														>
															<span className="mr-2 font-medium">
																{String.fromCharCode(65 + index)})
															</span>
															{option}
															{bookmark.question.correctAnswer.includes(option) && (
																<span className="ml-2 text-xs font-medium">
																	✓ Corretta
																</span>
															)}
														</li>
													)
												)}
											</ul>
										</div>
									)}

									{bookmark.question.explanation && (
										<div className="rounded-lg border-l-4 border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
											<p className="text-sm font-medium text-blue-800 dark:text-blue-200">
												Spiegazione:
											</p>
											<div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
												<MarkdownRenderer
													content={bookmark.question.explanation}
													className="[&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
												/>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
