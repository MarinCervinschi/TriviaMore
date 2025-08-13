import { Check, ChevronLeft, Eye, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FlashcardQuestion } from "@/lib/types/flashcard.types";

interface FlashcardSidebarProps {
	questions: FlashcardQuestion[];
	studiedCards: Set<number>;
	currentCardIndex: number;
	onCardSelect: (index: number) => void;
	isOpen: boolean;
	onToggle: () => void;
}

export function FlashcardSidebar({
	questions,
	studiedCards,
	currentCardIndex,
	onCardSelect,
	isOpen,
	onToggle,
}: FlashcardSidebarProps) {
	const studiedCount = studiedCards.size;

	return (
		<>
			{/* Overlay per mobile - solo a destra della sidebar */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
					style={{ left: "320px" }}
					onClick={onToggle}
				/>
			)}

			{/* Sidebar */}
			<div
				className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-lg transition-transform duration-300 ease-in-out dark:bg-gray-800 lg:static lg:transform-none ${
					isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
				} ${!isOpen ? "lg:hidden" : ""}`}
			>
				<div className="flex h-full flex-col">
					{/* Header */}
					<div className="border-b p-4 dark:border-gray-700">
						<div className="flex items-center justify-between">
							<h2 className="text-lg font-semibold text-gray-900 dark:text-white">
								Flashcard
							</h2>
							<div className="flex items-center space-x-2">
								{/* Pulsante chiusura per schermi grandi */}
								<Button
									variant="ghost"
									size="sm"
									onClick={onToggle}
									className="hidden lg:flex"
									title="Nascondi sidebar"
								>
									<ChevronLeft className="h-4 w-4" />
								</Button>
								{/* Pulsante chiusura per mobile */}
								<Button
									variant="ghost"
									size="sm"
									onClick={onToggle}
									className="lg:hidden"
									title="Chiudi"
								>
									<X className="h-4 w-4" />
								</Button>
							</div>
						</div>
						<p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
							{studiedCount} di {questions.length} studiate
						</p>
					</div>

					{/* Progress bar */}
					<div className="px-4 py-2">
						<div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
							<div
								className="h-2 rounded-full bg-purple-600 transition-all duration-300"
								style={{
									width: `${(studiedCount / questions.length) * 100}%`,
								}}
							/>
						</div>
					</div>

					{/* Cards grid */}
					<div className="flex-1 overflow-y-auto p-4">
						<div className="grid grid-cols-5 gap-2">
							{questions.map((question, index) => {
								const isStudied = studiedCards.has(index);
								const isCurrent = index === currentCardIndex;

								return (
									<button
										key={question.id}
										onClick={() => onCardSelect(index)}
										className={`relative h-10 w-10 rounded-lg border-2 text-sm font-medium transition-all ${
											isCurrent
												? "border-purple-500 bg-purple-500 text-white"
												: isStudied
													? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
													: "border-gray-300 bg-white text-gray-700 hover:border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
										}`}
									>
										{index + 1}
										{isStudied && !isCurrent && (
											<Eye className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-green-500 p-0.5 text-white" />
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Legend */}
					<div className="border-t p-4 dark:border-gray-700">
						<div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
							<div className="flex items-center space-x-2">
								<div className="h-3 w-3 rounded border-2 border-purple-500 bg-purple-500"></div>
								<span>Flashcard attuale</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-3 w-3 rounded border-2 border-green-500 bg-green-50 dark:bg-green-900/20"></div>
								<span>Già studiata</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="h-3 w-3 rounded border-2 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700"></div>
								<span>Non studiata</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
