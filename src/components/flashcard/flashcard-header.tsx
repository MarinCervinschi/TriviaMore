import { Eye, LogOut, PanelLeft, PanelLeftClose } from "lucide-react";

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
		<header className="border-border/50 bg-background/70 flex items-center justify-between border-b px-4 py-4 backdrop-blur-xl">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon"
					onClick={onToggleSidebar}
					className="h-9 w-9 rounded-xl"
				>
					{sidebarOpen ? (
						<PanelLeftClose className="h-4 w-4" />
					) : (
						<PanelLeft className="h-4 w-4" />
					)}
				</Button>
				<span className="bg-muted rounded-lg px-3 py-1 text-sm font-medium">
					{questionIndex + 1}
					<span className="text-muted-foreground"> / {totalQuestions}</span>
				</span>
			</div>

			<div className="flex items-center gap-3">
				<Badge variant="secondary" className="gap-1.5 rounded-xl px-3 py-1">
					<Eye className="h-3.5 w-3.5" />
					{studiedCount}/{totalQuestions}
				</Badge>
				<ThemeToggle className="h-9 w-9" />
				<Button
					variant="ghost"
					size="sm"
					onClick={onExit}
					className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl"
				>
					<LogOut className="mr-1.5 h-4 w-4" />
					Esci
				</Button>
			</div>
		</header>
	);
}
