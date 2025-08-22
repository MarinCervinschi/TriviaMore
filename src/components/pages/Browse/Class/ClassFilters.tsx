import { useState } from "react";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClassFiltersProps {
	onSearchChange: (query: string) => void;
	totalResults: number;
}

export default function ClassFilters({
	onSearchChange,
	totalResults,
}: ClassFiltersProps) {
	const [searchQuery, setSearchQuery] = useState<string>("");

	const updateSearch = (query: string) => {
		setSearchQuery(query);
		onSearchChange(query);
	};

	const clearFilters = () => {
		setSearchQuery("");
		onSearchChange("");
	};

	const hasActiveFilters = searchQuery !== "";

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
								placeholder="Cerca sezioni..."
								value={searchQuery}
								onChange={e => updateSearch(e.target.value)}
								className="pl-10 pr-10"
							/>
						</div>
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
