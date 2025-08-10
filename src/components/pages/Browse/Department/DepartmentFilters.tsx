"use client";

import { useState } from "react";

import { Filter, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

interface DepartmentFilters {
	type?: "BACHELOR" | "MASTER";
	search?: string;
}

interface DepartmentFiltersProps {
	filters: DepartmentFilters;
	searchValue: string;
	onSearchValueChange: (value: string) => void;
	onSearch: (e: React.FormEvent) => void;
	onFilterChange: (filters: Partial<DepartmentFilters>) => void;
	onClearFilters: () => void;
}

export function DepartmentFilters({
	filters,
	searchValue,
	onSearchValueChange,
	onSearch,
	onFilterChange,
	onClearFilters,
}: DepartmentFiltersProps) {
	const [showFilters, setShowFilters] = useState(false);
	const hasActiveFilters = filters.search || filters.type;

	return (
		<div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
					Cerca e Filtra
				</h2>
				<Button
					variant="outline"
					size="sm"
					onClick={() => setShowFilters(!showFilters)}
					className="md:hidden"
				>
					<Filter className="mr-2 h-4 w-4" />
					Filtri
				</Button>
			</div>

			<div className={`space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
				<div className="flex flex-col gap-4 md:flex-row">
					{/* Search */}
					<div className="flex-1">
						<form onSubmit={onSearch} className="flex gap-2">
							<div className="relative flex-1">
								<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400 dark:text-gray-500" />
								<Input
									type="text"
									placeholder="Cerca per nome, codice o descrizione..."
									value={searchValue}
									onChange={e => onSearchValueChange(e.target.value)}
									className="pl-10"
								/>
							</div>
							<Button type="submit" className="shrink-0">
								Cerca
							</Button>
						</form>
					</div>

					{/* Type Filter */}
					<div className="md:w-48">
						<Select
							value={filters.type || "all"}
							onValueChange={value =>
								onFilterChange({
									type: value === "all" ? undefined : (value as "BACHELOR" | "MASTER"),
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Tipo corso" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">Tutti i tipi</SelectItem>
								<SelectItem value="BACHELOR">Laurea Triennale</SelectItem>
								<SelectItem value="MASTER">Laurea Magistrale</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{/* Clear Filters */}
					{hasActiveFilters && (
						<Button variant="outline" onClick={onClearFilters} className="shrink-0">
							<X className="mr-2 h-4 w-4" />
							Rimuovi Filtri
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
