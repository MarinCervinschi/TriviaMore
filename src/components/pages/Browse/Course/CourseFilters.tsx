"use client";

import { useState } from "react";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface CourseFilters {
	year?: string;
	search?: string;
}

interface CourseFiltersProps {
	availableYears: number[];
	onFilterChange: (filters: Partial<CourseFilters>) => void;
}

export function CourseFilters({ availableYears, onFilterChange }: CourseFiltersProps) {
	const [filters, setFilters] = useState<CourseFilters>({
		year: "all",
		search: "",
	});

	const updateFilters = (newFilters: Partial<CourseFilters>) => {
		const updated = {
			...filters,
			...newFilters,
		};
		setFilters(updated);
		onFilterChange(updated);
	};

	const clearFilters = () => {
		const clearedFilters = {
			year: "all",
			search: "",
		};
		setFilters(clearedFilters);
		onFilterChange(clearedFilters);
	};

	const hasActiveFilters = filters.search || filters.year !== "all";

	return (
		<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<div className="mb-4">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
					Cerca e Filtra
				</h2>
			</div>

			<div className="space-y-4">
				<div className="flex flex-col gap-4 md:flex-row">
					{/* Search */}
					<div className="flex-1">
						<div className="relative flex-1">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
							<Input
								type="text"
								placeholder="Cerca per nome, codice o descrizione..."
								value={filters.search}
								onChange={e => updateFilters({ search: e.target.value })}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Year Filter */}
					<div className="md:w-48">
						<Select
							value={filters.year}
							onValueChange={value => {
								updateFilters({
									year: value,
								});
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Anno" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti gli anni</SelectItem>
								{availableYears.map(year => (
									<SelectItem key={year} value={year.toString()}>
										{year}° Anno
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Clear Filters */}
					{hasActiveFilters && (
						<Button variant="outline" onClick={clearFilters} className="shrink-0">
							<X className="mr-2 h-4 w-4" />
							Rimuovi Filtri
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
