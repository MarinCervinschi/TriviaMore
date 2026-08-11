import { Logout3Icon } from "@solar-icons/react/linear/logout-3";
import { SidebarIcon } from "@solar-icons/react/linear/sidebar";
import { SidebarMinimalisticIcon } from "@solar-icons/react/linear/sidebar-minimalistic";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";

import { QuizTimer } from "./quiz-timer";

export function QuizHeader({
	questionIndex,
	totalQuestions,
	timeLimit,
	sidebarOpen,
	onToggleSidebar,
	onTimeUp,
	onExit,
}: {
	questionIndex: number;
	totalQuestions: number;
	timeLimit: number | null;
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
					className="h-9 w-9 rounded-xl"
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
			</div>

			<div className="flex items-center gap-3">
				<QuizTimer timeLimitMinutes={timeLimit} onTimeUp={onTimeUp} />
				<ThemeToggle className="h-9 w-9" />
				<Button
					variant="ghost"
					size="sm"
					onClick={onExit}
					className="text-muted-foreground hover:bg-destructive/10 hover:text-danger rounded-xl"
				>
					<Logout3Icon className="mr-1.5 h-4 w-4" />
					Esci
				</Button>
			</div>
		</header>
	);
}
