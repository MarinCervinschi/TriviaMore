"use client";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

import { QuestionCard } from "./QuestionCard";
import { QuestionFilters } from "./QuestionFilters";

interface QuestionManagementProps {
	sectionId: string;
	onEditAction?: (action: "create" | "edit" | "delete", data?: any) => void;
}

export function QuestionManagement({
	sectionId,
	onEditAction,
}: QuestionManagementProps) {
	const [filters, setFilters] = useState<QuestionFilters>({
		search: "",
		questionType: "all",
		difficulty: "all",
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	// Fetch questions for this section
	const {
		data: questions = [],
		isLoading,
		error,
	} = useQuery({
		queryKey: ["section-questions", sectionId],
		queryFn: async () => {
			const response = await fetch(
				`/api/protected/admin/sections/${sectionId}/questions`
			);
			if (!response.ok) {
				throw new Error("Errore nel caricamento delle domande");
			}
			return response.json();
		},
	});

	// Filter and sort questions
	const filteredQuestions = useMemo(() => {
		let filtered = [...questions];

		// Apply search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				q =>
					q.content.toLowerCase().includes(searchLower) ||
					(q.explanation && q.explanation.toLowerCase().includes(searchLower))
			);
		}

		// Apply type filter
		if (filters.questionType !== "all") {
			filtered = filtered.filter(q => q.questionType === filters.questionType);
		}

		// Apply difficulty filter
		if (filters.difficulty !== "all") {
			filtered = filtered.filter(q => q.difficulty === filters.difficulty);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			let aValue = a[filters.sortBy];
			let bValue = b[filters.sortBy];

			// Handle date sorting
			if (filters.sortBy === "createdAt" || filters.sortBy === "updatedAt") {
				aValue = new Date(aValue).getTime();
				bValue = new Date(bValue).getTime();
			}

			// Handle string sorting
			if (typeof aValue === "string" && typeof bValue === "string") {
				aValue = aValue.toLowerCase();
				bValue = bValue.toLowerCase();
			}

			if (filters.sortOrder === "asc") {
				return aValue > bValue ? 1 : -1;
			} else {
				return aValue < bValue ? 1 : -1;
			}
		});

		return filtered;
	}, [questions, filters]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<AlertCircle className="mx-auto h-12 w-12 text-red-500" />
					<h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
						Errore nel caricamento
					</h3>
					<p className="mt-1 text-gray-500 dark:text-gray-400">
						Non è stato possibile caricare le domande della sezione.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with create button */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white">
						Gestione Domande
					</h2>
					<p className="text-gray-600 dark:text-gray-400">
						Modifica, elimina o crea nuove domande per questa sezione
					</p>
				</div>
				<Button
					onClick={() => onEditAction?.("create")}
					className="flex items-center gap-2"
				>
					<Plus className="h-4 w-4" />
					Nuova Domanda
				</Button>
			</div>

			{/* Filters */}
			<QuestionFilters
				onFiltersChange={setFilters}
				totalQuestions={questions.length}
				filteredCount={filteredQuestions.length}
			/>

			{/* Questions List */}
			{filteredQuestions.length === 0 ? (
				<div className="py-12 text-center">
					<AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
						{questions.length === 0 ? "Nessuna domanda trovata" : "Nessun risultato"}
					</h3>
					<p className="mt-1 text-gray-500 dark:text-gray-400">
						{questions.length === 0
							? "Inizia creando la prima domanda per questa sezione."
							: "Prova a modificare i filtri per trovare le domande che stai cercando."}
					</p>
					{questions.length === 0 && (
						<Button onClick={() => onEditAction?.("create")} className="mt-4">
							<Plus className="mr-2 h-4 w-4" />
							Crea Prima Domanda
						</Button>
					)}
				</div>
			) : (
				<div className="grid gap-4">
					{filteredQuestions.map(question => (
						<QuestionCard
							key={question.id}
							question={question}
							onEditAction={onEditAction}
						/>
					))}
				</div>
			)}
		</div>
	);
}
