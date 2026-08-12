import { cn } from "@/lib/utils";

interface FlashcardSidebarContentProps {
	totalQuestions: number;
	currentIndex: number;
	studiedCards: Set<number>;
	onJump: (index: number) => void;
}

export function FlashcardSidebarContent({
	totalQuestions,
	currentIndex,
	studiedCards,
	onJump,
}: FlashcardSidebarContentProps) {
	return (
		<div>
			<h3 className="text-muted-foreground eyebrow mb-3">Carte</h3>
			<div className="grid grid-cols-5 gap-2">
				{Array.from({ length: totalQuestions }, (_, i) => (
					<button
						key={i}
						onClick={() => onJump(i)}
						className={cn(
							"flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
							i === currentIndex &&
								"ring-primary ring-offset-background ring-2 ring-offset-2",
							studiedCards.has(i)
								? "bg-green-600 text-white shadow-sm dark:bg-green-700"
								: "border-border bg-card hover:bg-muted border"
						)}
					>
						{i + 1}
					</button>
				))}
			</div>
			<div className="text-muted-foreground mt-4 space-y-2 text-xs">
				<div className="flex items-center gap-2">
					<div className="h-3 w-3 rounded-lg bg-green-600 dark:bg-green-700" />
					<span>Studiata</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="border-border bg-card h-3 w-3 rounded-lg border" />
					<span>Da studiare</span>
				</div>
			</div>
		</div>
	);
}

export function FlashcardSidebar(props: FlashcardSidebarContentProps) {
	return (
		<aside className="border-border/50 bg-background hidden w-64 shrink-0 border-r p-4 backdrop-blur-xl lg:block">
			<FlashcardSidebarContent {...props} />
		</aside>
	);
}
