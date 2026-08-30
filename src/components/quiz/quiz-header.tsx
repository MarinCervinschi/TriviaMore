import { BookMinimalisticIcon } from "@solar-icons/react/linear/book-minimalistic";
import { ClipboardCheckIcon } from "@solar-icons/react/linear/clipboard-check";
import { DocumentTextIcon } from "@solar-icons/react/linear/document-text";
import { Logout3Icon } from "@solar-icons/react/linear/logout-3";
import { SidebarIcon } from "@solar-icons/react/linear/sidebar";
import { SidebarMinimalisticIcon } from "@solar-icons/react/linear/sidebar-minimalistic";

import type { Icon } from "@/components/icons";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

import { QuizTimer } from "./quiz-timer";

/** What the run is over, so the header says which quiz this is. */
export type QuizContext = {
	kind: "section" | "class" | "exam";
	/** The section's name, or the class's when the run spans the whole class. */
	name: string;
};

const KIND: Record<QuizContext["kind"], { label: string; icon: Icon }> = {
	section: { label: "Sezione", icon: DocumentTextIcon },
	class: { label: "Insegnamento", icon: BookMinimalisticIcon },
	exam: { label: "Simulazione d\u2019esame", icon: ClipboardCheckIcon },
};

export function QuizHeader({
	questionIndex,
	totalQuestions,
	timeLimit,
	context,
	sidebarOpen,
	onToggleSidebar,
	onTimeUp,
	onExit,
}: {
	questionIndex: number;
	totalQuestions: number;
	timeLimit: number | null;
	context?: QuizContext;
	sidebarOpen: boolean;
	onToggleSidebar: () => void;
	onTimeUp: () => void;
	onExit: () => void;
}) {
	return (
		<header className="border-border/50 bg-background flex items-center justify-between border-b px-4 py-4 backdrop-blur-xl">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleSidebar}
					className="h-9 w-9"
					aria-label={
						sidebarOpen
							? "Chiudi l\u2019elenco delle domande"
							: "Apri l\u2019elenco delle domande"
					}
				>
					{sidebarOpen ? (
						<SidebarIcon className="h-4 w-4" />
					) : (
						<SidebarMinimalisticIcon className="h-4 w-4" />
					)}
				</Button>
				<span className="bg-muted rounded-lg px-3 py-1 text-sm font-medium">
					{questionIndex + 1}
					<span className="text-muted-foreground"> / {totalQuestions}</span>
				</span>
				{context && <ContextLabel context={context} />}
			</div>

			<div className="flex items-center gap-3">
				<QuizTimer timeLimitMinutes={timeLimit} onTimeUp={onTimeUp} />
				<ThemeToggle className="h-9 w-9" />
				<Button
					variant="ghost"
					size="sm"
					onClick={onExit}
					className="text-muted-foreground hover:bg-destructive/10 hover:text-danger"
				>
					<Logout3Icon className="mr-1.5 h-4 w-4" />
					Esci
				</Button>
			</div>
		</header>
	);
}

/**
 * Which quiz this is. Held back below `sm`, where the bar already carries the
 * counter, the timer and the way out — and where the name would be cut to a word.
 */
function ContextLabel({ context }: { context: QuizContext }) {
	const { label, icon: Glyph } = KIND[context.kind];
	return (
		<div className="hidden min-w-0 items-center gap-2 sm:flex">
			<span aria-hidden className="bg-border/80 h-5 w-px" />
			<Glyph className="text-muted-foreground size-4 shrink-0" />
			<span className="text-muted-foreground truncate text-sm">
				{label}
				<span className="text-foreground font-medium"> · {context.name}</span>
			</span>
		</div>
	);
}
