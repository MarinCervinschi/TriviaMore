import { cn } from "@/lib/utils";

interface QuizSidebarContentProps {
	totalQuestions: number;
	currentIndex: number;
	answeredQuestions: boolean[];
	onJump: (index: number) => void;
}

export function QuizSidebarContent({
	totalQuestions,
	currentIndex,
	answeredQuestions,
	onJump,
}: QuizSidebarContentProps) {
	return (
		<div>
			<h3 className="text-muted-foreground eyebrow mb-3">Domande</h3>
			<div className="grid grid-cols-5 gap-2">
				{Array.from({ length: totalQuestions }, (_, i) => (
					<button
						key={i}
						onClick={() => onJump(i)}
						className={cn(
							"flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200",
							i === currentIndex &&
								"ring-primary ring-offset-background ring-2 ring-offset-2",
							answeredQuestions[i]
								? "bg-primary text-primary-foreground shadow-sm"
								: "border-border bg-card hover:bg-muted border"
						)}
					>
						{i + 1}
					</button>
				))}
			</div>
			<div className="text-muted-foreground mt-4 space-y-2 text-xs">
				<div className="flex items-center gap-2">
					<div className="bg-primary h-3 w-3 rounded-md" />
					<span>Risposta data</span>
				</div>
				<div className="flex items-center gap-2">
					<div className="border-border bg-card h-3 w-3 rounded-md border" />
					<span>Senza risposta</span>
				</div>
			</div>
		</div>
	);
}

export function QuizSidebar(props: QuizSidebarContentProps) {
	return (
		<aside className="border-border/50 bg-background hidden w-64 shrink-0 border-r p-4 backdrop-blur-xl lg:block">
			<QuizSidebarContent {...props} />
		</aside>
	);
}
