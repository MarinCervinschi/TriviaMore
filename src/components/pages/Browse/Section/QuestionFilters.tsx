"use client";

import { useState } from "react";

import { Filter, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface QuestionFiltersProps {
	onFiltersChange: (filters: QuestionFilters) => void;
	totalQuestions: number;
	filteredCount: number;
}

export interface QuestionFilters {
	search: string;
	questionType: string;
	difficulty: string;
	sortBy: string;
	sortOrder: "asc" | "desc";
}

export function QuestionFilters({
	onFiltersChange,
	totalQuestions,
	filteredCount,
}: QuestionFiltersProps) {
	const [filters, setFilters] = useState<QuestionFilters>({
		search: "",
		questionType: "all",
		difficulty: "all",
		sortBy: "createdAt",
		sortOrder: "desc",
	});

	const [isExpanded, setIsExpanded] = useState(false);

	const updateFilters = (newFilters: Partial<QuestionFilters>) => {
		const updated = { ...filters, ...newFilters };
		setFilters(updated);
		onFiltersChange(updated);
	};

	const clearFilters = () => {
		const cleared: QuestionFilters = {
			search: "",
			questionType: "all",
			difficulty: "all",
			sortBy: "createdAt",
			sortOrder: "desc",
		};
		setFilters(cleared);
		onFiltersChange(cleared);
	};

	const hasActiveFilters =
		filters.search || filters.questionType !== "all" || filters.difficulty !== "all";

	return (
		<div className="space-y-4 rounded-lg border bg-white p-4 dark:bg-gray-800">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Filter className="h-4 w-4" />
					<span className="font-medium">Filtri Domande</span>
					<Badge variant="secondary">
						{filteredCount} di {totalQuestions}
					</Badge>
				</div>
				<Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
					{isExpanded ? "Nascondi" : "Mostra"} Filtri
				</Button>
			</div>

			{isExpanded && (
				<div className="space-y-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<Input
							placeholder="Cerca per contenuto della domanda..."
							value={filters.search}
							onChange={e => updateFilters({ search: e.target.value })}
							className="pl-10"
						/>
					</div>

					{/* Filters Row */}
					<div className="grid grid-cols-1 gap-4 md:grid-cols-4">
						<Select
							value={filters.questionType}
							onValueChange={value => updateFilters({ questionType: value })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Tipo Domanda" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i tipi</SelectItem>
								<SelectItem value="MULTIPLE_CHOICE">Scelta multipla</SelectItem>
								<SelectItem value="TRUE_FALSE">Vero/Falso</SelectItem>
								<SelectItem value="SHORT_ANSWER">Risposta breve</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.difficulty}
							onValueChange={value => updateFilters({ difficulty: value })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Difficoltà" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutte le difficoltà</SelectItem>
								<SelectItem value="EASY">Facile</SelectItem>
								<SelectItem value="MEDIUM">Medio</SelectItem>
								<SelectItem value="HARD">Difficile</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.sortBy}
							onValueChange={value => updateFilters({ sortBy: value })}
						>
							<SelectTrigger>
								<SelectValue placeholder="Ordina per" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="createdAt">Data creazione</SelectItem>
								<SelectItem value="updatedAt">Ultima modifica</SelectItem>
								<SelectItem value="content">Contenuto</SelectItem>
								<SelectItem value="difficulty">Difficoltà</SelectItem>
								<SelectItem value="questionType">Tipo</SelectItem>
							</SelectContent>
						</Select>

						<Select
							value={filters.sortOrder}
							onValueChange={(value: "asc" | "desc") =>
								updateFilters({ sortOrder: value })
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Ordine" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="desc">Decrescente</SelectItem>
								<SelectItem value="asc">Crescente</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Clear Filters */}
					{hasActiveFilters && (
						<div className="flex justify-end">
							<Button variant="outline" size="sm" onClick={clearFilters}>
								<X className="mr-2 h-4 w-4" />
								Cancella Filtri
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
