import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ClassFiltersProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	totalResults: number;
}

export default function ClassFilters({
	searchQuery,
	onSearchChange,
	totalResults,
}: ClassFiltersProps) {
	const handleClearSearch = () => {
		onSearchChange("");
	};

	return (
		<div className="mb-8">
			<div className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex-1">
					<div className="relative max-w-md">
						<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
						<Input
							type="text"
							placeholder="Cerca sezioni..."
							value={searchQuery}
							onChange={e => onSearchChange(e.target.value)}
							className="pl-10 pr-10"
						/>
						{searchQuery && (
							<Button
								variant="ghost"
								size="sm"
								onClick={handleClearSearch}
								className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<X className="h-4 w-4" />
							</Button>
						)}
					</div>
				</div>

				<div className="flex items-center space-x-4">
					<span className="text-sm text-gray-600 dark:text-gray-300">
						{totalResults} {totalResults === 1 ? "sezione trovata" : "sezioni trovate"}
					</span>
				</div>
			</div>
		</div>
	);
}
