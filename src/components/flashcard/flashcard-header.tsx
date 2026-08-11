import { EyeIcon } from "@solar-icons/react/linear/eye";
import { Logout3Icon } from "@solar-icons/react/linear/logout-3";
import { SidebarIcon } from "@solar-icons/react/linear/sidebar";
import { SidebarMinimalisticIcon } from "@solar-icons/react/linear/sidebar-minimalistic";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function FlashcardHeader({
	questionIndex,
	totalQuestions,
	studiedCount,
	sidebarOpen,
	onToggleSidebar,
	onExit,
}: {
	questionIndex: number;
	totalQuestions: number;
	studiedCount: number;
	sidebarOpen: boolean;
	onToggleSidebar: () => void;
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
				<Badge variant="secondary" className="gap-1.5 rounded-xl px-3 py-1">
					<EyeIcon className="h-3.5 w-3.5" />
					{studiedCount}/{totalQuestions}
				</Badge>
				<ThemeToggle className="h-9 w-9" />
				<Button
					variant="ghost"
					size="sm"
					onClick={onExit}
					className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl"
				>
					<Logout3Icon className="mr-1.5 h-4 w-4" />
					Esci
				</Button>
			</div>
		</header>
	);
}
